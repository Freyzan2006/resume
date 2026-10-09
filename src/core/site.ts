import type { SectionName, Labels } from "./config-schema.ts"
import type { Download } from "./formats.ts"
import type { Resume } from "./resume-schema.ts"

/**
 * Everything the web layer gets from assets/: built by build/load.ts and
 * served as the `virtual:resume` module.
 */
export type SiteData = {
  resume: Resume
  lang: string
  sections: SectionName[]
  labels: Labels
  downloads: Download[]
}
