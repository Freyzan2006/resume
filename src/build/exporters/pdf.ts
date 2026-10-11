import { launchBrowser } from "../browser.ts"
import type { Exporter } from "./types.ts"

/** Prints the built site with headless Chromium, using its print styles. */
export const exportPdf: Exporter = async ({ outFile, pageUrl }) => {
  const browser = await launchBrowser()

  try {
    const page = await browser.newPage({ colorScheme: "light" })
    await page.goto(await pageUrl(), { waitUntil: "networkidle" })
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
    await browser.close()
  }
}
