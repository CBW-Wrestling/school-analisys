import { useEffect, useState } from 'react'
import { LogOut, User } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { fetchCurrentUser, logout, type UserInfo } from '../lib/auth'

export function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser().then((u) => { setUser(u); setLoading(false) })
  }, [])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <main className="analysis-page">
      <PageHeader active="profile" />
      <section className="analysis-content" style={{ maxWidth: 480, margin: '0 auto' }}>
        <p className="eyebrow">CONTA</p>
        <h1>Meu perfil</h1>

        {loading ? (
          <p style={{ color: '#5e6f80', marginTop: 24 }}>Carregando...</p>
        ) : user ? (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name ?? user.email}
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e8f5ee', display: 'grid', placeItems: 'center' }}>
                  <User size={28} color="#0c7444" />
                </div>
              )}
              <div>
                <strong style={{ display: 'block', fontSize: 18 }}>{user.name ?? '—'}</strong>
                <span style={{ color: '#5e6f80', fontSize: 14 }}>{user.email}</span>
              </div>
            </div>

            <dl style={{ display: 'grid', gap: 8, background: '#f8fafb', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <dt style={{ color: '#5e6f80', fontSize: 13 }}>Login via</dt>
                <dd style={{ fontWeight: 500, fontSize: 13 }}>
                  {user.provider === 'google' ? 'Google' : 'Email e senha'}
                </dd>
              </div>
            </dl>

            <button
              onClick={() => void handleLogout()}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: '1px solid #f87171', borderRadius: 8, background: '#fff', color: '#ef4444', fontWeight: 500, cursor: 'pointer', width: 'fit-content' }}
            >
              <LogOut size={16} />
              Sair da conta
            </button>
          </div>
        ) : (
          <p style={{ color: '#5e6f80', marginTop: 24 }}>Não foi possível carregar os dados.</p>
        )}
      </section>
    </main>
  )
}
