import type { Period } from "@/resume/schema"

/** "2022" → "2022", "2022-03" and "2022-03-15" → "03.2022". */
function formatDate(value: string) {
  const [year, month] = value.split("-")
  return month ? `${month}.${year}` : year
}

/**
 * JSON Resume period → "03.2022 — по наст. время". A missing endDate means
 * "present"; with no dates at all there is nothing to show.
 */
export function formatPeriod(
  { startDate, endDate }: Period,
  presentLabel: string
): string | undefined {
  if (!startDate) {
    return endDate && formatDate(endDate)
  }
  const end = endDate ? formatDate(endDate) : presentLabel
  return `${formatDate(startDate)} — ${end}`
}
