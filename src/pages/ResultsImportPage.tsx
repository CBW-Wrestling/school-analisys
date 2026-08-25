import { PageHeader } from '../components/PageHeader'
import { SqlImportFlow } from '../components/SqlImportFlow'

export function ResultsImportPage() {
  return (
    <PageHeader
      active="results-import"
      breadcrumb={[{ label: 'Coleta', href: '?view=collection' }, { label: 'Importar resultados' }]}
    >
      <div className="px-7 py-12">
        <SqlImportFlow importType="results" />
      </div>
    </PageHeader>
  )
}
