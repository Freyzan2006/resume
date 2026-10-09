import { z } from "zod"

import { renderMarkdown } from "./markdown.ts"

// Schemas describe one assets/<section>.md file: its frontmatter plus the
// markdown body under the `body` key. They run at build time only (inside the
// Vite plugin), so the app imports nothing from here but types.

const text = z.string().trim().min(1)

/** Markdown source in, rendered HTML out. */
const markdown = text.transform(renderMarkdown)

const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "ожидается дата в формате YYYY-MM")

const period = {
  start: yearMonth,
  end: z.union([yearMonth, z.literal("present")]),
}

const noBody = z
  .string()
  .trim()
  .max(0, "у этого раздела всё описывается во frontmatter, текст не нужен")

export const contactSchema = z.strictObject({
  name: text,
  title: text,
  location: text.optional(),
  email: z.email().optional(),
  phone: text.optional(),
  links: z.array(z.strictObject({ label: text, url: z.url() })).default([]),
  body: noBody,
})

export const summarySchema = z.strictObject({
  title: text,
  body: markdown,
})

export const jobsSchema = z.strictObject({
  title: text,
  items: z
    .array(
      z.strictObject({
        company: text,
        position: text,
        location: text.optional(),
        url: z.url().optional(),
        ...period,
        stack: z.array(text).default([]),
        description: markdown.optional(),
      })
    )
    .min(1),
  body: noBody,
})

export const educationSchema = z.strictObject({
  title: text,
  items: z
    .array(
      z.strictObject({
        institution: text,
        degree: text,
        field: text.optional(),
        ...period,
        description: markdown.optional(),
      })
    )
    .min(1),
  body: noBody,
})

export const skillsSchema = z.strictObject({
  title: text,
  groups: z
    .array(z.strictObject({ name: text, items: z.array(text).min(1) }))
    .min(1),
  body: noBody,
})

/** Every key is a required assets/<key>.md file. */
export const sectionSchemas = {
  contact: contactSchema,
  summary: summarySchema,
  jobs: jobsSchema,
  education: educationSchema,
  skills: skillsSchema,
}

export type SectionName = keyof typeof sectionSchemas

export type Resume = {
  [K in SectionName]: z.output<(typeof sectionSchemas)[K]>
}

export type Period = Pick<Resume["jobs"]["items"][number], "start" | "end">
