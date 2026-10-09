// Writes every format listed in assets/config.yaml (`formats`) into dist/.
// Run after `vite build`.
import { resolve } from "node:path"
import { preview, type PreviewServer } from "vite"

import { exporters } from "../exporters/index.ts"
import { ASSETS_DIR, loadSite } from "../plugins/resume/load.ts"

const { data, source } = await loadSite(resolve(ASSETS_DIR))

let server: PreviewServer | undefined

async function siteUrl() {
  server ??= await preview({
    preview: { port: 4180, open: false },
    logLevel: "warn",
  })
  const url = server.resolvedUrls?.local[0]
  if (!url) {
    throw new Error("vite preview не сообщил адрес сервера")
  }
  return url
}

try {
  for (const { format, href } of data.downloads) {
    const outFile = resolve("dist", href)
    await exporters[format]({ site: data, source, outFile, siteUrl })
    console.log(`${format}: ${outFile}`)
  }
} finally {
  await server?.close()
}
