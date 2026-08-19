import { useEffect, useState } from 'react'
import type { ReactNode, ChangeEvent, KeyboardEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { KeyRound, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './Auth.css'

// -----------------------------------------------------------------
// AuthGate: envolve o app. Enquanto não há sessão, mostra o login.
// Uso em main.tsx ou App:  <AuthGate><App /></AuthGate>
// -----------------------------------------------------------------
export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!ready) return null
  if (!session) return <LoginScreen />
  return <>{children}</>
}

// Botão de sair — coloque no header se quiser.
export function SignOutButton() {
  return (
    <button className="secondary" onClick={() => supabase.auth.signOut()}>
      Sair
    </button>
  )
}

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const signIn = async () => {
    setBusy(true)
    setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setMsg(error.message)
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
      <section className="login-content" aria-labelledby="login-title">
        <form className="login-form" onSubmit={(event) => { event.preventDefault(); void signIn() }}>
          <h1 id="login-title">Sistema de Gestão de<br />Novos Atletas</h1>
          <label className="login-field">
            <span>Email <b>*</b></span>
            <div><Mail size={16} aria-hidden="true" /><input type="email" required value={email} onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)} placeholder="email@cbw.com" autoComplete="username" /></div>
          </label>
          <label className="login-field">
            <span>Senha <b>*</b></span>
            <div><KeyRound size={16} aria-hidden="true" /><input type="password" required value={password} onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)} onKeyDown={(event: KeyboardEvent) => event.key === 'Enter' && void signIn()} placeholder="Senha" autoComplete="current-password" /></div>
          </label>
          <label className="login-remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Manter conectado</span></label>
          {msg && <p className="login-error" role="alert">{msg}</p>}
          <button className="login-submit" type="submit" disabled={busy || !email || !password}>{busy ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <p className="login-credit">Desenvolvido por <strong>wizd</strong><small>DIGITAL</small></p>
      </section>
    </main>
  )
}