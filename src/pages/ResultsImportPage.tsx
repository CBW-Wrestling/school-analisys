import { PageHeader } from '../components/PageHeader'
import { SqlImportFlow } from '../components/SqlImportFlow'

export function ResultsImportPage() {
  return (
    <main className="analysis-page">
      <PageHeader active="results-import" />
      <div style={{ padding: '48px 28px 58px' }}>
        <SqlImportFlow importType="results" />
      </div>
    </main>
  )
}
