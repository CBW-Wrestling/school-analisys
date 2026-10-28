import { History } from 'lucide-react'
import { useState } from 'react'
import { useApiRows } from '../lib/api'
import { useProfileLabels, versionFields } from '../lib/evolution'
import { PHYSICAL_ENABLED } from '../lib/features'
import type { AssessmentVersion, EnumOption } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'

const KIND_LABEL: Record<AssessmentVersion['kind'], string> = { PROFILE: 'Perfil social', PHYSICAL: 'Físico', MOTOR: 'Técnica motora' }

const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

function VersionList({ entryId }: { entryId: string }) {
  const { rows, loading, error } = useApiRows<AssessmentVersion>(`/api/entries/${encodeURIComponent(entryId)}/assessment-versions`)
  const profileLabels = useProfileLabels()
  const { rows: motorResults } = useApiRows<EnumOption>('/api/enums/motor-results')
  const { rows: movements } = useApiRows<EnumOption>('/api/enums/motor-movements')

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>
  if (error) return <p className="text-sm text-muted-foreground">Não foi possível carregar as versões.</p>

  // A versão física continua guardada; só não aparece enquanto a análise física estiver escondida.
  const visible = rows.filter((version) => PHYSICAL_ENABLED || version.kind !== 'PHYSICAL')
  const hidden = rows.length - visible.length
  const hiddenNote = hidden > 0 && (
    <p className="text-sm text-muted-foreground">
      {hidden} {hidden === 1 ? 'versão do físico fica guardada' : 'versões do físico ficam guardadas'}, mas não aparece enquanto a análise física estiver escondida.
    </p>
  )
  if (visible.length === 0) return hiddenNote || <p className="text-sm text-muted-foreground">Nenhuma versão anterior.</p>

  return (
    <div className="flex flex-col gap-3">
      {hiddenNote}
      <ol className="flex flex-col gap-3">
        {visible.map((version, index) => (
          <li key={`${version.replacedAt}-${index}`} className="flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{KIND_LABEL[version.kind]}</span>
              <Badge variant="outline">{version.operation === 'DELETE' ? 'removida' : 'substituída'}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {version.operation === 'DELETE' ? 'Removida' : 'Substituída'} em {dateTime.format(new Date(version.replacedAt))}
              {version.changedBy ? ` por ${version.changedBy}` : ''}
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {versionFields(version.kind, version.data, { ...profileLabels, motorResults, movements }).map((field) => (
                <div key={field.label} className="contents">
                  <dt className="text-muted-foreground">{field.label}</dt>
                  <dd>{field.value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function AssessmentVersionsSheet({ entryId, count, competition }: { entryId: string; count: number; competition: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
          <History data-icon="inline-start" />
          {count} {count === 1 ? 'versão anterior' : 'versões anteriores'}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <SheetHeader>
          <SheetTitle>Versões anteriores</SheetTitle>
          <SheetDescription>{competition}: avaliações substituídas por uma reavaliação nesta competição, da mais recente para a mais antiga.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">{open && <VersionList entryId={entryId} />}</div>
      </SheetContent>
    </Sheet>
  )
}
