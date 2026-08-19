import "./App.css"
import { details } from "./constants"
import { CollectionHome } from "./pages/CollectionHome"
import { CollectionPage } from "./pages/CollectionPage"
import { DashboardPage } from "./pages/DashboardPage"
import { ExplorerPage } from "./pages/ExplorerPage"
import { MotorPage } from "./pages/MotorPage"
import { PhysicalPage } from "./pages/PhysicalPage"
import { ProfilesPage } from "./pages/ProfilesPage"
import { ResultsPage } from "./pages/ResultsPage"
import type { FormKind } from "./types"

function App() {
  const requestedForm = new URLSearchParams(window.location.search).get("form")
  const requestedView = new URLSearchParams(window.location.search).get("view")
  if (requestedForm && requestedForm in details) return <CollectionPage initialKind={requestedForm as FormKind} />
  if (requestedView === "explorer") return <ExplorerPage />
  if (requestedView === "results") return <ResultsPage />
  if (requestedView === "profiles") return <ProfilesPage />
  if (requestedView === "physical") return <PhysicalPage />
  if (requestedView === "motor") return <MotorPage />
  if (requestedView === "collection") return <CollectionHome />
  return <DashboardPage />
}

export default App
