import { ArrowLeft, Medal, User, Dumbbell, Brain } from 'lucide-react'
import { useApiData } from '../lib/api'
import type { AthleteDetail, MotorItem } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  entryId: string
  onBack: () => void
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b py-1.5 last:border-b-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">
        {value ?? <span className="font-normal text-muted-foreground">—</span>}
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

function boolLabel(v: boolean | null, yes = 'Sim', no = 'Não') {
  if (v === null || v === undefined) return null
  return v ? yes : no
}

export function AthleteDetailPage({ entryId, onBack }: Props) {
  const { data: d, loading, error } = useApiData<AthleteDetail>(`/api/athletes/entries/${entryId}`)

  if (loading) return (
    <div className="mx-auto max-w-[1200px] px-7 py-16 text-center text-sm text-muted-foreground">Carregando dados do atleta…</div>
  )

  if (error) return (
    <div className="mx-auto max-w-[1200px] px-7 py-16 text-center">
      <p className="mb-4 text-sm text-muted-foreground">Erro ao carregar dados: {error}</p>
      <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> Voltar</Button>
    </div>
  )

  if (!d) return (
    <div className="mx-auto max-w-[1200px] px-7 py-16 text-center">
      <p className="mb-4 text-sm text-muted-foreground">Atleta não encontrado.</p>
      <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> Voltar</Button>
    </div>
  )

  const motorByComp = (d.motorData ?? []).reduce<Record<string, MotorItem[]>>(
    (acc, item) => { (acc[item.competency] ??= []).push(item); return acc },
    {},
  )

  return (
    <div className="@container/main">
      <div className="mx-auto max-w-[1200px] px-7 py-8">
        <Button variant="outline" size="sm" className="mb-6" onClick={onBack}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" /> Resultados
        </Button>

        <div className="mb-7 flex flex-col items-start justify-between gap-4 border-b pb-6 @xl/main:flex-row @xl/main:items-center">
          <div>
            <p className="mb-1 text-xs font-bold tracking-wide text-muted-foreground">{d.competitionName}</p>
            <h2 className="font-heading text-3xl font-semibold text-foreground">{d.athleteName}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{d.style}</Badge>
              <Badge variant="secondary">{d.gender === 'M' ? 'Masculino' : 'Feminino'}</Badge>
              <Badge variant="secondary">{d.ageCategoryCode}</Badge>
              {d.state && <Badge variant="secondary">{d.state}</Badge>}
              {d.weight > 0 && <Badge variant="secondary">{d.weight} kg</Badge>}
            </div>
          </div>
          {d.rank != null && (
            <div className="flex shrink-0 flex-col items-center gap-1 rounded-lg border bg-card px-5 py-3.5">
              <Medal className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="font-mono text-lg font-bold text-foreground">{d.rank}º lugar</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3.5 @xl/main:grid-cols-2">
          <DetailSection icon={<Medal className="size-4" aria-hidden="true" />} title="Resultado na competição">
            <DetailRow label="Colocação" value={d.rank != null ? `${d.rank}º` : null} />
            <DetailRow label="Vitórias / Derrotas" value={d.wins != null ? `${d.wins}V — ${d.losses}D` : null} />
            <DetailRow label="Lutas" value={d.countFights} />
            <DetailRow label="Pontos marcados" value={d.technicalPointsFor} />
            <DetailRow label="Pontos sofridos" value={d.technicalPointsAgainst} />
            <DetailRow label="Saldo de pontos" value={d.technicalPointsDiff != null ? (d.technicalPointsDiff >= 0 ? `+${d.technicalPointsDiff}` : d.technicalPointsDiff) : null} />
            <DetailRow label="Finalista ouro" value={boolLabel(d.isFinalistGold)} />
            <DetailRow label="Não classificado" value={boolLabel(d.isNotRanked, 'Sim', 'Não')} />
          </DetailSection>

          <DetailSection icon={<User className="size-4" aria-hidden="true" />} title="Dados sociais">
            <DetailRow label="Escola" value={d.school} />
            <DetailRow label="Tempo de prática" value={d.practiceTime} />
            <DetailRow label="Local de prática" value={d.practiceLocation} />
            {d.practiceLocationName && <DetailRow label="Nome do local" value={d.practiceLocationName} />}
            <DetailRow label="Freq. semanal" value={d.weeklyFrequency} />
            <DetailRow label="Pratica outra modalidade" value={boolLabel(d.practicesOtherSport)} />
            {d.otherSports && d.otherSports.length > 0 && <DetailRow label="Outras modalidades" value={d.otherSports.join(', ')} />}
            <DetailRow label="Iniciou na luta" value={boolLabel(d.startedInWrestling)} />
          </DetailSection>

          <DetailSection icon={<Dumbbell className="size-4" aria-hidden="true" />} title="Avaliação física">
            <DetailRow label="Estatura" value={d.heightCm != null ? `${d.heightCm} cm` : null} />
            <DetailRow label="Envergadura" value={d.armSpanCm != null ? `${d.armSpanCm} cm` : null} />
            <DetailRow label="Base" value={d.baseCm != null ? `${d.baseCm} cm` : null} />
            <DetailRow label="Antebraço D" value={d.forearmRightCm != null ? `${d.forearmRightCm} cm` : null} />
            <DetailRow label="Antebraço E" value={d.forearmLeftCm != null ? `${d.forearmLeftCm} cm` : null} />
            <DetailRow label="Prensão D" value={d.handGripRight != null ? `${d.handGripRight} kgf` : null} />
            <DetailRow label="Prensão E" value={d.handGripLeft != null ? `${d.handGripLeft} kgf` : null} />
            <DetailRow label="Placement" value={d.placement} />
          </DetailSection>

          <DetailSection icon={<Brain className="size-4" aria-hidden="true" />} title="Avaliação motora">
            {Object.keys(motorByComp).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem avaliação motora registrada.</p>
            ) : (
              Object.entries(motorByComp).map(([comp, items]) => (
                <div key={comp} className="mb-3 last:mb-0">
                  <p className="mb-1.5 text-xs font-bold tracking-wide text-muted-foreground">{comp}</p>
                  {items.map((item) => <DetailRow key={item.movement} label={item.movement} value={item.result} />)}
                </div>
              ))
            )}
          </DetailSection>
        </div>
      </div>
    </div>
  )
}
