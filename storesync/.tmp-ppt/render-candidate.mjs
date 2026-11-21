import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const toolPath = 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs'
const base = 'C:/Users/MAHENDRA S/.codex/.chatgpt-projects/g-p-6af450ba5d2c8191b702b43f261749ea/storesync/.tmp-ppt'
const { FileBlob, PresentationFile } = await import(pathToFileURL(toolPath).href)
const deck = await PresentationFile.importPptx(await FileBlob.load(path.join(base, 'candidate.pptx')))
for (let i = 0; i < deck.slides.items.length; i++) {
  const slide = deck.slides.items[i]
  const png = await deck.export({ slide, format: 'png', scale: 1 })
  await fs.writeFile(path.join(base, `review-${String(i + 1).padStart(2, '0')}.png`), new Uint8Array(await png.arrayBuffer()))
}
console.log(`Rendered ${deck.slides.items.length} slides for review.`)
