// Regenerates schemas/*.schema.json from the src/core schemas.
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { renderJsonSchemas, SCHEMAS_DIR } from "../json-schema.ts"

await mkdir(SCHEMAS_DIR, { recursive: true })

for (const [name, content] of Object.entries(renderJsonSchemas())) {
  await writeFile(join(SCHEMAS_DIR, name), content)
  console.log(`${SCHEMAS_DIR}/${name}`)
}
