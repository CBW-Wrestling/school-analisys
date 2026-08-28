import { ArrowLeft, Brain, Dumbbell, Info, Medal, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useApiData } from '../lib/api'
import type { AthleteDetail, AthleteDetailItem } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  entryId: string
  onBack: () => void
}

// Ícones conhecidos que o backend pode enviar por seção; qualquer valor não
// mapeado cai no ícone neutro (Info) em vez de quebrar a renderização.
const SECTION_ICONS: Record<string, LucideIcon> = {
  medal: Medal,
  user: User,
  dumbbell: Dumbbell,
  brain: Brain,
}

function iconFor(icon: string): LucideIcon {
  return SECTION_ICONS[icon] ?? Info
}

function DetailRow({ item }: { item: AthleteDetailItem }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b py-1.5 last:border-b-0">
      <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">
        {item.value || <span className="font-normal text-muted-foreground">—</span>}
      </dd>
    </div>
  )
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</span>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <dl>{children}</dl>
      </CardContent>
    </Card>
  )
}

export function AthleteDetailPage({ entryId, onBack }: Props) {
  const { data: d, loading, error } = useApiData<AthleteDetail>(`/api/athletes/entries/${entryId}`)

  if (loading) return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-16 text-center text-sm text-muted-foreground md:px-6">Carregando dados do atleta…</div>
  )

  if (error) return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-16 text-center md:px-6">
      <p className="mb-4 text-sm text-muted-foreground">Erro ao carregar dados: {error}</p>
      <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> Voltar</Button>
    </div>
  )

  if (!d) return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-16 text-center md:px-6">
      <p className="mb-4 text-sm text-muted-foreground">Atleta não encontrado.</p>
      <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> Voltar</Button>
    </div>
  )

  return (
    <div className="@container/main">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-6">
        <Button variant="outline" size="sm" className="mb-6" onClick={onBack}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" /> Resultados
        </Button>

        <div className="mb-7 flex flex-col items-start justify-between gap-4 border-b pb-6 @xl/main:flex-row @xl/main:items-center">
          <div>
            <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground">{d.competitionName}</p>
            <h1 className="text-3xl leading-none tracking-tight text-foreground">{d.athleteName}</h1>
            {d.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
            )}
          </div>
          {d.rank != null && (
            <div className="flex shrink-0 flex-col items-center gap-1 rounded-lg border bg-card px-5 py-3.5">
              <Medal className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="font-mono text-lg font-bold text-foreground">{d.rank}º lugar</span>
            </div>
          )}
        </div>

        {d.sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma informação adicional disponível.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 @xl/main:grid-cols-2">
            {d.sections.map((section) => {
              const Icon = iconFor(section.icon)
              return (
                <DetailSection key={section.code} icon={<Icon className="size-4" aria-hidden="true" />} title={section.title}>
                  {section.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum dado registrado.</p>
                  ) : (
                    section.items.map((item) => <DetailRow key={item.code} item={item} />)
                  )}
                </DetailSection>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
