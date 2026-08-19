import { useEffect, useState } from 'react'
import type { ReactNode, ChangeEvent, KeyboardEvent, CSSProperties } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

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
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0e1116',
        color: '#e8edf2',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: 340,
          padding: 32,
          borderRadius: 16,
          background: '#161b22',
          border: '1px solid #232a33',
        }}
      >
        <p style={{ fontSize: 12, letterSpacing: 1, opacity: 0.6, margin: 0 }}>
          ACESSO INTERNO · CBW
        </p>
        <h1 style={{ fontSize: 22, margin: '6px 0 20px' }}>Entrar no painel</h1>

        <label style={{ fontSize: 13, opacity: 0.8 }}>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          style={inputStyle}
          autoComplete="username"
        />

        <label style={{ fontSize: 13, opacity: 0.8 }}>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          onKeyDown={(e: KeyboardEvent) => e.key === 'Enter' && signIn()}
          style={inputStyle}
          autoComplete="current-password"
        />

        {msg && (
          <p style={{ color: '#ff8080', fontSize: 13, marginTop: 4 }}>{msg}</p>
        )}

        <button
          onClick={signIn}
          disabled={busy || !email || !password}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '11px 0',
            borderRadius: 10,
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? 'Entrando…' : 'Entrar'}
        </button>

        <p style={{ fontSize: 12, opacity: 0.5, marginTop: 16, lineHeight: 1.5 }}>
          As contas são criadas pela administração no painel do Supabase
          (Authentication → Users). Não há cadastro público.
        </p>
      </div>
    </main>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  margin: '4px 0 14px',
  borderRadius: 10,
  border: '1px solid #2b333d',
  background: '#0e1116',
  color: '#e8edf2',
  fontSize: 14,
  boxSizing: 'border-box',
}