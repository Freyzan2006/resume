import type { SiteData } from "../site.ts"
import { plainText } from "./text.ts"
import { publicImage } from "./urls.ts"

const isEmpty = (value: unknown) =>
  value === undefined || (Array.isArray(value) && value.length === 0)

function compact(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => !isEmpty(item))
  )
}

const unique = (values: (string | undefined)[]) => [
  ...new Set(values.filter((value): value is string => !!value)),
]

/** schema.org Person of the primary language. Contacts stay out on purpose. */
export function personJsonLd({ locales, url }: SiteData) {
  const { basics, work, education, skills, languages } = locales[0].resume
  const { location } = basics

  return compact({
    "@context": "https://schema.org",
    "@type": "Person",
    name: basics.name,
    jobTitle: basics.label,
    description: basics.summary && plainText(basics.summary),
    url: url ?? basics.url,
    image: publicImage(basics),
    sameAs: unique([
      basics.url,
      ...basics.profiles.map((profile) => profile.url),
    ]).filter((link) => link !== url),
    address:
      location &&
      compact({
        "@type": "PostalAddress",
        addressLocality: location.city,
        addressRegion: location.region,
        addressCountry: location.countryCode,
      }),
    worksFor: work
      .filter((job) => !job.endDate)
      .map((job) =>
        compact({ "@type": "Organization", name: job.name, url: job.url })
      ),
    alumniOf: education.map((school) =>
      compact({
        "@type": "EducationalOrganization",
        name: school.institution,
        url: school.url,
      })
    ),
    knowsAbout: unique(skills.flatMap((skill) => skill.keywords)),
    knowsLanguage: languages.map((item) => item.language),
  })
}

/** `<` would let the data close the <script> element early. */
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replaceAll("<", "\\u003c")
}
