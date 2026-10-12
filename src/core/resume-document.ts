import type { SectionName } from "./config-schema.ts"
import { formatLocation } from "./location.ts"
import { formatDate, formatPeriod } from "./period.ts"
import {
  degree,
  type FormatContext,
  jobPeriod,
  joinParts,
  projectRole,
  workTitle,
} from "./resume-format.ts"
import type { Resume } from "./resume-schema.ts"

// The resume laid out as a document, the way the site shows it. Document
// exports (Markdown, DOCX) only render this, so they all say the same thing.
// Markdown fields are kept as source: each format renders them its own way.

export type DocumentLink = { text: string; url?: string }

/** A job, project, school or certificate. */
export type DocumentEntry = {
  /** Plain text before the title: the position at a job. */
  lead?: string
  title: DocumentLink
  /** Period, duration, place, …: one line under the title. */
  facts?: string
  /** Block markdown. */
  text?: string
  /** Inline markdown, one item each. */
  highlights: string[]
  tags: string[]
}

/** "Name: detail" for skills and languages. */
type DocumentTerm = { name: string; detail?: string }

export type DocumentSection = { title: string } & (
  | { kind: "text"; markdown: string }
  | { kind: "entries"; entries: DocumentEntry[] }
  | { kind: "terms"; terms: DocumentTerm[] }
)

export type ResumeDocument = {
  name: string
  label?: string
  contacts: DocumentLink[]
  sections: DocumentSection[]
}

export type DocumentOptions = FormatContext & {
  /** Which sections and in what order, as on the site. */
  sections: SectionName[]
}

const entries = (title: string, items: DocumentEntry[]) =>
  items.length > 0
    ? { title, kind: "entries" as const, entries: items }
    : undefined

const terms = (title: string, items: DocumentTerm[]) =>
  items.length > 0 ? { title, kind: "terms" as const, terms: items } : undefined

const builders: Record<
  SectionName,
  (resume: Resume, options: DocumentOptions) => DocumentSection | undefined
> = {
  summary: ({ basics }, { labels }) =>
    basics.summary
      ? { title: labels.summary, kind: "text", markdown: basics.summary }
      : undefined,

  work: ({ work }, options) =>
    entries(
      workTitle(work, options),
      work.map((job) => ({
        lead: `${job.position} · `,
        title: { text: job.name, url: job.url },
        facts: joinParts(
          jobPeriod(job, options),
          job.description,
          job.location
        ),
        text: job.summary,
        highlights: job.highlights,
        tags: job.keywords,
      }))
    ),

  projects: ({ projects }, { labels }) =>
    entries(
      labels.projects,
      projects.map((project) => ({
        title: { text: project.name, url: project.url },
        facts: joinParts(
          formatPeriod(project, labels.present),
          projectRole(project)
        ),
        text: project.description,
        highlights: project.highlights,
        tags: project.keywords,
      }))
    ),

  skills: ({ skills }, { labels }) =>
    terms(
      labels.skills,
      skills.map((skill) => ({
        name: skill.name,
        detail: joinParts(skill.keywords.join(", "), skill.level),
      }))
    ),

  education: ({ education }, { labels }) =>
    entries(
      labels.education,
      education.map((item) => ({
        title: { text: item.institution, url: item.url },
        facts: joinParts(formatPeriod(item, labels.present), degree(item)),
        highlights: [],
        tags: item.courses,
      }))
    ),

  certificates: ({ certificates }, { labels }) =>
    entries(
      labels.certificates,
      certificates.map((item) => ({
        title: { text: item.name, url: item.url },
        facts: joinParts(item.date && formatDate(item.date), item.issuer),
        highlights: [],
        tags: [],
      }))
    ),

  languages: ({ languages }, { labels }) =>
    terms(
      labels.languages,
      languages.map((item) => ({ name: item.language, detail: item.fluency }))
    ),
}

/** The resume (markdown as source) as a document; empty sections are left out. */
export function resumeDocument(
  resume: Resume,
  options: DocumentOptions
): ResumeDocument {
  const { basics } = resume
  const location = formatLocation(basics.location)

  return {
    name: basics.name,
    label: basics.label,
    contacts: [
      ...(location ? [{ text: location }] : []),
      ...(basics.email ? [{ text: basics.email }] : []),
      ...(basics.phone ? [{ text: basics.phone }] : []),
      ...(basics.url
        ? [{ text: basics.url.replace(/^https?:\/\//, ""), url: basics.url }]
        : []),
      ...basics.profiles.map((profile) => ({
        text: profile.network,
        url: profile.url,
      })),
    ],
    sections: options.sections
      .map((name) => builders[name](resume, options))
      .filter((section) => section !== undefined),
  }
}
