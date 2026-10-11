import { describe, expect, it } from "vitest"

import { personalizeHtml } from "../../src/build/html.ts"
import { siteFixture } from "../fixtures/site.ts"

const template = `<!doctype html>
<html lang="en">
  <head>
    <title>Resume</title>
    <script type="module" src="./assets/index.js"></script>
  </head>
  <body><div id="root"></div></body>
</html>`

const site = siteFixture("https://a.dev/", "ru", "en")
const [ru, en] = site.locales

describe("personalizeHtml", () => {
  it("sets the language, title and search metadata", () => {
    const html = personalizeHtml(template, site, ru)

    expect(html).toContain('<html lang="ru"')
    expect(html).toContain("<title>Ivan — Dev</title>")
    expect(html).toContain('<link rel="canonical" href="https://a.dev/">')
    expect(html).toContain('<script type="application/ld+json">{')
    expect(html).not.toContain("<base")
  })

  it("points pages in a language folder back at the site root", () => {
    const html = personalizeHtml(template, site, en)

    expect(html).toContain('<html lang="en"')
    expect(html).toContain('<link rel="canonical" href="https://a.dev/en/">')
    expect(html.indexOf('<base href="../">')).toBeLessThan(
      html.indexOf("./assets/index.js")
    )
  })

  it("escapes attribute values", () => {
    const html = personalizeHtml(template, site, { ...ru, title: '"A" & <B>' })

    expect(html).toContain("<title>&quot;A&quot; &amp; &lt;B&gt;</title>")
    expect(html).toContain('content="&quot;A&quot; &amp; &lt;B&gt;"')
  })
})
