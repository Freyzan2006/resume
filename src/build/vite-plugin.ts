import { relative, resolve, sep } from "node:path"
import type { Plugin } from "vite"

import { personalizeHtml } from "./html.ts"
import { loadSite, type LoadedSite } from "./load.ts"

const VIRTUAL_ID = "virtual:resume"
const RESOLVED_ID = `\0${VIRTUAL_ID}`

/**
 * Module source for `virtual:resume`. Local files the data points at (photos)
 * become imports, so Vite serves them in dev and fingerprints them in builds.
 */
function moduleSource({ data, localAssets }: LoadedSite, root: string) {
  let json = JSON.stringify(data)
  const imports = localAssets.map((path, index) => {
    json = json.replaceAll(JSON.stringify(path), `asset${index}`)
    const url = `/${relative(root, path).split(sep).join("/")}`
    return `import asset${index} from ${JSON.stringify(url)}`
  })
  return [...imports, `export default ${json}`].join("\n")
}

/**
 * Exposes the validated content of `dir` (the profile chosen in config.yaml,
 * every language) as `virtual:resume` and fills index.html with the person's
 * name and primary language. Any validation error fails the build (and shows
 * the overlay in dev).
 */
export function resume({ dir }: { dir: string }): Plugin {
  const assetsDir = resolve(dir)
  let root = process.cwd()

  return {
    name: "resume",

    configResolved(config) {
      root = config.root
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_ID
      }
    },

    async load(id) {
      if (id !== RESOLVED_ID) {
        return
      }

      const site = await loadSite(assetsDir)
      for (const file of site.files) {
        this.addWatchFile(file)
      }
      for (const warning of site.warnings) {
        this.warn(warning)
      }
      return moduleSource(site, root)
    },

    async transformIndexHtml(html) {
      // On invalid content leave the page as is: the `load` hook above
      // reports the error (build failure or dev overlay).
      const site = await loadSite(assetsDir).catch(() => undefined)
      return site ? personalizeHtml(html, site.data) : html
    },

    configureServer(server) {
      server.watcher.add(assetsDir)

      // Any change in assets/ may switch the profile, add a language or a
      // photo, so reload the data and the page.
      const reload = (file: string) => {
        if (!file.startsWith(assetsDir + sep)) {
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
