import { formatDuration, periodMonths, totalMonths } from "@core/experience"
import { formatPeriod } from "@core/period"

import { joinParts, Section, type SectionProps } from "./section"
import { TimelineItem, TitleLink } from "./timeline"

export function WorkSection({
  locale: { resume, labels, lang },
}: SectionProps) {
  if (resume.work.length === 0) {
    return null
  }

  // Counted when the page is viewed, so "present" stays current without a rebuild.
  const now = new Date()
  const total = totalMonths(resume.work, now)

  const title =
    total > 0
      ? `${labels.work} · ${formatDuration(total, lang, { units: labels })}`
      : labels.work

  return (
    <Section title={title}>
      {resume.work.map((job) => {
        const months = periodMonths(job, now)
        return (
          <TimelineItem
            key={`${job.name}-${job.startDate}`}
            title={
              <>
                {job.position} · <TitleLink url={job.url}>{job.name}</TitleLink>
              </>
            }
            subtitle={joinParts(job.description, job.location)}
            period={joinParts(
              formatPeriod(job, labels.present),
              months > 0
                ? formatDuration(months, lang, {
                    display: "short",
                    units: labels,
                  })
                : undefined
            )}
            summary={job.summary}
            highlights={job.highlights}
            tags={job.keywords}
          />
        )
      })}
    </Section>
  )
}
