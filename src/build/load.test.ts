import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { renderJsonSchemas, SCHEMAS_DIR } from "./json-schema.ts"
import { loadSite, ResumeError } from "./load.ts"

const ROOT = resolve(import.meta.dirname, "../..")
const ASSETS = join(ROOT, "assets")

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "resume-"))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

/** Writes files relative to the temp assets dir. */
async function write(files: Record<string, string>) {
  for (const [name, content] of Object.entries(files)) {
    await mkdir(dirname(join(dir, name)), { recursive: true })
    await writeFile(join(dir, name), content)
  }
}

async function problemsOf(promise: Promise<unknown>): Promise<string> {
  const error = await promise.catch((error: unknown) => error)
  expect(error).toBeInstanceOf(ResumeError)
  return (error as ResumeError).problems.join("\n")
}

const minimal = (name = "A") => `basics: { name: ${name} }`

describe("loadSite: the real assets/", () => {
  it("loads without warnings", async () => {
    const { data, warnings } = await loadSite(ASSETS)

    expect(data.locales[0].resume.basics.name).toBeTruthy()
    expect(warnings).toEqual([])
  })
})

describe("loadSite: profiles", () => {
  it("uses the only profile when config does not name one", async () => {
    await write({ "frontend/resume.ru.yaml": minimal() })

    expect((await loadSite(dir)).data.profile).toBe("frontend")
  })

  it("builds the profile chosen in config.yaml", async () => {
    await write({
      "config.yaml": "profile: devops",
      "frontend/resume.ru.yaml": minimal("Front"),
      "devops/resume.ru.yaml": minimal("Ops"),
    })

    const { data } = await loadSite(dir)

    expect(data.profile).toBe("devops")
    expect(data.locales[0].resume.basics.name).toBe("Ops")
  })

  it("asks to choose when there are several profiles", async () => {
    await write({
      "frontend/resume.ru.yaml": minimal(),
      "devops/resume.ru.yaml": minimal(),
    })

    expect(await problemsOf(loadSite(dir))).toMatch(
      /несколько \(devops, frontend\).*profile: devops/
    )
  })

  it("rejects an unknown profile and lists the existing ones", async () => {
    await write({
      "config.yaml": "profile: backend",
      "frontend/resume.ru.yaml": minimal(),
    })

    expect(await problemsOf(loadSite(dir))).toMatch(/«backend».*есть: frontend/)
  })

  it("reports an assets/ without resumes", async () => {
    await write({ "config.yaml": "lang: ru" })

    expect(await problemsOf(loadSite(dir))).toMatch(/нет ни одного резюме/)
  })

  it("ignores profiles other than the chosen one, even broken ones", async () => {
    await write({
      "config.yaml": "profile: frontend",
      "frontend/resume.ru.yaml": minimal(),
      "devops/resume.ru.yaml": "basics: {}",
    })

    await expect(loadSite(dir)).resolves.toBeTruthy()
  })
})

describe("loadSite: languages", () => {
  it("puts the primary language first, then the rest alphabetically", async () => {
    await write({
      "config.yaml": "lang: en",
      "p/resume.ru.yaml": minimal("Иван"),
      "p/resume.de.yaml": minimal("Iwan"),
      "p/resume.en.yaml": minimal("Ivan"),
    })

    const { data, sources } = await loadSite(dir)

    expect(data.locales.map((locale) => locale.lang)).toEqual([
      "en",
      "de",
      "ru",
    ])
    expect(data.locales[2].labels.work).toBe("Опыт работы")
    expect(Object.keys(sources).sort()).toEqual(["de", "en", "ru"])
  })

  it("requires a version in the primary language", async () => {
    await write({ "p/resume.en.yaml": minimal() })

    expect(await problemsOf(loadSite(dir))).toMatch(
      /нет resume\.ru\.yaml.*есть: en/
    )
  })

  it("rejects two files for one language", async () => {
    await write({
      "p/resume.ru.yaml": minimal(),
      "p/resume.ru.json": JSON.stringify({ basics: { name: "A" } }),
    })

    expect(await problemsOf(loadSite(dir))).toMatch(/оставьте только один/)
  })

  it("reads an existing JSON Resume file as is", async () => {
    await write({
      "p/resume.ru.json": JSON.stringify({
        basics: { name: "A" },
        work: [{ name: "Co", position: "Dev", startDate: "2020-01-15" }],
      }),
    })

    const [{ resume }] = (await loadSite(dir)).data.locales

    expect(resume.work[0].startDate).toBe("2020-01-15")
  })

  it("names downloads per language once there are several", async () => {
    await write({
      "config.yaml": "formats: [json, pdf]",
      "p/resume.ru.yaml": minimal("Иван"),
      "p/resume.en.yaml": minimal("Ivan"),
    })

    const [ru, en] = (await loadSite(dir)).data.locales

    expect(ru.downloads[0]).toEqual({
      format: "json",
      label: "JSON Resume",
      href: "resume.ru.json",
      filename: "Иван (RU).json",
    })
    expect(en.downloads.map((item) => item.href)).toEqual([
      "resume.en.json",
      "resume.en.pdf",
    ])
  })

  it("names a single-language download after the person, PDF by default", async () => {
    await write({ "p/resume.ru.yaml": minimal("Иван") })

    const [{ downloads }] = (await loadSite(dir)).data.locales

    expect(downloads).toEqual([
      expect.objectContaining({ href: "resume.ru.pdf", filename: "Иван.pdf" }),
    ])
  })

  it("has built-in labels for ru, en and uz, English for the rest", async () => {
    await write({
      "p/resume.ru.yaml": minimal(),
      "p/resume.uz.yaml": minimal(),
      "p/resume.de.yaml": minimal(),
    })

    const labels = (await loadSite(dir)).data.locales.map(
      (locale) => `${locale.lang}: ${locale.labels.education}`
    )

    expect(labels).toEqual(["ru: Образование", "de: Education", "uz: Taʼlim"])
  })

  it("applies label overrides only to their language", async () => {
    await write({
      "config.yaml": "labels: { ru: { work: Карьера } }",
      "p/resume.ru.yaml": minimal(),
      "p/resume.en.yaml": minimal(),
    })

    const [ru, en] = (await loadSite(dir)).data.locales

    expect(ru.labels.work).toBe("Карьера")
    expect(en.labels.work).toBe("Experience")
  })
})

