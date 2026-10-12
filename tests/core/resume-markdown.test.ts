import { describe, expect, it } from "vitest"

import { resolveLabels } from "@core/labels.ts"
import { type DocumentOptions, resumeDocument } from "@core/resume-document.ts"
import { resumeMarkdown } from "@core/resume-markdown.ts"
import { resumeSourceSchema } from "@core/resume-schema.ts"

const resume = resumeSourceSchema.parse({
  basics: {
    name: "Ivan",
    label: "Dev",
    email: "ivan@example.com",
    summary: "Builds **fast** UIs",
    location: { city: "Moscow" },
    profiles: [{ network: "GitHub", url: "https://github.com/ivan" }],
  },
  work: [
    {
      name: "Acme",
      url: "https://acme.dev",
      position: "Engineer",
      startDate: 2020,
      endDate: "2021-12",
      highlights: ["Cut load time by **40%**"],
      keywords: ["React"],
    },
  ],
  skills: [{ name: "Front", keywords: ["React", "TS"] }],
})

const markdown = (sections: DocumentOptions["sections"]) =>
  resumeMarkdown(
    resumeDocument(resume, {
      lang: "en",
      labels: resolveLabels("en", { labels: {} }),
      sections,
      now: new Date(2025, 0),
    })
  )

describe("resumeMarkdown", () => {
  it("starts with the person and their contacts", () => {
    expect(markdown([])).toBe(
      "# Ivan\n\n**Dev**\n\nMoscow · ivan@example.com · [GitHub](https://github.com/ivan)\n"
    )
  })

  it("keeps markdown fields as written", () => {
    const text = markdown(["summary", "work"])

    expect(text).toContain("## Summary\n\nBuilds **fast** UIs")
    expect(text).toContain("- Cut load time by **40%**")
  })

  it("lays out jobs with period, duration and stack", () => {
    expect(markdown(["work"])).toContain(
      [
        "## Experience · 2 years",
        "### Engineer · [Acme](https://acme.dev)",
        "_2020 — 12.2021 · 2 yrs_",
        "- Cut load time by **40%**",
        "`React`",
      ].join("\n\n")
    )
  })

  it("follows the sections of config.yaml and skips empty ones", () => {
    const text = markdown(["skills", "projects", "summary"])

    expect(text.indexOf("## Skills")).toBeLessThan(text.indexOf("## Summary"))
    expect(text).not.toContain("## Projects")
    expect(text).toContain("- **Front**: React, TS")
  })
})
