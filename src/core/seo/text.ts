import type { Resume } from "../resume-schema.ts"

const DESCRIPTION_LENGTH = 160

const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
}

function decodeEntity(entity: string, name: string) {
  if (name.startsWith("#")) {
    const hex = name[1] === "x" || name[1] === "X"
    return String.fromCodePoint(
      Number.parseInt(name.slice(hex ? 2 : 1), hex ? 16 : 10)
    )
  }
  return namedEntities[name] ?? entity
}

export function escapeMarkup(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function plainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, decodeEntity)
    .replace(/\s+/g, " ")
    .trim()
}

/** Cuts at the last word that fits, so the ellipsis never splits a word. */
export function truncate(text: string, max = DESCRIPTION_LENGTH) {
  if (text.length <= max) {
    return text
  }
  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  const words = lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut
  return `${words.replace(/[\s,.;:—-]+$/, "")}…`
}

/** The summary as one short plain-text line, or the title without one. */
export function metaDescription({ summary }: Resume["basics"], title: string) {
  return summary ? truncate(plainText(summary)) : title
}
