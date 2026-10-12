import { describe, expect, it } from "vitest"

import { jsonTokens } from "@core/json-tokens.ts"

describe("jsonTokens", () => {
  it("tells keys from values", () => {
    expect(jsonTokens('{"a": "b", "n": -1.5e3, "t": true, "z": null}')).toEqual(
      [
        { type: "plain", text: "{" },
        { type: "key", text: '"a"' },
        { type: "plain", text: ": " },
        { type: "string", text: '"b"' },
        { type: "plain", text: ", " },
        { type: "key", text: '"n"' },
        { type: "plain", text: ": " },
        { type: "number", text: "-1.5e3" },
        { type: "plain", text: ", " },
        { type: "key", text: '"t"' },
        { type: "plain", text: ": " },
        { type: "literal", text: "true" },
        { type: "plain", text: ", " },
        { type: "key", text: '"z"' },
        { type: "plain", text: ": " },
        { type: "literal", text: "null" },
        { type: "plain", text: "}" },
      ]
    )
  })

  it("keeps escaped quotes and digits inside strings", () => {
    expect(jsonTokens('["say \\"hi\\" 42"]')).toEqual([
      { type: "plain", text: "[" },
      { type: "string", text: '"say \\"hi\\" 42"' },
      { type: "plain", text: "]" },
    ])
  })

  it("gives the text back when joined", () => {
    const text = JSON.stringify(
      { basics: { name: "Ivan", tags: [1, false] } },
      null,
      2
    )

    expect(
      jsonTokens(text)
        .map((token) => token.text)
        .join("")
    ).toBe(text)
  })
})
