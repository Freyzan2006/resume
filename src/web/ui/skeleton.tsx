import { cn } from "@web/lib/utils"

/**
 * shadcn/ui Skeleton. Its look is the `.skeleton` class of index.css, shared
 * with the static loading skeleton in index.html (shown before React runs).
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton", className)}
      {...props}
    />
  )
}

export { Skeleton }
