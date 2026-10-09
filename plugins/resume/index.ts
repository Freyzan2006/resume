import { resolve } from "node:path"
import type { Plugin } from "vite"

import { loadResume, sectionFiles } from "./load.ts"

const VIRTUAL_ID = "virtual:resume"
const RESOLVED_ID = `\0${VIRTUAL_ID}`

/**
 * Exposes the validated content of `dir/*.md` as `virtual:resume`.
 * Any schema error fails the build (and shows the overlay in dev).
 */
export function resume({ dir }: { dir: string }): Plugin {
  const assetsDir = resolve(dir)

  return {
    name: "resume",

    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_ID
      }
    },

    async load(id) {
      if (id !== RESOLVED_ID) {
        return
      }

      for (const file of sectionFiles(assetsDir)) {
        this.addWatchFile(file)
      }

      const data = await loadResume(assetsDir)
      return `export default ${JSON.stringify(data)}`
    },

    configureServer(server) {
      server.watcher.add(assetsDir)

      const reload = (file: string) => {
        if (!file.startsWith(assetsDir) || !file.endsWith(".md")) {
          return
        }

        const { moduleGraph } = server.environments.client
        const module = moduleGraph.getModuleById(RESOLVED_ID)
        if (module) {
          moduleGraph.invalidateModule(module)
        }
        server.ws.send({ type: "full-reload" })
      }

      server.watcher.on("add", reload)
      server.watcher.on("change", reload)
      server.watcher.on("unlink", reload)
    },
  }
}
