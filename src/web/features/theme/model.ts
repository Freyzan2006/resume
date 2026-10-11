import {
  action,
  atom,
  computed,
  effect,
  reatomMediaQuery,
  withLocalStorage,
} from "@reatom/core"

export type Theme = "light" | "dark" | "system"

const prefersDark = reatomMediaQuery("(prefers-color-scheme: dark)")

/**
 * The viewer's choice, remembered in localStorage. The key is namespaced:
 * GitHub Pages sites of one account share an origin, and the plain "theme"
 * key holds a raw string from the template's old provider. The inline script
 * in index.html reads the same key to apply the theme before the first paint.
 */
const theme = atom<Theme>("system", "theme").extend(
  withLocalStorage("resume.theme")
)

/** The theme actually shown: "system" follows the OS setting. */
export const resolvedTheme = computed(() => {
  const value = theme()
  if (value !== "system") {
    return value
  }
  return prefersDark() ? "dark" : "light"
}, "resolvedTheme")

export const toggleTheme = action(() => {
  theme.set(resolvedTheme() === "dark" ? "light" : "dark")
}, "toggleTheme")

// shadcn's tokens switch on the `dark` class of <html>.
effect(() => {
  document.documentElement.classList.toggle("dark", resolvedTheme() === "dark")
}, "applyTheme")
