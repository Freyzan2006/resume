import type { ComponentType } from "react"

import type { Download, Locale } from "@core/types"

/** A preview only draws its file; the dialog frames it and shows load errors. */
export type PreviewProps = { download: Download }

/** An extra button of a format in the dialog footer: copy, open in a tab, … */
export type ActionProps = { download: Download; labels: Locale["labels"] }

export type Preview = {
  Content: ComponentType<PreviewProps>
  Action?: ComponentType<ActionProps>
}
