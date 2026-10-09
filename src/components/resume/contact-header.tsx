import { Link, Mail, MapPin, Phone } from "lucide-react"
import type { ReactNode } from "react"

import type { Resume } from "@/resume/schema"

function Item({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1.5 [&_svg]:size-3.5 [&_svg]:text-muted-foreground">
      {icon}
      {children}
    </li>
  )
}

const linkClassName = "underline-offset-4 hover:underline"

export function ContactHeader({ contact }: { contact: Resume["contact"] }) {
  return (
    <header className="flex flex-col gap-3">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {contact.name}
        </h1>
        <p className="text-lg text-muted-foreground">{contact.title}</p>
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {contact.location && <Item icon={<MapPin />}>{contact.location}</Item>}
        {contact.email && (
          <Item icon={<Mail />}>
            <a className={linkClassName} href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </Item>
        )}
        {contact.phone && (
          <Item icon={<Phone />}>
            <a
              className={linkClassName}
              href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
            >
              {contact.phone}
            </a>
          </Item>
        )}
        {contact.links.map((link) => (
          <Item key={link.url} icon={<Link />}>
            <a className={linkClassName} href={link.url}>
              {link.label}
            </a>
          </Item>
        ))}
      </ul>
    </header>
  )
}
