import { describe, expect, it } from "vitest"

import { formatDuration, periodMonths, totalMonths } from "./experience.ts"

const now = new Date(2026, 9, 9) // October 2026

describe("periodMonths", () => {
  it("counts both edge months", () => {
    expect(
      periodMonths({ startDate: "2022-03", endDate: "2022-03" }, now)
    ).toBe(1)
    expect(
      periodMonths({ startDate: "2019-09", endDate: "2022-02" }, now)
    ).toBe(30)
  })

  it("runs an open period up to the current month", () => {
    expect(periodMonths({ startDate: "2026-01" }, now)).toBe(10)
  })

  it("reads bare years as whole years and ignores days", () => {
    expect(periodMonths({ startDate: "2015", endDate: "2016" }, now)).toBe(24)
    expect(
      periodMonths({ startDate: "2020-01-31", endDate: "2020-02-01" }, now)
    ).toBe(2)
  })

  it("is zero without a start or for a reversed period", () => {
    expect(periodMonths({ endDate: "2020" }, now)).toBe(0)
    expect(periodMonths({ startDate: "2021", endDate: "2020" }, now)).toBe(0)
  })
})

describe("totalMonths", () => {
  it("sums separate periods", () => {
    expect(
      totalMonths(
        [
          { startDate: "2019-09", endDate: "2022-02" },
          { startDate: "2022-03" },
        ],
        now
      )
    ).toBe(30 + 56)
  })

  it("counts overlapping months once", () => {
    expect(
      totalMonths(
        [
          { startDate: "2020-01", endDate: "2020-12" },
          { startDate: "2020-07", endDate: "2021-06" },
          { startDate: "2020-03", endDate: "2020-04" },
        ],
        now
      )
    ).toBe(18)
  })

  it("is zero for no work", () => {
    expect(totalMonths([], now)).toBe(0)
  })
})

describe("formatDuration", () => {
  it("formats years and months with the language's plural rules", () => {
    expect(formatDuration(79, "ru")).toBe("6 лет 7 месяцев")
    expect(formatDuration(13, "ru")).toBe("1 год 1 месяц")
    expect(formatDuration(79, "en")).toBe("6 years 7 months")
  })

  it("omits empty parts but never returns nothing", () => {
    expect(formatDuration(24, "en")).toBe("2 years")
    expect(formatDuration(0, "en")).toBe("0 months")
  })

  it("has a short form", () => {
    expect(formatDuration(31, "ru", "short")).toBe("2 г. 7 мес.")
  })
})
