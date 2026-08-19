import { ArrowRight, ClipboardList, ShieldCheck } from 'lucide-react'
import { details } from '../constants'
import { PageHeader } from '../components/PageHeader'
import type { FormKind } from '../types'

export function CollectionHome() {
  return (
    <main className="app-shell">
      <PageHeader active="collection" />
      <section className="hero" id="inicio">
        <div>
          <p className="eyebrow">CENTRO DE INTELIGÊNCIA E RESULTADOS</p>
          <h1>A informação certa para<br /><em>formar campeões.</em></h1>
          <p>Registre dados de atletas com critérios claros e transforme cada avaliação em inteligência para o wrestling brasileiro.</p>
        </div>
        <div className="hero-seal">
          <ClipboardList size={27} />
          <strong>Coleta<br />padronizada</strong>
          <span>JEBS · JEJS</span>
        </div>
      </section>
      <section className="collection" id="coleta">
        <div className="section-heading">
          <div>
            <p className="eyebrow">NOVA COLETA</p>
            <h2>O que você deseja registrar?</h2>
          </div>
          <p>Três instrumentos, uma base de dados confiável.</p>
        </div>
        <div className="form-cards">
          {(Object.keys(details) as FormKind[]).map((formKind) => {
            const item = details[formKind]
            const Icon = item.icon
            return (
              <article className={`form-card ${item.color}`} key={formKind}>
                <span className="card-icon"><Icon /></span>
                <p className="card-kicker">{formKind === 'profile' ? '01' : formKind === 'physical' ? '02' : '03'} · FORMULÁRIO</p>
                <h3>{item.label}</h3>
                <p>
                  {formKind === 'profile'
                    ? 'Histórico, contexto de prática e identificação esportiva.'
                    : formKind === 'physical'
                      ? 'Medidas antropométricas e indicadores de força.'
                      : 'Competências fundamentais por movimento avaliado.'}
                </p>
                <ul>
                  {formKind === 'profile' ? (
                    <><li>1 registro por atleta</li><li>Dados socioesportivos</li></>
                  ) : formKind === 'physical' ? (
                    <><li>1 registro por atleta</li><li>Medidas em centímetros</li></>
                  ) : (
                    <><li>12 movimentos por atleta</li><li>3 competências técnicas</li></>
                  )}
                </ul>
                <a href={`?form=${formKind}`} target="_blank" rel="noopener">Iniciar registro <ArrowRight size={16} /></a>
              </article>
            )
          })}
        </div>
      </section>
      <section className="data-note">
        <ShieldCheck size={23} />
        <div>
          <strong>Dados de menores exigem cuidado.</strong>
          <span>Use apenas os campos necessários à avaliação e respeite a base legal aplicável para coleta e tratamento.</span>
        </div>
      </section>
      <footer>Confederação Brasileira de Wrestling <span>·</span> Plataforma de inteligência esportiva</footer>
    </main>
  )
}
