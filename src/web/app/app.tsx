import { reatomComponent } from "@reatom/react"
import site from "virtual:resume"

import { Downloads } from "@/web/features/download/downloads"
import { LanguageSwitcher } from "@/web/features/language/language-switcher"
import { locale } from "@/web/features/language/model"
import { ThemeToggle } from "@/web/features/theme/theme-toggle"
import { Header, sections } from "@/web/sections"

export const App = reatomComponent(() => {
  const current = locale()

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10 print:max-w-none print:p-0">
      <div className="flex flex-wrap-reverse items-start justify-between gap-4">
        <Header basics={current.resume.basics} />
        <div className="flex gap-2 print:hidden">
          <LanguageSwitcher />
          {/* Exported files are written after `vite build`, so prod only. */}
          {import.meta.env.PROD && (
            <Downloads
              downloads={current.downloads}
              label={current.labels.download}
            />
          )}
          <ThemeToggle />
        </div>
      </div>

      {site.sections.map((name) => {
        const SectionComponent = sections[name]
        return <SectionComponent key={name} locale={current} />
      })}
    </main>
  )
}, "App")
