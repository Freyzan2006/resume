import { Download, Moon, Sun } from "lucide-react"
import resume from "virtual:resume"

import { ContactHeader } from "@/components/resume/contact-header"
import { Markdown, Section } from "@/components/resume/section"
import { TimelineItem } from "@/components/resume/timeline"
import { useTheme } from "@/components/theme-provider"
import { Button, buttonVariants } from "@/components/ui/button"

function Toolbar() {
  const { setTheme } = useTheme()

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div className="flex gap-2 print:hidden">
      {/* resume.pdf is printed from the build, so it only exists in prod. */}
      {import.meta.env.PROD && (
        <a
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href="resume.pdf"
          download
        >
          <Download data-icon="inline-start" />
          PDF
        </a>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggleTheme}
        aria-label="Переключить тему"
      >
        <Sun className="hidden dark:block" />
        <Moon className="dark:hidden" />
      </Button>
    </div>
  )
}

export function App() {
  const { contact, summary, jobs, education, skills } = resume

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10 print:max-w-none print:p-0">
      <title>{`${contact.name} — ${contact.title}`}</title>

      <div className="flex items-start justify-between gap-4">
        <ContactHeader contact={contact} />
        <Toolbar />
      </div>

      <Section title={summary.title}>
        <Markdown html={summary.body} />
      </Section>

      <Section title={jobs.title}>
        {jobs.items.map((job) => (
          <TimelineItem
            key={`${job.company}-${job.start}`}
            title={
              <>
                {job.position} ·{" "}
                {job.url ? (
                  <a
                    className="underline-offset-4 hover:underline"
                    href={job.url}
                  >
                    {job.company}
                  </a>
                ) : (
                  job.company
                )}
              </>
            }
            subtitle={job.location}
            period={job}
            tags={job.stack}
            description={job.description}
          />
        ))}
      </Section>

      <Section title={skills.title}>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {skills.groups.map((group) => (
            <div key={group.name} className="contents">
              <dt className="font-semibold">{group.name}</dt>
              <dd className="text-muted-foreground">
                {group.items.join(", ")}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title={education.title}>
        {education.items.map((item) => (
          <TimelineItem
            key={`${item.institution}-${item.start}`}
            title={item.institution}
            subtitle={[item.degree, item.field].filter(Boolean).join(", ")}
            period={item}
            description={item.description}
          />
        ))}
      </Section>
    </main>
  )
}

export default App
