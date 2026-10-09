import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { parse } from "yaml"
import { z } from "zod"

import { downloadsFor } from "../../src/resume/formats.ts"
import { resolveLabels } from "../../src/resume/labels.ts"
import {
  configSchema,
  resumeSchema,
  unrenderedSections,
  type SiteData,
} from "../../src/resume/schema.ts"

export const ASSETS_DIR = "assets"

// YAML 1.2 is a superset of JSON, so an existing JSON Resume file works as is.
export const RESUME_FILES = ["resume.yaml", "resume.yml", "resume.json"]
export const CONFIG_FILES = ["config.yaml", "config.yml", "config.json"]

export class ResumeError extends Error {
  readonly problems: string[]

  constructor(problems: string[]) {
    super(`Резюме собрано с ошибками:\n\n${problems.join("\n\n")}`)
    this.name = "ResumeError"
    this.problems = problems
  }
}

type Source = { file: string; value: unknown }

/** Reads and parses the one existing file out of `names`, if any. */
async function readSource(
  dir: string,
  names: string[],
  problems: string[]
): Promise<Source | undefined> {
  const found = names.map((name) => join(dir, name)).filter(existsSync)

  if (found.length > 1) {
    problems.push(`${found.join(", ")}: оставьте только один из этих файлов`)
    return
  }
  if (found.length === 0) {
    return
  }

  const [file] = found
  try {
    return { file, value: parse(await readFile(file, "utf8")) }
  } catch (error) {
    problems.push(`${file}: не удалось разобрать файл\n${error}`)
  }
}

function validate<T extends z.ZodType>(
  schema: T,
  { file, value }: Source,
  problems: string[]
): z.output<T> | undefined {
  const result = schema.safeParse(value)
  if (result.success) {
    return result.data
  }
  problems.push(`${file}:\n${z.prettifyError(result.error)}`)
}

/**
 * Reads, validates and renders assets/resume.* and the optional
 * assets/config.*. Throws a ResumeError listing every problem at once.
 * `source` is the resume as written (markdown not rendered), for exporters.
 */
export async function loadSite(
  dir: string
): Promise<{ data: SiteData; source: unknown; warnings: string[] }> {
  const problems: string[] = []

  const resumeSource = await readSource(dir, RESUME_FILES, problems)
  const configSource = await readSource(dir, CONFIG_FILES, problems)

  if (!resumeSource && problems.length === 0) {
    problems.push(
      `${dir}: нет файла резюме, ожидается один из: ${RESUME_FILES.join(", ")}`
    )
  }

  const resume = resumeSource && validate(resumeSchema, resumeSource, problems)
  const config = configSource
    ? validate(configSchema, configSource, problems)
    : configSchema.parse({})

  if (problems.length > 0 || !resumeSource || !resume || !config) {
    throw new ResumeError(problems)
  }

  const warnings = unrenderedSections
    .filter((key) => resume[key]?.length)
    .map(
      (key) => `раздел «${key}» есть в резюме, но сайт его пока не показывает`
    )

  return {
    data: {
      resume,
      lang: config.lang,
      sections: config.sections,
      labels: resolveLabels(config),
      downloads: downloadsFor(config.formats, resume.basics.name),
    },
    source: resumeSource.value,
    warnings,
  }
}
