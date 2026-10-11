import { formatDuration, totalMonths } from "../experience.ts"
import { formatLocation } from "../location.ts"
import type { Locale } from "../site.ts"

const MAX_SKILLS = 6

export type CardContent = {
  lang: string
  name: string
  label?: string
  /** Location and total experience, whichever the resume has. */
  facts: string[]
  skills: string[]
  /** The site's address without the protocol: freyzan2006.github.io */
  host: string
}

/** What the link-preview card shows. Contacts stay out on purpose. */
export function cardContent(
  { lang, labels, resume }: Locale,
  siteUrl: string,
  now: Date
): CardContent {
  const { name, label, location } = resume.basics
  const months = totalMonths(resume.work, now)
  const experience =
    months > 0
      ? `${labels.work}: ${formatDuration(months, lang, { units: labels })}`
      : undefined

  return {
    lang,
    name,
    label,
    facts: [formatLocation(location), experience].filter(
      (fact) => fact !== undefined
    ),
    skills: [
      ...new Set(resume.skills.flatMap((skill) => skill.keywords)),
    ].slice(0, MAX_SKILLS),
    host: siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  }
}
