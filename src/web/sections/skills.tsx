import { joinParts, Section, type SectionProps } from "./section"

export function SkillsSection({ resume, labels }: SectionProps) {
  if (resume.skills.length === 0) {
    return null
  }

  return (
    <Section title={labels.skills}>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        {resume.skills.map((skill) => (
          <div key={skill.name} className="contents">
            <dt className="font-semibold">{skill.name}</dt>
            <dd className="text-muted-foreground">
              {joinParts(skill.keywords.join(", "), skill.level)}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
