import { formatPeriod } from "@/core/period"

import { joinParts, Section, type SectionProps } from "./section"
import { TimelineItem, TitleLink } from "./timeline"

export function EducationSection({ resume, labels }: SectionProps) {
  if (resume.education.length === 0) {
    return null
  }

  return (
    <Section title={labels.education}>
      {resume.education.map((item) => (
        <TimelineItem
          key={`${item.institution}-${item.startDate}`}
          title={<TitleLink url={item.url}>{item.institution}</TitleLink>}
          subtitle={joinParts(
            [item.studyType, item.area].filter(Boolean).join(", "),
            item.score
          )}
          period={formatPeriod(item, labels.present)}
          tags={item.courses}
        />
      ))}
    </Section>
  )
}
