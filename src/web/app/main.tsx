import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
// Applies the saved theme before the first render.
import "@/web/features/theme/model"

import { App } from "./app"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
