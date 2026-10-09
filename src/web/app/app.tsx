import site from "virtual:resume"

import { Downloads } from "@/web/features/download/downloads"
import { ThemeToggle } from "@/web/features/theme/theme-toggle"
import { Header, sections } from "@/web/sections"

const { resume, labels, downloads } = site

export function App() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10 print:max-w-none print:p-0">
      <div className="flex items-start justify-between gap-4">
        <Header basics={resume.basics} />
        <div className="flex gap-2 print:hidden">
          {/* Exported files are written after `vite build`, so prod only. */}
          {import.meta.env.PROD && (
            <Downloads downloads={downloads} label={labels.download} />
          )}
          <ThemeToggle />
        </div>
      </div>

      {site.sections.map((name) => {
        const SectionComponent = sections[name]
        return <SectionComponent key={name} resume={resume} labels={labels} />
      })}
    </main>
  )
}
