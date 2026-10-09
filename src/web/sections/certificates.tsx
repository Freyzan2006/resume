import { formatDate } from "@/core/period"

import { Section, type SectionProps } from "./section"
import { TimelineItem, TitleLink } from "./timeline"

export function CertificatesSection({
  locale: { resume, labels },
}: SectionProps) {
  if (resume.certificates.length === 0) {
    return null
  }

  return (
    <Section title={labels.certificates}>
      {resume.certificates.map((item) => (
        <TimelineItem
          key={`${item.name}-${item.date}`}
          title={<TitleLink url={item.url}>{item.name}</TitleLink>}
          subtitle={item.issuer}
          period={item.date && formatDate(item.date)}
        />
      ))}
    </Section>
  )
}
