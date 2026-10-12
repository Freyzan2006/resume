import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { exportMarkdown } from "@build/exporters/markdown.ts"
import type { ExportContext } from "@build/exporters/types.ts"
import { loadSite } from "@build/load.ts"

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "resume-export-"))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe("exportMarkdown", () => {
  it("exports every language of the example assets/ in its own labels", async () => {
    const { data, sources } = await loadSite(
      resolve(import.meta.dirname, "../../../examples/assets")
    )

    for (const locale of data.locales) {
      const outFile = join(dir, `resume.${locale.lang}.md`)
      await exportMarkdown({
        locale,
        source: sources[locale.lang],
        sections: data.sections,
        outFile,
      } as ExportContext)
      const markdown = await readFile(outFile, "utf8")

      expect(markdown.startsWith(`# ${locale.resume.basics.name}\n`)).toBe(true)
      expect(markdown).toContain(`## ${locale.labels.skills}`)
      expect(markdown).not.toMatch(/<\/?(p|strong|em)>/)
    }
  })
})
