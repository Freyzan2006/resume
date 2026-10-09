import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn, type TextRole } from "@/web/lib/utils"

/**
 * Text roles. Sizes, line heights and weights live in the `--text-<role>`
 * tokens of index.css (with a separate print scale); this only adds the
 * typeface and colour of each role.
 */
const textVariants = cva("", {
  variants: {
    variant: {
      /** The person's name. */
      display: "font-heading text-display",
      /** The position under the name. */
      lead: "text-lead text-muted-foreground",
      /** Section titles. */
      heading: "font-mono text-heading text-muted-foreground uppercase",
      /** Job, project, school, certificate. */
      title: "text-title",
      /** Running text. */
      copy: "text-copy",
      /** Dates, durations, places, issuers: facts about a title. */
      annotation:
        "font-mono text-annotation text-muted-foreground tabular-nums",
      /** Names of groups, e.g. in skills. */
      label: "text-label",
    } satisfies Record<TextRole, string>,
  },
})

type Variant = NonNullable<VariantProps<typeof textVariants>["variant"]>

const defaultTags = {
  display: "h1",
  lead: "p",
  heading: "h2",
  title: "h3",
  copy: "p",
  annotation: "span",
  label: "span",
} as const satisfies Record<Variant, keyof React.JSX.IntrinsicElements>

/** `<Text variant="annotation">…</Text>`; change the tag with `render`. */
function Text({
  variant,
  className,
  render,
  ...props
}: useRender.ComponentProps<"span"> & { variant: Variant }) {
  return useRender({
    defaultTagName: defaultTags[variant],
    props: mergeProps<"span">(
      { className: cn(textVariants({ variant }), className) },
      props
    ),
    render,
    state: { slot: "text", variant },
  })
}

export { Text, textVariants }
