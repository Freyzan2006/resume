import { Text } from "@/web/ui/typography"

import { Section, type SectionProps } from "./section"

export function LanguagesSection({ locale: { resume, labels } }: SectionProps) {
  if (resume.languages.length === 0) {
    return null
  }

  return (
    <Section title={labels.languages}>
      <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        {resume.languages.map((item) => (
          <li key={item.language} className="flex items-baseline gap-2">
            <Text variant="label">{item.language}</Text>
            {item.fluency && <Text variant="annotation">{item.fluency}</Text>}
          </li>
        ))}
      </ul>
    </Section>
  )
}
