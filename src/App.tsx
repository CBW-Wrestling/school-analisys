import "./App.css"
import { useEffect } from "react"
import { details } from "./constants"
import { saveTokens } from "./lib/auth"
import { CollectionHome } from "./pages/CollectionHome"
import { CollectionPage } from "./pages/CollectionPage"
import { DashboardPage } from "./pages/DashboardPage"
import { ExplorerPage } from "./pages/ExplorerPage"
import { ImportPage } from "./pages/ImportPage"
import { ProfilePage } from "./pages/ProfilePage"
import { MotorPage } from "./pages/MotorPage"
import { PhysicalPage } from "./pages/PhysicalPage"
import { ProfilesPage } from "./pages/ProfilesPage"
import { ResultsPage } from "./pages/ResultsPage"
import type { FormKind } from "./types"

function App() {
  const params = new URLSearchParams(window.location.search)
  const requestedForm = params.get("form")
  const requestedView = params.get("view")

  // Recebe tokens após callback do Google OAuth
  const accessToken  = params.get("accessToken")
  const refreshToken = params.get("refreshToken")

  useEffect(() => {
    if (accessToken && refreshToken) {
      saveTokens(accessToken, refreshToken)
      window.history.replaceState({}, '', window.location.pathname)
      window.location.reload()
    }
  }, [accessToken, refreshToken])

  if (accessToken && refreshToken) return null // aguarda reload

  if (requestedForm && requestedForm in details) return <CollectionPage initialKind={requestedForm as FormKind} />
  if (requestedView === "explorer")   return <ExplorerPage />
  if (requestedView === "results")    return <ResultsPage />
  if (requestedView === "profiles")   return <ProfilesPage />
  if (requestedView === "physical")   return <PhysicalPage />
  if (requestedView === "motor")      return <MotorPage />
  if (requestedView === "collection") return <CollectionHome />
  if (requestedView === "import")     return <ImportPage />
  if (requestedView === "profile")    return <ProfilePage />
  return <DashboardPage />
}

export default App
