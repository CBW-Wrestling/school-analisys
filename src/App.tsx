import "./App.css"
import { useEffect } from "react"
import { details } from "./constants"
import { saveTokens } from "./lib/auth"
import { CollectionPage } from "./pages/CollectionPage"
import { DashboardPage } from "./pages/DashboardPage"
import { DefaultPage } from "./pages/DefaultPage"
import { AnalyticsDashboardPage } from "./pages/AnalyticsDashboardPage"
import { CrmDashboardPage } from "./pages/CrmDashboardPage"
import { EcommerceDashboardPage } from "./pages/EcommerceDashboardPage"
import { FinanceDashboardPage } from "./pages/FinanceDashboardPage"
import { AcademyDashboardPage } from "./pages/AcademyDashboardPage"
import { LogisticsDashboardPage } from "./pages/LogisticsDashboardPage"
import { ProductivityDashboardPage } from "./pages/ProductivityDashboardPage"
import { PatientMonitoringDashboardPage } from "./pages/PatientMonitoringDashboardPage"
import { UsersDashboardPage } from "./pages/UsersDashboardPage"
import { TechnicalAssessmentsPage } from "./pages/TechnicalAssessmentsPage"
import { StateExecutionPage } from "./pages/StateExecutionPage"
import { CompetitionImportPage } from "./pages/CompetitionImportPage"
import { ResultsImportPage } from "./pages/ResultsImportPage"
import { RefereeImportPage } from "./pages/RefereeImportPage"
import { PublicRefereeAssessmentPage } from "./pages/PublicRefereeAssessmentPage"
import { ProfilePage } from "./pages/ProfilePage"
import { PhysicalPage } from "./pages/PhysicalPage"
import { InferencesPage } from "./pages/InferencesPage"
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
    if (requestedView === "referee-assessment") return
    if (accessToken && refreshToken) {
      saveTokens(accessToken, refreshToken)
      window.history.replaceState({}, '', window.location.pathname)
      window.location.reload()
    }
  }, [accessToken, refreshToken, requestedView])

  if (requestedView === "referee-assessment") return <PublicRefereeAssessmentPage />

  if (accessToken && refreshToken) return null // aguarda reload

  const page = requestedForm && requestedForm in details ? <CollectionPage initialKind={requestedForm as FormKind} />
    : requestedView === "default" ? <DefaultPage />
    : requestedView === "analytics" ? <AnalyticsDashboardPage />
    : requestedView === "crm" ? <CrmDashboardPage />
    : requestedView === "ecommerce" ? <EcommerceDashboardPage />
    : requestedView === "finance" ? <FinanceDashboardPage />
    : requestedView === "academy" ? <AcademyDashboardPage />
    : requestedView === "logistics" ? <LogisticsDashboardPage />
    : requestedView === "productivity" ? <ProductivityDashboardPage />
    : requestedView === "patient-monitoring" ? <PatientMonitoringDashboardPage />
    : requestedView === "users-example" ? <UsersDashboardPage />
    : requestedView === "results" ? <ResultsPage />
    : requestedView === "profiles" ? <ProfilesPage />
    : requestedView === "physical" ? <PhysicalPage />
    : requestedView === "motor" ? <TechnicalAssessmentsPage />
    : requestedView === "motor-states" ? <StateExecutionPage />
    : requestedView === "inferences" ? <InferencesPage />
    : requestedView === "competition-import" ? <CompetitionImportPage />
    : requestedView === "results-import" ? <ResultsImportPage />
    : requestedView === "referee-import" ? <RefereeImportPage />
    : requestedView === "profile" ? <ProfilePage />
    : <DashboardPage />

  return <SidebarProvider defaultOpen>{page}</SidebarProvider>
}

export default App
