import { useRef, useState, useCallback } from 'react'
import { Upload, FileCode2, CheckCircle, AlertCircle } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'
import {
  uploadImport,
  selectCompetition,
  getImportStatus,
  uploadResultsImport,
  selectResultsCompetition,
  getResultsImportStatus,
  type CompetitionOption,
} from '../lib/importApi'

type Step = 'upload' | 'select' | 'processing' | 'done' | 'error'

interface Props {
  importType: 'competition' | 'results'
}

export function SqlImportFlow({ importType }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('upload')
  const [importId, setImportId] = useState<string | null>(null)
  const [competitions, setCompetitions] = useState<CompetitionOption[]>([])
  const [selected, setSelected] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const isResults = importType === 'results'
  const subtitle = isResults
    ? 'Upload do dump .sql final do Arena para importar os resultados da competição.'
    : 'Upload do dump .sql inicial do Arena para criar a estrutura da competição no banco.'
  const actionLabel = isResults ? 'Importar resultados' : 'Criar competição'

  async function handleUpload(file: File) {
    try {
      setStep('processing')
      const uploadFn = isResults ? uploadResultsImport : uploadImport
      const result = await uploadFn(file)
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
      const selectFn = isResults ? selectResultsCompetition : selectCompetition
      const statusFn = isResults ? getResultsImportStatus : getImportStatus
      await selectFn(importId, selected)
      let tries = 0
      const poll = async () => {
        const status = await statusFn(importId)
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.name.toLowerCase().endsWith('.sql')) setSelectedFile(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  function reset() {
    setStep('upload')
    setImportId(null)
    setCompetitions([])
    setSelected('')
    setErrorMsg(null)
    setSelectedFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <section className="analysis-content" style={{ maxWidth: 560, margin: '0 auto' }}>
      <p className="eyebrow">IMPORTAÇÃO</p>
      <h1 style={{ margin: '0 0 8px', color: 'var(--navy)', fontSize: 30 }}>
        {isResults ? 'Importar resultados' : 'Criar competição'}
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6, margin: '0 0 32px' }}>
        {subtitle}
      </p>

      {step === 'upload' && (
        <div>
          <div
            className={`sql-dropzone${isDragging ? ' sql-dropzone--active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".sql"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {selectedFile ? (
              <>
                <FileCode2 size={36} style={{ color: 'var(--green)' }} />
                <strong style={{ color: 'var(--navy)', marginTop: 8 }}>{selectedFile.name}</strong>
                <span>Clique para trocar o arquivo</span>
              </>
            ) : (
              <>
                <Upload size={36} style={{ color: 'var(--green)' }} />
                <strong style={{ color: 'var(--navy)', marginTop: 8 }}>
                  Arraste um arquivo .sql aqui
                </strong>
                <span>ou clique para selecionar do seu computador</span>
              </>
            )}
          </div>
          <button
            className="primary"
            style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
            disabled={!selectedFile}
            onClick={() => selectedFile && handleUpload(selectedFile)}
          >
            Analisar arquivo
          </button>
        </div>
      )}

      {step === 'processing' && (
        <div style={{ marginTop: 40 }}>
          <LoadingSpinner
            size="lg"
            label={importId ? 'Processando dados no banco…' : 'Analisando arquivo SQL…'}
          />
        </div>
      )}

      {step === 'select' && (
        <div>
          <h3 style={{ margin: '0 0 16px', color: 'var(--navy)', fontSize: 17 }}>
            Selecione a competição
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {competitions.map((c) => (
              <label
                key={c.id}
                className="filter-check"
                style={{
                  padding: '12px 16px',
                  border: `1px solid ${selected === c.id ? 'var(--green)' : 'var(--line)'}`,
                  borderRadius: 7,
                  background: selected === c.id ? 'var(--mint)' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="competition"
                  value={c.id}
                  checked={selected === c.id}
                  onChange={() => setSelected(c.id)}
                />
                <span style={{ fontWeight: 700, flex: 1 }}>{c.name}</span>
                {c.date && (
                  <small style={{ color: 'var(--muted)', fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                    {c.date}
                  </small>
                )}
              </label>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button className="secondary" onClick={reset}>Voltar</button>
            <button
              className="primary"
              disabled={!selected}
              onClick={handleSelectCompetition}
            >
              {actionLabel}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <CheckCircle size={52} style={{ color: 'var(--green)' }} />
          <h3 style={{ margin: '16px 0 6px', color: 'var(--navy)', fontSize: 20 }}>
            {isResults ? 'Resultados importados!' : 'Competição criada!'}
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            {isResults
              ? 'Os resultados foram gravados com sucesso no banco.'
              : 'A estrutura da competição foi criada com sucesso no banco.'}
          </p>
          <button className="primary" style={{ marginTop: 24 }} onClick={reset}>
            Nova importação
          </button>
        </div>
      )}

      {step === 'error' && (
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <AlertCircle size={52} style={{ color: '#dc2626' }} />
          <h3 style={{ margin: '16px 0 6px', color: 'var(--navy)', fontSize: 20 }}>
            Erro na importação
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 420, margin: '0 auto 24px' }}>
            {errorMsg}
          </p>
          <button className="secondary" onClick={reset}>Tentar novamente</button>
        </div>
      )}
    </section>
  )
}
