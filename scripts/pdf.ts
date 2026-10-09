// Prints the built site (dist/) to dist/resume.pdf with headless Chromium.
// Run after `vite build`. Browser lookup: $CHROMIUM_PATH, then a system
// Chromium/Chrome, then Playwright's own build (`playwright install chromium`).
import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { chromium } from "playwright"
import { preview } from "vite"

const OUT_FILE = resolve("dist/resume.pdf")

const SYSTEM_BROWSERS = [
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]

function findBrowser(): string | undefined {
  return process.env.CHROMIUM_PATH || SYSTEM_BROWSERS.find(existsSync)
}

const server = await preview({
  preview: { port: 4180, open: false },
  logLevel: "warn",
})

try {
  const url = server.resolvedUrls?.local[0]
  if (!url) {
    throw new Error("vite preview не сообщил адрес сервера")
  }

  const executablePath = findBrowser()
  const browser = await chromium.launch({ executablePath })

  try {
    const page = await browser.newPage({ colorScheme: "light" })
    await page.goto(url, { waitUntil: "networkidle" })
    // Runs in the page; a string keeps DOM types out of the Node tsconfig.
    await page.evaluate("document.fonts.ready.then(() => {})")
    await page.pdf({
      path: OUT_FILE,
      preferCSSPageSize: true,
      printBackground: true,
    })
  } finally {
    await browser.close()
  }

  console.log(`PDF: ${OUT_FILE} (${executablePath ?? "Playwright Chromium"})`)
} finally {
  await server.close()
}
