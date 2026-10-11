import { readFile } from "node:fs/promises"
import { extname } from "node:path"

const IMAGE_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
}

export const IMAGE_EXTENSIONS = Object.keys(IMAGE_TYPES)

export function imageType(path: string): string | undefined {
  return IMAGE_TYPES[extname(path).toLowerCase()]
}

/** A local image as a data URL, for pages that cannot read the build machine's files. */
export async function imageDataUrl(path: string) {
  return `data:${imageType(path)};base64,${await readFile(path, "base64")}`
}
