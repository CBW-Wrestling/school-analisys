import { PageHeader } from '../components/PageHeader'
import { SqlImportFlow } from '../components/SqlImportFlow'

export function ResultsImportPage() {
  return (
    <PageHeader
      active="results-import"
      breadcrumb={[{ label: 'Coleta', href: '?view=collection' }, { label: 'Importar resultados' }]}
    >
      <div className="mx-auto w-full max-w-[1400px] p-4 md:p-6">
        <SqlImportFlow importType="results" />
      </div>
    </PageHeader>
  )
}
