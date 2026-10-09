import { Download, Moon, Sun } from "lucide-react"
import type { ReactNode } from "react"
import site from "virtual:resume"

import { ContactHeader } from "@/components/resume/contact-header"
import { Markdown, Section } from "@/components/resume/section"
import { TimelineItem, TitleLink } from "@/components/resume/timeline"
import { useTheme } from "@/components/theme-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatPeriod } from "@/lib/period"
import type { SectionName } from "@/resume/schema"

const { resume, labels } = site

const join = (...parts: (string | undefined)[]) =>
  parts.filter(Boolean).join(" · ") || undefined

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
          download={`${resume.basics.name}.pdf`}
        >
          <Download data-icon="inline-start" />
          PDF
        </a>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <Sun className="hidden dark:block" />
        <Moon className="dark:hidden" />
      </Button>
    </div>
  )
}

/** Section bodies; a falsy result hides a section that has no content. */
const sections: Record<SectionName, () => ReactNode> = {
  summary: () =>
    resume.basics.summary && <Markdown html={resume.basics.summary} />,

  work: () =>
    resume.work.length > 0 &&
    resume.work.map((job) => (
      <TimelineItem
        key={`${job.name}-${job.startDate}`}
        title={
          <>
            {job.position} · <TitleLink url={job.url}>{job.name}</TitleLink>
          </>
        }
        subtitle={join(job.description, job.location)}
        period={formatPeriod(job, labels.present)}
        summary={job.summary}
        highlights={job.highlights}
        tags={job.keywords}
      />
    )),

  projects: () =>
    resume.projects.length > 0 &&
    resume.projects.map((project) => (
      <TimelineItem
        key={project.name}
        title={<TitleLink url={project.url}>{project.name}</TitleLink>}
        subtitle={join(project.roles.join(", "), project.entity)}
        period={formatPeriod(project, labels.present)}
        summary={project.description}
        highlights={project.highlights}
        tags={project.keywords}
      />
    )),

  skills: () =>
    resume.skills.length > 0 && (
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        {resume.skills.map((skill) => (
          <div key={skill.name} className="contents">
            <dt className="font-semibold">{skill.name}</dt>
            <dd className="text-muted-foreground">
              {join(skill.keywords.join(", "), skill.level)}
            </dd>
          </div>
        ))}
      </dl>
    ),

  education: () =>
    resume.education.length > 0 &&
    resume.education.map((item) => (
      <TimelineItem
        key={`${item.institution}-${item.startDate}`}
        title={<TitleLink url={item.url}>{item.institution}</TitleLink>}
        subtitle={join(
          [item.studyType, item.area].filter(Boolean).join(", "),
          item.score
        )}
        period={formatPeriod(item, labels.present)}
        tags={item.courses}
      />
    )),

  languages: () =>
    resume.languages.length > 0 && (
      <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        {resume.languages.map((item) => (
          <li key={item.language}>
            <span className="font-semibold">{item.language}</span>
            {item.fluency && (
              <span className="text-muted-foreground"> — {item.fluency}</span>
            )}
          </li>
        ))}
      </ul>
    ),
}

export function App() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10 print:max-w-none print:p-0">
      <div className="flex items-start justify-between gap-4">
        <ContactHeader basics={resume.basics} />
        <Toolbar />
      </div>

      {site.sections.map((name) => {
        const content = sections[name]()
        return (
          content && (
            <Section key={name} title={labels[name]}>
              {content}
            </Section>
          )
        )
      })}
    </main>
  )
}

export default App
