import { Text } from "@/web/ui/typography"

import { joinParts, Section, type SectionProps } from "./section"

export function SkillsSection({ locale: { resume, labels } }: SectionProps) {
  if (resume.skills.length === 0) {
    return null
  }

  return (
    <Section title={labels.skills}>
      <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 print:gap-y-1">
        {resume.skills.map((skill) => (
          <div key={skill.name} className="contents">
            <Text variant="label" render={<dt />}>
              {skill.name}
            </Text>
            <Text
              variant="copy"
              render={<dd />}
              className="text-muted-foreground"
            >
              {joinParts(skill.keywords.join(", "), skill.level)}
            </Text>
          </div>
        ))}
      </dl>
    </Section>
  )
}
