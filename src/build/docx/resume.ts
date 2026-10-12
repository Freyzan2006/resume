import {
  convertMillimetersToTwip,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Paragraph,
  type ParagraphChild,
  TextRun,
} from "docx"

import type {
  DocumentEntry,
  DocumentLink,
  DocumentSection,
  ResumeDocument,
} from "../../core/resume-document.ts"
import { pageTitle } from "../../core/site.ts"
import { markdownParagraphs, markdownRuns, type RunStyle } from "./markdown.ts"
import { COLORS, FONTS, halfPoints, SIZES } from "./theme.ts"

const SEPARATOR = " · "
const PAGE_MARGIN = { vertical: 18, horizontal: 19 }

/** Paragraph spacing is set in twentieths of a point. */
const twips = (points: number) => points * 20

const mutedStyle = (extra: RunStyle = {}): RunStyle => ({
  color: COLORS.muted,
  size: halfPoints(SIZES.small),
  ...extra,
})

function link(
  { text, url }: DocumentLink,
  style: RunStyle = {}
): ParagraphChild {
  return url
    ? new ExternalHyperlink({
        link: url,
        children: [new TextRun({ ...style, text, style: "Hyperlink" })],
      })
    : new TextRun({ ...style, text })
}

/** A paragraph of one run, or none when there is no text. */
const line = (text: string | undefined, style: RunStyle, keepNext = false) =>
  text
    ? [new Paragraph({ keepNext, children: [new TextRun({ ...style, text })] })]
    : []

function header(document: ResumeDocument): Paragraph[] {
  return [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun(document.name)],
    }),
    ...line(document.label, {
      color: COLORS.muted,
      size: halfPoints(SIZES.label),
    }),
    new Paragraph({
      children: document.contacts.flatMap((contact, index) => [
        ...(index > 0
          ? [new TextRun({ ...mutedStyle(), text: SEPARATOR })]
          : []),
        link(contact, { size: halfPoints(SIZES.small) }),
      ]),
    }),
  ]
}

function entry(item: DocumentEntry): Paragraph[] {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      keepNext: true,
      children: [
        ...(item.lead ? [new TextRun(item.lead)] : []),
        link(item.title),
      ],
    }),
    ...line(item.facts, mutedStyle({ italics: true }), true),
    ...(item.text ? markdownParagraphs(item.text) : []),
    ...item.highlights.map(
      (highlight) =>
        new Paragraph({
          bullet: { level: 0 },
          children: markdownRuns(highlight),
        })
    ),
    ...line(item.tags.join(SEPARATOR), mutedStyle()),
  ]
}

function sectionBody(section: DocumentSection): Paragraph[] {
  switch (section.kind) {
    case "text":
      return markdownParagraphs(section.markdown)
    case "entries":
      return section.entries.flatMap(entry)
    case "terms":
      return section.terms.map(
        ({ name, detail }) =>
          new Paragraph({
            children: [
              new TextRun({ text: name, bold: true }),
              ...(detail ? [new TextRun(`: ${detail}`)] : []),
            ],
          })
      )
  }
}

const section = (item: DocumentSection) => [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    keepNext: true,
    children: [new TextRun(item.title)],
  }),
  ...sectionBody(item),
]

/** Word's built-in styles restyled, so headings stay real headings. */
const styles = (lang: string) => ({
  default: {
    document: {
      run: {
        font: FONTS.body,
        size: halfPoints(SIZES.body),
        language: { value: lang },
      },
      paragraph: { spacing: { after: twips(4) } },
    },
    title: {
      run: {
        font: FONTS.body,
        size: halfPoints(SIZES.name),
        bold: true,
        color: COLORS.text,
      },
      paragraph: { spacing: { after: twips(2) } },
    },
    heading1: {
      run: {
        font: FONTS.body,
        size: halfPoints(SIZES.small),
        bold: true,
        allCaps: true,
        color: COLORS.muted,
      },
      paragraph: {
        spacing: { before: twips(14), after: twips(6) },
        border: {
          bottom: {
            style: "single" as const,
            size: 4,
            color: COLORS.rule,
            space: 2,
          },
        },
      },
    },
    heading2: {
      run: {
        font: FONTS.body,
        size: halfPoints(SIZES.entry),
        bold: true,
        color: COLORS.text,
      },
      paragraph: { spacing: { before: twips(8), after: twips(1) } },
    },
    hyperlink: { run: { color: COLORS.text, underline: {} } },
  },
})

/** The resume document as Word: real headings, lists and links. */
export function resumeDocx(document: ResumeDocument, lang: string) {
  const vertical = convertMillimetersToTwip(PAGE_MARGIN.vertical)
  const horizontal = convertMillimetersToTwip(PAGE_MARGIN.horizontal)

  return new Document({
    creator: document.name,
    title: pageTitle(document),
    styles: styles(lang),
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: vertical,
              bottom: vertical,
              left: horizontal,
              right: horizontal,
            },
          },
        },
        children: [...header(document), ...document.sections.flatMap(section)],
      },
    ],
  })
}
