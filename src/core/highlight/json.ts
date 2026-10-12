import { scan, type Token, tokenList } from "./tokens.ts"

export type JsonTokenType = "key" | "string" | "number" | "literal" | "plain"

const TOKEN =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

/** JSON text as tokens for highlighting; joined, they give the text back. */
export function jsonTokens(text: string): Token<JsonTokenType>[] {
  const { tokens, push } = tokenList<JsonTokenType>()

  scan(text, TOKEN, "plain", push, ([token, string, colon]) => {
    if (string) {
      push(colon ? "key" : "string", string)
      push("plain", colon ?? "")
    } else {
      push(/^[-\d]/.test(token) ? "number" : "literal", token)
    }
  })
  return tokens
}
