// Regenerates schemas/*.schema.json from src/resume/schema.ts.
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

import {
  renderJsonSchemas,
  SCHEMAS_DIR,
} from "../plugins/resume/json-schema.ts"

await mkdir(SCHEMAS_DIR, { recursive: true })

for (const [name, content] of Object.entries(renderJsonSchemas())) {
  await writeFile(join(SCHEMAS_DIR, name), content)
  console.log(`${SCHEMAS_DIR}/${name}`)
}
