import type { Locale, SiteData } from "../site.ts"
import {
  alternates,
  languagePages,
  OG_IMAGE,
  ogImageFile,
  publicImage,
} from "./urls.ts"

type Meta =
  | { name: string; content: string }
  | { property: string; content: string }

type Link = { rel: string; href: string; hreflang?: string }

/** Open Graph wants language_TERRITORY: ru → ru_RU, en → en_US. */
export function ogLocale(lang: string) {
  const { language, region } = new Intl.Locale(lang).maximize()
  return region ? `${language}_${region}` : language
}

/**
 * Meta tags and links of one language version. Without the site's address
 * (config.yaml → url) the ones that need an absolute URL are left out, and
 * the preview image falls back to a photo given as a URL.
 */
export function headTags({ locales, url }: SiteData, locale: Locale) {
  const { lang, title, description, resume } = locale
  const others = locales.filter((other) => other.lang !== lang)
  const page = url
    ? languagePages(url, locales).find((item) => item.hreflang === lang)?.href
    : undefined
  const card = url ? `${url}${ogImageFile(lang)}` : undefined
  const image = card ?? publicImage(resume.basics)

  const meta: Meta[] = [
    { name: "description", content: description },
    { property: "og:type", content: "profile" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:locale", content: ogLocale(lang) },
    ...others.map((other) => ({
      property: "og:locale:alternate",
      content: ogLocale(other.lang),
    })),
    ...(page ? [{ property: "og:url", content: page }] : []),
    ...(image ? [{ property: "og:image", content: image }] : []),
    ...(card
      ? [
          { property: "og:image:width", content: String(OG_IMAGE.width) },
          { property: "og:image:height", content: String(OG_IMAGE.height) },
          { property: "og:image:alt", content: title },
        ]
      : []),
    {
      name: "twitter:card",
      content: card ? "summary_large_image" : "summary",
    },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ]

  const links: Link[] =
    url && page
      ? [
          { rel: "canonical", href: page },
          ...alternates(url, locales).map((item) => ({
            rel: "alternate",
            ...item,
          })),
        ]
      : []

  return { meta, links }
}
