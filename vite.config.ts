/// <reference types="vitest/config" />
import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

import { ASSETS_DIR } from "./src/build/load.ts"
import { resume } from "./src/build/vite-plugin.ts"

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs, so the build works from any sub-path (GitHub Pages).
  base: "./",
  plugins: [resume({ dir: ASSETS_DIR }), react(), tailwindcss()],
  resolve: {
    alias: {
      "@core": resolve(import.meta.dirname, "src/core"),
      "@web": resolve(import.meta.dirname, "src/web"),
      "@build": resolve(import.meta.dirname, "src/build"),
      "@tests": resolve(import.meta.dirname, "tests"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
})
