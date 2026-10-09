import type { ReactNode } from "react"

import { Separator } from "@/components/ui/separator"

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

/** Pre-rendered markdown from assets/*.md (trusted, build-time content). */
export function Markdown({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm max-w-none text-foreground prose-zinc dark:prose-invert prose-p:my-1.5 prose-a:text-foreground prose-strong:text-foreground prose-ul:my-1.5 prose-li:my-0.5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
