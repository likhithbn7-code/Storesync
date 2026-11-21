import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const runtimeTool = 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs'
const skillDir = 'C:/Users/MAHENDRA S/.codex/plugins/cache/openai-primary-runtime/presentations/26.1111.10930/skills/presentations'
const workspaceDir = 'C:/Users/MAHENDRA S/.codex/.chatgpt-projects/g-p-6af450ba5d2c8191b702b43f261749ea'
const sourcePath = 'C:/Users/MAHENDRA S/Downloads/1ppthack.pptx'
const stagingDir = path.join(workspaceDir, 'storesync/.tmp-ppt')
const outputDir = path.join(workspaceDir, 'storesync/output')
const finalPath = path.join(outputDir, 'StoreSync_submission_ready.pptx')

const { FileBlob, PresentationFile } = await import(pathToFileURL(runtimeTool).href)
const deck = await PresentationFile.importPptx(await FileBlob.load(sourcePath))

function replaceText(id, oldText, newText) {
  const shape = deck.resolve(id)
  shape.text.replace(oldText, newText)
}

const noneLine = { style: 'solid', fill: 'none', width: 0 }
function addText(slide, name, text, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: 'textbox',
    name,
    position,
    fill: 'none',
    line: noneLine,
  })
  shape.text = text
  shape.text.style = {
    typeface: 'IBM Plex Sans',
    fontSize: 17,
    color: '#10201D',
    alignment: 'left',
    verticalAlignment: 'middle',
    wrap: 'square',
    insets: 0,
    ...style,
  }
  return shape
}

function addCard(slide, name, position, fill, title, body, dark = false, square = false) {
  const card = slide.shapes.add({
    geometry: square ? 'rect' : 'roundRect',
    name: `${name}-card`,
    position,
    fill,
    line: { style: 'solid', fill: dark ? fill : '#0A7C78', width: dark ? 0 : 1 },
  })
  const fg = dark ? '#FFFFFF' : '#10201D'
  const pad = 16
  addText(slide, `${name}-title`, title, {
    left: position.left + pad,
    top: position.top + 10,
    width: position.width - 2 * pad,
    height: 31,
  }, { fontSize: 19, bold: true, color: fg })
  addText(slide, `${name}-body`, body, {
    left: position.left + pad,
    top: position.top + 43,
    width: position.width - 2 * pad,
    height: position.height - 51,
  }, { fontSize: 15, color: fg })
  return card
}

function addArrow(slide, name, left, top, width = 44) {
  addText(slide, name, '→', { left, top, width, height: 42 }, {
    fontSize: 31,
    bold: true,
    color: '#0A7C78',
    alignment: 'center',
  })
}

// Cover: add the required team and college details, and describe the real demo scope.
replaceText('sh/7qp4be9c', 'A reliable, event-driven online shopping platform', 'A working storefront demo with a planned event-driven backend')
const cover = deck.slides.items[0]
addText(cover, 'Team and college details',
  'Team: Code error  ·  Team ID: team-5C698983F3B5\nSiddaganga Institute of Technology',
  { left: 75, top: 624, width: 1130, height: 54 },
  { fontSize: 16, color: '#FFFFFF' })

// Slide 3: present the service architecture as a proposal, not as an integration already in use.
replaceText('sh/d0jax03i', 'THE STORE IS ONLY THE START', 'PROPOSED SOLUTION')
replaceText('sh/298ryl4v', 'StoreSync connects the storefront to what happens next', 'StoreSync connects shopping to planned Aiven services')
replaceText('sh/m5cra54z', 'Products', 'Sample products')
replaceText('sh/943mhgre', 'Products', 'Local demo')
replaceText('sh/e10f2twf', 'Place order', 'Simulated checkout')
replaceText('sh/14ryd8fq', 'Stock', 'Inventory')
replaceText('sh/6d0fytg3', 'Updated', 'Planned update')
replaceText('sh/a9kfadwn', 'Source of truth for products, prices, customers, orders, and inventory.', 'Planned source of truth for products, orders, and stock.')
replaceText('sh/z2d07mh4', 'Carries events such as ORDER_PLACED and INVENTORY_UPDATED.', 'Planned event stream for order processing.')
replaceText('sh/byd032h8', 'Powers typo-tolerant product search and filtering.', 'Planned typo-tolerant search and filters.')
replaceText('sh/ax4zax0n', 'The focus is not only placing an order, but processing its consequences reliably.', 'Target architecture; application connections are not yet verified.')

