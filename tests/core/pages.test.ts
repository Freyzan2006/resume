import { describe, expect, it } from "vitest"

import { langOfPath, localePath } from "@core/pages.ts"

describe("localePath", () => {
  it("puts the primary language at the root and the rest in folders", () => {
    expect(localePath("ru", "ru")).toBe("")
    expect(localePath("en", "ru")).toBe("en/")
  })
})

describe("langOfPath", () => {
  const langs = ["ru", "en"]

  it("finds the language folder", () => {
    expect(langOfPath("en/", langs)).toBe("en")
    expect(langOfPath("en/index.html", langs)).toBe("en")
  })

  it("falls back to the primary language", () => {
    expect(langOfPath("", langs)).toBe("ru")
    expect(langOfPath("index.html", langs)).toBe("ru")
    expect(langOfPath("de/", langs)).toBe("ru")
  })
})
