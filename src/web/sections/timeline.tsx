import type { ReactNode } from "react"

import { Markdown } from "./section"
import { Badge } from "@/web/ui/badge"
import { Text } from "@/web/ui/typography"

export function TimelineItem({
  title,
  subtitle,
  period,
  summary,
  highlights = [],
  tags = [],
}: {
  title: ReactNode
  subtitle?: ReactNode
  /** Already formatted, see formatPeriod. */
  period?: string
  /** Rendered block markdown. */
  summary?: string
  /** Rendered inline markdown, one per bullet. */
  highlights?: string[]
  tags?: string[]
}) {
  return (
    <article className="flex break-inside-avoid flex-col gap-1.5 print:gap-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <Text variant="title">{title}</Text>
        {period && (
          <Text variant="annotation" className="ml-auto whitespace-nowrap">
            {period}
          </Text>
        )}
      </div>
      {subtitle && (
        <Text variant="annotation" render={<p />}>
          {subtitle}
        </Text>
      )}
      {summary && <Markdown html={summary} />}
      {highlights.length > 0 && (
        <Markdown
          html={`<ul>${highlights.map((item) => `<li>${item}</li>`).join("")}</ul>`}
        />
      )}
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary" className="font-mono">
                {tag}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

/** Title that links to `url` when there is one. */
export function TitleLink({
  url,
  children,
}: {
  url?: string
  children: string
}) {
  return url ? (
    <a className="underline-offset-4 hover:underline" href={url}>
      {children}
    </a>
  ) : (
    children
  )
}
