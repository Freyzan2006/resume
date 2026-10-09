import type { ReactNode } from "react"

import type { Locale } from "@/core/site"
import { Separator } from "@/web/ui/separator"
import { Text } from "@/web/ui/typography"

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
    <section className="flex break-inside-avoid-page flex-col gap-4 print:gap-2.5">
      <div className="flex items-center gap-3">
        <Text variant="heading" className="whitespace-nowrap">
          {title}
        </Text>
        <Separator className="flex-1" />
      </div>
      {children}
    </section>
  )
}

/** Markdown rendered to HTML at build time from assets/ (trusted content). */
export function Markdown({ html }: { html: string }) {
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
}
