// Download formats a site can offer. Each one has an exporter in
// build/exporters/ that writes dist/resume.<lang>.<extension> after `vite build`.
export const formats = {
  pdf: { extension: "pdf", label: "PDF" },
  json: { extension: "json", label: "JSON Resume" },
} as const

export type FormatName = keyof typeof formats

export const formatNames = Object.keys(formats) as [FormatName, ...FormatName[]]

/** Path of an exported file, relative to dist/. */
export const exportPath = (format: FormatName, lang: string) =>
  `resume.${lang}.${formats[format].extension}`

export type Download = {
  format: FormatName
  label: string
  href: string
  /** Name the browser saves the file under. */
  filename: string
}

export function downloadsFor(
  formatList: FormatName[],
  {
    name,
    lang,
    multilingual,
  }: { name: string; lang: string; multilingual: boolean }
): Download[] {
  const suffix = multilingual ? ` (${lang.toUpperCase()})` : ""
  return formatList.map((format) => ({
    format,
    label: formats[format].label,
    href: exportPath(format, lang),
    filename: `${name}${suffix}.${formats[format].extension}`,
  }))
}
