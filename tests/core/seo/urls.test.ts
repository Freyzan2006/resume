import { describe, expect, it } from "vitest"
import {
  alternates,
  languagePages,
  publicImage,
} from "../../../src/core/seo/urls.ts"
import { siteFixture } from "../../fixtures/site.ts"

describe("languagePages", () => {
  it("keeps the primary language at the root", () => {
    const { locales } = siteFixture(undefined, "ru", "en")

    expect(languagePages("https://a.dev/cv/", locales)).toEqual([
      { hreflang: "ru", href: "https://a.dev/cv/" },
      { hreflang: "en", href: "https://a.dev/cv/en/" },
    ])
  })
})

describe("alternates", () => {
  it("adds x-default to several languages", () => {
    const { locales } = siteFixture(undefined, "ru", "en")

    expect(alternates("https://a.dev/", locales)).toContainEqual({
      hreflang: "x-default",
      href: "https://a.dev/",
    })
  })

  it("is empty for a single language", () => {
    expect(
      alternates("https://a.dev/", siteFixture(undefined, "ru").locales)
    ).toEqual([])
  })
})

describe("publicImage", () => {
  it("publishes only web URLs", () => {
    expect(
      publicImage({ name: "A", image: "https://a.dev/me.jpg", profiles: [] })
    ).toBe("https://a.dev/me.jpg")
    expect(
      publicImage({ name: "A", image: "/home/me/photo.jpg", profiles: [] })
    ).toBeUndefined()
  })
})
