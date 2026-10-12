import { describe, expect, it } from "vitest"

import { fillRoot } from "@build/prerender.ts"

describe("fillRoot", () => {
  it("fills the empty #root, keeping the rest of the page", () => {
    const html = `<body>
    <div id="root"></div>
  </body>`

    expect(fillRoot(html, "<main>Ivan</main>")).toBe(`<body>
    <div id="root"><main>Ivan</main></div>
  </body>`)
  })

  it("fails without #root", () => {
    expect(() => fillRoot("<body></body>", "x")).toThrow("root")
  })
})
