import type { FormatName } from "../../core/formats.ts"
import { exportJson } from "./json.ts"
import { exportPdf } from "./pdf.ts"
import type { Exporter } from "./types.ts"

/** One exporter per format in src/core/formats.ts — the type enforces it. */
export const exporters: Record<FormatName, Exporter> = {
  pdf: exportPdf,
  json: exportJson,
}

export type { ExportContext, Exporter } from "./types.ts"
