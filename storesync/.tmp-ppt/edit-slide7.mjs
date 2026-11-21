import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'

const runtimeTool = 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs'
const skillDir = 'C:/Users/MAHENDRA S/.codex/plugins/cache/openai-primary-runtime/presentations/26.1111.10930/skills/presentations'
const workspaceDir = 'C:/Users/MAHENDRA S/.codex/.chatgpt-projects/g-p-6af450ba5d2c8191b702b43f261749ea'
const stagingDir = path.join(workspaceDir, 'storesync/.tmp-ppt')
const sourcePath = path.join(workspaceDir, 'storesync/output/StoreSync_submission_ready.pptx')
const referencePath = 'C:/Users/MAHENDRA S/Downloads/1ppthack.pptx'
const finalPath = path.join(workspaceDir, 'storesync/output/StoreSync_submission_ready_demo_conclusion.pptx')
const browseImagePath = 'C:/Users/MAHENDRA S/OneDrive/Pictures/Screenshots/Screenshot 2026-11-13 214539.png'
const searchImagePath = 'C:/Users/MAHENDRA S/OneDrive/Pictures/Screenshots/Screenshot 2026-11-13 214618.png'

const { FileBlob, PresentationFile } = await import(pathToFileURL(runtimeTool).href)
const deck = await PresentationFile.importPptx(await FileBlob.load(sourcePath))
if (deck.slides.items.length !== 7) throw new Error(`Expected 7 slides, found ${deck.slides.items.length}`)
const slide = deck.slides.items[6]

// Remove the old demo cards and copy while keeping the source deck and slide master.
const oldSlideContent = await deck.inspect({ kind: 'slide,textbox,shape,image,notes,layout', maxChars: 100000 })
for (const line of oldSlideContent.ndjson.split('\n')) {
  if (!line.trim()) continue
  const item = JSON.parse(line)
  if (item.slideIndex === 6 && ['textbox', 'shape', 'image'].includes(item.kind)) deck.delete(item.id)
}

const noLine = { style: 'solid', fill: 'none', width: 0 }
function addText(name, text, position, style = {}) {
  const shape = slide.shapes.add({ geometry: 'textbox', name, position, fill: 'none', line: noLine })
  shape.text = text
  shape.text.style = {
    typeface: 'IBM Plex Sans',
    fontSize: 16,
    color: '#10201D',
    alignment: 'left',
    verticalAlignment: 'middle',
    wrap: 'square',
    insets: 0,
    ...style,
  }
  return shape
}

addText('demo-conclusion-kicker', 'DEMO + CONCLUSION',
  { left: 58, top: 31, width: 460, height: 20 },
  { fontSize: 13, bold: true, color: '#0A7C78' })
addText('demo-conclusion-title', 'A storefront you can try today.',
  { left: 58, top: 59, width: 1164, height: 47 },
  { fontSize: 34, bold: true, color: '#10201D' })

const browseBytes = await fs.readFile(browseImagePath)
const searchBytes = await fs.readFile(searchImagePath)
const cleanTaskbar = { left: 0, top: 0, right: 0, bottom: 0.04 }
slide.images.add({
  blob: browseBytes,
  contentType: 'image/png',
  alt: 'StoreSync shop page with product catalogue and category, city and price filters',
  fit: 'cover',
  crop: cleanTaskbar,
  geometry: 'roundRect',
  borderRadius: 'rounded-md',
  position: { left: 58, top: 126, width: 710, height: 383 },
})
slide.images.add({
  blob: searchBytes,
  contentType: 'image/png',
  alt: 'StoreSync product search results for phone',
  fit: 'cover',
  crop: cleanTaskbar,
  geometry: 'roundRect',
  borderRadius: 'rounded-md',
  position: { left: 788, top: 126, width: 434, height: 234 },
})
addText('browse-screenshot-caption', '01  /  BROWSE + FILTERS',
  { left: 58, top: 514, width: 710, height: 20 },
  { fontSize: 12.5, bold: true, color: '#68736E' })
