import { createCn } from "cn/config"

/** Typography roles: `text-<role>` utilities from the tokens in index.css. */
export const textRoles = [
  "display",
  "lead",
  "heading",
  "title",
  "copy",
  "annotation",
  "label",
] as const

export type TextRole = (typeof textRoles)[number]

/**
 * `cn` that knows `text-<role>` sets the font size. The stock one takes it for
 * a colour and drops it next to `text-muted-foreground`.
 */
export const cn = createCn({
  extend: { classGroups: { "font-size": [{ text: [...textRoles] }] } },
})
