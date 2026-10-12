import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import JSZip from "jszip"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { exportDocx } from "@build/exporters/docx.ts"
import type { ExportContext } from "@build/exporters/types.ts"
import { loadSite } from "@build/load.ts"

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "resume-export-"))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

/** The document's text and its hyperlink targets. */
async function readDocx(file: string) {
  const zip = await JSZip.loadAsync(await readFile(file))
  const xml = (await zip.file("word/document.xml")?.async("string")) ?? ""
  const rels =
    (await zip.file("word/_rels/document.xml.rels")?.async("string")) ?? ""
  return {
    text: [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
      .map(([, text]) => text)
      .join(""),
    links: [...rels.matchAll(/Target="(https?:[^"]+)"/g)].map(([, url]) => url),
  }
}

describe("exportDocx", () => {
  it("exports every language of the example assets/ as a Word document", async () => {
    const { data, sources } = await loadSite(
      resolve(import.meta.dirname, "../../../examples/assets")
    )

    for (const locale of data.locales) {
      const outFile = join(dir, `resume.${locale.lang}.docx`)
      await exportDocx({
        locale,
        source: sources[locale.lang],
        sections: data.sections,
        outFile,
      } as ExportContext)
      const { text, links } = await readDocx(outFile)

      expect(text.startsWith(locale.resume.basics.name)).toBe(true)
      expect(text).toContain(locale.labels.skills)
      expect(text).not.toMatch(/\*\*|<\/?(p|strong)>/)
      expect(text).not.toContain("\n")
      expect(links).toEqual(
        expect.arrayContaining(
          locale.resume.basics.profiles.flatMap((profile) =>
            profile.url ? [profile.url] : []
          )
        )
      )
    }
  })
})
