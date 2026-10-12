import { resumeDocument } from "../../core/resume-document.ts"
import { resumeSourceSchema } from "../../core/resume-schema.ts"
import type { ExportContext } from "./types.ts"

/** The resume as written (markdown as source), laid out like the site. */
export function documentOf({ locale, source, sections }: ExportContext) {
  return resumeDocument(resumeSourceSchema.parse(source), {
    lang: locale.lang,
    labels: locale.labels,
    sections,
    now: new Date(),
  })
}
