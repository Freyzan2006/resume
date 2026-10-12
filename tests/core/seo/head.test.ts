import { describe, expect, it } from "vitest"

import { headTags, ogLocale } from "@core/seo/head.ts"
import type { SiteData } from "@core/site.ts"
import { siteFixture } from "@tests/fixtures/site.ts"

const tagsOf = (site: SiteData, lang = site.locales[0].lang) =>
  headTags(
    site,
    site.locales.find((locale) => locale.lang === lang) ?? site.locales[0]
  )

describe("ogLocale", () => {
  it("adds the likely territory", () => {
    expect(ogLocale("ru")).toBe("ru_RU")
    expect(ogLocale("en")).toBe("en_US")
    expect(ogLocale("uz")).toBe("uz_UZ")
  })
})

describe("headTags", () => {
  it("describes the person by the summary as plain text", () => {
    const { meta } = tagsOf(siteFixture(undefined, "ru"))

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

  it("previews the language's card when the site url is known", () => {
    const { meta } = tagsOf(siteFixture("https://a.dev/", "ru", "en"), "en")

    expect(meta).toContainEqual({
      property: "og:image",
      content: "https://a.dev/og.en.png",
    })
    expect(meta).toContainEqual({ property: "og:image:width", content: "1200" })
    expect(meta).toContainEqual({
      name: "twitter:card",
      content: "summary_large_image",
    })
  })

  it("makes each language page canonical for itself", () => {
    const { meta, links } = tagsOf(
      siteFixture("https://a.dev/", "ru", "en"),
      "en"
    )

    expect(meta).toContainEqual({ property: "og:locale", content: "en_US" })
    expect(meta).toContainEqual({
      property: "og:locale:alternate",
      content: "ru_RU",
    })
    expect(meta).toContainEqual({
      property: "og:url",
      content: "https://a.dev/en/",
    })
    expect(links).toEqual([
      { rel: "canonical", href: "https://a.dev/en/" },
      { rel: "alternate", hreflang: "ru", href: "https://a.dev/" },
      { rel: "alternate", hreflang: "en", href: "https://a.dev/en/" },
      { rel: "alternate", hreflang: "x-default", href: "https://a.dev/" },
    ])
  })

  it("leaves out absolute links without the site url", () => {
    const { meta, links } = tagsOf(siteFixture(undefined, "ru"))

    expect(links).toEqual([])
    expect(meta).not.toContainEqual(
      expect.objectContaining({ property: "og:url" })
    )
  })
})
