import { writeFile } from "node:fs/promises"
import { Packer } from "docx"

import { resumeDocx } from "../docx/resume.ts"
import { documentOf } from "./document.ts"
import type { Exporter } from "./types.ts"

/** The resume as a Word document, with the site's sections and labels. */
export const exportDocx: Exporter = async (context) => {
  const document = resumeDocx(documentOf(context), context.locale.lang)
  await writeFile(context.outFile, await Packer.toBuffer(document))
}
