import { existsSync } from "node:fs"
import { chromium } from "playwright"

import type { Exporter } from "./types.ts"

const SYSTEM_BROWSERS = [
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]

/** $CHROMIUM_PATH, then a system Chromium/Chrome, then Playwright's own build. */
function findBrowser(): string | undefined {
  return process.env.CHROMIUM_PATH || SYSTEM_BROWSERS.find(existsSync)
}

/** Prints the built site with headless Chromium, using its print styles. */
export const exportPdf: Exporter = async ({ outFile, siteUrl }) => {
  const browser = await chromium.launch({ executablePath: findBrowser() })

  try {
    const page = await browser.newPage({ colorScheme: "light" })
    await page.goto(await siteUrl(), { waitUntil: "networkidle" })
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
