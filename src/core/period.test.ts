import { describe, expect, it } from "vitest"

import { formatPeriod } from "./period.ts"

describe("formatPeriod", () => {
  it("formats a closed period", () => {
    expect(
      formatPeriod({ startDate: "2019-09", endDate: "2022-02" }, "now")
    ).toBe("09.2019 — 02.2022")
  })

  it("uses the present label for a missing endDate", () => {
    expect(formatPeriod({ startDate: "2022-03" }, "по наст. время")).toBe(
      "03.2022 — по наст. время"
    )
  })

  it("supports year-only and full dates", () => {
    expect(
      formatPeriod({ startDate: "2015", endDate: "2019-06-30" }, "now")
    ).toBe("2015 — 06.2019")
  })

  it("handles missing dates", () => {
    expect(formatPeriod({}, "now")).toBeUndefined()
    expect(formatPeriod({ endDate: "2020" }, "now")).toBe("2020")
  })
})
