import type { Exporter } from "./types.ts"

/** Prints the built site with headless Chromium, using its print styles. */
export const exportPdf: Exporter = async ({ path, outFile, session }) => {
  const browser = await session.browser()
  const page = await browser.newPage({ colorScheme: "light" })

  try {
    await page.goto(`${await session.siteUrl()}${path}`, {
      waitUntil: "networkidle",
    })
    // The app has replaced the loading skeleton of index.html.
    await page.waitForSelector("main:not([aria-busy])")
    // Runs in the page; a string keeps DOM types out of the Node tsconfig.
    await page.evaluate("document.fonts.ready.then(() => {})")
    await page.pdf({
      path: outFile,
      preferCSSPageSize: true,
      printBackground: true,
    })
  } finally {
    await page.close()
  }
}
