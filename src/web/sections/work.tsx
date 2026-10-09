import { formatPeriod } from "@/core/period"

import { joinParts, Section, type SectionProps } from "./section"
import { TimelineItem, TitleLink } from "./timeline"

export function WorkSection({ resume, labels }: SectionProps) {
  if (resume.work.length === 0) {
    return null
  }

  return (
    <Section title={labels.work}>
      {resume.work.map((job) => (
        <TimelineItem
          key={`${job.name}-${job.startDate}`}
          title={
            <>
              {job.position} · <TitleLink url={job.url}>{job.name}</TitleLink>
            </>
          }
          subtitle={joinParts(job.description, job.location)}
          period={formatPeriod(job, labels.present)}
          summary={job.summary}
          highlights={job.highlights}
          tags={job.keywords}
        />
      ))}
    </Section>
  )
}
