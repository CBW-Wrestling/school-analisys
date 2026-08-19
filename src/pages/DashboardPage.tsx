import { Activity, ArrowRight, Dumbbell, Medal, UserRound } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

function DashboardLink({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <a className="explore-card" href={href}>
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <ArrowRight size={17} />
    </a>
  )
}

export function DashboardPage() {
  return (
    <main className="dashboard-page">
      <PageHeader active="dashboard" />
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">CENTRO DE INTELIGÊNCIA CBW</p>
          <h1>Dados que fazem<br /><em>o wrestling avançar.</em></h1>
          <p>Explore resultados, desenvolvimento físico e avaliação técnica das competições escolares brasileiras.</p>
          <a className="primary" href="?view=results">Ver resultados oficiais <ArrowRight size={16} /></a>
        </div>
        <div className="event-block">
          <span>BASE ATUAL</span>
          <strong>JEBS 2024<br />JEJS 2025</strong>
          <small>5 fontes integradas</small>
        </div>
      </section>
      <section className="dashboard-content">
        <p className="eyebrow">EXPLORAR DADOS</p>
        <h2>Uma visão para cada decisão.</h2>
        <div className="explore-grid">
          <DashboardLink href="?view=results" icon={<Medal />} title="Resultados" text="Rankings, pódios, vitórias e pontos técnicos por categoria." />
          <DashboardLink href="?view=profiles" icon={<UserRound />} title="Perfil de atletas" text="Hábitos de prática e contexto de formação esportiva." />
          <DashboardLink href="?view=physical" icon={<Dumbbell />} title="Desenvolvimento físico" text="Antropometria e força por evento, estado e estilo." />
          <DashboardLink href="?view=motor" icon={<Activity />} title="Avaliação técnica" text="Domínio de movimentos fundamentais por competência." />
        </div>
      </section>
    </main>
  )
}
