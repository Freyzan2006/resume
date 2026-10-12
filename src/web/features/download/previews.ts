import type { Download } from "@core/types"

import { OpenPdf, PdfPreview } from "./pdf-preview"
import { CopyText, JsonPreview, MarkdownPreview } from "./text-preview"
import type { Preview } from "./types"

/** Formats that can be previewed before downloading. */
export const previews: Partial<Record<Download["format"], Preview>> = {
  pdf: { Content: PdfPreview, Action: OpenPdf },
  json: { Content: JsonPreview, Action: CopyText },
  md: { Content: MarkdownPreview, Action: CopyText },
}

export const hasPreview = (download: Download) => download.format in previews
