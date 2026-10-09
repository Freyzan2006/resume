import type { SiteData } from "../core/site.ts"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

/** SVG favicon with the person's initials, so forks don't share an icon. */
function initialsFavicon(name: string) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#18181b"/><text x="32" y="32" dy=".35em" text-anchor="middle" font-family="monospace" font-size="28" font-weight="700" fill="#fafafa">${escapeHtml(initials)}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * index.html with the person's primary language, title, description and
 * favicon. The web layer updates lang and title when the language changes.
 */
export function personalizeHtml(html: string, { locales }: SiteData) {
  const [{ lang, title, resume }] = locales
  const { name } = resume.basics

  return {
    html: html
      .replace(/<html lang="[^"]*"/, `<html lang="${escapeHtml(lang)}"`)
      .replace(/<title>.*<\/title>/, `<title>${escapeHtml(title)}</title>`),
    tags: [
      {
        tag: "link",
        attrs: { rel: "icon", href: initialsFavicon(name) },
        injectTo: "head" as const,
      },
      {
        tag: "meta",
        attrs: { name: "description", content: title },
        injectTo: "head" as const,
      },
    ],
  }
}
