import { ArrowRight } from 'lucide-react'

export function PageHeader({ active }: { active: string }) {
  return (
    <header className="topbar">
      <a className="brand" href="/">
        <span className="brand-mark">
          <span>C</span><span>B</span><span>W</span>
        </span>
        <span>CBW <b>Dashboard</b></span>
      </a>
      <nav>
        <a className={active === 'dashboard' ? 'active' : ''} href="/">Painel</a>
        <a className={active === 'explorer' ? 'active' : ''} href="?view=explorer">Análise</a>
        <a className={active === 'results' ? 'active' : ''} href="?view=results">Resultados</a>
        <a className={active === 'profiles' ? 'active' : ''} href="?view=profiles">Atletas</a>
        <a className={active === 'physical' ? 'active' : ''} href="?view=physical">Físico</a>
        <a className={active === 'motor' ? 'active' : ''} href="?view=motor">Técnico</a>
        <a className={active === 'collection' ? 'active' : ''} href="?view=collection">Coleta</a>
      </nav>
      <a className="header-action" href="?form=profile" target="_blank" rel="noopener">
        Novo registro <ArrowRight size={16} />
      </a>
    </header>
  )
}
