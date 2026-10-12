import { Check, Copy } from "lucide-react"
import { use, useEffect, useState } from "react"

import { type JsonTokenType, jsonTokens } from "@core/json-tokens"
import { Button } from "@web/ui/button"
import { Text } from "@web/ui/typography"

import { fetchOk, fileLoader } from "./load-file"
import type { ActionProps, PreviewProps } from "./types"

const COPIED_FOR_MS = 2000

const loadText = fileLoader(async (url) => (await fetchOk(url)).text())

const tokenClasses: Record<JsonTokenType, string> = {
  key: "text-foreground",
  string: "text-chart-4 dark:text-chart-2",
  number: "text-chart-5 dark:text-chart-1",
  literal: "text-chart-5 dark:text-chart-1",
  plain: "text-muted-foreground",
}

/** The file exactly as it downloads, with syntax highlighting. */
export function JsonPreview({ download }: PreviewProps) {
  const text = use(loadText(download.href))

  return (
    <Text
      variant="annotation"
      render={<pre />}
      className="wrap-break-word whitespace-pre-wrap"
    >
      <code>
        {jsonTokens(text).map((token, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a static list, never reordered
          <span key={index} className={tokenClasses[token.type]}>
            {token.text}
          </span>
        ))}
      </code>
    </Text>
  )
}

/** Copies the file's text: developers usually paste JSON rather than save it. */
export function CopyJson({ download, labels }: ActionProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }
    const timer = setTimeout(() => setCopied(false), COPIED_FOR_MS)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(await loadText(download.href))
      setCopied(true)
    } catch {
      // No clipboard access (insecure context, denied permission): nothing to show.
    }
  }

  return (
    <Button variant="ghost" onClick={copy} aria-live="polite">
      {copied ? (
        <Check data-icon="inline-start" />
      ) : (
        <Copy data-icon="inline-start" />
      )}
      {copied ? labels.copied : labels.copy}
    </Button>
  )
}
