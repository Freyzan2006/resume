import { existsSync } from "node:fs"
import { type Browser, chromium } from "playwright"
import { preview } from "vite"

const SYSTEM_BROWSERS = [
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]

/** $CHROMIUM_PATH, then a system Chromium/Chrome, then Playwright's own build. */
function launchBrowser() {
  const executablePath =
    process.env.CHROMIUM_PATH || SYSTEM_BROWSERS.find(existsSync)
  return chromium.launch({ executablePath })
}

async function startPreview() {
  const server = await preview({
    preview: { port: 4180, open: false },
    logLevel: "warn",
  })
  const url = server.resolvedUrls?.local[0]
  if (!url) {
    await server.close()
    throw new Error("vite preview не сообщил адрес сервера")
  }
  return { server, url }
}

/**
 * The built site (dist/) served by `vite preview` and one headless Chromium,
 * both started on first use and shared by the whole export step.
 */
export function browserSession() {
  let site: ReturnType<typeof startPreview> | undefined
  let browser: Promise<Browser> | undefined

  return {
    async siteUrl() {
      site ??= startPreview()
      return (await site).url
    },

    browser() {
      browser ??= launchBrowser()
      return browser
    },

    async close() {
      await (await browser)?.close()
      await (await site)?.server.close()
    },
  }
}

export type BrowserSession = ReturnType<typeof browserSession>
