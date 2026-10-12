import { Download as DownloadIcon } from "lucide-react"
import { Component, type ReactNode, Suspense, useRef } from "react"

import type { Download, Locale } from "@core/types"
import { cn } from "@web/lib/utils"
import { Button, buttonVariants } from "@web/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@web/ui/dialog"
import { Skeleton } from "@web/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@web/ui/tabs"
import { Text } from "@web/ui/typography"

import { previews } from "./previews"

/** Shows `fallback` once a preview fails to load its file. */
class LoadErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const frameHeight = "h-full sm:h-[60vh]"

type PreviewDialogProps = {
  /** Formats that have a preview, one tab each. */
  downloads: Download[]
  /** The shown tab; it stays while the dialog animates closed. */
  format: Download["format"] | undefined
  onFormatChange: (format: Download["format"]) => void
  labels: Locale["labels"]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreviewDialog({
  downloads,
  format,
  onFormatChange,
  labels,
  open,
  onOpenChange,
}: PreviewDialogProps) {
  const downloadRef = useRef<HTMLAnchorElement>(null)
  const current = downloads.find((item) => item.format === format)
  const Action = current && previews[current.format]?.Action

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {current && (
        // Focus on «Download», so Enter downloads the shown file.
        <DialogContent
          className={cn(
            "sm:max-w-2xl",
            // Phones: the whole screen, the preview takes what is left.
            "max-sm:translate-none max-sm:inset-0 max-sm:h-dvh max-sm:max-w-none max-sm:grid-rows-[auto_1fr_auto] max-sm:gap-4 max-sm:rounded-none max-sm:p-4 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))]"
          )}
          initialFocus={downloadRef}
        >
          <DialogHeader>
            <DialogTitle>{labels.preview}</DialogTitle>
            <DialogDescription className="font-mono">
              {current.filename}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            className="min-h-0"
            value={current.format}
            onValueChange={(value: Download["format"]) => onFormatChange(value)}
          >
            {downloads.length > 1 && (
              <TabsList className="max-w-full overflow-x-auto">
                {downloads.map((item) => (
                  <TabsTrigger key={item.format} value={item.format}>
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}
            {downloads.map((item) => {
              const Preview = previews[item.format]?.Content
              return (
                Preview && (
                  <TabsContent
                    key={item.format}
                    value={item.format}
                    className="min-h-0"
                  >
                    <LoadErrorBoundary
                      fallback={
                        <Text variant="copy" className="text-destructive">
                          {labels.loadError}
                        </Text>
                      }
                    >
                      <Suspense fallback={<Skeleton className={frameHeight} />}>
                        <div
                          className={cn(
                            frameHeight,
                            "overflow-auto bg-muted p-4"
                          )}
                        >
                          <Preview download={item} />
                        </div>
                      </Suspense>
                    </LoadErrorBoundary>
                  </TabsContent>
                )
              )
            })}
          </Tabs>

          <DialogFooter className="max-sm:flex-row max-sm:items-center">
            {Action && (
              <div className="sm:mr-auto">
                <Action download={current} labels={labels} />
              </div>
            )}
            <DialogClose
              render={<Button variant="outline" className="max-sm:hidden" />}
            >
              {labels.close}
            </DialogClose>
            <a
              ref={downloadRef}
              className={buttonVariants({ className: "max-sm:flex-1" })}
              href={current.href}
              download={current.filename}
            >
              <DownloadIcon data-icon="inline-start" />
              {labels.download}
            </a>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
