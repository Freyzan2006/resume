import { z } from "zod"

import { renderInlineMarkdown, renderMarkdown } from "./markdown.ts"

// assets/resume.yaml follows the JSON Resume schema (https://jsonresume.org/schema).
// Validated at build time. The web layer imports only types from here.

const text = z.string().trim().min(1)
const url = z.url()

type MarkdownField = z.ZodType<string, string>

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

/** JSON Resume sections the site accepts but does not render (yet). */
export const unrenderedSections = [
  "volunteer",
  "awards",
  "publications",
  "interests",
  "references",
] as const

const unrendered = z
  .array(z.unknown())
  .optional()
  .describe("Раздел JSON Resume, который сайт пока не показывает")

/**
 * The resume schema; `markdown` (blocks) and `inlineMarkdown` (one line)
 * decide what becomes of the markdown fields.
 */
function resumeSchemaWith(
  markdown: MarkdownField,
  inlineMarkdown: MarkdownField
) {
  const basicsSchema = z.strictObject({
    name: text,
    label: text.optional().describe("Должность или короткий заголовок"),
    image: text
      .optional()
      .describe(
        "Фото: URL или путь к файлу относительно резюме, например ../photo.jpg"
      ),
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

  const certificateSchema = z.strictObject({
    name: text,
    date: isoDate.optional(),
    issuer: text.optional().describe("Кто выдал: Coursera, AWS, …"),
    url: url.optional(),
  })

  const languageSchema = z.strictObject({
    language: text,
    fluency: text.optional(),
  })

  return z.strictObject({
    $schema: z.string().optional(),
    basics: basicsSchema,
    work: list(workSchema),
    projects: list(projectSchema),
    education: list(educationSchema),
    skills: list(skillSchema),
    certificates: list(certificateSchema),
    languages: list(languageSchema),
    volunteer: unrendered,
    awards: unrendered,
    publications: unrendered,
    interests: unrendered,
    references: unrendered,
    meta: z.record(z.string(), z.unknown()).optional(),
  })
}

/** Markdown rendered to HTML: what the site shows. */
export const resumeSchema = resumeSchemaWith(
  text.transform(renderMarkdown),
  text.transform(renderInlineMarkdown)
)

/** The same checks, markdown kept as written: for exports in markdown. */
export const resumeSourceSchema = resumeSchemaWith(text, text)

export type Resume = z.output<typeof resumeSchema>

export type Period = { startDate?: string; endDate?: string }
