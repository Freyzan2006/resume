import { resumeSchema } from "../../src/core/resume-schema.ts"
import { metaDescription } from "../../src/core/seo/text.ts"
import type { Locale, SiteData } from "../../src/core/site.ts"

const TITLE = "Ivan — Dev"

function locale(lang: string): Locale {
  const resume = resumeSchema.parse({
    basics: {
      name: "Ivan",
      label: "Dev",
      summary: "Builds **fast** UIs & tools <3",
      image: "https://example.com/me.jpg",
      email: "ivan@example.com",
      location: { city: "Moscow", countryCode: "RU" },
      profiles: [{ network: "GitHub", url: "https://github.com/ivan" }],
    },
    work: [
      { name: "Now", position: "Dev", startDate: "2022" },
      { name: "Past", position: "Dev", startDate: "2019", endDate: "2021" },
    ],
    skills: [
      { name: "Front", keywords: ["React", "TS"] },
      { name: "Tools", keywords: ["TS", "Vite"] },
    ],
    languages: [{ language: "English" }],
  })

  return {
    lang,
    resume,
    labels: {} as Locale["labels"],
    downloads: [],
    title: TITLE,
    description: metaDescription(resume.basics, TITLE),
  }
}

/** A site in the given languages, the first one primary. */
export function siteFixture(
  url: string | undefined,
  ...langs: [string, ...string[]]
): SiteData {
  return {
    profile: "frontend",
    url,
    sections: [],
    locales: langs.map(locale) as SiteData["locales"],
  }
}
