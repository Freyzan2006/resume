import { computed, effect, searchParamsAtom } from "@reatom/core"
import site from "virtual:resume"

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

effect(() => {
  const { lang, title } = locale()
  document.documentElement.lang = lang
  document.title = title
}, "applyLocale")
