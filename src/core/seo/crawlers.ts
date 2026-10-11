import type { SiteData } from "../site.ts"
import { escapeMarkup } from "./text.ts"
import { alternates, languagePages } from "./urls.ts"

export function robotsTxt({ url }: SiteData) {
  const lines = ["User-agent: *", "Allow: /"]
  if (url) {
    lines.push("", `Sitemap: ${url}sitemap.xml`)
  }
  return `${lines.join("\n")}\n`
}

/** One entry per language, each listing all of them as alternates. */
export function sitemapXml({ locales, url }: SiteData) {
  if (!url) {
    return
  }
  const links = alternates(url, locales).map(
    ({ hreflang, href }) =>
      `    <xhtml:link rel="alternate" hreflang="${escapeMarkup(hreflang)}" href="${escapeMarkup(href)}"/>`
  )
  const entries = languagePages(url, locales).flatMap(({ href }) => [
    "  <url>",
    `    <loc>${escapeMarkup(href)}</loc>`,
    ...links,
    "  </url>",
  ])

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n")
}
