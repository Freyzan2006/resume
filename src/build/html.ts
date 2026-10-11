import { localePath } from "../core/pages.ts"
import { headTags } from "../core/seo/head.ts"
import { personJsonLd, serializeJsonLd } from "../core/seo/json-ld.ts"
import { escapeMarkup } from "../core/seo/text.ts"
import type { Locale, SiteData } from "../core/site.ts"

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

function tag(name: string, attrs: Record<string, string>, children?: string) {
  const attributes = Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${escapeMarkup(value)}"`)
    .join("")
  return children === undefined
    ? `<${name}${attributes}>`
    : `<${name}${attributes}>${children}</${name}>`
}

/**
 * index.html of one language version: its lang, title, favicon and search
 * metadata. Pages of other languages live in a folder (en/), so <base> points
 * their relative links (scripts, styles, downloads) back at the site root.
 */
export function personalizeHtml(html: string, site: SiteData, locale: Locale) {
  const { lang, title, resume } = locale
  const folder = localePath(lang, site.locales[0].lang)
  const { meta, links } = headTags(site, locale)

  const tags = [
    tag("link", { rel: "icon", href: initialsFavicon(resume.basics.name) }),
    ...meta.map((attrs) => tag("meta", attrs)),
    ...links.map((attrs) => tag("link", attrs)),
    tag(
      "script",
      { type: "application/ld+json" },
      serializeJsonLd(personJsonLd(site, locale))
    ),
  ]

  return html
    .replace(/<html lang="[^"]*"/, `<html lang="${escapeMarkup(lang)}"`)
    .replace(
      /<head>/,
      folder ? `<head>\n    ${tag("base", { href: "../" })}` : "<head>"
    )
    .replace(/<title>.*<\/title>/, `<title>${escapeMarkup(title)}</title>`)
    .replace("</head>", `    ${tags.join("\n    ")}\n  </head>`)
}
