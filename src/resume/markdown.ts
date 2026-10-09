import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify)
  .freeze()

export function renderMarkdown(source: string): string {
  return String(processor.processSync(source)).trim()
}

/** Like renderMarkdown, but without the wrapping <p> of a single paragraph. */
export function renderInlineMarkdown(source: string): string {
  return renderMarkdown(source).replace(/^<p>([\s\S]*)<\/p>$/, "$1")
}
