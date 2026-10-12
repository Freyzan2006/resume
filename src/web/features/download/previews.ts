import type { Download } from "@core/types"

import { CopyJson, JsonPreview } from "./json-preview"
import { OpenPdf, PdfPreview } from "./pdf-preview"
import type { Preview } from "./types"

/** Formats that can be previewed before downloading. */
export const previews: Partial<Record<Download["format"], Preview>> = {
  pdf: { Content: PdfPreview, Action: OpenPdf },
  json: { Content: JsonPreview, Action: CopyJson },
}

export const hasPreview = (download: Download) => download.format in previews
