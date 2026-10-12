import { describe, expect, it } from "vitest"

import { personJsonLd, serializeJsonLd } from "@core/seo/json-ld.ts"
import { siteFixture } from "@tests/fixtures/site.ts"

describe("personJsonLd", () => {
  it("builds a schema.org Person without contacts", () => {
    const site = siteFixture("https://a.dev/", "ru")

    expect(personJsonLd(site, site.locales[0])).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Ivan",
      jobTitle: "Dev",
      description: "Builds fast UIs & tools <3",
      url: "https://a.dev/",
      image: "https://example.com/me.jpg",
      sameAs: ["https://github.com/ivan"],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Moscow",
        addressCountry: "RU",
      },
      worksFor: [{ "@type": "Organization", name: "Now" }],
      knowsAbout: ["React", "TS", "Vite"],
      knowsLanguage: ["English"],
    })
  })
})

describe("personJsonLd: the site itself", () => {
  it("is not listed among the person's other pages", () => {
    const site = siteFixture("https://a.dev/", "ru")
    site.locales[0].resume.basics.url = "https://a.dev"

    expect(personJsonLd(site, site.locales[0]).sameAs).toEqual([
      "https://github.com/ivan",
    ])
  })
})

describe("serializeJsonLd", () => {
  it("cannot close the script element", () => {
    expect(serializeJsonLd({ a: "</script>" })).not.toContain("</")
  })
})
