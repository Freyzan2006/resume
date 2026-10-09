import { existsSync } from "node:fs"
import { resolve } from "node:path"
import type { Plugin } from "vite"

import { personalizeHtml } from "./html.ts"
import { CONFIG_FILES, loadSite, RESUME_FILES } from "./load.ts"

const VIRTUAL_ID = "virtual:resume"
const RESOLVED_ID = `\0${VIRTUAL_ID}`

/**
 * Exposes the validated content of `dir` (resume.yaml + config.yaml) as
 * `virtual:resume` and fills index.html with the person's name and language.
 * Any validation error fails the build (and shows the overlay in dev).
 */
export function resume({ dir }: { dir: string }): Plugin {
  const assetsDir = resolve(dir)
  const watchedFiles = [...RESUME_FILES, ...CONFIG_FILES].map((name) =>
    resolve(assetsDir, name)
  )

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

      // Dev turns watch files into module imports, so a missing one breaks
      // import analysis. New files are picked up by the watcher below.
      for (const file of watchedFiles.filter(existsSync)) {
        this.addWatchFile(file)
      }

      const { data, warnings } = await loadSite(assetsDir)
      for (const warning of warnings) {
        this.warn(warning)
      }
      return `export default ${JSON.stringify(data)}`
    },

    async transformIndexHtml(html) {
      // On invalid content leave the page as is: the `load` hook above
      // reports the error (build failure or dev overlay).
      const site = await loadSite(assetsDir).catch(() => undefined)
      return site ? personalizeHtml(html, site.data) : html
    },

    configureServer(server) {
      server.watcher.add(assetsDir)

      const reload = (file: string) => {
        if (!watchedFiles.includes(file)) {
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
