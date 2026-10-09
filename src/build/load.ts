import { existsSync } from "node:fs"
import { readdir, readFile } from "node:fs/promises"
import { dirname, extname, join, resolve } from "node:path"
import { parse } from "yaml"
import { z } from "zod"

import { configSchema, type Config } from "../core/config-schema.ts"
import { downloadsFor } from "../core/formats.ts"
import { resolveLabels } from "../core/labels.ts"
import { resumeSchema, unrenderedSections } from "../core/resume-schema.ts"
import { pageTitle, type Locale, type SiteData } from "../core/site.ts"

// assets/
//   config.yaml                      optional: profile, lang, sections, …
//   <profile>/resume.<lang>.yaml     one folder per specialty, one file per language
export const ASSETS_DIR = "assets"
export const CONFIG_FILES = ["config.yaml", "config.yml", "config.json"]

// YAML 1.2 is a superset of JSON, so an existing JSON Resume file works as is.
const RESUME_FILE =
  /^resume\.(?<lang>[a-z]{2,3}(?:-[A-Za-z0-9]+)*)\.(?:ya?ml|json)$/

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"]

export class ResumeError extends Error {
  readonly problems: string[]

  constructor(problems: string[]) {
    super(`Резюме собрано с ошибками:\n\n${problems.join("\n\n")}`)
    this.name = "ResumeError"
    this.problems = problems
  }
}

export type LoadedSite = {
  data: SiteData
  /** The resumes as written (markdown as source), by language. */
  sources: Record<string, unknown>
  /** Every file the result depends on, for watching. */
  files: string[]
  /** Absolute paths of local files the data points at (photos). */
  localAssets: string[]
  warnings: string[]
}

type Source = { file: string; value: unknown }

async function readSource(
  file: string,
  problems: string[]
): Promise<Source | undefined> {
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

async function loadConfig(
  dir: string,
  problems: string[]
): Promise<{ config?: Config; file?: string }> {
  const found = CONFIG_FILES.map((name) => join(dir, name)).filter(existsSync)
  if (found.length > 1) {
    problems.push(`${found.join(", ")}: оставьте только один из этих файлов`)
    return {}
  }
  if (found.length === 0) {
    return { config: configSchema.parse({}) }
  }

  const source = await readSource(found[0], problems)
  return {
    config: source && validate(configSchema, source, problems),
    file: found[0],
  }
}

/** Resume files of every language in a profile folder. */
async function findResumes(profileDir: string) {
  const byLang = new Map<string, string[]>()
  for (const entry of await readdir(profileDir)) {
    const lang = RESUME_FILE.exec(entry)?.groups?.lang
    if (lang) {
      byLang.set(lang, [...(byLang.get(lang) ?? []), join(profileDir, entry)])
    }
  }
  return byLang
}

/** Folders of assets/ that hold at least one resume.<lang>.* file. */
async function findProfiles(dir: string) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const profiles: string[] = []
  for (const entry of entries) {
    if (
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      (await findResumes(join(dir, entry.name))).size > 0
    ) {
      profiles.push(entry.name)
    }
  }
  return profiles.sort()
}

function chooseProfile(
  config: Config,
  profiles: string[],
  dir: string,
  problems: string[]
) {
  if (profiles.length === 0) {
    problems.push(
      `${dir}: нет ни одного резюме, ожидается ${dir}/<профиль>/resume.<язык>.yaml`
    )
  } else if (config.profile && !profiles.includes(config.profile)) {
    problems.push(
      `config.yaml: profile «${config.profile}» — нет такой папки с резюме, есть: ${profiles.join(", ")}`
    )
  } else if (!config.profile && profiles.length > 1) {
    problems.push(
      `config.yaml: резюме несколько (${profiles.join(", ")}) — укажите, какое собирать: profile: ${profiles[0]}`
    )
  } else {
    return config.profile ?? profiles[0]
  }
}

/** https://…, data:… — anything but a path on disk. */
const isUrl = (value: string) => /^([a-z][a-z\d+.-]*:\/\/|data:)/i.test(value)

/** A local `basics.image` → absolute path, checked to be an existing image. */
function resolveLocalImage(
  image: string,
  file: string,
  problems: string[]
): string | undefined {
  const path = resolve(dirname(file), image)
  if (!existsSync(path)) {
    problems.push(`${file}: basics.image — файл не найден: ${path}`)
  } else if (!IMAGE_EXTENSIONS.includes(extname(path).toLowerCase())) {
    problems.push(
      `${file}: basics.image — ожидается изображение (${IMAGE_EXTENSIONS.join(", ")})`
    )
  } else {
    return path
  }
}

/**
 * Reads, validates and renders the chosen profile of assets/ in every
 * language. Throws a ResumeError listing every problem at once.
 */
export async function loadSite(dir: string): Promise<LoadedSite> {
  const problems: string[] = []
  const fail = () => new ResumeError(problems)

  const { config, file: configFile } = await loadConfig(dir, problems)
  if (!config) {
    throw fail()
  }

  const profile = chooseProfile(config, await findProfiles(dir), dir, problems)
  if (!profile) {
    throw fail()
  }

  const profileDir = join(dir, profile)
  const resumes = await findResumes(profileDir)
  for (const files of resumes.values()) {
    if (files.length > 1) {
      problems.push(`${files.join(", ")}: оставьте только один из этих файлов`)
    }
  }
  if (!resumes.has(config.lang)) {
    problems.push(
      `${profileDir}: нет resume.${config.lang}.yaml — версии на основном языке (lang в config.yaml); есть: ${[...resumes.keys()].join(", ")}`
    )
  }
  if (problems.length > 0) {
    throw fail()
  }

  // Primary language first, then the rest alphabetically.
  const langs = [
    config.lang,
    ...[...resumes.keys()].filter((lang) => lang !== config.lang).sort(),
  ]

  const locales: Locale[] = []
  const sources: Record<string, unknown> = {}
  const files = configFile ? [configFile] : []
  const localAssets = new Set<string>()
  const warnings: string[] = []

  for (const lang of langs) {
    const [file] = resumes.get(lang)!
    files.push(file)

    const source = await readSource(file, problems)
    const resume = source && validate(resumeSchema, source, problems)
    if (!source || !resume) {
      continue
    }

    const { image } = resume.basics
    if (image && !isUrl(image)) {
      resume.basics.image = resolveLocalImage(image, file, problems)
      if (resume.basics.image) {
        localAssets.add(resume.basics.image)
      }
    }

    for (const key of unrenderedSections) {
      if (resume[key]?.length) {
        warnings.push(
          `${file}: раздел «${key}» есть в резюме, но сайт его пока не показывает`
        )
      }
    }

    sources[lang] = source.value
    locales.push({
      lang,
      resume,
      labels: resolveLabels(lang, config),
      downloads: downloadsFor(config.formats, {
        name: resume.basics.name,
        lang,
        multilingual: langs.length > 1,
      }),
      title: pageTitle(resume.basics),
    })
  }

  if (problems.length > 0) {
    throw fail()
  }

  return {
    data: {
      profile,
      sections: config.sections,
      locales: locales as SiteData["locales"],
    },
    sources,
    files: [...files, ...localAssets],
    localAssets: [...localAssets],
    warnings,
  }
}
