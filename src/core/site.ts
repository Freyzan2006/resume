import type { Labels, SectionName } from "./config-schema.ts"
import type { Download } from "./formats.ts"
import type { Resume } from "./resume-schema.ts"

/** One language version of the resume. */
export type Locale = {
  lang: string
  resume: Resume
  labels: Labels
  downloads: Download[]
  /** Page title: "Name — Label". */
  title: string
}

/**
 * Everything the web layer gets from assets/: built by build/load.ts and
 * served as the `virtual:resume` module.
 */
export type SiteData = {
  /** The assets/ folder the resume came from: frontend, devops, … */
  profile: string
  sections: SectionName[]
  /** All language versions; the first one is the primary language. */
  locales: [Locale, ...Locale[]]
}

export function pageTitle({ name, label }: Resume["basics"]) {
  return label ? `${name} — ${label}` : name
}
