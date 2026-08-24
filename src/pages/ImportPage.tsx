import { useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner } from '../components/LoadingSpinner'
import {
  type CompetitionOption,
  getImportStatus,
  selectCompetition,
  uploadImport,
} from '../lib/importApi'

type Step = 'upload' | 'select' | 'processing' | 'done' | 'error'

export function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('upload')
  const [importId, setImportId] = useState<string | null>(null)
  const [competitions, setCompetitions] = useState<CompetitionOption[]>([])
  const [selected, setSelected] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    try {
      setStep('processing')
      const result = await uploadImport(file)
      setImportId(result.importId)
      setCompetitions(result.competitions)
      setStep('select')
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro no upload')
      setStep('error')
    }
  }

  async function handleSelectCompetition() {
    if (!importId || !selected) return
    try {
      setStep('processing')
      await selectCompetition(importId, selected)
      // Polling até COMPLETED ou FAILED
      let tries = 0
      const poll = async () => {
        const status = await getImportStatus(importId)
        if (status.status === 'COMPLETED') { setStep('done'); return }
        if (status.status === 'FAILED') {
          setErrorMsg(status.errorMessage ?? 'Falha no processamento')
          setStep('error')
          return
        }
        if (++tries < 20) setTimeout(poll, 1500)
      }
      await poll()
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro no processamento')
      setStep('error')
    }
  }

  return (
    <main className="analysis-page">
      <PageHeader active="collection" />

      <section className="analysis-content" style={{ maxWidth: 540, margin: '0 auto' }}>
        <p className="eyebrow">IMPORTAÇÃO</p>
        <h1>Importar arquivo SQL</h1>

        {step === 'upload' && (
          <div className="field-grid" style={{ marginTop: 24 }}>
            <label className="login-field">
              <span>Arquivo .sql</span>
              <input ref={fileRef} type="file" accept=".sql" />
            </label>
            <button className="primary" onClick={handleUpload}>
              Enviar
            </button>
          </div>
        )}

        {step === 'processing' && (
          <LoadingSpinner size="lg" label={importId ? 'Processando dados…' : 'Analisando arquivo…'} />
        )}

        {step === 'select' && (
          <div style={{ marginTop: 24 }}>
            <h3>Selecione a competição</h3>
            <div className="field-grid" style={{ marginTop: 16 }}>
              {competitions.map((c) => (
                <label key={c.id} className="filter-check">
                  <input
                    type="radio"
                    name="competition"
                    value={c.id}
                    checked={selected === c.id}
                    onChange={() => setSelected(c.id)}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <button className="secondary" onClick={() => setStep('upload')}>Voltar</button>
              <button className="primary" disabled={!selected} onClick={handleSelectCompetition}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ marginTop: 24 }}>
            <p>✓ Importação concluída com sucesso.</p>
            <button className="primary" style={{ marginTop: 16 }} onClick={() => setStep('upload')}>
              Nova importação
            </button>
          </div>
        )}

        {step === 'error' && (
          <div style={{ marginTop: 24 }}>
            <p style={{ color: 'red' }}>Erro: {errorMsg}</p>
            <button className="secondary" style={{ marginTop: 12 }} onClick={() => { setStep('upload'); setErrorMsg(null) }}>
              Tentar novamente
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
