import type { SectionName } from "../../core/config-schema.ts"
import type { Locale } from "../../core/site.ts"
import type { BrowserSession } from "../browser.ts"

/** One exporter call writes one file: one format of one language version. */
export type ExportContext = {
  /** The language version to export, markdown rendered to HTML. */
  locale: Locale
  /** The same resume exactly as written in assets/ (markdown as source). */
  source: unknown
  /** Sections shown on the site, in order (config.yaml). */
  sections: SectionName[]
  /** The language's page, relative to the site root: "" or "en/". */
  path: string
  /** Absolute path of the file to write. */
  outFile: string
  /** The built site and a browser, started on first use. */
  session: BrowserSession
}

export type Exporter = (context: ExportContext) => Promise<void>
