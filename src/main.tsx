import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { subscribeToLogout } from "@/api-client/auth-events"
import { logoutSession } from "@/api-client/instance"
import { clearLegacyTokenCookies } from "@/api-client/session"
import { router } from "./router"
import "@/app/globals.css"

clearLegacyTokenCookies()

const stopAuthSync = subscribeToLogout(() => {
  void logoutSession({ broadcast: false }).finally(() => {
    window.location.replace("/login")
  })
})

if (import.meta.hot) {
  import.meta.hot.dispose(stopAuthSync)
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
