import {
  ExternalHyperlink,
  type IRunOptions,
  Paragraph,
  type ParagraphChild,
  TextRun,
} from "docx"
import type { PhrasingContent, RootContent } from "mdast"

import { parseMarkdown } from "../../core/markdown.ts"
import { FONTS } from "./theme.ts"

// Markdown fields of the resume as Word formatting: paragraphs, bullet lists,
// bold, italics, code and links.

export type RunStyle = Omit<IRunOptions, "text" | "children">

/** Inline nodes as runs; nested styles add up (a link in bold is both). */
function runs(nodes: PhrasingContent[], style: RunStyle): ParagraphChild[] {
  return nodes.flatMap((node): ParagraphChild[] => {
    switch (node.type) {
      case "text":
        // A single newline in markdown is a space, not a line break.
        return [
          new TextRun({ ...style, text: node.value.replace(/\s*\n\s*/g, " ") }),
        ]
      case "strong":
        return runs(node.children, { ...style, bold: true })
      case "emphasis":
        return runs(node.children, { ...style, italics: true })
      case "delete":
        return runs(node.children, { ...style, strike: true })
      case "inlineCode":
        return [new TextRun({ ...style, text: node.value, font: FONTS.mono })]
      case "link":
        return [
          new ExternalHyperlink({
            link: node.url,
            children: runs(node.children, { ...style, style: "Hyperlink" }),
          }),
        ]
      case "break":
        return [new TextRun({ ...style, break: 1 })]
      default:
        return "value" in node
          ? [new TextRun({ ...style, text: String(node.value) })]
          : []
    }
  })
}

/** Block nodes as paragraphs; list items become bullets at their depth. */
function paragraphs(nodes: RootContent[], level = 0): Paragraph[] {
  return nodes.flatMap((node): Paragraph[] => {
    switch (node.type) {
      case "paragraph":
      case "heading":
        return [new Paragraph({ children: runs(node.children, {}) })]
      case "list":
        return node.children.flatMap((item) =>
          item.children.flatMap((child) =>
            child.type === "paragraph"
              ? [
                  new Paragraph({
                    bullet: { level },
                    children: runs(child.children, {}),
                  }),
                ]
              : paragraphs([child], level + 1)
          )
        )
      case "blockquote":
        return paragraphs(node.children, level)
      default:
        return []
    }
  })
}

/** Block markdown (summaries, descriptions) as paragraphs. */
export const markdownParagraphs = (source: string) =>
  paragraphs(parseMarkdown(source).children)

/** One line of markdown (a highlight) as runs. */
export function markdownRuns(source: string, style: RunStyle = {}) {
  const [first] = parseMarkdown(source).children
  return first?.type === "paragraph" ? runs(first.children, style) : []
}
