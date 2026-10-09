// Download formats a site can offer. Each one has an exporter in exporters/
// that writes dist/resume.<extension> after `vite build`.
export const formats = {
  pdf: { extension: "pdf", label: "PDF" },
  json: { extension: "json", label: "JSON Resume" },
} as const

export type FormatName = keyof typeof formats

export const formatNames = Object.keys(formats) as [FormatName, ...FormatName[]]

/** Path of the exported file, relative to dist/. */
export const exportPath = (format: FormatName) =>
  `resume.${formats[format].extension}`

export type Download = {
  format: FormatName
  label: string
  href: string
  /** Name the browser saves the file under. */
  filename: string
}

export function downloadsFor(
  formatList: FormatName[],
  name: string
): Download[] {
  return formatList.map((format) => ({
    format,
    label: formats[format].label,
    href: exportPath(format),
    filename: `${name}.${formats[format].extension}`,
  }))
}
