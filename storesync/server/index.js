import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import pg from 'pg'
import { Kafka } from 'kafkajs'
import { Client as OpenSearchClient } from '@opensearch-project/opensearch'
import { products as sampleProducts } from '../src/products.js'
import { buildProductSearchQuery, normalizeOrderItems } from './domain.js'

const { Pool } = pg
const here = path.dirname(fileURLToPath(import.meta.url))
const projectDir = path.resolve(here, '..')
try {
  process.loadEnvFile(path.join(projectDir, '.env.local'))
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const port = Number(process.env.API_PORT || 3001)
const searchIndex = process.env.OPENSEARCH_INDEX || 'storesync-products'
const kafkaTopic = process.env.KAFKA_TOPIC || 'storesync.orders'
const status = { postgres: false, kafka: false, opensearch: false }
const caPath = process.env.AIVEN_CA_CERT_PATH
  ? path.resolve(projectDir, process.env.AIVEN_CA_CERT_PATH)
  : ''
const ca = caPath && existsSync(caPath) ? readFileSync(caPath) : undefined

function secureConnectionString(value) {
  const url = new URL(value)
  for (const key of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey']) url.searchParams.delete(key)
  return url.toString()
}

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: secureConnectionString(process.env.DATABASE_URL),
      ssl: { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
      max: 5,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 30000,
    })
  : null

const openSearchUrl = process.env.OPENSEARCH_URL
const openSearch = openSearchUrl && process.env.OPENSEARCH_USERNAME && process.env.OPENSEARCH_PASSWORD
  ? new OpenSearchClient({
      node: openSearchUrl,
      auth: { username: process.env.OPENSEARCH_USERNAME, password: process.env.OPENSEARCH_PASSWORD },
      ...(ca ? { ssl: { ca, rejectUnauthorized: true } } : {}),
      requestTimeout: 8000,
    })
  : null

const kafkaBrokers = (process.env.KAFKA_BROKERS || '').split(',').map((item) => item.trim()).filter(Boolean)
const kafka = kafkaBrokers.length && process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD
  ? new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'storesync-demo',
      brokers: kafkaBrokers,
      ssl: { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
      sasl: {
        mechanism: process.env.KAFKA_SASL_MECHANISM || 'scram-sha-256',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
      },
      connectionTimeout: 8000,
      requestTimeout: 10000,
      retry: { retries: 2 },
    })
  : null

let producer = null
let consumer = null
let outboxTimer = null

function logServiceError(name, error) {
  const message = String(error?.message || error).split('\n')[0].slice(0, 240)
  console.error(`[${name}] ${message}`)
}

function publicProduct(row) {
  return { ...row.catalog, stock: Number(row.stock) }
}

