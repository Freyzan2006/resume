import site from "virtual:resume"

import { localePath } from "@/core/pages"

const [primary] = site.locales

/** Every language has its own page, built with its lang on <html>. */
export const locale =
  site.locales.find((item) => item.lang === document.documentElement.lang) ??
  primary

/** Link to a language version; pages in folders resolve it via <base>. */
export const localeHref = (lang: string) =>
  localePath(lang, primary.lang) || "./"

// Links from before the language folders: ?lang=en → en/
const legacyLang = new URLSearchParams(location.search).get("lang")
if (
  legacyLang &&
  legacyLang !== locale.lang &&
  site.locales.some((item) => item.lang === legacyLang)
) {
  location.replace(new URL(localeHref(legacyLang), document.baseURI))
}
