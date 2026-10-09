import { z } from "zod"

import { formatNames } from "./formats.ts"

// assets/config.yaml: optional site settings, all fields have defaults.

const text = z.string().trim().min(1)

export const sectionNames = [
  "summary",
  "work",
  "projects",
  "skills",
  "education",
  "certificates",
  "languages",
] as const

export type SectionName = (typeof sectionNames)[number]

export const labelNames = [
  ...sectionNames,
  "present",
  "download",
  // Duration units, used only where the browser's Intl lacks the language.
  "year",
  "month",
] as const

export type Labels = Record<(typeof labelNames)[number], string>

/** BCP 47-ish language code, as used in resume.<lang>.yaml file names. */
export const langPattern = /^[a-z]{2,3}(-[A-Za-z0-9]+)*$/

/** A profile is a folder in assets/: frontend, devops, … */
export const profilePattern = /^[a-z0-9][a-z0-9_-]*$/

export const configSchema = z.strictObject({
  $schema: z.string().optional(),
  profile: z
    .string()
    .regex(
      profilePattern,
      "ожидается имя папки: строчные латинские буквы, цифры, - и _"
    )
    .optional()
    .describe(
      "Какое резюме собирать: папка в assets/. Можно не указывать, если папка одна"
    ),
  lang: z
    .string()
    .regex(langPattern, "ожидается код языка: ru, en, …")
    .default("ru")
    .describe(
      "Основной язык: его версия открывается по умолчанию. Для ru и en подписи встроены"
    ),
  sections: z
    .array(z.enum(sectionNames))
    .default([...sectionNames])
    .describe("Какие разделы показывать и в каком порядке"),
  formats: z
    .array(z.enum(formatNames))
    .default(["pdf"])
    .describe("В каких форматах резюме можно скачать с сайта"),
  labels: z
    .record(
      z.string().regex(langPattern, "ожидается код языка: ru, en, …"),
      z.partialRecord(z.enum(labelNames), text)
    )
    .default({})
    .describe(
      "Свои подписи вместо встроенных, по языкам: { ru: { work: Карьера } }"
    ),
})

export type Config = z.output<typeof configSchema>
