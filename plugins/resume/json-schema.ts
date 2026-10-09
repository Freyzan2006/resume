import { z } from "zod"

import { configSchema, resumeSchema } from "../../src/resume/schema.ts"

export const SCHEMAS_DIR = "schemas"

/**
 * JSON Schemas for editor autocompletion of assets/*.yaml (see the
 * `yaml-language-server` comment on their first line). Generated from the zod
 * schemas: `bun run schema`.
 */
export function renderJsonSchemas(): Record<string, string> {
  const render = (schema: z.ZodType) =>
    `${JSON.stringify(z.toJSONSchema(schema, { io: "input" }), null, 2)}\n`

  return {
    "resume.schema.json": render(resumeSchema),
    "config.schema.json": render(configSchema),
  }
}
