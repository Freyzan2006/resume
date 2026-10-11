import type { HtmlTagDescriptor } from "vite"

import { headTags } from "../core/seo/head.ts"
import { personJsonLd, serializeJsonLd } from "../core/seo/json-ld.ts"
import { escapeMarkup } from "../core/seo/text.ts"
import type { SiteData } from "../core/site.ts"

/** SVG favicon with the person's initials, so forks don't share an icon. */
function initialsFavicon(name: string) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#18181b"/><text x="32" y="32" dy=".35em" text-anchor="middle" font-family="monospace" font-size="28" font-weight="700" fill="#fafafa">${escapeMarkup(initials)}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const headTag = (
  tag: string,
  attrs: Record<string, string>,
  children?: string
): HtmlTagDescriptor => ({ tag, attrs, children, injectTo: "head" })

/**
 * index.html with the person's primary language, title, favicon and search
 * metadata. The web layer updates them when the language changes.
 */
export function personalizeHtml(html: string, site: SiteData) {
  const [{ lang, title, resume }] = site.locales
  const { meta, links } = headTags(site)

  return {
    html: html
      .replace(/<html lang="[^"]*"/, `<html lang="${escapeMarkup(lang)}"`)
      .replace(/<title>.*<\/title>/, `<title>${escapeMarkup(title)}</title>`),
    tags: [
      headTag("link", {
        rel: "icon",
        href: initialsFavicon(resume.basics.name),
      }),
      ...meta.map((attrs) => headTag("meta", attrs)),
      ...links.map((attrs) => headTag("link", attrs)),
      headTag(
        "script",
        { type: "application/ld+json" },
        serializeJsonLd(personJsonLd(site))
      ),
    ],
  }
}
