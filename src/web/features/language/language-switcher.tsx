import { wrap } from "@reatom/core"
import { reatomComponent } from "@reatom/react"
import site from "virtual:resume"

import { Button } from "@/web/ui/button"

import { lang } from "./model"

/** RU / EN toggle; hidden when the profile has a single language. */
export const LanguageSwitcher = reatomComponent(() => {
  if (site.locales.length < 2) {
    return null
  }

  const current = lang()

  return (
    <div className="flex" role="group" aria-label="Language">
      {site.locales.map((item) => (
        <Button
          key={item.lang}
          variant={item.lang === current ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={item.lang === current}
          onClick={wrap(() => lang.set(item.lang))}
        >
          {item.lang.toUpperCase()}
        </Button>
      ))}
    </div>
  )
}, "LanguageSwitcher")
