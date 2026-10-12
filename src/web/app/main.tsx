import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
// Apply the saved theme before the first render.
import "@web/features/theme/model"

import { App } from "./app"

const root = document.getElementById("root")
if (!root) {
  throw new Error("index.html has no #root element")
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
