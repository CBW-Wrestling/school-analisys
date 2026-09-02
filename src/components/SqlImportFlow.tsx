import { useRef, useState, useCallback } from 'react'
import { Upload, FileCode2, CheckCircle, AlertCircle } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
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
    <section className="flex w-full max-w-[640px] flex-col gap-6 bg-background text-foreground">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl leading-none tracking-tight">{isResults ? 'Importar resultados' : 'Criar competição'}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {step === 'upload' && (
        <div>
          <div
            className={cn(
              'flex min-h-56 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            )}
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
              className="hidden"
              onChange={handleFileChange}
            />
            {selectedFile ? (
              <>
                <FileCode2 className="size-9 text-primary" aria-hidden="true" />
                <strong className="mt-2 text-sm font-semibold text-foreground">{selectedFile.name}</strong>
                <span className="text-xs text-muted-foreground">Clique para trocar o arquivo</span>
              </>
            ) : (
              <>
                <Upload className="size-9 text-primary" aria-hidden="true" />
                <strong className="mt-2 text-sm font-semibold text-foreground">
                  Arraste um arquivo .sql aqui
                </strong>
                <span className="text-xs text-muted-foreground">ou clique para selecionar do seu computador</span>
              </>
            )}
          </div>
          <Button
            className="mt-4 w-full"
            disabled={!selectedFile}
            onClick={() => selectedFile && handleUpload(selectedFile)}
          >
            Analisar arquivo
          </Button>
        </div>
      )}

      {step === 'processing' && (
        <div className="mt-10">
          <LoadingSpinner
            size="lg"
            label={importId ? 'Processando dados no banco…' : 'Analisando arquivo SQL…'}
          />
        </div>
      )}

      {step === 'select' && (
        <div>
          <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
            Selecione a competição
          </h2>
          <RadioGroup value={selected} onValueChange={setSelected} className="gap-2.5">
            {competitions.map((c) => (
              <label
                key={c.id}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3',
                  selected === c.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
                )}
              >
                <RadioGroupItem
                  value={c.id}
                  aria-label={c.name}
                />
                <span className="flex-1 text-sm font-semibold text-foreground">{c.name}</span>
                {c.date && (
                  <small className="font-mono text-xs text-muted-foreground">
                    {c.date}
                  </small>
                )}
              </label>
            ))}
          </RadioGroup>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" onClick={reset}>Voltar</Button>
            <Button
              disabled={!selected}
              onClick={handleSelectCompetition}
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <Card className="mt-10 text-center">
          <CardContent className="flex flex-col items-center gap-1 pt-6">
            <CheckCircle className="size-[52px] text-primary" aria-hidden="true" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">
              {isResults ? 'Resultados importados!' : 'Competição criada!'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isResults
                ? 'Os resultados foram gravados com sucesso no banco.'
                : 'A estrutura da competição foi criada com sucesso no banco.'}
            </p>
            <Button className="mt-6" onClick={reset}>
              Nova importação
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'error' && (
        <Alert variant="destructive" className="mt-10 flex flex-col items-center text-center">
          <AlertCircle className="size-[52px]" aria-hidden="true" />
          <AlertTitle className="mt-4 text-xl">Erro na importação</AlertTitle>
          <AlertDescription className="mx-auto mb-6 max-w-[420px]">
            {errorMsg}
          </AlertDescription>
          <Button variant="outline" onClick={reset}>Tentar novamente</Button>
        </Alert>
      )}
    </section>
  )
}
