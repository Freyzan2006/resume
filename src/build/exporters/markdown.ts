import { writeFile } from "node:fs/promises"

import { resumeMarkdown } from "../../core/resume-markdown.ts"
import { documentOf } from "./document.ts"
import type { Exporter } from "./types.ts"

/** The resume as a Markdown document, with the site's sections and labels. */
export const exportMarkdown: Exporter = async (context) => {
  await writeFile(context.outFile, resumeMarkdown(documentOf(context)))
}
