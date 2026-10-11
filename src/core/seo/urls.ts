import { localePath } from "../pages.ts"
import type { Resume } from "../resume-schema.ts"
import type { Locale } from "../site.ts"

export type Alternate = { hreflang: string; href: string }

/** The address of every language version; the primary one is the site root. */
export function languagePages(siteUrl: string, locales: Locale[]): Alternate[] {
  const primaryLang = locales[0]?.lang ?? ""
  return locales.map(({ lang }) => ({
    hreflang: lang,
    href: `${siteUrl}${localePath(lang, primaryLang)}`,
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

/** Link-preview cards, one per language, rendered by the export step. */
export const OG_IMAGE = { width: 1200, height: 630 }

export const ogImageFile = (lang: string) => `og.${lang}.png`
