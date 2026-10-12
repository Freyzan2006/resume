import { Check, Copy } from "lucide-react"
import { type ComponentType, use, useEffect, useState } from "react"

import { type JsonTokenType, jsonTokens } from "@core/highlight/json"
import {
  type MarkdownTokenType,
  markdownTokens,
} from "@core/highlight/markdown"
import type { Token } from "@core/highlight/tokens"
import { Button } from "@web/ui/button"
import { Text } from "@web/ui/typography"

import { loadText } from "./load-file"
import type { ActionProps, PreviewProps } from "./types"

const COPIED_FOR_MS = 2000

/** A preview of a text file, exactly as it downloads, with highlighting. */
function textPreview<T extends string>(
  tokenize: (text: string) => Token<T>[],
  classes: Record<T, string>
): ComponentType<PreviewProps> {
  return function TextPreview({ download }) {
    const tokens = tokenize(use(loadText(download.href)))

    return (
      <Text
        variant="annotation"
        render={<pre />}
        className="wrap-anywhere whitespace-pre-wrap"
      >
        <code>
          {tokens.map((token, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a static list, never reordered
            <span key={index} className={classes[token.type]}>
              {token.text}
            </span>
          ))}
        </code>
      </Text>
    )
  }
}

const accent = "text-chart-4 dark:text-chart-2"
const value = "text-chart-5 dark:text-chart-1"

export const JsonPreview = textPreview<JsonTokenType>(jsonTokens, {
  key: "text-foreground",
  string: accent,
  number: value,
  literal: value,
  plain: "text-muted-foreground",
})

export const MarkdownPreview = textPreview<MarkdownTokenType>(markdownTokens, {
  heading: "font-bold text-foreground",
  marker: accent,
  strong: "font-bold text-foreground",
  emphasis: "italic",
  code: value,
  link: "text-foreground underline underline-offset-2",
  url: "text-muted-foreground",
  plain: "text-foreground",
})

/** Copies a text file: JSON and Markdown are more often pasted than saved. */
export function CopyText({ download, labels }: ActionProps) {
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
