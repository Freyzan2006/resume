import { describe, expect, it } from "vitest"

import { builtStylesheet, cardHtml } from "@build/og-image.ts"
import type { CardContent } from "@core/seo/card.ts"

const card: CardContent = {
  lang: "en",
  name: "Ivan",
  label: "Dev",
  facts: ["Moscow", "Experience: 6 years"],
  skills: ["React", "Vite"],
  host: "a.dev",
}

const page = { stylesheet: "./assets/index.css" }

describe("cardHtml", () => {
  it("lays out the card on the site's stylesheet", () => {
    const html = cardHtml(card, { ...page, image: "data:image/png;base64,AA" })

    expect(html).toContain('href="./assets/index.css"')
    expect(html).toContain('<img class="photo" src="data:image/png;base64,AA"')
    expect(html).toContain(">Ivan</h1>")
    expect(html).toContain(">Moscow · Experience: 6 years</div>")
    expect(html).toContain("<li>React</li><li>Vite</li>")
    expect(html).toContain(">a.dev</div>")
  })

  it("leaves out what the resume does not have", () => {
    const html = cardHtml({ ...card, label: undefined, facts: [] }, page)

    expect(html).not.toContain("<img")
    expect(html).not.toContain('class="label"')
    expect(html).not.toContain('class="facts"')
  })

  it("escapes the resume's text", () => {
    expect(cardHtml({ ...card, name: "<b>Ivan</b>" }, page)).toContain(
      "&lt;b&gt;Ivan&lt;/b&gt;"
    )
  })
})

describe("builtStylesheet", () => {
  it("finds the stylesheet vite linked", () => {
    expect(
      builtStylesheet(
        '<link rel="stylesheet" crossorigin href="./assets/index-1.css">'
      )
    ).toBe("./assets/index-1.css")
  })
})