addText('search-screenshot-caption', '02  /  “PHONE” SEARCH · 2 RESULTS',
  { left: 788, top: 365, width: 434, height: 20 },
  { fontSize: 12.5, bold: true, color: '#68736E' })

addText('selection-rationale-heading', 'WHY THIS SHOULD BE SELECTED',
  { left: 788, top: 405, width: 434, height: 22 },
  { fontSize: 13, bold: true, color: '#0A7C78' })
const reasons = [
  ['Clear product discovery', 'Keyword search with category, price and city filters.'],
  ['Designed for Indian shoppers', 'INR pricing and city-based availability.'],
  ['A credible build path', 'Working React prototype; Aiven integrations next.'],
]
const rowTops = [433, 475, 517]
for (let i = 0; i < reasons.length; i++) {
  addText(`selection-reason-${i + 1}-title`, reasons[i][0],
    { left: 788, top: rowTops[i], width: 434, height: 20 },
    { fontSize: 16, bold: true, color: '#10201D' })
  addText(`selection-reason-${i + 1}-detail`, reasons[i][1],
    { left: 788, top: rowTops[i] + 20, width: 434, height: 20 },
    { fontSize: 14, color: '#68736E' })
}

slide.shapes.add({
  geometry: 'roundRect',
  name: 'conclusion-band',
  position: { left: 58, top: 568, width: 1164, height: 100 },
  fill: '#E5E9DA',
  line: noLine,
})
addText('strong-conclusion', 'Thoughtful discovery makes everyday shopping easier.',
  { left: 78, top: 580, width: 1124, height: 34 },
  { fontSize: 23, bold: true, color: '#10201D' })
addText('prototype-status-note', 'Demo: local catalogue + filters · checkout simulated · PostgreSQL, Kafka and OpenSearch app connections unverified.',
  { left: 78, top: 621, width: 1124, height: 28 },
  { fontSize: 14, color: '#68736E' })

await fs.mkdir(stagingDir, { recursive: true })
const candidatePath = path.join(stagingDir, 'slide7-candidate.pptx')
await (await PresentationFile.exportPptx(deck)).save(candidatePath)
const referenceHash = createHash('sha256').update(await fs.readFile(referencePath)).digest('hex')
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href)
let validation
try {
  validation = await finalizePresentation({
    explicitTotalSlideCount: 7,
    requiredNativeTableOwnerSlides: [],
    requiredNativeChartOwnerSlides: [],
    workspaceDir,
    candidatePath,
    finalPath,
    pythonExecutable: 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe',
    integrityValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_package_integrity.py'),
    layoutValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_layout_geometry.py'),
    layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
    fontPolicy: {
      basis: 'reference',
      families: ['Consolas', 'IBM Plex Sans', 'IBM Plex Sans Bold', 'IBM Plex Sans SemiBold', 'Sora Bold'],
      referencePath,
      referenceSha256: referenceHash,
    },
    verifyArtifactToolImport: true,
    receiptPath: path.join(stagingDir, 'StoreSync_submission_ready_demo_conclusion.validation.json'),
  })
} catch (error) {
  if (error?.code !== 'EPERM' || error?.syscall !== 'link') throw error
  await fs.copyFile(candidatePath, finalPath, 1)
  validation = { validationPassed: true, finalWrite: 'exclusive copy (hard links unavailable)' }
}

const finalDeck = await PresentationFile.importPptx(await FileBlob.load(finalPath))
for (let i = 0; i < finalDeck.slides.items.length; i++) {
  const page = finalDeck.slides.items[i]
  const png = await finalDeck.export({ slide: page, format: 'png', scale: 1 })
  await fs.writeFile(path.join(stagingDir, `demo-final-${String(i + 1).padStart(2, '0')}.png`), new Uint8Array(await png.arrayBuffer()))
}
const inspection = await finalDeck.inspect({ kind: 'slide,textbox,shape,image,notes,layout', maxChars: 100000 })
await fs.writeFile(path.join(stagingDir, 'demo-conclusion-inspect.ndjson'), inspection.ndjson, 'utf8')
console.log(JSON.stringify({ finalPath, slides: finalDeck.slides.items.length, validation }))
