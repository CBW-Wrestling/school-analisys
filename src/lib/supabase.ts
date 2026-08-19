import { createClient } from '@supabase/supabase-js'

// IMPORTANTE: use SEMPRE a chave anon (pública) aqui — NUNCA a service_role.
// A service_role ignora RLS e daria controle total do banco a qualquer um
// que abrisse o site. Ela só pode viver no backend/scripts, nunca no front.
const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  throw new Error(
    'Faltam VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY no .env.local'
  )
}

export const supabase = createClient(url, anonKey)