import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { loadSite } from "../load.ts"
import { resumeSchema } from "../../core/resume-schema.ts"
import { exportJson, JSON_RESUME_SCHEMA } from "./json.ts"
import type { ExportContext } from "./types.ts"

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "resume-export-"))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

async function exportSource(source: unknown) {
  const outFile = join(dir, "resume.json")
  await exportJson({ source, outFile } as ExportContext)
  return JSON.parse(await readFile(outFile, "utf8"))
}

describe("exportJson", () => {
  it("points $schema at the official JSON Resume schema", async () => {
    const json = await exportSource({
      $schema: "../schemas/resume.schema.json",
      basics: { name: "A" },
    })

    expect(json).toEqual({
      $schema: JSON_RESUME_SCHEMA,
      basics: { name: "A" },
    })
    expect(Object.keys(json)[0]).toBe("$schema")
  })

  it("keeps markdown as source and turns bare years into strings", async () => {
    const json = await exportSource({
      basics: { name: "A", summary: "**bold**" },
      education: [{ institution: "U", startDate: 2015, endDate: "2019-06" }],
    })

    expect(json.basics.summary).toBe("**bold**")
    expect(json.education[0]).toMatchObject({
      startDate: "2015",
      endDate: "2019-06",
    })
  })

  it("exports the real assets/ as a valid resume", async () => {
    const { source } = await loadSite(
      resolve(import.meta.dirname, "../../../assets")
    )

    const json = await exportSource(source)

    expect(resumeSchema.safeParse(json).success).toBe(true)
  })
})
