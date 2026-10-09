import type { SiteData } from "../src/resume/schema.ts"

export type ExportContext = {
  /** Validated site data, markdown rendered to HTML. */
  site: SiteData
  /** The resume exactly as written in assets/ (markdown as source). */
  source: unknown
  /** Absolute path of the file to write. */
  outFile: string
  /** URL of the built site, served from dist/ on first call. */
  siteUrl: () => Promise<string>
}

export type Exporter = (context: ExportContext) => Promise<void>
