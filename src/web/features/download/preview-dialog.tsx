import { Download as DownloadIcon } from "lucide-react"
import { Component, type ReactNode, Suspense, useRef } from "react"

import type { Download, Locale } from "@core/types"
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
        <DialogContent className="sm:max-w-2xl" initialFocus={downloadRef}>
          <DialogHeader>
            <DialogTitle>{labels.preview}</DialogTitle>
            <DialogDescription className="font-mono">
              {current.filename}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={current.format}
            onValueChange={(value: Download["format"]) => onFormatChange(value)}
          >
            {downloads.length > 1 && (
              <TabsList>
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
                  <TabsContent key={item.format} value={item.format}>
                    <LoadErrorBoundary
                      fallback={
                        <Text variant="copy" className="text-destructive">
                          {labels.loadError}
                        </Text>
                      }
                    >
                      <Suspense fallback={<Skeleton className="h-[60vh]" />}>
                        <div className="h-[60vh] overflow-auto bg-muted p-4">
                          <Preview download={item} />
                        </div>
                      </Suspense>
                    </LoadErrorBoundary>
                  </TabsContent>
                )
              )
            })}
          </Tabs>

          <DialogFooter>
            {Action && (
              <div className="sm:mr-auto">
                <Action download={current} labels={labels} />
              </div>
            )}
            <DialogClose render={<Button variant="outline" />}>
              {labels.close}
            </DialogClose>
            <a
              ref={downloadRef}
              className={buttonVariants()}
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
