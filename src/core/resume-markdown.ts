import type {
  DocumentEntry,
  DocumentLink,
  DocumentSection,
  ResumeDocument,
} from "./resume-document.ts"

const blocks = (...parts: (string | undefined)[]) =>
  parts.filter(Boolean).join("\n\n")

const link = ({ text, url }: DocumentLink) => (url ? `[${text}](${url})` : text)

const entry = (item: DocumentEntry) =>
  blocks(
    `### ${item.lead ?? ""}${link(item.title)}`,
    item.facts && `_${item.facts}_`,
    item.text,
    item.highlights.map((highlight) => `- ${highlight}`).join("\n"),
    item.tags.map((tag) => `\`${tag}\``).join(" ")
  )

function section(item: DocumentSection) {
  const body =
    item.kind === "text"
      ? item.markdown
      : item.kind === "entries"
        ? item.entries.map(entry).join("\n\n")
        : item.terms
            .map(
              ({ name, detail }) =>
                `- **${name}**${detail ? `: ${detail}` : ""}`
            )
            .join("\n")
  return `## ${item.title}\n\n${body}`
}

/** The document as Markdown; markdown fields go in as written. */
export function resumeMarkdown(document: ResumeDocument) {
  return `${blocks(
    `# ${document.name}`,
    document.label && `**${document.label}**`,
    document.contacts.map(link).join(" · "),
    ...document.sections.map(section)
  )}\n`
}
