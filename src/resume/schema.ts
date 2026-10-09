import { z } from "zod"

import { renderInlineMarkdown, renderMarkdown } from "./markdown.ts"

// assets/resume.yaml follows the JSON Resume schema (https://jsonresume.org/schema)
// and assets/config.yaml holds site settings. Both are validated at build time
// inside the Vite plugin, so the app imports nothing from here but types.
// Markdown fields arrive as source and leave as rendered HTML.

const text = z.string().trim().min(1)
const url = z.url()

/** Block markdown: paragraphs, lists, emphasis, links. */
const markdown = text.transform(renderMarkdown)

/** One line of markdown: emphasis and links, no paragraph wrapper. */
const inlineMarkdown = text.transform(renderInlineMarkdown)

/** JSON Resume dates are partial ISO 8601; YAML reads a bare `2020` as a number. */
const isoDate = z
  .union([
    z
      .string()
      .regex(
        /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/,
        "ожидается дата YYYY, YYYY-MM или YYYY-MM-DD"
      ),
    z.number().int().min(1000).max(9999),
  ])
  .transform(String)

const period = {
  startDate: isoDate.optional(),
  endDate: isoDate.optional().describe("Пусто — по настоящее время"),
}

const list = <T extends z.ZodType>(item: T) => z.array(item).default([])

const basicsSchema = z.strictObject({
  name: text,
  label: text.optional().describe("Должность или короткий заголовок"),
  image: text.optional().describe("URL фотографии"),
  email: z.email().optional(),
  phone: text.optional(),
  url: url.optional().describe("Личный сайт"),
  summary: markdown.optional().describe("О себе, markdown"),
  location: z
    .strictObject({
      address: text.optional(),
      postalCode: text.optional(),
      city: text.optional(),
      countryCode: text.optional(),
      region: text.optional(),
    })
    .optional(),
  profiles: list(
    z.strictObject({
      network: text.describe("GitHub, Telegram, LinkedIn…"),
      username: text.optional(),
      url: url.optional(),
    })
  ),
})

const workSchema = z.strictObject({
  name: text.describe("Компания"),
  position: text,
  location: text.optional(),
  description: text.optional().describe("Чем занимается компания"),
  url: url.optional(),
  ...period,
  summary: markdown.optional().describe("Описание работы, markdown"),
  highlights: list(inlineMarkdown).describe("Достижения, по одному на пункт"),
  keywords: list(text).describe("Стек (расширение JSON Resume)"),
})

const projectSchema = z.strictObject({
  name: text,
  description: markdown.optional(),
  highlights: list(inlineMarkdown),
  keywords: list(text),
  ...period,
  url: url.optional(),
  roles: list(text),
  entity: text.optional(),
  type: text.optional(),
})

const educationSchema = z.strictObject({
  institution: text,
  url: url.optional(),
  area: text.optional().describe("Специальность"),
  studyType: text.optional().describe("Степень: бакалавр, магистр…"),
  ...period,
  score: text.optional(),
  courses: list(text),
})

const skillSchema = z.strictObject({
  name: text,
  level: text.optional(),
  keywords: list(text),
})

const languageSchema = z.strictObject({
  language: text,
  fluency: text.optional(),
})

/** JSON Resume sections the site accepts but does not render (yet). */
export const unrenderedSections = [
  "volunteer",
  "awards",
  "certificates",
  "publications",
  "interests",
  "references",
] as const

const unrendered = z
  .array(z.unknown())
  .optional()
  .describe("Раздел JSON Resume, который сайт пока не показывает")

export const resumeSchema = z.strictObject({
  $schema: z.string().optional(),
  basics: basicsSchema,
  work: list(workSchema),
  projects: list(projectSchema),
  education: list(educationSchema),
  skills: list(skillSchema),
  languages: list(languageSchema),
  volunteer: unrendered,
  awards: unrendered,
  certificates: unrendered,
  publications: unrendered,
  interests: unrendered,
  references: unrendered,
  meta: z.record(z.string(), z.unknown()).optional(),
})

export const sectionNames = [
  "summary",
  "work",
  "projects",
  "skills",
  "education",
  "languages",
] as const

export type SectionName = (typeof sectionNames)[number]

export const labelNames = [...sectionNames, "present"] as const

export type Labels = Record<(typeof labelNames)[number], string>

export const configSchema = z.strictObject({
  $schema: z.string().optional(),
  lang: z
    .string()
    .regex(/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/, "ожидается код языка: ru, en, …")
    .default("ru")
    .describe("Язык сайта; для ru и en подписи встроены"),
  sections: z
    .array(z.enum(sectionNames))
    .default([...sectionNames])
    .describe("Какие разделы показывать и в каком порядке"),
  labels: z
    .partialRecord(z.enum(labelNames), text)
    .default({})
    .describe("Свои подписи разделов вместо встроенных"),
})

export type Resume = z.output<typeof resumeSchema>
export type Config = z.output<typeof configSchema>

export type Period = { startDate?: string; endDate?: string }

/** What `virtual:resume` exports. */
export type SiteData = {
  resume: Resume
  lang: string
  sections: SectionName[]
  labels: Labels
}
