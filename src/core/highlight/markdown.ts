import { scan, type Token, tokenList } from "./tokens.ts"

export type MarkdownTokenType =
  | "heading"
  | "marker"
  | "strong"
  | "emphasis"
  | "code"
  | "link"
  | "url"
  | "plain"

/** `# `, `- `, `1. `, `> ` at the start of a line. */
const LINE_START = /^(#{1,6} |\s*(?:[-*+]|\d+\.) |> )/

const INLINE =
  /(\*\*[^*\n]+\*\*)|((?<!\w)_[^_\n]+_(?!\w))|(`[^`\n]+`)|(\[[^\]\n]+\])(\([^)\s]+\))/g

/**
 * Markdown text as tokens for highlighting, line by line: block markers, then
 * emphasis, code and links. Heading text is a heading, except its inline
 * parts. Joined, the tokens give the text back.
 */
export function markdownTokens(text: string): Token<MarkdownTokenType>[] {
  const { tokens, push } = tokenList<MarkdownTokenType>()

  text.split("\n").forEach((line, index) => {
    if (index > 0) {
      push("plain", "\n")
    }
    const marker = LINE_START.exec(line)?.[0] ?? ""
    const plain = marker.startsWith("#") ? "heading" : "plain"
    push("marker", marker)

    scan(line.slice(marker.length), INLINE, plain, push, (match) => {
      const [, strong, emphasis, code, link, url] = match
      if (link && url) {
        push("link", link)
        push("url", url)
      } else {
        push(
          strong ? "strong" : emphasis ? "emphasis" : code ? "code" : plain,
          match[0]
        )
      }
    })
  })
  return tokens
}
