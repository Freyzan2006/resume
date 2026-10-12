import site from "virtual:resume"

import { Downloads } from "@web/features/download/downloads"
import { LanguageSwitcher } from "@web/features/language/language-switcher"
import { locale } from "@web/features/language/model"
import { ThemeToggle } from "@web/features/theme/theme-toggle"
import { Header, sections } from "@web/sections"

export function App() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10 print:max-w-none print:gap-5 print:p-0">
      <div className="-mb-4 flex justify-end gap-2 print:hidden">
        <LanguageSwitcher />
        {/* Exported files are written after `vite build`, so prod only. */}
        {import.meta.env.PROD && (
          <Downloads downloads={locale.downloads} labels={locale.labels} />
        )}
        <ThemeToggle />
      </div>

      <Header basics={locale.resume.basics} />

      {site.sections.map((name) => {
        const SectionComponent = sections[name]
        return <SectionComponent key={name} locale={locale} />
      })}
    </main>
  )
}
