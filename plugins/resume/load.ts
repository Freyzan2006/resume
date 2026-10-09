import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import matter from "gray-matter"
import { z } from "zod"

import {
  sectionSchemas,
  type Resume,
  type SectionName,
} from "../../src/resume/schema.ts"

const sectionNames = Object.keys(sectionSchemas) as SectionName[]

export class ResumeError extends Error {
  readonly problems: string[]

  constructor(problems: string[]) {
    super(`Резюме собрано с ошибками:\n\n${problems.join("\n\n")}`)
    this.name = "ResumeError"
    this.problems = problems
  }
}

export function sectionFiles(dir: string): string[] {
  return sectionNames.map((name) => join(dir, `${name}.md`))
}

/** Reads, validates and renders every assets/<section>.md in `dir`. */
export async function loadResume(dir: string): Promise<Resume> {
  const problems: string[] = []
  const resume: Partial<Record<SectionName, unknown>> = {}

  for (const name of sectionNames) {
    const file = join(dir, `${name}.md`)

    let source: string
    try {
      source = await readFile(file, "utf8")
    } catch {
      problems.push(`${file}: файл не найден`)
      continue
    }

    let parsed: matter.GrayMatterFile<string>
    try {
      // An empty options object bypasses gray-matter's global content cache.
      parsed = matter(source, {})
    } catch (error) {
      problems.push(`${file}: не удалось разобрать frontmatter\n${error}`)
      continue
    }

    const result = sectionSchemas[name].safeParse({
      ...parsed.data,
      body: parsed.content,
    })
    if (result.success) {
      resume[name] = result.data
    } else {
      problems.push(`${file}:\n${z.prettifyError(result.error)}`)
    }
  }

  const known = new Set(sectionNames.map((name) => `${name}.md`))
  const entries = await readdir(dir).catch(() => [])
  for (const entry of entries) {
    if (entry.endsWith(".md") && !known.has(entry)) {
      problems.push(
        `${join(dir, entry)}: неизвестный раздел, ожидаются: ${[...known].join(", ")}`
      )
    }
  }

  if (problems.length > 0) {
    throw new ResumeError(problems)
  }

  return resume as Resume
}
