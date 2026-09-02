import * as XLSX from 'xlsx'
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload, UsersRound } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { SelectPairs } from '../components/Field'
import { useApiRows } from '../lib/api'
import { importReferees, type ImportedReferee, type RefereeImportResponse } from '../lib/refereeApi'
import type { CompetitionRow } from '../types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

type Step = 'upload' | 'select' | 'done'

function valueFrom(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const found = row[key]
    if (found !== undefined && found !== null && String(found).trim()) return String(found).trim()
  }
  return ''
}

async function parseRefereeFile(file: File): Promise<ImportedReferee[]> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
  return rows
    .map((row) => ({
      name: valueFrom(row, ['Nome', 'nome', 'NOME']),
      state: valueFrom(row, ['Estado (Sigla)', 'Estado', 'estado', 'UF', 'uf']).toUpperCase(),
    }))
    .filter((row) => row.name || row.state)
}

function downloadTemplate() {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([['Nome', 'Estado (Sigla)']])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Árbitros')
  XLSX.writeFile(workbook, 'modelo-arbitros.xlsx')
}

function publicUrl(accessToken: string) {
  const url = new URL(window.location.href)
  url.search = `?view=referee-assessment&token=${encodeURIComponent(accessToken)}`
  return url.toString()
}

function competitionPublicUrl(code: string) {
  const url = new URL(window.location.href)
  url.search = `?view=referee-assessment&competition=${encodeURIComponent(code)}`
  return url.toString()
}

function fileSafeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function linksText(result: RefereeImportResponse) {
  const lines = result.referees.map((referee) => `${referee.name} (${referee.state}): ${publicUrl(referee.accessToken)}`)
  return [`Competição: ${result.competition.name}`, `Link único: ${competitionPublicUrl(result.competition.code)}`, '', 'Links individuais:', ...lines].join('\n')
}

function downloadTextLinks(result: RefereeImportResponse) {
  const blob = new Blob([linksText(result)], { type: 'text/plain;charset=utf-8' })
  const anchor = document.createElement('a')
  anchor.href = URL.createObjectURL(blob)
  anchor.download = `links-arbitros-${fileSafeName(result.competition.code)}.txt`
  anchor.click()
  URL.revokeObjectURL(anchor.href)
}

function downloadSpreadsheetLinks(result: RefereeImportResponse) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(result.referees.map((referee) => ({
    Nome: referee.name,
    Estado: referee.state,
    Link: publicUrl(referee.accessToken),
  })))
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Links')
  XLSX.writeFile(workbook, `links-arbitros-${fileSafeName(result.competition.code)}.xlsx`)
}

