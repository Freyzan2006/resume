import { use, useEffect, useRef } from "react"

import { fetchOk, fileLoader } from "./load-file"
import type { PreviewProps } from "./types"

/** docx-preview is loaded only when a DOCX is previewed. */
const loadDocx = fileLoader(async (url) => {
  const [{ renderAsync }, response] = await Promise.all([
    import("docx-preview"),
    fetchOk(url),
  ])
  return { renderAsync, data: await response.arrayBuffer() }
})

/** Scales the rendered pages to the width they are shown at. */
function fitWidth(pages: HTMLElement, width: number) {
  const page = pages.querySelector<HTMLElement>("section.docx")
  if (page) {
    pages.style.zoom = String(width / page.offsetWidth)
  }
}

/** The Word document's pages, laid out by docx-preview, scaled to fit. */
export function DocxPreview({ download }: PreviewProps) {
  const { renderAsync, data } = use(loadDocx(download.href))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }
    // Rendering is async and cannot be cancelled: draw off-screen, then swap in.
    let cancelled = false
    const pages = document.createElement("div")
    renderAsync(data, pages, undefined, { inWrapper: false }).then(() => {
      if (!cancelled) {
        // Measured first: a full-size page would widen the container.
        const width = container.clientWidth
        container.replaceChildren(pages)
        fitWidth(pages, width)
      }
    })
    return () => {
      cancelled = true
    }
  }, [renderAsync, data])

  return (
    <div
      ref={containerRef}
      className="overflow-hidden bg-white text-black shadow-sm"
    />
  )
}