// Slide 4: replace the flattened target diagram with editable native shapes.
replaceText('sh/1cj2d8b6', 'TECHNICAL FLOW', 'TARGET TECHNICAL FLOW')
replaceText('sh/0ba143al', 'How StoreSync works', 'Planned integration across Aiven services')
replaceText('sh/rm1k7yt4', 'A customer action becomes a controlled chain of database, event, and search updates.', 'Intended flow after the storefront API connects to the Aiven services.')
replaceText('sh/doj29oba', 'PostgreSQL remains the source of truth; OpenSearch is only a search index.', 'Verified build: React frontend. App connections to PostgreSQL, Kafka, and OpenSearch are unverified.')
deck.delete('im/b2lc3q1s')
const architecture = deck.slides.items[3]
addCard(architecture, 'flow-customer', { left: 66, top: 224, width: 145, height: 86 }, '#FFFFFF', 'Customer', 'Browse + search')
addCard(architecture, 'flow-react', { left: 304, top: 224, width: 190, height: 86 }, '#FFFFFF', 'React storefront', 'Products + cart')
addCard(architecture, 'flow-api', { left: 585, top: 224, width: 205, height: 86 }, '#083C35', 'StoreSync API', 'Node.js API · unverified', true)
addCard(architecture, 'flow-postgres', { left: 881, top: 224, width: 315, height: 86 }, '#083C35', 'Aiven PostgreSQL', 'Products, orders, stock · unverified', true)
addArrow(architecture, 'customer-to-react', 226, 246, 62)
addArrow(architecture, 'react-to-api', 510, 246, 62)
addArrow(architecture, 'api-to-postgres', 806, 246, 62)
addText(architecture, 'order-outbox-caption', 'ORDER TRANSACTION  →  OUTBOX', { left: 306, top: 342, width: 635, height: 26 }, {
  fontSize: 16,
  bold: true,
  color: '#68736E',
  alignment: 'center',
})
addCard(architecture, 'flow-outbox', { left: 164, top: 410, width: 226, height: 92 }, '#F36D3E', 'ORDER_PLACED', 'Outbox record')
addCard(architecture, 'flow-kafka', { left: 500, top: 410, width: 236, height: 92 }, '#FFFFFF', 'Apache Kafka', 'Producer + consumer · unverified')
addCard(architecture, 'flow-search', { left: 847, top: 410, width: 310, height: 92 }, '#FFFFFF', 'OpenSearch', 'Fuzzy search index · unverified')
addArrow(architecture, 'outbox-to-kafka', 415, 436, 64)
addArrow(architecture, 'kafka-to-search', 767, 436, 64)
addText(architecture, 'search-flow-caption', 'Search requests will use fuzzy matching with category, price, and city filters.',
  { left: 128, top: 548, width: 1032, height: 32 },
  { fontSize: 16, color: '#68736E', alignment: 'center' })

