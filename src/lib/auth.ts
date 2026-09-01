const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')

function apiUrl(path: string) {
  return `${BASE ?? ''}${path}`
}

async function request(path: string, init: RequestInit) {
  try {
    return await fetch(apiUrl(path), init)
  } catch {
    throw new Error('Não foi possível conectar ao backend. Verifique se o servidor está ativo em http://localhost:8082.')
  }
}

const KEYS = { access: 'cbw_access_token', refresh: 'cbw_refresh_token' } as const
const DEMO_SESSION_KEY = 'cbw_demo_mode'

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
  sessionStorage.removeItem(DEMO_SESSION_KEY)
}

// ── Modo demonstração ────────────────────────────────────────────────
// Bypassa o login (só em dev) sem emitir tokens reais. Endpoints protegidos
// continuam retornando 401 nesse modo — quem trata a resposta precisa saber
// disso para não tratar como sessão expirada (ver isDemoMode em api.ts).
export function isDemoMode(): boolean {
  return import.meta.env.DEV && sessionStorage.getItem(DEMO_SESSION_KEY) === 'true'
}

export function enableDemoMode() {
  sessionStorage.setItem(DEMO_SESSION_KEY, 'true')
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
  const res = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    if (res.status === 401) throw new Error(body.message ?? 'Email ou senha incorretos.')
    throw new Error(body.message ?? `O backend recusou o login (${res.status}).`)
  }
  const data = await res.json()
  if (typeof data.accessToken !== 'string' || typeof data.refreshToken !== 'string') {
    throw new Error('O backend respondeu sem os tokens de acesso esperados.')
  }
  saveTokens(data.accessToken, data.refreshToken)
  return data
}

export async function register(email: string, password: string, name?: string) {
  const res = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password, name }),
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
    await request('/api/auth/logout', {
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
    const res = await request('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) { clearTokens(); return false }
    const data = await res.json()
    if (typeof data.accessToken !== 'string' || typeof data.refreshToken !== 'string') {
      clearTokens()
      return false
    }
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
