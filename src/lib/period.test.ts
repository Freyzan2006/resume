import { describe, expect, it } from "vitest"

import { formatPeriod } from "./period.ts"

describe("formatPeriod", () => {
  it("formats a closed period", () => {
    expect(formatPeriod({ start: "2019-09", end: "2022-02" }, "ru")).toBe(
      "09.2019 — 02.2022"
    )
  })

  it("localizes an open period", () => {
    const period = { start: "2022-03", end: "present" } as const

    expect(formatPeriod(period, "ru")).toBe("03.2022 — по наст. время")
    expect(formatPeriod(period, "en")).toBe("03.2022 — present")
    expect(formatPeriod(period, "de")).toBe("03.2022 — present")
  })
})
