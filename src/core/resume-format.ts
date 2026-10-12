import type { Labels } from "./config-schema.ts"
import { formatDuration, periodMonths, totalMonths } from "./experience.ts"
import { formatPeriod } from "./period.ts"
import type { Period, Resume } from "./resume-schema.ts"

// Texts the site and the exports build alike, so the two never drift apart.

export type FormatContext = { lang: string; labels: Labels; now: Date }

/** "a", undefined, "b" → "a · b"; nothing → undefined. */
export const joinParts = (...parts: (string | undefined)[]) =>
  parts.filter(Boolean).join(" · ") || undefined

/** "Опыт работы · 7 лет 2 месяца": the section title with the total. */
export function workTitle(
  work: Period[],
  { lang, labels, now }: FormatContext
) {
  const total = totalMonths(work, now)
  return total > 0
    ? `${labels.work} · ${formatDuration(total, lang, { units: labels })}`
    : labels.work
}

/** "03.2022 — по наст. время · 4 г. 8 мес." */
export function jobPeriod(job: Period, { lang, labels, now }: FormatContext) {
  const months = periodMonths(job, now)
  return joinParts(
    formatPeriod(job, labels.present),
    months > 0
      ? formatDuration(months, lang, { display: "short", units: labels })
      : undefined
  )
}

/** "Тимлид · Acme": roles and the organisation of a project. */
export const projectRole = ({ roles, entity }: Resume["projects"][number]) =>
  joinParts(roles.join(", "), entity)

/** "Бакалавр, Прикладная информатика" and the score. */
export const degree = ({
  studyType,
  area,
  score,
}: Resume["education"][number]) =>
  joinParts([studyType, area].filter(Boolean).join(", "), score)
