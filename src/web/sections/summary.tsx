import { Markdown, Section, type SectionProps } from "./section"

export function SummarySection({ resume, labels }: SectionProps) {
  const { summary } = resume.basics
  if (!summary) {
    return null
  }

  return (
    <Section title={labels.summary}>
      <Markdown html={summary} />
    </Section>
  )
}
