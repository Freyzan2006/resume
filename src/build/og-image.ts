import { readFile } from "node:fs/promises"
import { extname } from "node:path"

import { formatDuration, totalMonths } from "../core/experience.ts"
import { formatLocation } from "../core/location.ts"
import { escapeMarkup } from "../core/seo/text.ts"
import { OG_IMAGE, publicImage } from "../core/seo/urls.ts"
import type { Locale } from "../core/site.ts"
import { launchBrowser } from "./browser.ts"

const MAX_SKILLS = 6

const IMAGE_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
}

const style = `
  body { margin: 0; width: ${OG_IMAGE.width}px; height: ${OG_IMAGE.height}px; overflow: hidden; }
  .card { box-sizing: border-box; height: 100%; padding: 72px 80px; border-left: 16px solid var(--primary);
    display: flex; flex-direction: column; justify-content: space-between; }
  .person { display: flex; align-items: center; gap: 56px; }
  .photo { width: 220px; height: 220px; flex-shrink: 0; border-radius: 50%; object-fit: cover; }
  .name { margin: 0; font-size: 68px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em;
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
  .label { margin-top: 12px; font-size: 36px; color: var(--muted-foreground); }
  .facts { margin-top: 28px; font-size: 26px; }
  .footer { display: flex; justify-content: space-between; align-items: flex-end; gap: 40px; }
  .skills { display: flex; flex-wrap: wrap; gap: 12px; margin: 0; padding: 0; list-style: none; }
  .skills li { padding: 6px 14px; font-size: 22px; border: 2px solid var(--border); border-radius: var(--radius); }
  .host { font-size: 24px; color: var(--muted-foreground); white-space: nowrap; }
`

type CardOptions = {
  locale: Locale
  /** The site's address from config.yaml: its host is printed on the card. */
  siteUrl: string
  /** The built site's stylesheet, for its fonts and colour tokens. */
  stylesheet: string
  /** Photo as a URL the card page can load. */
  image?: string
  now: Date
}

/** The card's page: name, title, location, experience and key skills. */
export function ogCardHtml({
  locale,
  siteUrl,
  stylesheet,
  image,
  now,
}: CardOptions) {
  const { lang, labels, resume } = locale
  const { basics } = resume
  const months = totalMonths(resume.work, now)
  const facts = [
    formatLocation(basics.location),
    months > 0
      ? `${labels.work}: ${formatDuration(months, lang, { units: labels })}`
      : undefined,
  ].filter((fact) => fact !== undefined)
  const skills = [
    ...new Set(resume.skills.flatMap((skill) => skill.keywords)),
  ].slice(0, MAX_SKILLS)
  const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
  const e = escapeMarkup

  return `<!doctype html>
<html lang="${e(lang)}" class="dark">
<head>
<meta charset="UTF-8" />
<link rel="stylesheet" href="${e(stylesheet)}" />
<style>${style}</style>
</head>
<body>
<div class="card">
  <div class="person">
    ${image ? `<img class="photo" src="${e(image)}" alt="" />` : ""}
    <div>
      <h1 class="name font-heading">${e(basics.name)}</h1>
      ${basics.label ? `<div class="label">${e(basics.label)}</div>` : ""}
      ${facts.length ? `<div class="facts">${e(facts.join(" · "))}</div>` : ""}
    </div>
  </div>
  <div class="footer">
    <ul class="skills font-mono">${skills.map((skill) => `<li>${e(skill)}</li>`).join("")}</ul>
    <div class="host font-mono">${e(host)}</div>
  </div>
</div>
</body>
</html>`
}

/** A local photo as a data URL: the card page cannot read the build machine's files. */
async function cardImage(basics: Locale["resume"]["basics"]) {
  const { image } = basics
  if (!image || publicImage(basics)) {
    return image
  }
  const type = IMAGE_TYPES[extname(image).toLowerCase()]
  const data = await readFile(image, "base64")
  return `data:${type};base64,${data}`
}

/** The stylesheet index.html links to, as a path relative to the site root. */
export function builtStylesheet(indexHtml: string) {
  const href = /<link rel="stylesheet"[^>]*href="([^"]+)"/.exec(indexHtml)?.[1]
  if (!href) {
    throw new Error("index.html: не найден подключённый CSS")
  }
  return href
}

type RenderOptions = {
  locale: Locale
  siteUrl: string
  /** Where the built site is served during the export. */
  previewUrl: string
  stylesheet: string
  outFile: string
}

/** Renders the card with headless Chromium on top of the built site's CSS. */
export async function renderOgImage({
  previewUrl,
  outFile,
  ...options
}: RenderOptions) {
  const page = ogCardHtml({
    ...options,
    image: await cardImage(options.locale.resume.basics),
    now: new Date(),
  })
  const cardUrl = new URL("og-card.html", previewUrl).href
  const browser = await launchBrowser()

  try {
    const tab = await browser.newPage({
      viewport: { width: OG_IMAGE.width, height: OG_IMAGE.height },
    })
    await tab.route(cardUrl, (route) =>
      route.fulfill({ contentType: "text/html", body: page })
    )
    await tab.goto(cardUrl, { waitUntil: "networkidle" })
    await tab.evaluate("document.fonts.ready.then(() => {})")
    await tab.screenshot({ path: outFile, type: "png" })
  } finally {
    await browser.close()
  }
}
