// Writes every format listed in assets/config.yaml (`formats`) for every
// language version into dist/, and the link-preview card when `url` is set.
// Run after `vite build`.
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { type PreviewServer, preview } from "vite"

import { OG_IMAGE } from "../../core/seo/urls.ts"
import { exporters } from "../exporters/index.ts"
import { ASSETS_DIR, loadSite } from "../load.ts"
import { builtStylesheet, renderOgImage } from "../og-image.ts"

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

  if (data.url) {
    const outFile = resolve("dist", OG_IMAGE.file)
    await renderOgImage({
      locale: data.locales[0],
      siteUrl: data.url,
      previewUrl: await siteUrl(),
      stylesheet: builtStylesheet(
        await readFile(resolve("dist", "index.html"), "utf8")
      ),
      outFile,
    })
    console.log(`og: ${outFile}`)
  }
} finally {
  await server?.close()
}
