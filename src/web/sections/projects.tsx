import { formatPeriod } from "@core/period"
import { projectRole } from "@core/resume-format"

import { Section, type SectionProps } from "./section"
import { TimelineItem, TitleLink } from "./timeline"

export function ProjectsSection({ locale: { resume, labels } }: SectionProps) {
  if (resume.projects.length === 0) {
    return null
  }

  return (
    <Section title={labels.projects}>
      {resume.projects.map((project) => (
        <TimelineItem
          key={project.name}
          title={<TitleLink url={project.url}>{project.name}</TitleLink>}
          subtitle={projectRole(project)}
          period={formatPeriod(project, labels.present)}
          summary={project.description}
          highlights={project.highlights}
          tags={project.keywords}
        />
      ))}
    </Section>
  )
}
