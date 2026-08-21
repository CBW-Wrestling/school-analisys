import { ArrowLeft, Medal, User, Activity, Dumbbell, Brain } from 'lucide-react'
import { useSupabaseRpc } from '../lib/data'
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
  const { rows, loading, error } = useSupabaseRpc<AthleteDetail>(
    'get_athlete_detail',
    { p_entry_id: entryId },
  )

  const d = rows[0] ?? null

  if (loading) {
    return (
      <div className="detail-loading">
        <p>Carregando dados do atleta…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="detail-error">
        <p>Erro ao carregar dados: {error}</p>
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Voltar
        </button>
      </div>
    )
  }

  if (!d) {
    return (
      <div className="detail-error">
        <p>Atleta não encontrado.</p>
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Voltar
        </button>
      </div>
    )
  }

  // Agrupa motor_data por competência
  const motorByComp = (d.motor_data ?? []).reduce<Record<string, MotorItem[]>>(
    (acc, item) => {
      ;(acc[item.competency] ??= []).push(item)
      return acc
    },
    {},
  )

  return (
    <div className="athlete-detail">
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Resultados
        </button>
      </div>

      <div className="detail-hero">
        <div>
          <p className="eyebrow">{d.competition_name}</p>
          <h2>{d.athlete_name}</h2>
          <div className="detail-tags">
            <span>{d.style}</span>
            <span>{d.gender === 'M' ? 'Masculino' : 'Feminino'}</span>
            <span>{d.age_category_code}</span>
            {d.state && <span>{d.state}</span>}
            {d.weight > 0 && <span>{d.weight} kg</span>}
          </div>
        </div>

        {d.rank != null && (
          <div className="detail-rank-badge">
            <Medal size={22} />
            <span>{d.rank}º lugar</span>
          </div>
        )}
      </div>

      <div className="detail-sections">
        {/* ── Resultado ── */}
        <DetailSection icon={<Medal size={15} />} title="Resultado na competição">
          <DetailRow label="Colocação" value={d.rank != null ? `${d.rank}º` : null} />
          <DetailRow
            label="Vitórias / Derrotas"
            value={
              d.wins != null ? `${d.wins}V — ${d.losses}D` : null
            }
          />
          <DetailRow label="Lutas" value={d.count_fights} />
          <DetailRow label="Pontos marcados" value={d.technical_points_for} />
          <DetailRow label="Pontos sofridos" value={d.technical_points_against} />
          <DetailRow
            label="Saldo de pontos"
            value={
              d.technical_points_diff != null
                ? d.technical_points_diff >= 0
                  ? `+${d.technical_points_diff}`
                  : d.technical_points_diff
                : null
            }
          />
          <DetailRow label="Finalista ouro" value={boolLabel(d.is_finalist_gold)} />
          <DetailRow
            label="Não classificado"
            value={boolLabel(d.is_not_ranked, 'Sim', 'Não')}
          />
        </DetailSection>

        {/* ── Social ── */}
        <DetailSection icon={<User size={15} />} title="Dados sociais">
          <DetailRow label="Escola" value={d.school} />
          <DetailRow label="Nascimento" value={formatDate(d.birth_date)} />
          <DetailRow label="Tempo de prática" value={d.practice_time} />
          <DetailRow label="Local de prática" value={d.practice_location} />
          {d.practice_location_name && (
            <DetailRow label="Nome do local" value={d.practice_location_name} />
          )}
          <DetailRow label="Freq. semanal" value={d.weekly_frequency} />
          <DetailRow
            label="Pratica outra modalidade"
            value={boolLabel(d.practices_other_sport)}
          />
          {d.other_sports && d.other_sports.length > 0 && (
            <DetailRow label="Outras modalidades" value={d.other_sports.join(', ')} />
          )}
          <DetailRow
            label="Iniciou na luta"
            value={boolLabel(d.started_in_wrestling)}
          />
        </DetailSection>

        {/* ── Físico ── */}
        <DetailSection icon={<Dumbbell size={15} />} title="Avaliação física">
          <DetailRow
            label="Estatura"
            value={d.height_cm != null ? `${d.height_cm} cm` : null}
          />
          <DetailRow
            label="Envergadura"
            value={d.arm_span_cm != null ? `${d.arm_span_cm} cm` : null}
          />
          <DetailRow
            label="Base"
            value={d.base_cm != null ? `${d.base_cm} cm` : null}
          />
          <DetailRow
            label="Antebraço D"
            value={d.forearm_right_cm != null ? `${d.forearm_right_cm} cm` : null}
          />
          <DetailRow
            label="Antebraço E"
            value={d.forearm_left_cm != null ? `${d.forearm_left_cm} cm` : null}
          />
          <DetailRow
            label="Prensão D"
            value={d.hand_grip_right != null ? `${d.hand_grip_right} kgf` : null}
          />
          <DetailRow
            label="Prensão E"
            value={d.hand_grip_left != null ? `${d.hand_grip_left} kgf` : null}
          />
          <DetailRow label="Placement" value={d.placement} />
        </DetailSection>

        {/* ── Motor ── */}
        <DetailSection icon={<Brain size={15} />} title="Avaliação motora">
          {Object.keys(motorByComp).length === 0 ? (
            <p className="detail-no-data">Sem avaliação motora registrada.</p>
          ) : (
            Object.entries(motorByComp).map(([comp, items]) => (
              <div key={comp} className="motor-competency">
                <p className="eyebrow motor-comp-label">{comp}</p>
                {items.map((item) => (
                  <DetailRow
                    key={item.movement}
                    label={item.movement}
                    value={item.result}
                  />
                ))}
              </div>
            ))
          )}
        </DetailSection>
      </div>
    </div>
  )
}
