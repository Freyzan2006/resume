import type { Download } from "@core/types"

/** Formats shown before downloading; previews.ts has the preview of each. */
const previewFormats = [
  "pdf",
  "docx",
  "json",
  "md",
] as const satisfies readonly Download["format"][]

export type PreviewFormat = (typeof previewFormats)[number]

export const hasPreview = (download: Download) =>
  (previewFormats as readonly string[]).includes(download.format)
