// Writes every format listed in assets/config.yaml (`formats`) for every
// language version into dist/. Run after `vite build`.
import { resolve } from "node:path"
import { preview, type PreviewServer } from "vite"

import { exporters } from "../exporters/index.ts"
import { ASSETS_DIR, loadSite } from "../load.ts"

const { data, sources } = await loadSite(resolve(ASSETS_DIR))

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
  for (const locale of data.locales) {
    const pageUrl = async () => `${await siteUrl()}?lang=${locale.lang}`

    for (const { format, href } of locale.downloads) {
      const outFile = resolve("dist", href)
      const source = sources[locale.lang]
      await exporters[format]({ locale, source, outFile, pageUrl })
      console.log(`${format}: ${outFile}`)
    }
  }
} finally {
  await server?.close()
}
