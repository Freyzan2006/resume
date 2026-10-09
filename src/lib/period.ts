import type { Period } from "@/resume/schema"

const PRESENT: Record<string, string> = {
  ru: "по наст. время",
  en: "present",
}

function formatYearMonth(value: string) {
  const [year, month] = value.split("-")
  return `${month}.${year}`
}

/** "2022-03" … "present" → "03.2022 — по наст. время" (by <html lang>). */
export function formatPeriod({ start, end }: Period, lang: string) {
  const to =
    end === "present" ? (PRESENT[lang] ?? PRESENT.en) : formatYearMonth(end)
  return `${formatYearMonth(start)} — ${to}`
}
