import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { localePath } from "../core/pages.ts"
import type { SiteData } from "../core/site.ts"
import type { BrowserSession } from "./browser.ts"

const ROOT_OPEN = '<div id="root">'

/** index.html with `content` inside its empty #root. */
export function fillRoot(html: string, content: string) {
  const start = html.indexOf(ROOT_OPEN)
  const end = html.lastIndexOf("</div>", html.indexOf("</body>"))
  if (start === -1 || end < start) {
    throw new Error('index.html: не найден <div id="root">')
  }
  return `${html.slice(0, start + ROOT_OPEN.length)}${content}${html.slice(end)}`
}

/**
 * Renders every language page of the built site in Chromium and writes the
 * result into its index.html: search engines and slow phones get the resume
 * without running JS, and the app replaces it with the same markup on load.
 */
export async function prerenderPages(
  { locales }: SiteData,
  session: BrowserSession,
  distDir: string
) {
  const siteUrl = await session.siteUrl()
  const browser = await session.browser()
  const rendered: { file: string; content: string }[] = []

  for (const { lang } of locales) {
    const path = localePath(lang, locales[0].lang)
    const page = await browser.newPage({ colorScheme: "light" })
    try {
      await page.goto(`${siteUrl}${path}`, { waitUntil: "networkidle" })
      await page.waitForSelector("#root main")
      rendered.push({
        file: join(distDir, path, "index.html"),
        content: await page.innerHTML("#root"),
      })
    } finally {
      await page.close()
    }
  }

  // Written only after every page is read: the preview server keeps serving dist/.
  for (const { file, content } of rendered) {
    await writeFile(file, fillRoot(await readFile(file, "utf8"), content))
  }
}
