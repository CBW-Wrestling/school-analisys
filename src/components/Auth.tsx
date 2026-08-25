import { useEffect, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import logo from '../assets/logo.svg'
import heroImage from '../assets/hero.png'
import { isAuthenticated, login, logout, refreshTokens, register } from '../lib/auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type AuthScreen = 'login' | 'register'

export function AuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [ready, setReady] = useState(false)
  const [screen, setScreen] = useState<AuthScreen>('login')

  useEffect(() => {
    const check = async () => {
      setAuthed(isAuthenticated() || await refreshTokens())
      setReady(true)
    }
    void check()
  }, [])

  if (!ready) return null
  if (authed) return <>{children}</>

  return screen === 'login'
    ? <LoginScreen onAuthenticated={() => setAuthed(true)} onRegister={() => setScreen('register')} />
    : <RegisterScreen onBack={() => setScreen('login')} />
}

export function SignOutButton() {
  return (
    <Button variant="secondary" onClick={() => { void logout().then(() => location.reload()) }}>
      Sair
    </Button>
  )
}

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden p-0" aria-label="Acesso ao sistema">
          <CardContent className="grid p-0 md:grid-cols-2">
            {children}
            <div className="relative hidden bg-muted md:block">
              <img
                src={heroImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3]"
              />
            </div>
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          Confederação Brasileira de Wrestling · Plataforma de inteligência esportiva
        </FieldDescription>
      </div>
    </main>
  )
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
    </svg>
  )
}

function AuthHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <img className="size-10 object-contain" src={logo} alt="" />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-balance text-muted-foreground">{description}</p>
    </div>
  )
}

function AuthError({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <Alert variant="destructive">
      <AlertTitle>Não foi possível continuar</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

function LoginScreen({
  onAuthenticated,
  onRegister,
}: {
  onAuthenticated: () => void
  onRegister: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const googleUrl = `${import.meta.env.VITE_API_URL}/api/auth/google`

  const signIn = async () => {
    setBusy(true)
    setMessage(null)
    try {
      await login(email, password)
      onAuthenticated()
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Erro ao entrar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <form className="p-6 md:p-8" onSubmit={(event) => { event.preventDefault(); void signIn() }}>
        <FieldGroup>
          <AuthHeader title="Entrar na plataforma" description="Use suas credenciais para continuar." />

          <Button variant="outline" type="button" asChild>
            <a href={googleUrl}>
              <GoogleMark />
              Continuar com Google
            </a>
          </Button>

          <FieldSeparator>ou use seu e-mail</FieldSeparator>

          <Field>
            <FieldLabel htmlFor="login-email">Email</FieldLabel>
            <Input id="login-email" type="email" value={email} onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)} placeholder="nome@exemplo.com" autoComplete="username" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="login-password">Senha</FieldLabel>
            <Input id="login-password" type="password" value={password} onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)} placeholder="Sua senha" autoComplete="current-password" required />
          </Field>

          <AuthError message={message} />
          <Field>
            <Button type="submit" disabled={busy || !email || !password}>
              {busy ? 'Entrando...' : 'Entrar'}
            </Button>
          </Field>
          <FieldDescription className="text-center">
            Ainda não tem conta? <a href="#" onClick={(event) => { event.preventDefault(); onRegister() }}>Criar conta</a>
          </FieldDescription>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}

function RegisterScreen({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (password !== confirm) {
      setMessage('As senhas não coincidem.')
      return
    }

    setBusy(true)
    setMessage(null)
    try {
      await register(email, password, name)
      setDone(true)
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Erro ao criar conta.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center" role="status" aria-live="polite">
          <CheckCircle2 className="size-11" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Conta criada</h2>
          <p className="text-balance text-muted-foreground">Sua conta está pronta. Entre para acessar a plataforma.</p>
          <Button className="w-full" onClick={onBack}>Ir para o login</Button>
        </CardContent>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <form className="p-6 md:p-8" onSubmit={(event) => { event.preventDefault(); void submit() }}>
        <FieldGroup>
          <AuthHeader title="Criar uma conta" description="Preencha seus dados para solicitar acesso." />

          <Field>
            <FieldLabel htmlFor="register-name">Nome</FieldLabel>
            <Input id="register-name" value={name} onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)} placeholder="Seu nome" autoComplete="name" />
          </Field>
          <Field>
            <FieldLabel htmlFor="register-email">Email</FieldLabel>
            <Input id="register-email" type="email" value={email} onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)} placeholder="nome@exemplo.com" autoComplete="username" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="register-password">Senha</FieldLabel>
            <Input id="register-password" type="password" minLength={8} value={password} onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" autoComplete="new-password" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="register-confirm">Confirmar senha</FieldLabel>
            <Input id="register-confirm" type="password" value={confirm} onChange={(event: ChangeEvent<HTMLInputElement>) => setConfirm(event.target.value)} placeholder="Repita sua senha" autoComplete="new-password" required />
          </Field>

          <AuthError message={message} />
          <Field>
            <Button type="submit" disabled={busy || !email || !password || !confirm}>
              {busy ? 'Criando...' : 'Criar conta'}
            </Button>
          </Field>
          <FieldDescription className="text-center">
            Já tem conta? <a href="#" onClick={(event) => { event.preventDefault(); onBack() }}>Entrar</a>
          </FieldDescription>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
