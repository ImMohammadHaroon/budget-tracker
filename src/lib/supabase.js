import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your_supabase') &&
  supabaseAnonKey !== 'your_supabase_anon_key'

if (!isConfigured) {
  console.error(
    'Supabase is not configured. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

export const isSupabaseConfigured = isConfigured

export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', color: '#404040', icon: '🍔' },
  { id: 'transport', label: 'Transport', color: '#2A2A2A', icon: '🚗' },
  { id: 'shopping', label: 'Shopping', color: '#525252', icon: '🛍️' },
  { id: 'entertainment', label: 'Entertainment', color: '#606060', icon: '🎬' },
  { id: 'bills', label: 'Bills & Utilities', color: '#333333', icon: '💡' },
  { id: 'health', label: 'Health', color: '#808080', icon: '🏥' },
  { id: 'income', label: 'Income', color: '#4A7A4D', icon: '💰' },
  { id: 'other', label: 'Other', color: '#1A1A1A', icon: '📦' },
]

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
}

/** Ensures a profiles row exists for the auth user (required by FK on transactions, etc.) */
export async function ensureUserProfile(user) {
  if (!user?.id) return { error: null }

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      full_name: user.user_metadata?.full_name || null,
      currency: 'PKR',
    },
    { onConflict: 'id' }
  )

  return { error }
}

const CURRENCY_LOCALE = 'en-PK'
const CURRENCY_CODE = 'PKR'

export function formatCurrency(amount) {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCurrencyCompact(amount) {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyBalance(amount) {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
