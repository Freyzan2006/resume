// Domain types for web, which may not import the schema modules (zod, unified).
import type { SiteData as Site } from "./site.ts"

export type { SectionName } from "./config-schema.ts"
export type { Download } from "./formats.ts"
export type { Resume } from "./resume-schema.ts"
export type { Locale } from "./site.ts"

/** @public used in web/app/virtual.d.ts, which knip does not read */
export type SiteData = Site
