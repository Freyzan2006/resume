import { Section, type SectionProps } from "./section"

export function LanguagesSection({ locale: { resume, labels } }: SectionProps) {
  if (resume.languages.length === 0) {
    return null
  }

  return (
    <Section title={labels.languages}>
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
    </Section>
  )
}
