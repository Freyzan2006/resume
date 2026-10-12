export type Token<T extends string> = { type: T; text: string }

/** Collects tokens, merging neighbours of one type: fewer spans to render. */
export function tokenList<T extends string>() {
  const tokens: Token<T>[] = []

  const push = (type: T, text: string) => {
    const previous = tokens.at(-1)
    if (!text) {
      return
    }
    if (previous?.type === type) {
      previous.text += text
    } else {
      tokens.push({ type, text })
    }
  }

  return { tokens, push }
}

/**
 * Runs `pattern` over `text`: `onMatch` pushes each match's tokens, the text
 * between matches goes in as `plain`.
 */
export function scan<T extends string>(
  text: string,
  pattern: RegExp,
  plain: T,
  push: (type: T, text: string) => void,
  onMatch: (match: RegExpExecArray) => void
) {
  let last = 0
  for (const match of text.matchAll(pattern)) {
    push(plain, text.slice(last, match.index))
    onMatch(match)
    last = match.index + match[0].length
  }
  push(plain, text.slice(last))
}
