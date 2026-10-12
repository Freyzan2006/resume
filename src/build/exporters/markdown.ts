import { writeFile } from "node:fs/promises"

import { resumeMarkdown } from "../../core/resume-markdown.ts"
import { resumeSourceSchema } from "../../core/resume-schema.ts"
import type { Exporter } from "./types.ts"

/** The resume as a Markdown document, with the site's sections and labels. */
export const exportMarkdown: Exporter = async ({
  locale,
  source,
  sections,
  outFile,
}) => {
  const resume = resumeSourceSchema.parse(source)
  const markdown = resumeMarkdown(resume, {
    lang: locale.lang,
    labels: locale.labels,
    sections,
    now: new Date(),
  })
  await writeFile(outFile, markdown)
}
