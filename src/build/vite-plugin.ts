import { relative, resolve, sep } from "node:path"
import type { Plugin } from "vite"

import { langOfPath, localePath } from "../core/pages.ts"
import { robotsTxt, sitemapXml } from "../core/seo/crawlers.ts"
import { personalizeHtml } from "./html.ts"
import { type LoadedSite, loadSite } from "./load.ts"

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
  let cached: Promise<LoadedSite> | undefined
  const site = () => {
    cached ??= loadSite(assetsDir)
    return cached
  }

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

      const loaded = await site()
      for (const file of loaded.files) {
        this.addWatchFile(file)
      }
      for (const warning of loaded.warnings) {
        this.warn(warning)
      }
      return moduleSource(loaded, root)
    },

    generateBundle: {
      // After Vite has written its scripts and styles into index.html.
      order: "post",
      async handler(_, bundle) {
        const { data } = await site()
        const index = bundle["index.html"]
        if (index?.type !== "asset") {
          throw new Error("сборка не создала index.html")
        }
        const template = String(index.source)
        const [primary] = data.locales

        const files: Record<string, string | undefined> = {
          "robots.txt": robotsTxt(data),
          "sitemap.xml": sitemapXml(data),
        }
        for (const locale of data.locales) {
          const fileName = `${localePath(locale.lang, primary.lang)}index.html`
          files[fileName] = personalizeHtml(template, data, locale)
        }

        index.source = files["index.html"] ?? template
        delete files["index.html"]
        for (const [fileName, source] of Object.entries(files)) {
          if (source) {
            this.emitFile({ type: "asset", fileName, source })
          }
        }
      },
    },

    async transformIndexHtml(html, { server, originalUrl }) {
      // Builds personalize every language page in generateBundle instead.
      if (!server) {
        return html
      }
      // On invalid content leave the page as is: the `load` hook above
      // reports the error (dev overlay).
      const loaded = await site().catch(() => undefined)
      if (!loaded) {
        return html
      }
      const { locales } = loaded.data
      const path = (originalUrl ?? "/").replace(/^\//, "")
      const lang = langOfPath(
        path,
        locales.map((locale) => locale.lang)
      )
      const locale = locales.find((item) => item.lang === lang) ?? locales[0]
      return personalizeHtml(html, loaded.data, locale)
    },

    configureServer(server) {
      server.watcher.add(assetsDir)

      // Any change in assets/ may switch the profile, add a language or a
      // photo, so reload the data and the page.
      const reload = (file: string) => {
        if (!file.startsWith(assetsDir + sep)) {
          return
        }

        cached = undefined
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
