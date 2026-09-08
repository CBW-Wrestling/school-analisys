import { PageHeader } from '../components/PageHeader'
import { SqlImportFlow } from '../components/SqlImportFlow'

export function CompetitionImportPage() {
  return (
    <PageHeader
      active="competition-import"
      breadcrumb={[{ label: 'Operações' }, { label: 'Criar competição' }]}
    >
      <div className="mx-auto w-full max-w-[1400px] p-4 md:p-6">
        <SqlImportFlow importType="competition" />
      </div>
    </PageHeader>
  )
}
