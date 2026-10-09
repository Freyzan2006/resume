import { wrap } from "@reatom/core"
import { reatomComponent } from "@reatom/react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/web/ui/button"

import { resolvedTheme, toggleTheme } from "./model"

export const ThemeToggle = reatomComponent(() => {
  const isDark = resolvedTheme() === "dark"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={"cursor-pointer"}
      onClick={wrap(() => toggleTheme())}
      aria-label={isDark ? "Light theme" : "Dark theme"}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}, "ThemeToggle")
