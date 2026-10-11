import site from "virtual:resume"
import { computed, effect, searchParamsAtom } from "@reatom/core"

const [primary] = site.locales
const langs = site.locales.map((locale) => locale.lang)

/**
 * The shown language, kept in the URL (`?lang=en`) so a link opens the same
 * version. The primary language has no parameter.
 */
export const lang = searchParamsAtom.lens("lang", {
  parse: (value) => (value && langs.includes(value) ? value : primary.lang),
  serialize: (value) => (value === primary.lang ? undefined : value),
  replace: true,
  name: "lang",
})

export const locale = computed(
  () => site.locales.find((item) => item.lang === lang()) ?? primary,
  "locale"
)

const head = (selector: string) => document.head.querySelector(selector)

effect(() => {
  const { lang, title, description } = locale()
  document.documentElement.lang = lang
  document.title = title
  head('meta[name="description"]')?.setAttribute("content", description)

  // Each language page is canonical for itself, as hreflang expects.
  const href = head(`link[rel="alternate"][hreflang="${lang}"]`)?.getAttribute(
    "href"
  )
  if (href) {
    head('link[rel="canonical"]')?.setAttribute("href", href)
  }
}, "applyLocale")
