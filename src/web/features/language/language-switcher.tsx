import site from "virtual:resume"

import { cn } from "@web/lib/utils"
import { buttonVariants } from "@web/ui/button"

import { locale, localeHref } from "./model"

/** Links to the other language pages; hidden when there is a single language. */
export function LanguageSwitcher() {
  if (site.locales.length < 2) {
    return null
  }

  return (
    <nav className="flex" aria-label="Language">
      {site.locales.map(({ lang }) => {
        const current = lang === locale.lang
        return (
          <a
            key={lang}
            href={localeHref(lang)}
            hrefLang={lang}
            lang={lang}
            aria-current={current ? "page" : undefined}
            className={cn(
              buttonVariants({
                variant: current ? "secondary" : "ghost",
                size: "sm",
              }),
              "max-sm:px-2"
            )}
          >
            {lang.toUpperCase()}
          </a>
        )
      })}
    </nav>
  )
}
