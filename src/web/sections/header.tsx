import { Globe, Link, Mail, MapPin, Phone } from "lucide-react"
import type { ReactNode } from "react"

import type { Resume } from "@/core/resume-schema"

function Item({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1.5 [&_svg]:size-3.5 [&_svg]:text-muted-foreground">
      {icon}
      {children}
    </li>
  )
}

const linkClassName = "underline-offset-4 hover:underline"

function formatLocation(location: Resume["basics"]["location"]) {
  if (!location) {
    return undefined
  }
  const place = [location.city, location.region].filter(Boolean).join(", ")
  return place || location.countryCode
}

export function Header({ basics }: { basics: Resume["basics"] }) {
  const location = formatLocation(basics.location)

  return (
    <header className="flex items-center gap-5">
      {basics.image && (
        <img
          src={basics.image}
          alt={basics.name}
          className="size-24 shrink-0 rounded-full object-cover print:size-20"
        />
      )}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {basics.name}
          </h1>
          {basics.label && (
            <p className="text-lg text-muted-foreground">{basics.label}</p>
          )}
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          {location && <Item icon={<MapPin />}>{location}</Item>}
          {basics.email && (
            <Item icon={<Mail />}>
              <a className={linkClassName} href={`mailto:${basics.email}`}>
                {basics.email}
              </a>
            </Item>
          )}
          {basics.phone && (
            <Item icon={<Phone />}>
              <a
                className={linkClassName}
                href={`tel:${basics.phone.replace(/[^\d+]/g, "")}`}
              >
                {basics.phone}
              </a>
            </Item>
          )}
          {basics.url && (
            <Item icon={<Globe />}>
              <a className={linkClassName} href={basics.url}>
                {basics.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            </Item>
          )}
          {basics.profiles.map((profile) => (
            <Item key={profile.network} icon={<Link />}>
              {profile.url ? (
                <a className={linkClassName} href={profile.url}>
                  {profile.network}
                </a>
              ) : (
                `${profile.network}: ${profile.username ?? ""}`
              )}
            </Item>
          ))}
        </ul>
      </div>
    </header>
  )
}
