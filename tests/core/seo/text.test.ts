import { describe, expect, it } from "vitest"

import { escapeMarkup, plainText, truncate } from "@core/seo/text.ts"

describe("plainText", () => {
  it("strips tags and decodes entities", () => {
    expect(
      plainText("<p>A <strong>b</strong> &amp; &#x3C;c&#62;</p>\n<p>d</p>")
    ).toBe("A b & <c> d")
  })
})

describe("truncate", () => {
  it("keeps short text", () => {
    expect(truncate("short", 10)).toBe("short")
  })

  it("cuts at a word boundary", () => {
    expect(truncate("one two three four", 12)).toBe("one two…")
  })

  it("drops punctuation before the ellipsis", () => {
    expect(truncate("one two, three four", 13)).toBe("one two…")
  })
})

describe("escapeMarkup", () => {
  it("escapes text and attribute values", () => {
    expect(escapeMarkup(`<a href="x">&</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;"
    )
  })
})