async function ensureDatabase() {
  if (!pool) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price >= 0),
      cities TEXT[] NOT NULL DEFAULT '{}',
      stock INTEGER NOT NULL DEFAULT 10 CHECK (stock >= 0),
      catalog JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      event_status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS order_items (
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price INTEGER NOT NULL,
      PRIMARY KEY (order_id, product_id)
    );
    CREATE TABLE IF NOT EXISTS store_outbox (
      id UUID PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL,
      sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM products')
  if (rows[0].count === 0) {
    for (const item of sampleProducts) {
      await pool.query(
        `INSERT INTO products (id, name, subtitle, category, price, cities, stock, catalog)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.name, item.subtitle, item.category, item.price, item.cities, 10, JSON.stringify(item)],
      )
    }
  }
  status.postgres = true
}

async function readProducts(ids = null) {
  if (!pool || !status.postgres) throw new Error('PostgreSQL is not connected.')
  if (ids?.length) {
    const result = await pool.query('SELECT catalog, stock FROM products WHERE id = ANY($1::text[])', [ids])
    const byId = new Map(result.rows.map((row) => [row.catalog.id, publicProduct(row)]))
    return ids.map((id) => byId.get(id)).filter(Boolean)
  }
  const result = await pool.query('SELECT catalog, stock FROM products ORDER BY id')
  return result.rows.map(publicProduct)
}

async function indexProducts(items) {
  if (!openSearch || !status.opensearch || items.length === 0) return
  const body = items.flatMap((item) => [
    { index: { _index: searchIndex, _id: item.id } },
    {
      id: item.id,
      name: item.name,
      subtitle: item.subtitle,
      category: item.category,
      price: item.price,
      cities: item.cities || [],
      description: item.description || '',
      stock: item.stock,
      catalog: item,
    },
  ])
  const response = await openSearch.bulk({ refresh: true, body })
  if (response.body?.errors) throw new Error('OpenSearch rejected one or more product updates.')
}

async function ensureOpenSearch() {
  if (!openSearch) return
  const exists = await openSearch.indices.exists({ index: searchIndex })
  if (!(exists.body ?? exists)) {
    await openSearch.indices.create({
      index: searchIndex,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
            subtitle: { type: 'text' },
            category: { type: 'keyword' },
            price: { type: 'integer' },
            cities: { type: 'keyword' },
            description: { type: 'text' },
            stock: { type: 'integer' },
            catalog: { type: 'object', enabled: true },
          },
        },
      },
    })
  }
  status.opensearch = true
  await indexProducts(await readProducts())
}

async function startKafka() {
  if (!kafka) return
  const admin = kafka.admin()
  await admin.connect()
  await admin.createTopics({
    waitForLeaders: true,
    topics: [{ topic: kafkaTopic, numPartitions: 1, replicationFactor: 1 }],
  })
  await admin.disconnect()

  producer = kafka.producer({ allowAutoTopicCreation: false })
  await producer.connect()
  consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'storesync-order-processor' })
  await consumer.connect()
  await consumer.subscribe({ topic: kafkaTopic, fromBeginning: true })
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return
      const event = JSON.parse(message.value.toString())
      if (event.type !== 'ORDER_PLACED' || !event.orderId || !pool) return
      await pool.query(
        `UPDATE orders SET event_status = 'processed' WHERE id = $1`,
        [event.orderId],
      )
      const items = await readProducts((event.items || []).map((item) => item.productId))
      await indexProducts(items)
    },
  })
  status.kafka = true
  outboxTimer = setInterval(() => void flushOutbox(), 1000)
  void flushOutbox()
}

async function flushOutbox() {
  if (!producer || !pool || !status.kafka || !status.postgres) return
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      `SELECT id, order_id, event_type, payload FROM store_outbox
       WHERE sent_at IS NULL ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 10`,
    )
    for (const row of rows) {
      await producer.send({
        topic: kafkaTopic,
        messages: [{ key: row.order_id, value: JSON.stringify(row.payload) }],
      })
      await client.query('UPDATE store_outbox SET sent_at = NOW() WHERE id = $1', [row.id])
      await client.query("UPDATE orders SET event_status = 'sent' WHERE id = $1", [row.order_id])
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    logServiceError('outbox', error)
  } finally {
    client.release()
  }
}

async function createOrder(payload) {
  if (!pool || !status.postgres) throw new Error('PostgreSQL is not connected.')
  const items = normalizeOrderItems(payload.items)
  const name = String(payload.customer?.name || '').trim().slice(0, 120)
  const email = String(payload.customer?.email || '').trim().slice(0, 180)
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a name and a valid email address.')
  }

  const client = await pool.connect()
  const orderId = `SS-${randomUUID().slice(0, 8).toUpperCase()}`
  try {
    await client.query('BEGIN')
    const ids = items.map((item) => item.productId)
    const products = await client.query(
      'SELECT id, name, price, stock FROM products WHERE id = ANY($1::text[]) FOR UPDATE',
      [ids],
    )
    const byId = new Map(products.rows.map((item) => [item.id, item]))
    if (byId.size !== items.length) throw new Error('A product in your cart is no longer available.')
    let subtotal = 0
    const orderItems = []
    for (const item of items) {
      const product = byId.get(item.productId)
      if (Number(product.stock) < item.quantity) {
        throw new Error(`${product.name} has only ${product.stock} left in this demo catalogue.`)
      }
      subtotal += Number(product.price) * item.quantity
      orderItems.push({ productId: product.id, quantity: item.quantity, price: Number(product.price) })
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.productId])
    }
    await client.query(
      `INSERT INTO orders (id, customer_name, email, subtotal) VALUES ($1,$2,$3,$4)`,
      [orderId, name, email, subtotal],
    )
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1,$2,$3,$4)`,
        [orderId, item.productId, item.quantity, item.price],
      )
    }
    const event = {
      type: 'ORDER_PLACED',
      eventId: randomUUID(),
      orderId,
      items: orderItems.map(({ productId, quantity }) => ({ productId, quantity })),
      createdAt: new Date().toISOString(),
    }
    await client.query(
      `INSERT INTO store_outbox (id, order_id, event_type, payload) VALUES ($1,$2,$3,$4::jsonb)`,
      [event.eventId, orderId, event.type, JSON.stringify(event)],
    )
    await client.query('COMMIT')
    void flushOutbox()
    return { id: orderId, subtotal, eventStatus: 'pending' }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

async function parseJson(request) {
  let data = ''
  for await (const part of request) {
    data += part
    if (data.length > 1_000_000) throw new Error('Request is too large.')
  }
  return data ? JSON.parse(data) : {}
}

function send(response, statusCode, body) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
  })
  response.end(JSON.stringify(body))
}

