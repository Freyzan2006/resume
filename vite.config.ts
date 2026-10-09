/// <reference types="vitest/config" />
import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

import { resume } from "./plugins/resume/index.ts"
import { ASSETS_DIR } from "./plugins/resume/load.ts"

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs, so the build works from any sub-path (GitHub Pages).
  base: "./",
  plugins: [resume({ dir: ASSETS_DIR }), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    include: ["{src,plugins,scripts,exporters}/**/*.test.ts"],
  },
})
