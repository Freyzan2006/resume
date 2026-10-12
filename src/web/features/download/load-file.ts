/**
 * A loader of a downloadable file that runs once per href and page load.
 * The href is resolved against <base>, as language pages live in folders.
 */
export function fileLoader<T>(load: (url: string) => Promise<T>) {
  const cache = new Map<string, Promise<T>>()

  return (href: string) => {
    let file = cache.get(href)
    if (!file) {
      file = load(new URL(href, document.baseURI).href)
      cache.set(href, file)
    }
    return file
  }
}

export async function fetchOk(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${url}: ${response.status}`)
  }
  return response
}