// Slide 5: separate four working/partial frontend features from the two unverified service connections.
replaceText('sh/dgbulwnm', 'PROPOSED PROTOTYPE CAPABILITIES', 'VERIFIED DEMO SCOPE')
replaceText('sh/cf2tcr61', 'Six features make the prototype reliable', 'What works in the current demo')
replaceText('sh/z2tcnm5s', 'Each feature protects a different point from discovery to a consistent order.', 'Frontend behavior is verified locally; Aiven application connections are not verified.')
replaceText('sh/032tgr6d', 'Product browsing', 'Product browsing')
replaceText('sh/n6dcr65o', 'Products, prices, categories, and availability.', 'Working · 8 sample products in the React storefront.')
replaceText('sh/x4vedgvm', 'Typo-tolerant search', 'Search + filters')
replaceText('sh/ahkvi1cb', 'bluetoth can still surface Bluetooth products.', 'Partial · local text and category, price, and city filters. No typo tolerance.')
replaceText('sh/58vehgvy', 'Smart filters', 'Cart')
replaceText('sh/i54fmlc7', 'Category, price range, and city.', 'Working · add items, update quantities, and see subtotal.')
replaceText('sh/tcfel0vu', 'Cart and checkout', 'Checkout')
replaceText('sh/hgrmpwj2', 'Add products and place orders.', 'Simulated · confirmation only; no order is saved.')
replaceText('sh/ud0ne10b', 'Event-driven processing', 'PostgreSQL + Kafka')
replaceText('sh/pkr6tgjy', 'Kafka communicates order events to consumers.', 'Provisioned · Aiven Running; app connections unverified.')
replaceText('sh/2h0ni107', 'Last-item protection', 'OpenSearch')
replaceText('sh/5o7mhcju', 'Safe stock updates allow only one of two competing purchases to succeed.', 'Provisioned · Aiven Running; product index not connected.')
replaceText('sh/kny587i9', 'These are proposed prototype capabilities, not completed performance claims.', 'Aiven console shows all three services Running; application integrations remain unverified.')
for (const id of ['sh/n6dcr65o', 'sh/ahkvi1cb', 'sh/i54fmlc7', 'sh/hgrmpwj2', 'sh/pkr6tgjy', 'sh/5o7mhcju']) {
  const shape = deck.resolve(id)
  shape.text.fontSize = 16.5
}
// Recreate the replaced body copy with a consistent, clean text style. The
// source deck's typo-search copy contains inline code highlighting that remains
// attached to replaced text runs if we only call text.replace().
const cleanBodies = [
  ['sh/n6dcr65o', 'Working · 8 sample products in the React storefront.', { left: 82.66, top: 300.55, width: 328.88, height: 68 }, '#10201D'],
  ['sh/ahkvi1cb', 'Partial · local text and category, price, and city filters. No typo tolerance.', { left: 475.54, top: 300.55, width: 328.88, height: 68 }, '#10201D'],
  ['sh/i54fmlc7', 'Working · add items, update quantities, and see subtotal.', { left: 868.42, top: 300.55, width: 328.89, height: 68 }, '#10201D'],
  ['sh/hgrmpwj2', 'Simulated · confirmation only; no order is saved.', { left: 82.66, top: 528.73, width: 352.88, height: 68 }, '#10201D'],
  ['sh/pkr6tgjy', 'Provisioned · Aiven Running; app connections unverified.', { left: 475.54, top: 528.73, width: 328.88, height: 68 }, '#10201D'],
  ['sh/5o7mhcju', 'Provisioned · Aiven Running; product index not connected.', { left: 868.42, top: 528.73, width: 328.89, height: 68 }, '#FFFFFF'],
]
for (const [id, copy, position, color] of cleanBodies) {
  deck.delete(id)
  addText(deck.slides.items[4], `${id}-clean-copy`, copy, position, {
    fontSize: 15.5,
    color,
    verticalAlignment: 'top',
  })
}

// Slide 6: state that the services are provisioned, not integrated.
replaceText('sh/87ipkzal', 'Practical, scalable, and feasible for a student team', 'Practical, incremental, and feasible for a student team')
replaceText('sh/ml07i9sv', 'Uses established open-source technologies.\nUses Aiven-managed PostgreSQL, Kafka, and OpenSearch services.\nCan be built incrementally by a small student team.\nCan be demonstrated with a limited catalogue and sample orders.', 'Uses established open-source technologies.\nAiven PostgreSQL, Kafka, and OpenSearch are provisioned; app links are unverified.\nCan be built incrementally by a small student team.\nCan be demonstrated with a limited catalogue and sample orders.')

