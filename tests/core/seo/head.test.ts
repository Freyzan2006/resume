import { describe, expect, it } from "vitest"
import { headTags, ogLocale } from "../../../src/core/seo/head.ts"
import { siteFixture } from "../../fixtures/site.ts"

describe("ogLocale", () => {
  it("adds the likely territory", () => {
    expect(ogLocale("ru")).toBe("ru_RU")
    expect(ogLocale("en")).toBe("en_US")
    expect(ogLocale("uz")).toBe("uz_UZ")
  })
})

describe("headTags", () => {
  it("describes the person by the summary as plain text", () => {
    const { meta } = headTags(siteFixture(undefined, "ru"))

    expect(meta).toContainEqual({
      name: "description",
      content: "Builds fast UIs & tools <3",
    })
    expect(meta).toContainEqual({ property: "og:title", content: "Ivan — Dev" })
    expect(meta).toContainEqual({
      property: "og:image",
      content: "https://example.com/me.jpg",
    })
  })

  it("previews the generated card when the site url is known", () => {
    const { meta } = headTags(siteFixture("https://a.dev/", "ru"))

    expect(meta).toContainEqual({
      property: "og:image",
      content: "https://a.dev/og.png",
    })
    expect(meta).toContainEqual({ property: "og:image:width", content: "1200" })
    expect(meta).toContainEqual({
      name: "twitter:card",
      content: "summary_large_image",
    })
  })

  it("lists other languages as alternates", () => {
    const { meta, links } = headTags(siteFixture("https://a.dev/", "ru", "en"))

    expect(meta).toContainEqual({ property: "og:locale", content: "ru_RU" })
    expect(meta).toContainEqual({
      property: "og:locale:alternate",
      content: "en_US",
    })
    expect(links).toEqual([
      { rel: "canonical", href: "https://a.dev/" },
      { rel: "alternate", hreflang: "ru", href: "https://a.dev/" },
      { rel: "alternate", hreflang: "en", href: "https://a.dev/?lang=en" },
      { rel: "alternate", hreflang: "x-default", href: "https://a.dev/" },
    ])
  })

  it("leaves out absolute links without the site url", () => {
    const { meta, links } = headTags(siteFixture(undefined, "ru"))

    expect(links).toEqual([])
    expect(meta).not.toContainEqual(
      expect.objectContaining({ property: "og:url" })
    )
  })
})
