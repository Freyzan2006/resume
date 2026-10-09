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

/** The viewer's choice, remembered in localStorage. */
export const theme = atom<Theme>("system", "theme").extend(
  withLocalStorage("theme")
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
