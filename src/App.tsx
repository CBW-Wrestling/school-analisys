import "./App.css"
import { useEffect } from "react"
import { details } from "./constants"
import { saveTokens } from "./lib/auth"
import { CollectionHome } from "./pages/CollectionHome"
import { CollectionPage } from "./pages/CollectionPage"
import { DashboardPage } from "./pages/DashboardPage"
import { DefaultPage } from "./pages/DefaultPage"
import { TechnicalAssessmentsPage } from "./pages/TechnicalAssessmentsPage"
import { CompetitionImportPage } from "./pages/CompetitionImportPage"
import { ResultsImportPage } from "./pages/ResultsImportPage"
import { ProfilePage } from "./pages/ProfilePage"
import { MotorPage } from "./pages/MotorPage"
import { PhysicalPage } from "./pages/PhysicalPage"
import { ProfilesPage } from "./pages/ProfilesPage"
import { ResultsPage } from "./pages/ResultsPage"
import { SidebarProvider } from "./components/ui/sidebar"
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

  const page = requestedForm && requestedForm in details ? <CollectionPage initialKind={requestedForm as FormKind} />
    : requestedView === "default" ? <DefaultPage />
    : requestedView === "explorer" ? <TechnicalAssessmentsPage />
    : requestedView === "results" ? <ResultsPage />
    : requestedView === "profiles" ? <ProfilesPage />
    : requestedView === "physical" ? <PhysicalPage />
    : requestedView === "motor" ? <MotorPage />
    : requestedView === "collection" ? <CollectionHome />
    : requestedView === "competition-import" ? <CompetitionImportPage />
    : requestedView === "results-import" ? <ResultsImportPage />
    : requestedView === "profile" ? <ProfilePage />
    : <DashboardPage />

  return <SidebarProvider defaultOpen>{page}</SidebarProvider>
}

export default App
