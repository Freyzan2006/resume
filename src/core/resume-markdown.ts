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

type Options = FormatContext & {
  /** Which sections and in what order, as on the site. */
  sections: SectionName[]
}

const blocks = (...parts: (string | undefined)[]) =>
  parts.filter(Boolean).join("\n\n")

const link = (text: string, url?: string) => (url ? `[${text}](${url})` : text)

const tags = (values: string[]) =>
  values.map((value) => `\`${value}\``).join(" ") || undefined

const bullets = (items: string[]) =>
  items.map((item) => `- ${item}`).join("\n") || undefined

/** "- **Name**: detail" for skills and languages. */
const term = (name: string, detail?: string) =>
  `- **${name}**${detail ? `: ${detail}` : ""}`

/** A job, project, school or certificate: title, facts, then its texts. */
const entry = (
  title: string,
  facts: string | undefined,
  ...body: (string | undefined)[]
) => blocks(`### ${title}`, facts && `_${facts}_`, ...body)

/** A titled section of items; nothing when there are no items. */
function section<T>(
  title: string,
  items: T[],
  render: (item: T) => string,
  separator = "\n\n"
) {
  return items.length > 0
    ? `## ${title}\n\n${items.map(render).join(separator)}`
    : undefined
}

function header({ basics }: Resume) {
  const contacts = joinParts(
    formatLocation(basics.location),
    basics.email,
    basics.phone,
    basics.url && link(basics.url.replace(/^https?:\/\//, ""), basics.url),
    ...basics.profiles.map((profile) => link(profile.network, profile.url))
  )
  return blocks(
    `# ${basics.name}`,
    basics.label && `**${basics.label}**`,
    contacts
  )
}

const sections: Record<
  SectionName,
  (resume: Resume, options: Options) => string | undefined
> = {
  summary: ({ basics }, { labels }) =>
    section(labels.summary, basics.summary ? [basics.summary] : [], String),

  work: ({ work }, options) =>
    section(workTitle(work, options), work, (job) =>
      entry(
        `${job.position} · ${link(job.name, job.url)}`,
        joinParts(jobPeriod(job, options), job.description, job.location),
        job.summary,
        bullets(job.highlights),
        tags(job.keywords)
      )
    ),

  projects: ({ projects }, { labels }) =>
    section(labels.projects, projects, (project) =>
      entry(
        link(project.name, project.url),
        joinParts(formatPeriod(project, labels.present), projectRole(project)),
        project.description,
        bullets(project.highlights),
        tags(project.keywords)
      )
    ),

  skills: ({ skills }, { labels }) =>
    section(
      labels.skills,
      skills,
      (skill) =>
        term(skill.name, joinParts(skill.keywords.join(", "), skill.level)),
      "\n"
    ),

  education: ({ education }, { labels }) =>
    section(labels.education, education, (item) =>
      entry(
        link(item.institution, item.url),
        joinParts(formatPeriod(item, labels.present), degree(item)),
        tags(item.courses)
      )
    ),

  certificates: ({ certificates }, { labels }) =>
    section(labels.certificates, certificates, (item) =>
      entry(
        link(item.name, item.url),
        joinParts(item.date && formatDate(item.date), item.issuer)
      )
    ),

  languages: ({ languages }, { labels }) =>
    section(
      labels.languages,
      languages,
      (item) => term(item.language, item.fluency),
      "\n"
    ),
}

/**
 * The resume as a Markdown document, laid out like the site: the same
 * sections in the same order and language. Markdown fields stay as written.
 */
export function resumeMarkdown(resume: Resume, options: Options) {
  const body = options.sections.map((name) => sections[name](resume, options))
  return `${blocks(header(resume), ...body)}\n`
}