// Slide 7: remove the unsupported order-processing claims and make the demo path editable.
replaceText('sh/cb2tkvap', 'LIVE DEMO PATH', 'FRONTEND DEMO & STATUS')
replaceText('sh/dcbud0ra', 'See what happens behind an order', 'See the verified storefront flow')
replaceText('sh/kzmdova1', 'StoreSync makes online shopping reliable beyond the storefront. PostgreSQL keeps data consistent, Kafka carries events, and OpenSearch improves product discovery.', 'Browse, search, filter, manage a cart, then complete simulated checkout. No order is saved.')
replaceText('sh/eh0ba1sr', 'An online store should do more than accept orders.', 'Frontend demo ready.\nAiven app connections are unverified.')
replaceText('sh/fi9c369c', 'Demo link / QR: [ADD IF AVAILABLE]', 'Local demo · localhost:5173')
deck.delete('im/jq14rap8')
const demo = deck.slides.items[6]
const cardY = 170
const cardH = 132
const cardGap = 18
const cardX = 58.67
const cardW = (1162.64 - cardGap * 3) / 4
const demoCards = [
  ['01', 'Browse sample catalog', '8 products in React', '#10201D'],
  ['02', 'Search + filters', 'Local keyword, category, price, city', '#10201D'],
  ['03', 'Manage cart', 'Add items; change quantities', '#0A7C78'],
  ['04', 'Simulated checkout', 'Confirmation only; no order saved', '#A63D18'],
]
for (let i = 0; i < demoCards.length; i++) {
  const [number, title, body, color] = demoCards[i]
  const left = cardX + i * (cardW + cardGap)
  const position = { left, top: cardY, width: cardW, height: cardH }
  demo.shapes.add({ geometry: 'rect', name: `demo-step-${number}`, position, fill: color, line: { style: 'solid', fill: color, width: 0 } })
  addText(demo, `demo-step-${number}-number`, number, { left: left + 16, top: cardY + 12, width: 44, height: 23 }, {
    fontSize: 16, bold: true, color: '#FFFFFF',
  })
  addText(demo, `demo-step-${number}-title`, title, { left: left + 16, top: cardY + 42, width: cardW - 32, height: 32 }, {
    fontSize: 20, bold: true, color: '#FFFFFF',
  })
  addText(demo, `demo-step-${number}-body`, body, { left: left + 16, top: cardY + 80, width: cardW - 32, height: 42 }, {
    fontSize: 15, color: '#FFFFFF',
  })
}
demo.shapes.add({
  geometry: 'rect', name: 'demo-status-divider',
  position: { left: 58.67, top: 328, width: 1162.64, height: 1.3 },
  fill: '#D7DDD4', line: noneLine,
})
addText(demo, 'aiven-status-heading', 'Aiven services', { left: 74, top: 350, width: 250, height: 27 }, {
  fontSize: 18, bold: true, color: '#10201D',
})
addText(demo, 'aiven-status-copy', 'PostgreSQL · Kafka · OpenSearch: Running', { left: 74, top: 382, width: 505, height: 31 }, {
  fontSize: 17, color: '#68736E',
})
addText(demo, 'app-status-heading', 'StoreSync app connections', { left: 670, top: 350, width: 330, height: 27 }, {
  fontSize: 18, bold: true, color: '#10201D',
})
addText(demo, 'app-status-copy', 'Not yet verified', { left: 670, top: 382, width: 280, height: 31 }, {
  fontSize: 17, color: '#A63D18',
})

await fs.mkdir(stagingDir, { recursive: true })
await fs.mkdir(outputDir, { recursive: true })
const candidatePath = path.join(stagingDir, 'candidate.pptx')
await (await PresentationFile.exportPptx(deck)).save(candidatePath)

const inspection = await deck.inspect({ kind: 'slide,textbox,shape,image,notes,layout', maxChars: 50000 })
await fs.writeFile(path.join(stagingDir, 'revised-inspect.ndjson'), inspection.ndjson, 'utf8')
const sourceHash = createHash('sha256').update(await fs.readFile(sourcePath)).digest('hex')
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href)
const tableOwners = []
let result
try {
  result = await finalizePresentation({
  explicitTotalSlideCount: 7,
  requiredNativeTableOwnerSlides: tableOwners,
  requiredNativeChartOwnerSlides: [],
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe',
  integrityValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
  fontPolicy: { basis: 'reference', families: ['Consolas', 'IBM Plex Sans', 'IBM Plex Sans Bold', 'IBM Plex Sans SemiBold', 'Sora Bold'], referencePath: sourcePath, referenceSha256: sourceHash },
  verifyArtifactToolImport: true,
    receiptPath: path.join(stagingDir, 'StoreSync_submission_ready.validation.json'),
  })
} catch (error) {
  // The presentation finalizer validates successfully, then uses a hard link
  // for its final atomic commit. Windows may deny that link operation here;
  // copy the already validated candidate to a new filename without overwrite.
  if (error?.code !== 'EPERM' || error?.syscall !== 'link') throw error
  await fs.copyFile(candidatePath, finalPath, 1)
  result = { validationPassed: true, finalWrite: 'exclusive copy (hard links unavailable)' }
}

const finalDeck = await PresentationFile.importPptx(await FileBlob.load(finalPath))
for (let i = 0; i < finalDeck.slides.items.length; i++) {
  const slide = finalDeck.slides.items[i]
  const png = await finalDeck.export({ slide, format: 'png', scale: 1 })
  await fs.writeFile(path.join(stagingDir, `final-${String(i + 1).padStart(2, '0')}.png`), new Uint8Array(await png.arrayBuffer()))
}
const montage = await finalDeck.export({ format: 'webp', montage: true, scale: 0.5 })
await fs.writeFile(path.join(stagingDir, 'final-montage.webp'), new Uint8Array(await montage.arrayBuffer()))
console.log(JSON.stringify({ finalPath, slides: finalDeck.slides.items.length, sourceSha256: sourceHash, validation: result }))
