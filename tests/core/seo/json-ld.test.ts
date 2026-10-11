import { describe, expect, it } from "vitest"
import { personJsonLd, serializeJsonLd } from "../../../src/core/seo/json-ld.ts"
import { siteFixture } from "../../fixtures/site.ts"

describe("personJsonLd", () => {
  it("builds a schema.org Person without contacts", () => {
    expect(personJsonLd(siteFixture("https://a.dev/", "ru"))).toEqual({
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

describe("serializeJsonLd", () => {
  it("cannot close the script element", () => {
    expect(serializeJsonLd({ a: "</script>" })).not.toContain("</")
  })
})