export function RefereeImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [referees, setReferees] = useState<ImportedReferee[]>([])
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<RefereeImportResponse | null>(null)
  const { rows: competitions, loading: competitionsLoading } = useApiRows<CompetitionRow>('/api/competitions')

  const competitionOptions = competitions.map((competition) => ({ label: competition.name, value: competition.id }))

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) setSelectedFile(file)
  }, [])

  async function analyzeSelectedFile() {
    if (!selectedFile) return
    setError(null)
    try {
      const parsed = await parseRefereeFile(selectedFile)
      const invalid = parsed.find((row) => !row.name || !/^[A-Z]{2}$/.test(row.state))
      if (parsed.length === 0) throw new Error('A planilha não possui árbitros preenchidos.')
      if (invalid) throw new Error('Confira as colunas Nome e Estado (Sigla). O estado deve ter duas letras.')
      setReferees(parsed)
      setStep('select')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível ler a planilha.')
    }
  }

  async function submit() {
    if (!selectedCompetitionId) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await importReferees(selectedCompetitionId, referees)
      setResult(response)
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar árbitros.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep('upload')
    setSelectedFile(null)
    setReferees([])
    setSelectedCompetitionId('')
    setError(null)
    setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <PageHeader
      active="referee-import"
      breadcrumb={[{ label: 'Operações' }, { label: 'Cadastrar árbitros' }]}
    >
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl leading-none tracking-tight">Cadastrar árbitros</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Importe a lista de árbitros por planilha e vincule os nomes a uma competição.</p>
          </div>
          <Button type="button" variant="outline" onClick={downloadTemplate}>
            <Download data-icon="inline-start" aria-hidden="true" /> Baixar modelo limpo
          </Button>
        </div>

        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Planilha de árbitros</CardTitle>
              <CardDescription>Use um arquivo .xlsx com as colunas Nome e Estado (Sigla).</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div
                className={cn(
                  'flex min-h-56 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                  isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                )}
                onDrop={handleDrop}
                onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => event.key === 'Enter' && fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
                {selectedFile ? (
                  <>
                    <FileSpreadsheet className="size-9 text-primary" aria-hidden="true" />
                    <strong className="mt-2 text-sm font-semibold text-foreground">{selectedFile.name}</strong>
                    <span className="text-xs text-muted-foreground">Clique para trocar o arquivo</span>
                  </>
                ) : (
                  <>
                    <Upload className="size-9 text-primary" aria-hidden="true" />
                    <strong className="mt-2 text-sm font-semibold text-foreground">Arraste um arquivo .xlsx aqui</strong>
                    <span className="text-xs text-muted-foreground">ou clique para selecionar do seu computador</span>
                  </>
                )}
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" aria-hidden="true" />
                  <AlertTitle>Não foi possível ler o arquivo</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button disabled={!selectedFile} onClick={analyzeSelectedFile}>Ler planilha</Button>
            </CardContent>
          </Card>
        )}

        {step === 'select' && (
          <Card>
            <CardHeader>
              <CardTitle>Selecionar competição</CardTitle>
              <CardDescription>{referees.length} árbitro{referees.length === 1 ? '' : 's'} lido{referees.length === 1 ? '' : 's'} da planilha.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <SelectPairs
                label="Competição"
                value={selectedCompetitionId}
                placeholder={competitionsLoading ? 'Carregando competições…' : 'Selecione a competição'}
                options={competitionOptions}
                onChange={setSelectedCompetitionId}
                disabled={competitionsLoading}
              />
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referees.slice(0, 10).map((referee, index) => (
                      <TableRow key={`${referee.name}-${referee.state}-${index}`}>
                        <TableCell className="font-medium">{referee.name}</TableCell>
                        <TableCell>{referee.state}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {referees.length > 10 && <p className="text-sm text-muted-foreground">Mostrando 10 de {referees.length} árbitros.</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={reset}>Voltar</Button>
                <Button disabled={!selectedCompetitionId || submitting} onClick={submit}>
                  {submitting ? 'Cadastrando…' : 'Cadastrar árbitros'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'done' && result && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-7" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold tracking-tight">Árbitros cadastrados</h2>
                <p className="text-sm text-muted-foreground">Abra o link único nos tablets. Cada árbitro escolhe o próprio nome ao iniciar.</p>
              </div>
              <div className="flex w-full items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-left">
                <UsersRound className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <code className="min-w-0 flex-1 truncate text-xs">{competitionPublicUrl(result.competition.code)}</code>
                <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard?.writeText(competitionPublicUrl(result.competition.code))}>Copiar</Button>
              </div>
              <div className="w-full overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Árbitro</TableHead>
                      <TableHead>Link individual</TableHead>
                      <TableHead className="w-28 text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.referees.map((referee) => {
                      const link = publicUrl(referee.accessToken)
                      return (
                        <TableRow key={referee.id}>
                          <TableCell className="font-medium">{referee.name} · {referee.state}</TableCell>
                          <TableCell className="max-w-[420px] truncate font-mono text-xs text-muted-foreground">{link}</TableCell>
                          <TableCell className="text-right">
                            <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard?.writeText(link)}>Copiar</Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button type="button" onClick={() => void navigator.clipboard?.writeText(result.referees.map((referee) => `${referee.name} (${referee.state}): ${publicUrl(referee.accessToken)}`).join('\n'))}>
                  <UsersRound data-icon="inline-start" aria-hidden="true" /> Copiar todos os links
                </Button>
                <Button type="button" variant="outline" onClick={() => downloadTextLinks(result)}>
                  <Download data-icon="inline-start" aria-hidden="true" /> Baixar .txt
                </Button>
                <Button type="button" variant="outline" onClick={() => downloadSpreadsheetLinks(result)}>
                  <FileSpreadsheet data-icon="inline-start" aria-hidden="true" /> Baixar .xlsx
                </Button>
                <Button type="button" variant="outline" onClick={reset}>Cadastrar outra lista</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageHeader>
  )
}