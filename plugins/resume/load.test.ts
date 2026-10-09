import { cp, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { loadResume, ResumeError } from "./load.ts"

const ASSETS = resolve(import.meta.dirname, "../../assets")

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "resume-"))
  await cp(ASSETS, dir, { recursive: true })
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

async function problemsOf(promise: Promise<unknown>): Promise<string> {
  const error = await promise.catch((error: unknown) => error)
  expect(error).toBeInstanceOf(ResumeError)
  return (error as ResumeError).problems.join("\n")
}

describe("loadResume", () => {
  it("loads the real assets/", async () => {
    const resume = await loadResume(ASSETS)

    expect(resume.contact.name).toBeTruthy()
    expect(resume.jobs.items.length).toBeGreaterThan(0)
  })

  it("renders markdown bodies and descriptions to HTML", async () => {
    await writeFile(
      join(dir, "summary.md"),
      "---\ntitle: About\n---\n\nHello **world**"
    )

    const resume = await loadResume(dir)

    expect(resume.summary.body).toBe("<p>Hello <strong>world</strong></p>")
    expect(resume.jobs.items[0].description).toContain("<li>")
  })

  it("reports a missing section file", async () => {
    await rm(join(dir, "skills.md"))

    expect(await problemsOf(loadResume(dir))).toMatch(
      /skills\.md: файл не найден/
    )
  })

  it("rejects unknown section files", async () => {
    await writeFile(join(dir, "hobbies.md"), "---\ntitle: Hobbies\n---\n")

    expect(await problemsOf(loadResume(dir))).toMatch(
      /hobbies\.md: неизвестный раздел/
    )
  })

  it("rejects malformed dates and unknown fields", async () => {
    await writeFile(
      join(dir, "education.md"),
      [
        "---",
        "title: Education",
        "items:",
        "  - institution: Uni",
        "    degree: BSc",
        "    start: 2015-13",
        "    end: 2019-06",
        "    grade: 5",
        "---",
      ].join("\n")
    )

    const problems = await problemsOf(loadResume(dir))

    expect(problems).toMatch(/YYYY-MM/)
    expect(problems).toMatch(/grade/)
  })

  it("rejects body text in frontmatter-only sections", async () => {
    await writeFile(
      join(dir, "contact.md"),
      "---\nname: A\ntitle: B\n---\n\nstray text"
    )

    expect(await problemsOf(loadResume(dir))).toMatch(/текст не нужен/)
  })

  it("collects problems from every file at once", async () => {
    await rm(join(dir, "jobs.md"))
    await rm(join(dir, "skills.md"))

    const problems = await problemsOf(loadResume(dir))

    expect(problems.split("\n")).toHaveLength(2)
  })
})
