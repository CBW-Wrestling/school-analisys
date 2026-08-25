import { PageHeader } from '../components/PageHeader'
import { SqlImportFlow } from '../components/SqlImportFlow'

export function CompetitionImportPage() {
  return (
    <PageHeader
      active="competition-import"
      breadcrumb={[{ label: 'Coleta', href: '?view=collection' }, { label: 'Criar competição' }]}
    >
      <div className="px-7 py-12">
        <SqlImportFlow importType="competition" />
      </div>
    </PageHeader>
  )
}
