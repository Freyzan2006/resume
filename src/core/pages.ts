/**
 * Folder of a language version, relative to the site root: the primary
 * language is the root itself (""), the others are "en/", "uz/", …
 */
export function localePath(lang: string, primaryLang: string) {
  return lang === primaryLang ? "" : `${lang}/`
}

/** The language whose folder a path relative to the site root is in. */
export function langOfPath(path: string, langs: string[]) {
  const folder = /^([^/]+)\//.exec(path)?.[1]
  return langs.find((lang) => lang === folder) ?? langs[0]
}
