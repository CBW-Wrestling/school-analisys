import { useEffect, useState } from 'react'
import type { ReactNode, ChangeEvent, KeyboardEvent } from 'react'
import { KeyRound, Mail } from 'lucide-react'
import { isAuthenticated, login, logout, refreshTokens, register } from '../lib/auth'
import './Auth.css'

export function AuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [ready, setReady] = useState(false)
  const [screen, setScreen] = useState<'login' | 'register'>('login')

  useEffect(() => {
    const check = async () => {
      if (isAuthenticated()) {
        setAuthed(true)
      } else {
        const ok = await refreshTokens()
        setAuthed(ok)
      }
      setReady(true)
    }
    void check()
  }, [])

  if (!ready) return null
  if (!authed)
    return screen === 'login'
      ? <LoginScreen onAuthenticated={() => setAuthed(true)} onRegister={() => setScreen('register')} />
      : <RegisterScreen onBack={() => setScreen('login')} onRegistered={() => setScreen('login')} />
  return <>{children}</>
}

export function SignOutButton() {
  return (
    <button className="secondary" onClick={() => { void logout().then(() => location.reload()) }}>
      Sair
    </button>
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
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const signIn = async () => {
    setBusy(true)
    setMsg(null)
    try {
      await login(email, password)
      onAuthenticated()
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Erro ao entrar.')
    } finally {
      setBusy(false)
    }
  }

  const googleUrl = `${import.meta.env.VITE_API_URL}/api/auth/google`

  return (
    <main className="login-screen">
      <section className="login-art" aria-label="Confederação Brasileira de Wrestling">
        <div className="login-ribbons" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="login-logo" aria-label="CBW Wrestling">
          <span>CBW</span>
          <strong>WRESTLING</strong>
        </div>
      </section>
      <section className="login-content" aria-labelledby="login-title">
        <form className="login-form" onSubmit={(e) => { e.preventDefault(); void signIn() }}>
          <h1 id="login-title">Sistema de Gestão de<br />Novos Atletas</h1>

          <a href={googleUrl} className="login-google">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
            </svg>
            Entrar com Google
          </a>

          <div className="login-divider"><span>ou</span></div>

          <label className="login-field">
            <span>Email <b>*</b></span>
            <div><Mail size={16} aria-hidden="true" /><input type="email" required value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="email@cbw.com" autoComplete="username" /></div>
          </label>
          <label className="login-field">
            <span>Senha <b>*</b></span>
            <div><KeyRound size={16} aria-hidden="true" /><input type="password" required value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} onKeyDown={(e: KeyboardEvent) => e.key === 'Enter' && void signIn()} placeholder="Senha" autoComplete="current-password" /></div>
          </label>

          {msg && <p className="login-error" role="alert">{msg}</p>}
          <button className="login-submit" type="submit" disabled={busy || !email || !password}>{busy ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <button className="login-register-link" type="button" onClick={onRegister}>
          Ainda não tem conta? <span>Criar conta</span>
        </button>
        <p className="login-credit">Desenvolvido por <strong>wizd</strong><small>DIGITAL</small></p>
      </section>
    </main>
  )
}

function RegisterScreen({
  onBack,
  onRegistered,
}: {
  onBack: () => void
  onRegistered: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (password !== confirm) { setMsg('As senhas não coincidem.'); return }
    setBusy(true)
    setMsg(null)
    try {
      await register(email, password, name)
      setDone(true)
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Erro ao criar conta.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <main className="login-screen">
        <section className="login-art" aria-label="Confederação Brasileira de Wrestling">
          <div className="login-ribbons" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="login-logo" aria-label="CBW Wrestling"><span>CBW</span><strong>WRESTLING</strong></div>
        </section>
        <section className="login-content">
          <div className="login-form" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 40 }}>✓</p>
            <h1>Conta criada!</h1>
            <p style={{ color: '#5e6f80', marginBottom: 28 }}>Faça login para continuar.</p>
            <button className="login-submit" onClick={onBack}>Ir para o login</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="login-screen">
      <section className="login-art" aria-label="Confederação Brasileira de Wrestling">
        <div className="login-ribbons" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="login-logo" aria-label="CBW Wrestling">
          <span>CBW</span>
          <strong>WRESTLING</strong>
        </div>
      </section>
      <section className="login-content" aria-labelledby="register-title">
        <form className="login-form" onSubmit={(e) => { e.preventDefault(); void submit() }}>
          <h1 id="register-title">Criar conta</h1>
          <label className="login-field">
            <span>Nome</span>
            <div><input type="text" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Seu nome" autoComplete="name" /></div>
          </label>
          <label className="login-field">
            <span>Email <b>*</b></span>
            <div><Mail size={16} aria-hidden="true" /><input type="email" required value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="email@cbw.com" autoComplete="username" /></div>
          </label>
          <label className="login-field">
            <span>Senha <b>*</b></span>
            <div><KeyRound size={16} aria-hidden="true" /><input type="password" required minLength={8} value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" /></div>
          </label>
          <label className="login-field">
            <span>Confirmar senha <b>*</b></span>
            <div><KeyRound size={16} aria-hidden="true" /><input type="password" required value={confirm} onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)} placeholder="Repita a senha" autoComplete="new-password" /></div>
          </label>
          {msg && <p className="login-error" role="alert">{msg}</p>}
          <button className="login-submit" type="submit" disabled={busy || !email || !password || !confirm}>{busy ? 'Criando...' : 'Criar conta'}</button>
        </form>
        <button className="login-register-link" type="button" onClick={onBack}>
          Já tem conta? <span>Entrar</span>
        </button>
        <p className="login-credit">Desenvolvido por <strong>wizd</strong><small>DIGITAL</small></p>
      </section>
    </main>
  )
}

