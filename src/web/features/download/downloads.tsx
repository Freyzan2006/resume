import { ChevronDown, Download as DownloadIcon, Eye } from "lucide-react"
import { useState } from "react"

import type { Download, Locale } from "@core/types"
import { Button } from "@web/ui/button"
import { ButtonGroup } from "@web/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@web/ui/dropdown-menu"

import { PreviewDialog } from "./preview-dialog"
import { hasPreview } from "./previews"

/**
 * «Download PDF» in one click: the first format of config.yaml. Next to it,
 * the preview and the other formats; a lone preview gets its own button.
 */
export function Downloads({
  downloads,
  labels,
}: {
  downloads: Download[]
  labels: Locale["labels"]
}) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<Download["format"]>()

  const [primary, ...others] = downloads
  if (!primary) {
    return null
  }

  const previewable = downloads.filter(hasPreview)
  const preview = () => {
    setFormat(hasPreview(primary) ? primary.format : previewable[0]?.format)
    setOpen(true)
  }

  const more =
    others.length > 0 ? (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="icon-sm" />}
          aria-label={labels.download}
        >
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {previewable.length > 0 && (
            <>
              <DropdownMenuItem onClick={preview}>
                <Eye />
                {labels.preview}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {others.map((item) => (
            <DropdownMenuItem
              key={item.format}
              render={<a href={item.href} download={item.filename} />}
            >
              <DownloadIcon />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      previewable.length > 0 && (
        <Button
          variant="outline"
          size="icon-sm"
          onClick={preview}
          aria-label={labels.preview}
        >
          <Eye />
        </Button>
      )
    )

  return (
    <>
      <ButtonGroup>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<a href={primary.href} download={primary.filename} />}
        >
          <DownloadIcon data-icon="inline-start" />
          {labels.download} {primary.label}
        </Button>
        {more}
      </ButtonGroup>
      <PreviewDialog
        downloads={previewable}
        format={format}
        onFormatChange={setFormat}
        labels={labels}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
