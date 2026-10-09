import type { Locale } from "../../core/site.ts"

/** One exporter call writes one file: one format of one language version. */
export type ExportContext = {
  /** The language version to export, markdown rendered to HTML. */
  locale: Locale
  /** The same resume exactly as written in assets/ (markdown as source). */
  source: unknown
  /** Absolute path of the file to write. */
  outFile: string
  /** URL of the built site showing this language, served from dist/ on first call. */
  pageUrl: () => Promise<string>
}

export type Exporter = (context: ExportContext) => Promise<void>
