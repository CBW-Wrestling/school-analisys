import { PageHeader } from '../components/PageHeader'
import { SqlImportFlow } from '../components/SqlImportFlow'

export function CompetitionImportPage() {
  return (
    <PageHeader active="competition-import">
      <div style={{ padding: '48px 28px 58px' }}>
        <SqlImportFlow importType="competition" />
      </div>
    </PageHeader>
  )
}
