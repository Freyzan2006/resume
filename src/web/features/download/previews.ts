import type { Download } from "@core/types"

import { DocxPreview } from "./docx-preview"
import { OpenPdf, PdfPreview } from "./pdf-preview"
import type { PreviewFormat } from "./preview-formats"
import { CopyText, JsonPreview, MarkdownPreview } from "./text-preview"
import type { Preview } from "./types"

const registry = {
  pdf: { Content: PdfPreview, Action: OpenPdf },
  docx: { Content: DocxPreview },
  json: { Content: JsonPreview, Action: CopyText },
  md: { Content: MarkdownPreview, Action: CopyText },
} satisfies Record<PreviewFormat, Preview>

/** The preview of each format; part of the dialog's chunk, loaded on demand. */
export const previews: Partial<Record<Download["format"], Preview>> = registry