describe("loadSite: content", () => {
  it("renders markdown fields to HTML and keeps the source", async () => {
    await write({
      "p/resume.ru.yaml": [
        "basics:",
        "  name: A",
        "  summary: Hello **world**",
        "work:",
        "  - name: Co",
        "    position: Dev",
        "    highlights: ['Made it *fast*']",
      ].join("\n"),
    })

    const { data, sources } = await loadSite(dir)
    const { resume } = data.locales[0]

    expect(resume.basics.summary).toBe("<p>Hello <strong>world</strong></p>")
    expect(resume.work[0].highlights).toEqual(["Made it <em>fast</em>"])
    expect(sources.ru).toMatchObject({ basics: { summary: "Hello **world**" } })
  })

  it("keeps YAML dates as strings, including bare years", async () => {
    await write({
      "p/resume.ru.yaml": `${minimal()}\neducation:\n  - { institution: U, startDate: 2015, endDate: 2019-06-30 }`,
    })

    const [item] = (await loadSite(dir)).data.locales[0].resume.education

    expect(item).toMatchObject({ startDate: "2015", endDate: "2019-06-30" })
  })

  it("resolves a local photo relative to the resume file", async () => {
    await write({
      "photo.png": "png",
      "p/resume.ru.yaml": "basics: { name: A, image: ../photo.png }",
    })

    const { data, localAssets, files } = await loadSite(dir)
    const photo = join(dir, "photo.png")

    expect(data.locales[0].resume.basics.image).toBe(photo)
    expect(localAssets).toEqual([photo])
    expect(files).toContain(photo)
  })

  it("leaves photo URLs as they are", async () => {
    await write({
      "p/resume.ru.yaml":
        "basics: { name: A, image: 'https://example.com/me.jpg' }",
    })

    const { data, localAssets } = await loadSite(dir)

    expect(data.locales[0].resume.basics.image).toBe(
      "https://example.com/me.jpg"
    )
    expect(localAssets).toEqual([])
  })

  it("rejects a missing or non-image photo", async () => {
    await write({
      "notes.txt": "",
      "p/resume.ru.yaml": "basics: { name: A, image: me.jpg }",
      "p/resume.en.yaml": "basics: { name: A, image: ../notes.txt }",
    })

    const problems = await problemsOf(loadSite(dir))

    expect(problems).toMatch(/файл не найден/)
    expect(problems).toMatch(/ожидается изображение/)
  })

  it("reports YAML syntax errors with the file name", async () => {
    await write({ "p/resume.ru.yaml": "basics:\n  name: A: B" })

    expect(await problemsOf(loadSite(dir))).toMatch(
      /resume\.ru\.yaml: не удалось разобрать/
    )
  })

  it("rejects malformed dates and unknown fields", async () => {
    await write({
      "p/resume.ru.yaml":
        "basics: { name: A, nickname: B }\nwork:\n  - { name: Co, position: Dev, startDate: 2022-13 }",
    })

    const problems = await problemsOf(loadSite(dir))

    expect(problems).toMatch(/YYYY-MM/)
    expect(problems).toMatch(/nickname/)
  })

  it("collects problems from every language at once", async () => {
    await write({
      "p/resume.ru.yaml": "basics: {}",
      "p/resume.en.yaml": "basics: {}",
    })

    const error = await loadSite(dir).catch((error: ResumeError) => error)

    expect((error as ResumeError).problems).toHaveLength(2)
  })

  it("rejects unknown config values", async () => {
    await write({
      "config.yaml": "formats: [docx]\nsections: [hobbies]",
      "p/resume.ru.yaml": minimal(),
    })

    const problems = await problemsOf(loadSite(dir))

    expect(problems).toMatch(/formats/)
    expect(problems).toMatch(/sections/)
  })

  it("warns about JSON Resume sections the site does not render", async () => {
    await write({ "p/resume.ru.yaml": `${minimal()}\nawards: [{ title: X }]` })

    const { warnings } = await loadSite(dir)

    expect(warnings).toEqual([expect.stringMatching(/awards/)])
  })

  it("copies cleanly from the real assets/", async () => {
    await cp(ASSETS, dir, { recursive: true })

    await expect(loadSite(dir)).resolves.toBeTruthy()
  })
})

describe("schemas/", () => {
  it("is up to date with src/core (run `bun run schema`)", async () => {
    for (const [name, content] of Object.entries(renderJsonSchemas())) {
      expect(await readFile(join(ROOT, SCHEMAS_DIR, name), "utf8")).toBe(
        content
      )
    }
  })
})
