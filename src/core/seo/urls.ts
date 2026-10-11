import type { Resume } from "../resume-schema.ts"
import type { Locale } from "../site.ts"

export type Alternate = { hreflang: string; href: string }

/** The address of every language version; the primary one is the site root. */
export function languagePages(siteUrl: string, locales: Locale[]): Alternate[] {
  const [primary] = locales
  return locales.map(({ lang }) => ({
    hreflang: lang,
    href:
      lang === primary?.lang
        ? siteUrl
        : `${siteUrl}?lang=${encodeURIComponent(lang)}`,
  }))
}

/** hreflang alternates: every language plus x-default, only when there are several. */
export function alternates(siteUrl: string, locales: Locale[]): Alternate[] {
  if (locales.length < 2) {
    return []
  }
  return [
    ...languagePages(siteUrl, locales),
    { hreflang: "x-default", href: siteUrl },
  ]
}

/** The photo, if it can be published: a local file is a path on the build machine. */
export function publicImage({ image }: Resume["basics"]) {
  return image && /^https?:\/\//.test(image) ? image : undefined
}

/** Link-preview card, rendered by the export step next to index.html. */
export const OG_IMAGE = { file: "og.png", width: 1200, height: 630 }
