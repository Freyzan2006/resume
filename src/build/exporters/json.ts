import { writeFile } from "node:fs/promises"

import type { Exporter } from "./types.ts"

export const JSON_RESUME_SCHEMA =
  "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json"

const DATE_KEYS = new Set(["startDate", "endDate", "date", "releaseDate"])

/** YAML reads a bare `2015` as a number; JSON Resume dates are strings. */
function normalizeDates(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeDates)
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        DATE_KEYS.has(key) && typeof item === "number"
          ? String(item)
          : normalizeDates(item),
      ])
    )
  }
  return value
}

/**
 * The resume as a JSON Resume document (markdown left as source), ready for
 * jsonresume.org themes and other tools. The local `$schema` link is replaced
 * by the official one.
 */
export const exportJson: Exporter = async ({ source, outFile }) => {
  const entries = Object.entries(normalizeDates(source) as object).filter(
    ([key]) => key !== "$schema"
  )
  const resume = Object.fromEntries([
    ["$schema", JSON_RESUME_SCHEMA],
    ...entries,
  ])

  await writeFile(outFile, `${JSON.stringify(resume, null, 2)}\n`)
}
