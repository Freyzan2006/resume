import type { ReactNode } from "react"

import { Markdown } from "@/components/resume/section"
import { Badge } from "@/components/ui/badge"
import { formatPeriod } from "@/lib/period"
import type { Period } from "@/resume/schema"

export function TimelineItem({
  title,
  subtitle,
  period,
  tags = [],
  description,
}: {
  title: ReactNode
  subtitle?: ReactNode
  period: Period
  tags?: string[]
  description?: string
}) {
  return (
    <article className="flex break-inside-avoid flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
          {formatPeriod(period, document.documentElement.lang)}
        </span>
      </div>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      {description && <Markdown html={description} />}
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary">{tag}</Badge>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
