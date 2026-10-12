import { describe, expect, it } from "vitest"

import { cardContent } from "@core/seo/card.ts"
import { siteFixture } from "@tests/fixtures/site.ts"

const [locale] = siteFixture("https://a.dev/", "en").locales
const labels = { ...locale.labels, work: "Experience" }
const now = new Date(2025, 0)

describe("cardContent", () => {
  it("sums up the person from the resume", () => {
    expect(cardContent({ ...locale, labels }, "https://a.dev/", now)).toEqual({
      lang: "en",
      name: "Ivan",
      label: "Dev",
      facts: ["Moscow", "Experience: 6 years"],
      skills: ["React", "TS", "Vite"],
      host: "a.dev",
    })
  })

  it("keeps the path of a project site", () => {
    expect(
      cardContent({ ...locale, labels }, "https://me.github.io/cv/", now).host
    ).toBe("me.github.io/cv")
  })

  it("leaves out experience without dated work", () => {
    const resume = { ...locale.resume, work: [] }

    expect(
      cardContent({ ...locale, labels, resume }, "https://a.dev/", now).facts
    ).toEqual(["Moscow"])
  })
})
