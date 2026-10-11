import { existsSync } from "node:fs"
import { chromium } from "playwright"

const SYSTEM_BROWSERS = [
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]

/** $CHROMIUM_PATH, then a system Chromium/Chrome, then Playwright's own build. */
export function launchBrowser() {
  const executablePath =
    process.env.CHROMIUM_PATH || SYSTEM_BROWSERS.find(existsSync)
  return chromium.launch({ executablePath })
}
