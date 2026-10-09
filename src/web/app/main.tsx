import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
// Apply the saved theme and the URL's language before the first render.
import "@/web/features/theme/model"
import "@/web/features/language/model"

import { App } from "./app"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
