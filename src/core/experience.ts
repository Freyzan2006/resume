import type { Period } from "./resume-schema.ts"

/** Months since year 0 at a month's start: "2022-03" → 2022 * 12 + 2. */
function monthIndex(date: string) {
  const [year, month] = date.split("-").map(Number)
  return year * 12 + (month ? month - 1 : 0)
}

/**
 * Half-open month range [start, end) of a period, as hh.ru counts: from the
 * start month up to, not including, the end month (February–April is two
 * months). A bare end year runs through its December; a missing endDate
 * means up to the current month.
 */
function monthRange(
  { startDate, endDate }: Period,
  now: Date
): [number, number] | undefined {
  if (!startDate) {
    return undefined
  }
  const start = monthIndex(startDate)
  const end = !endDate
    ? now.getFullYear() * 12 + now.getMonth()
    : monthIndex(endDate) + (/^\d{4}$/.test(endDate) ? 12 : 0)
  return end > start ? [start, end] : undefined
}

/** Length of a period in months. */
export function periodMonths(period: Period, now: Date): number {
  const range = monthRange(period, now)
  return range ? range[1] - range[0] : 0
}

/** Total months across periods; overlapping months are counted once. */
export function totalMonths(periods: Period[], now: Date): number {
  const ranges = periods
    .map((period) => monthRange(period, now))
    .filter((range) => range !== undefined)
    .sort((a, b) => a[0] - b[0])

  let total = 0
  let current: [number, number] | undefined
  for (const [start, end] of ranges) {
    if (current && start <= current[1]) {
      current[1] = Math.max(current[1], end)
      continue
    }
    if (current) {
      total += current[1] - current[0]
    }
    current = [start, end]
  }
  if (current) {
    total += current[1] - current[0]
  }
  return total
}

type DurationOptions = {
  display?: "long" | "short"
  /** Words for languages the runtime's Intl has no unit names for. */
  units?: { year: string; month: string }
}

/**
 * 79 months → "6 лет 7 месяцев" / "6 years 7 months" (or "6 г. 7 мес." when
 * short). Plural forms come from Intl. Browsers may lack unit names for some
 * languages (Chrome has none for Uzbek) and silently answer in English; then
 * `units` are used instead: "6 yil 7 oy".
 */
export function formatDuration(
  months: number,
  lang: string,
  { display = "long", units }: DurationOptions = {}
): string {
  const format = (locale: string, value: number, unit: "year" | "month") =>
    new Intl.NumberFormat(locale, {
      style: "unit",
      unit,
      unitDisplay: display,
    }).format(value)

  const isEnglish = lang.split("-")[0] === "en"
  const intlFallsBack =
    !isEnglish && format(lang, 7, "year") === format("en", 7, "year")

  const unit = (value: number, name: "year" | "month") =>
    units && intlFallsBack
      ? `${value} ${units[name]}`
      : format(lang, value, name)

  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts = []
  if (years > 0) parts.push(unit(years, "year"))
  if (rest > 0 || years === 0) parts.push(unit(rest, "month"))
  return parts.join(" ")
}
