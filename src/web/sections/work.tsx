import { jobPeriod, joinParts, workTitle } from "@core/resume-format"

import { Section, type SectionProps } from "./section"
import { TimelineItem, TitleLink } from "./timeline"

export function WorkSection({
  locale: { resume, labels, lang },
}: SectionProps) {
  if (resume.work.length === 0) {
    return null
  }

  // Counted when the page is viewed, so "present" stays current without a rebuild.
  const context = { lang, labels, now: new Date() }

  return (
    <Section title={workTitle(resume.work, context)}>
      {resume.work.map((job) => (
        <TimelineItem
          key={`${job.name}-${job.startDate}`}
          title={
            <>
              {job.position} · <TitleLink url={job.url}>{job.name}</TitleLink>
            </>
          }
          subtitle={joinParts(job.description, job.location)}
          period={jobPeriod(job, context)}
          summary={job.summary}
          highlights={job.highlights}
          tags={job.keywords}
        />
      ))}
    </Section>
  )
}
