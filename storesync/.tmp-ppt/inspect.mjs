import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const toolPath = 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const { FileBlob, PresentationFile } = await import(pathToFileURL(toolPath).href);
const input = 'C:/Users/MAHENDRA S/Downloads/1ppthack.pptx';
const out = 'C:/Users/MAHENDRA S/.codex/.chatgpt-projects/g-p-6af450ba5d2c8191b702b43f261749ea/storesync/.tmp-ppt';
const deck = await PresentationFile.importPptx(await FileBlob.load(input));
const report = await deck.inspect({kind:'slide,textbox,shape,image,table,chart,notes,layout',maxChars:50000});
await fs.writeFile(`${out}/inspect.ndjson`, report.ndjson, 'utf8');
console.log('slides', deck.slides.items.length, 'inspectChars', report.ndjson.length);
for (let i=0;i<deck.slides.items.length;i++) {
 const slide=deck.slides.items[i];
 const png=await deck.export({slide,format:'png',scale:1});
 await fs.writeFile(`${out}/source-${String(i+1).padStart(2,'0')}.png`,new Uint8Array(await png.arrayBuffer()));
}
const montage=await deck.export({format:'webp',montage:true,scale:0.5});
await fs.writeFile(`${out}/montage.webp`,new Uint8Array(await montage.arrayBuffer()));
