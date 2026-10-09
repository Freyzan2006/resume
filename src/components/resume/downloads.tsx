import { ChevronDown, Download } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Download as DownloadItem } from "@/resume/formats"

/** One button for a single format, a menu for several. */
export function Downloads({
  downloads,
  label,
}: {
  downloads: DownloadItem[]
  label: string
}) {
  if (downloads.length === 0) {
    return null
  }

  if (downloads.length === 1) {
    const [only] = downloads
    return (
      <a
        className={buttonVariants({ variant: "outline", size: "sm" })}
        href={only.href}
        download={only.filename}
      >
        <Download data-icon="inline-start" />
        {only.label}
      </a>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <Download data-icon="inline-start" />
        {label}
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {downloads.map((item) => (
          <DropdownMenuItem
            key={item.format}
            render={<a href={item.href} download={item.filename} />}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
