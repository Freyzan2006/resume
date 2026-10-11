import { type CardContent, cardContent } from "../core/seo/card.ts"
import { escapeMarkup as e } from "../core/seo/text.ts"
import { OG_IMAGE, publicImage } from "../core/seo/urls.ts"
import type { Locale } from "../core/site.ts"
import type { BrowserSession } from "./browser.ts"
import { imageDataUrl } from "./images.ts"

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

type CardPage = {
  /** The built site's stylesheet, for its fonts and colour tokens. */
  stylesheet: string
  /** The photo as a URL the card page can load. */
  image?: string
}

/** The card as a page in the site's dark theme. */
export function cardHtml(card: CardContent, { stylesheet, image }: CardPage) {
  const optional = (
    value: string | undefined,
    render: (value: string) => string
  ) => (value ? render(value) : "")

  return `<!doctype html>
<html lang="${e(card.lang)}" class="dark">
<head>
<meta charset="UTF-8" />
<link rel="stylesheet" href="${e(stylesheet)}" />
<style>${style}</style>
</head>
<body>
<div class="card">
  <div class="person">
    ${optional(image, (src) => `<img class="photo" src="${e(src)}" alt="" />`)}
    <div>
      <h1 class="name font-heading">${e(card.name)}</h1>
      ${optional(card.label, (label) => `<div class="label">${e(label)}</div>`)}
      ${optional(card.facts.join(" · "), (facts) => `<div class="facts">${e(facts)}</div>`)}
    </div>
  </div>
  <div class="footer">
    <ul class="skills font-mono">${card.skills.map((skill) => `<li>${e(skill)}</li>`).join("")}</ul>
    <div class="host font-mono">${e(card.host)}</div>
  </div>
</div>
</body>
</html>`
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
  outFile: string
  session: BrowserSession
}

/** Renders the card with headless Chromium on top of the built site's CSS. */
export async function renderOgImage({
  locale,
  siteUrl,
  outFile,
  session,
}: RenderOptions) {
  const previewUrl = await session.siteUrl()
  const { basics } = locale.resume
  const html = cardHtml(cardContent(locale, siteUrl, new Date()), {
    stylesheet: builtStylesheet(await (await fetch(previewUrl)).text()),
    image:
      basics.image && !publicImage(basics)
        ? await imageDataUrl(basics.image)
        : basics.image,
  })

  const cardUrl = new URL("og-card.html", previewUrl).href
  const browser = await session.browser()
  const page = await browser.newPage({
    viewport: { width: OG_IMAGE.width, height: OG_IMAGE.height },
  })

  try {
    await page.route(cardUrl, (route) =>
      route.fulfill({ contentType: "text/html", body: html })
    )
    await page.goto(cardUrl, { waitUntil: "networkidle" })
    await page.evaluate("document.fonts.ready.then(() => {})")
    await page.screenshot({ path: outFile, type: "png" })
  } finally {
    await page.close()
  }
}
