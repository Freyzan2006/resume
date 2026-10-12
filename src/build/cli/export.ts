// Writes every format listed in assets/config.yaml (`formats`) for every
// language version into dist/, the link-preview cards when `url` is set, and
// prerenders the pages. Run after `vite build`.
import { resolve } from "node:path"

import { localePath } from "../../core/pages.ts"
import { ogImageFile } from "../../core/seo/urls.ts"
import { browserSession } from "../browser.ts"
import { exporters } from "../exporters/index.ts"
import { ASSETS_DIR, loadSite } from "../load.ts"
import { renderOgImage } from "../og-image.ts"
import { prerenderPages } from "../prerender.ts"

const DIST_DIR = resolve("dist")

const { data, sources } = await loadSite(resolve(ASSETS_DIR))
const session = browserSession()

try {
  for (const locale of data.locales) {
    const path = localePath(locale.lang, data.locales[0].lang)
    for (const { format, href } of locale.downloads) {
      const outFile = resolve(DIST_DIR, href)
      const source = sources[locale.lang]
      await exporters[format]({
        locale,
        source,
        sections: data.sections,
        path,
        outFile,
        session,
      })
      console.log(`${format}: ${outFile}`)
    }

    if (data.url) {
      const outFile = resolve(DIST_DIR, ogImageFile(locale.lang))
      await renderOgImage({ locale, siteUrl: data.url, outFile, session })
      console.log(`og: ${outFile}`)
    }
  }

  await prerenderPages(data, session, DIST_DIR)
  console.log(
    `prerender: ${data.locales.map((locale) => locale.lang).join(", ")}`
  )
} finally {
  await session.close()
}
