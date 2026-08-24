const BASE = import.meta.env.VITE_API_URL as string

const KEYS = { access: 'cbw_access_token', refresh: 'cbw_refresh_token' } as const

// ── Token storage ──────────────────────────────────────────────────
export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(KEYS.access, accessToken)
  localStorage.setItem(KEYS.refresh, refreshToken)
}

export function getAccessToken() { return localStorage.getItem(KEYS.access) }
export function getRefreshToken() { return localStorage.getItem(KEYS.refresh) }

export function clearTokens() {
  localStorage.removeItem(KEYS.access)
  localStorage.removeItem(KEYS.refresh)
}

// Decode JWT payload without a library
function isExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now() + 30_000 // 30 s de margem
  } catch {
    return true
  }
}

export function isAuthenticated(): boolean {
  const token = getAccessToken()
  return !!token && !isExpired(token)
}

// ── API calls ──────────────────────────────────────────────────────
export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? 'Email ou senha incorretos.')
  }
  const data = await res.json()
  saveTokens(data.accessToken, data.refreshToken)
  return data
}

export async function register(email: string, password: string, name?: string) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? 'Erro ao criar conta.')
  }
  return res.json()
}

export async function logout() {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    await fetch(`${BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAccessToken() ?? ''}` },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {}) // falha silenciosa — sempre limpa o local
  }
  clearTokens()
}

export async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    const res = await fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) { clearTokens(); return false }
    const data = await res.json()
    saveTokens(data.accessToken, data.refreshToken)
    return true
  } catch {
    clearTokens()
    return false
  }
}

// Retorna um access token válido — renova automaticamente se necessário
export async function getValidToken(): Promise<string | null> {
  const token = getAccessToken()
  if (token && !isExpired(token)) return token
  const ok = await refreshTokens()
  return ok ? getAccessToken() : null
}

export interface UserInfo {
  email: string
  name: string | null
  photoUrl: string | null
  provider: string
}

export async function fetchCurrentUser(): Promise<UserInfo | null> {
  const token = await getValidToken()
  if (!token) return null
  try {
    const res = await fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
