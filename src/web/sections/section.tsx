import type { ReactNode } from "react"

import type { Locale } from "@/core/site"
import { Separator } from "@/web/ui/separator"

/** Every section gets the whole language version and picks what it renders. */
export type SectionProps = { locale: Locale }

/** "a", undefined, "b" → "a · b"; nothing → undefined. */
export const joinParts = (...parts: (string | undefined)[]) =>
  parts.filter(Boolean).join(" · ") || undefined

export function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex break-inside-avoid-page flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="font-heading text-xs font-semibold tracking-widest whitespace-nowrap text-muted-foreground uppercase">
          {title}
        </h2>
        <Separator className="flex-1" />
      </div>
      {children}
    </section>
  )
}

/** Markdown rendered to HTML at build time from assets/ (trusted content). */
export function Markdown({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm max-w-none text-foreground prose-zinc dark:prose-invert prose-p:my-1.5 prose-a:text-foreground prose-strong:text-foreground prose-ul:my-1.5 prose-li:my-0.5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
