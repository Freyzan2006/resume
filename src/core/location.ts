import type { Resume } from "./resume-schema.ts"

/** "City, region", or the country code without them. */
export function formatLocation(location: Resume["basics"]["location"]) {
  if (!location) {
    return undefined
  }
  const place = [location.city, location.region].filter(Boolean).join(", ")
  return place || location.countryCode
}
