import { describe, expect, it } from "vitest"

import { markdownTokens } from "@core/highlight/markdown.ts"

describe("markdownTokens", () => {
  it("marks headings, keeping their links apart", () => {
    expect(markdownTokens("### Dev · [Acme](https://acme.dev)")).toEqual([
      { type: "marker", text: "### " },
      { type: "heading", text: "Dev · " },
      { type: "link", text: "[Acme]" },
      { type: "url", text: "(https://acme.dev)" },
    ])
  })

  it("finds list markers, emphasis and code", () => {
    expect(markdownTokens("- Cut **40%** in _2024_ with `Vite`")).toEqual([
      { type: "marker", text: "- " },
      { type: "plain", text: "Cut " },
      { type: "strong", text: "**40%**" },
      { type: "plain", text: " in " },
      { type: "emphasis", text: "_2024_" },
      { type: "plain", text: " with " },
      { type: "code", text: "`Vite`" },
    ])
  })

  it("leaves underscores inside words alone", () => {
    expect(markdownTokens("snake_case_name")).toEqual([
      { type: "plain", text: "snake_case_name" },
    ])
  })

  it("gives the text back when joined", () => {
    const text =
      "# Ivan\n\n**Dev**\n\n## Work\n\n_2020 — 2021_\n\n1. One\n> quote\n`a` `b`\n"

    expect(
      markdownTokens(text)
        .map((token) => token.text)
        .join("")
    ).toBe(text)
  })
})
