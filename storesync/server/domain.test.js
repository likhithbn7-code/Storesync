import test from 'node:test'
import assert from 'node:assert/strict'
import { buildProductSearchQuery, normalizeOrderItems } from './domain.js'

test('normalizes cart items and rejects invalid quantities', () => {
  assert.deepEqual(normalizeOrderItems([{ productId: 'soundwave-pro', quantity: '2' }]), [
    { productId: 'soundwave-pro', quantity: 2 },
  ])
  assert.throws(() => normalizeOrderItems([]), /at least one item/)
  assert.throws(() => normalizeOrderItems([{ productId: 'a', quantity: 0 }]), /quantity/)
  assert.throws(() => normalizeOrderItems([
    { productId: 'a', quantity: 1 },
    { productId: 'a', quantity: 1 },
  ]), /only once/)
})

test('builds typo-tolerant search plus exact filter clauses', () => {
  const query = buildProductSearchQuery({
    query: 'bluetoth',
    category: 'Audio',
    city: 'Bengaluru',
    maxPrice: 10000,
  })
  assert.equal(query.bool.must[0].multi_match.query, 'bluetoth')
  assert.equal(query.bool.must[0].multi_match.fuzziness, 'AUTO')
  assert.deepEqual(query.bool.filter, [
    { term: { category: 'Audio' } },
    { term: { cities: 'Bengaluru' } },
    { range: { price: { lte: 10000 } } },
  ])
})
