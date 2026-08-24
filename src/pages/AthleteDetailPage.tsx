import { ArrowLeft, Medal, User, Dumbbell, Brain } from 'lucide-react'
import { useApiData } from '../lib/api'
import type { AthleteDetail, MotorItem } from '../types'

interface Props {
  entryId: string
  onBack: () => void
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{value ?? <span className="detail-empty-val">—</span>}</dd>
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
    <section className="detail-section">
      <header className="detail-section-header">
        <span className="detail-section-icon">{icon}</span>
        <h3>{title}</h3>
      </header>
      <dl className="detail-grid">{children}</dl>
    </section>
  )
}

function boolLabel(v: boolean | null, yes = 'Sim', no = 'Não') {
  if (v === null || v === undefined) return null
  return v ? yes : no
}

function formatDate(iso: string | null) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function AthleteDetailPage({ entryId, onBack }: Props) {
  const { data: d, loading, error } = useApiData<AthleteDetail>(`/api/athletes/entries/${entryId}`)

  if (loading) return <div className="detail-loading"><p>Carregando dados do atleta…</p></div>

  if (error) return (
    <div className="detail-error">
      <p>Erro ao carregar dados: {error}</p>
      <button className="back-btn" onClick={onBack}><ArrowLeft size={14} /> Voltar</button>
    </div>
  )

  if (!d) return (
    <div className="detail-error">
      <p>Atleta não encontrado.</p>
      <button className="back-btn" onClick={onBack}><ArrowLeft size={14} /> Voltar</button>
    </div>
  )

  const motorByComp = (d.motorData ?? []).reduce<Record<string, MotorItem[]>>(
    (acc, item) => { (acc[item.competency] ??= []).push(item); return acc },
    {},
  )

  return (
    <div className="athlete-detail">
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={14} /> Resultados</button>
      </div>

      <div className="detail-hero">
        <div>
          <p className="eyebrow">{d.competitionName}</p>
          <h2>{d.athleteName}</h2>
          <div className="detail-tags">
            <span>{d.style}</span>
            <span>{d.gender === 'M' ? 'Masculino' : 'Feminino'}</span>
            <span>{d.ageCategoryCode}</span>
            {d.state && <span>{d.state}</span>}
            {d.weight > 0 && <span>{d.weight} kg</span>}
          </div>
        </div>
        {d.rank != null && (
          <div className="detail-rank-badge"><Medal size={22} /><span>{d.rank}º lugar</span></div>
        )}
      </div>

      <div className="detail-sections">
        <DetailSection icon={<Medal size={15} />} title="Resultado na competição">
          <DetailRow label="Colocação" value={d.rank != null ? `${d.rank}º` : null} />
          <DetailRow label="Vitórias / Derrotas" value={d.wins != null ? `${d.wins}V — ${d.losses}D` : null} />
          <DetailRow label="Lutas" value={d.countFights} />
          <DetailRow label="Pontos marcados" value={d.technicalPointsFor} />
          <DetailRow label="Pontos sofridos" value={d.technicalPointsAgainst} />
          <DetailRow label="Saldo de pontos" value={d.technicalPointsDiff != null ? (d.technicalPointsDiff >= 0 ? `+${d.technicalPointsDiff}` : d.technicalPointsDiff) : null} />
          <DetailRow label="Finalista ouro" value={boolLabel(d.isFinalistGold)} />
          <DetailRow label="Não classificado" value={boolLabel(d.isNotRanked, 'Sim', 'Não')} />
        </DetailSection>

        <DetailSection icon={<User size={15} />} title="Dados sociais">
          <DetailRow label="Escola" value={d.school} />
          <DetailRow label="Nascimento" value={formatDate(d.birthDate)} />
          <DetailRow label="Tempo de prática" value={d.practiceTime} />
          <DetailRow label="Local de prática" value={d.practiceLocation} />
          {d.practiceLocationName && <DetailRow label="Nome do local" value={d.practiceLocationName} />}
          <DetailRow label="Freq. semanal" value={d.weeklyFrequency} />
          <DetailRow label="Pratica outra modalidade" value={boolLabel(d.practicesOtherSport)} />
          {d.otherSports && d.otherSports.length > 0 && <DetailRow label="Outras modalidades" value={d.otherSports.join(', ')} />}
          <DetailRow label="Iniciou na luta" value={boolLabel(d.startedInWrestling)} />
        </DetailSection>

        <DetailSection icon={<Dumbbell size={15} />} title="Avaliação física">
          <DetailRow label="Estatura" value={d.heightCm != null ? `${d.heightCm} cm` : null} />
          <DetailRow label="Envergadura" value={d.armSpanCm != null ? `${d.armSpanCm} cm` : null} />
          <DetailRow label="Base" value={d.baseCm != null ? `${d.baseCm} cm` : null} />
          <DetailRow label="Antebraço D" value={d.forearmRightCm != null ? `${d.forearmRightCm} cm` : null} />
          <DetailRow label="Antebraço E" value={d.forearmLeftCm != null ? `${d.forearmLeftCm} cm` : null} />
          <DetailRow label="Prensão D" value={d.handGripRight != null ? `${d.handGripRight} kgf` : null} />
          <DetailRow label="Prensão E" value={d.handGripLeft != null ? `${d.handGripLeft} kgf` : null} />
          <DetailRow label="Placement" value={d.placement} />
        </DetailSection>

        <DetailSection icon={<Brain size={15} />} title="Avaliação motora">
          {Object.keys(motorByComp).length === 0 ? (
            <p className="detail-no-data">Sem avaliação motora registrada.</p>
          ) : (
            Object.entries(motorByComp).map(([comp, items]) => (
              <div key={comp} className="motor-competency">
                <p className="eyebrow motor-comp-label">{comp}</p>
                {items.map((item) => <DetailRow key={item.movement} label={item.movement} value={item.result} />)}
              </div>
            ))
          )}
        </DetailSection>
      </div>
    </div>
  )
}
