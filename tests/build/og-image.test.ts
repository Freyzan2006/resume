import { describe, expect, it } from "vitest"
import { builtStylesheet, ogCardHtml } from "../../src/build/og-image.ts"
import { siteFixture } from "../fixtures/site.ts"

const [locale] = siteFixture("https://a.dev/", "en").locales

const card = (overrides: Partial<Parameters<typeof ogCardHtml>[0]> = {}) =>
  ogCardHtml({
    locale: { ...locale, labels: { ...locale.labels, work: "Experience" } },
    siteUrl: "https://a.dev/",
    stylesheet: "./assets/index.css",
    now: new Date(2025, 0),
    ...overrides,
  })

describe("ogCardHtml", () => {
  it("shows the person, experience, skills and the site host", () => {
    const html = card()

    expect(html).toContain(">Ivan</h1>")
    expect(html).toContain("Moscow · Experience: 6 years 1 month")
    expect(html).toContain("<li>Vite</li>")
    expect(html).toContain(">a.dev</div>")
    expect(html).toContain('href="./assets/index.css"')
  })

  it("leaves contacts out", () => {
    expect(card()).not.toContain("ivan@example.com")
  })

  it("escapes the resume's text", () => {
    const html = card({
      locale: {
        ...locale,
        resume: {
          ...locale.resume,
          basics: { ...locale.resume.basics, name: "<b>Ivan</b>" },
        },
      },
    })

    expect(html).toContain("&lt;b&gt;Ivan&lt;/b&gt;")
  })
})

describe("builtStylesheet", () => {
  it("finds the stylesheet vite linked", () => {
    expect(
      builtStylesheet(
        '<link rel="stylesheet" crossorigin href="./assets/index-1.css">'
      )
    ).toBe("./assets/index-1.css")
  })
})