async function handleRequest(request, response) {
  if (request.method === 'OPTIONS') return send(response, 204, {})
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
  try {
    if (request.method === 'GET' && url.pathname === '/api/health') {
      return send(response, 200, { services: status })
    }
    if (request.method === 'GET' && url.pathname === '/api/products') {
      return send(response, 200, { products: await readProducts() })
    }
    if (request.method === 'GET' && url.pathname === '/api/search') {
      if (!openSearch || !status.opensearch) return send(response, 503, { error: 'OpenSearch is not connected.' })
      const rawMax = url.searchParams.get('maxPrice')
      const max = rawMax === null || rawMax === '' ? undefined : Number(rawMax)
      const query = buildProductSearchQuery({
        query: (url.searchParams.get('q') || '').trim(),
        category: url.searchParams.get('category') || '',
        city: url.searchParams.get('city') || '',
        maxPrice: Number.isFinite(max) ? max : undefined,
      })
      const result = await openSearch.search({
        index: searchIndex,
        body: { query, size: 100, sort: [{ _score: { order: 'desc' } }, { price: { order: 'asc' } }] },
      })
      const hits = result.body?.hits?.hits || result.hits?.hits || []
      return send(response, 200, { products: hits.map((hit) => hit._source.catalog) })
    }
    if (request.method === 'POST' && url.pathname === '/api/orders') {
      const payload = await parseJson(request)
      const order = await createOrder(payload)
      return send(response, 201, { order })
    }
    const orderMatch = request.method === 'GET' && url.pathname.match(/^\/api\/orders\/([A-Z0-9-]+)$/i)
    if (orderMatch) {
      if (!pool || !status.postgres) throw new Error('PostgreSQL is not connected.')
      const { rows } = await pool.query('SELECT id, event_status, created_at FROM orders WHERE id = $1', [orderMatch[1]])
      if (!rows.length) return send(response, 404, { error: 'Order not found.' })
      return send(response, 200, { order: rows[0] })
    }
    return send(response, 404, { error: 'Not found.' })
  } catch (error) {
    const conflict = /only \d+ left|no longer available|stock/i.test(error.message)
    const code = conflict ? 409 : error.message.includes('not connected') ? 503 : 400
    return send(response, code, { error: error.message || 'Request failed.' })
  }
}

const server = createServer((request, response) => void handleRequest(request, response))
server.listen(port, '127.0.0.1', () => console.log(`StoreSync API listening on 127.0.0.1:${port}`))

async function initialize() {
  try {
    await ensureDatabase()
    if (pool) console.log('[postgres] connected and schema ready')
  } catch (error) {
    status.postgres = false
    logServiceError('postgres', error)
  }
  if (openSearch && status.postgres) {
    try {
      await ensureOpenSearch()
      console.log('[opensearch] connected and product index ready')
    } catch (error) {
      status.opensearch = false
      logServiceError('opensearch', error)
    }
  }
  try {
    await startKafka()
    if (kafka) console.log('[kafka] producer and consumer connected')
  } catch (error) {
    status.kafka = false
    await producer?.disconnect().catch(() => {})
    await consumer?.disconnect().catch(() => {})
    logServiceError('kafka', error)
  }
}

void initialize()

async function shutdown() {
  if (outboxTimer) clearInterval(outboxTimer)
  await Promise.allSettled([producer?.disconnect(), consumer?.disconnect(), pool?.end()])
  server.close(() => process.exit(0))
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
