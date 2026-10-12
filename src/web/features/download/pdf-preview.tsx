import { ExternalLink } from "lucide-react"
import type { PDFPageProxy } from "pdfjs-dist"
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import { use, useEffect, useRef } from "react"

import { buttonVariants } from "@web/ui/button"

import { fileLoader } from "./load-file"
import type { ActionProps, PreviewProps } from "./types"

/** pdf.js is loaded only when a PDF is previewed. */
const loadPages = fileLoader(async (url) => {
  const pdfjs = await import("pdfjs-dist")
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
  const pdf = await pdfjs.getDocument({ url }).promise
  return Promise.all(
    Array.from({ length: pdf.numPages }, (_, index) => pdf.getPage(index + 1))
  )
})

/** One page, drawn at the canvas's on-screen width and the screen's density. */
function PdfPage({ page }: { page: PDFPageProxy }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { width, height } = page.getViewport({ scale: 1 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const viewport = page.getViewport({
      scale: (canvas.clientWidth * devicePixelRatio) / width,
    })
    canvas.width = Math.round(viewport.width)
    canvas.height = Math.round(viewport.height)

    const task = page.render({ canvas, viewport })
    task.promise.catch(() => {})
    return () => task.cancel()
  }, [page, width])

  return (
    <canvas
      ref={canvasRef}
      className="w-full bg-white shadow-sm"
      style={{ aspectRatio: `${width} / ${height}` }}
    />
  )
}

/** The file's pages as they print, drawn by pdf.js. */
export function PdfPreview({ download }: PreviewProps) {
  const pages = use(loadPages(download.href))

  return (
    <div className="flex flex-col gap-4">
      {pages.map((page) => (
        <PdfPage key={page.pageNumber} page={page} />
      ))}
    </div>
  )
}

/** The browser's own viewer: search, zoom, print. */
export function OpenPdf({ download, labels }: ActionProps) {
  return (
    <a
      className={buttonVariants({ variant: "ghost" })}
      href={download.href}
      target="_blank"
      rel="noopener"
    >
      <ExternalLink data-icon="inline-start" />
      {labels.openInNewTab}
    </a>
  )
}
