import { useEffect, useState } from 'react'
import { LogOut, User } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { fetchCurrentUser, logout, type UserInfo } from '../lib/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const resolveUser = (request: ReturnType<typeof fetchCurrentUser>) => {
    request
      .then((u) => setUser(u))
      .catch(() => {
        setUser(null)
        setError(true)
      })
      .finally(() => setLoading(false))
  }

  const loadUser = () => {
    setLoading(true)
    setError(false)
    resolveUser(fetchCurrentUser())
  }

  useEffect(() => { resolveUser(fetchCurrentUser()) }, [])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <PageHeader active="profile">
      <div className="@container/main">
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conta</p>
            <h1 className="text-3xl leading-none tracking-tight text-foreground">Meu perfil</h1>
            <p className="text-sm text-muted-foreground">Consulte seus dados de acesso à plataforma.</p>
          </div>

          {loading ? (
            <Card>
              <CardHeader className="flex-row items-center gap-4">
                <Skeleton className="size-16 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          ) : user ? (
            <Card>
              <CardHeader className="flex-row items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={user.photoUrl ?? undefined} alt={user.name ?? user.email} />
                  <AvatarFallback><User aria-hidden="true" /></AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <CardTitle className="truncate text-lg">{user.name ?? '—'}</CardTitle>
                  <CardDescription className="truncate">{user.email}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                <dl className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm">
                  <dt className="text-muted-foreground">Login via</dt>
                  <dd className="font-medium">{user.provider === 'google' ? 'Google' : 'Email e senha'}</dd>
                </dl>

                <Button variant="outline" className="w-fit" onClick={() => void handleLogout()}>
                  <LogOut data-icon="inline-start" aria-hidden="true" />
                  Sair da conta
                </Button>
              </CardContent>
            </Card>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                <span>Não foi possível carregar os dados.</span>
                <Button variant="outline" size="sm" onClick={loadUser}>Tentar novamente</Button>
              </AlertDescription>
            </Alert>
          ) : null}
        </section>
      </div>
    </PageHeader>
  )
}
