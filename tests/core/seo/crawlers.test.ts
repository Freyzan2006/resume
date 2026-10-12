import { describe, expect, it } from "vitest"

import { robotsTxt, sitemapXml } from "@core/seo/crawlers.ts"
import { siteFixture } from "@tests/fixtures/site.ts"

describe("robotsTxt", () => {
  it("points at the sitemap when the site url is known", () => {
    expect(robotsTxt(siteFixture("https://a.dev/", "ru"))).toContain(
      "Sitemap: https://a.dev/sitemap.xml"
    )
    expect(robotsTxt(siteFixture(undefined, "ru"))).not.toContain("Sitemap")
  })
})

describe("sitemapXml", () => {
  it("lists every language with all alternates", () => {
    const xml = sitemapXml(siteFixture("https://a.dev/", "ru", "en")) ?? ""

    expect(xml.match(/<loc>/g)).toHaveLength(2)
    expect(xml).toContain("<loc>https://a.dev/en/</loc>")
    expect(xml.match(/hreflang="en"/g)).toHaveLength(2)
    expect(xml.match(/hreflang="x-default"/g)).toHaveLength(2)
  })

  it("has no alternates for a single language", () => {
    expect(sitemapXml(siteFixture("https://a.dev/", "ru"))).not.toContain(
      "xhtml:link"
    )
  })

  it("needs the site url", () => {
    expect(sitemapXml(siteFixture(undefined, "ru"))).toBeUndefined()
  })
})
