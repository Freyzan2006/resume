export type JsonTokenType = "key" | "string" | "number" | "literal" | "plain"

export type JsonToken = { type: JsonTokenType; text: string }

const TOKEN =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

/** Splits JSON text into tokens for syntax highlighting; joined, they give the text back. */
export function jsonTokens(text: string): JsonToken[] {
  const tokens: JsonToken[] = []
  const push = (type: JsonTokenType, value: string) => {
    const previous = tokens.at(-1)
    if (!value) {
      return
    }
    if (type === "plain" && previous?.type === "plain") {
      previous.text += value
    } else {
      tokens.push({ type, text: value })
    }
  }

  let last = 0
  for (const match of text.matchAll(TOKEN)) {
    push("plain", text.slice(last, match.index))
    const [token, string, colon] = match
    if (string) {
      push(colon ? "key" : "string", string)
      push("plain", colon ?? "")
    } else {
      push(/^[-\d]/.test(token) ? "number" : "literal", token)
    }
    last = match.index + token.length
  }
  push("plain", text.slice(last))
  return tokens
}
