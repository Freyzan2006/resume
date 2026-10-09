import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { renderJsonSchemas, SCHEMAS_DIR } from "./json-schema.ts"
import { loadSite, ResumeError } from "./load.ts"

const ROOT = resolve(import.meta.dirname, "../..")
const ASSETS = join(ROOT, "assets")

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "resume-"))
  await cp(ASSETS, dir, { recursive: true })
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

async function problemsOf(promise: Promise<unknown>): Promise<string[]> {
  const error = await promise.catch((error: unknown) => error)
  expect(error).toBeInstanceOf(ResumeError)
  return (error as ResumeError).problems
}

const write = (name: string, content: string) =>
  writeFile(join(dir, name), content)

describe("loadSite", () => {
  it("loads the real assets/", async () => {
    const { data, warnings } = await loadSite(ASSETS)

    expect(data.resume.basics.name).toBeTruthy()
    expect(data.labels.work).toBeTruthy()
    expect(warnings).toEqual([])
  })

  it("renders markdown fields to HTML", async () => {
    await write(
      "resume.yaml",
      [
        "basics:",
        "  name: A",
        "  summary: Hello **world**",
        "work:",
        "  - name: Co",
        "    position: Dev",
        "    highlights: ['Made it *fast*']",
      ].join("\n")
    )

    const { resume } = (await loadSite(dir)).data

    expect(resume.basics.summary).toBe("<p>Hello <strong>world</strong></p>")
    expect(resume.work[0].highlights).toEqual(["Made it <em>fast</em>"])
  })

  it("reads an existing JSON Resume file as is", async () => {
    await rm(join(dir, "resume.yaml"))
    await write(
      "resume.json",
      JSON.stringify({
        basics: { name: "A" },
        work: [{ name: "Co", position: "Dev", startDate: "2020-01-15" }],
      })
    )

    const { resume } = (await loadSite(dir)).data

    expect(resume.work[0].startDate).toBe("2020-01-15")
  })

  it("keeps YAML dates as strings, including bare years", async () => {
    await write(
      "resume.yaml",
      "basics: { name: A }\neducation:\n  - { institution: U, startDate: 2015, endDate: 2019-06-30 }"
    )

    const [item] = (await loadSite(dir)).data.resume.education

    expect(item).toMatchObject({ startDate: "2015", endDate: "2019-06-30" })
  })

  it("works without config.yaml", async () => {
    await rm(join(dir, "config.yaml"))

    const { data } = await loadSite(dir)

    expect(data.lang).toBe("ru")
    expect(data.sections).toContain("work")
  })

  it("applies config: language, section order and label overrides", async () => {
    await write(
      "config.yaml",
      "lang: en-GB\nsections: [work, summary]\nlabels: { work: Career }"
    )

    const { data } = await loadSite(dir)

    expect(data.lang).toBe("en-GB")
    expect(data.sections).toEqual(["work", "summary"])
    expect(data.labels).toMatchObject({ work: "Career", skills: "Skills" })
  })

  it("reports a missing resume file", async () => {
    await rm(join(dir, "resume.yaml"))

    expect((await problemsOf(loadSite(dir))).join()).toMatch(/нет файла резюме/)
  })

  it("rejects two resume files at once", async () => {
    await write("resume.json", "{}")

    expect((await problemsOf(loadSite(dir))).join()).toMatch(
      /оставьте только один/
    )
  })

  it("reports YAML syntax errors with the file name", async () => {
    await write("resume.yaml", "basics:\n  name: A: B")

    expect((await problemsOf(loadSite(dir))).join()).toMatch(
      /resume\.yaml: не удалось разобрать/
    )
  })

  it("rejects malformed dates and unknown fields", async () => {
    await write(
      "resume.yaml",
      "basics: { name: A, nickname: B }\nwork:\n  - { name: Co, position: Dev, startDate: 2022-13 }"
    )

    const problems = (await problemsOf(loadSite(dir))).join()

    expect(problems).toMatch(/YYYY-MM/)
    expect(problems).toMatch(/nickname/)
  })

  it("collects problems from both files at once", async () => {
    await write("resume.yaml", "basics: {}")
    await write("config.yaml", "sections: [hobbies]")

    expect(await problemsOf(loadSite(dir))).toHaveLength(2)
  })

  it("warns about JSON Resume sections the site does not render", async () => {
    await write("resume.yaml", "basics: { name: A }\nawards: [{ title: X }]")

    const { warnings } = await loadSite(dir)

    expect(warnings).toEqual([expect.stringMatching(/awards/)])
  })
})

describe("schemas/", () => {
  it("is up to date with src/resume/schema.ts (run `bun run schema`)", async () => {
    for (const [name, content] of Object.entries(renderJsonSchemas())) {
      expect(await readFile(join(ROOT, SCHEMAS_DIR, name), "utf8")).toBe(
        content
      )
    }
  })
})
