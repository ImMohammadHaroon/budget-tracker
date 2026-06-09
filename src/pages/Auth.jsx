import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import LiquidBlob from '../components/ui/LiquidBlob'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../lib/supabase'

function formatAuthError(error) {
  const msg = error?.message || 'Sign in failed'
  if (msg.toLowerCase().includes('email not confirmed')) {
    return 'Email not confirmed. Check your inbox for the confirmation link, or confirm the user in Supabase Dashboard → Authentication → Users.'
  }
  if (msg.toLowerCase().includes('invalid login credentials')) {
    return 'Invalid email or password. If you created the user in Supabase Dashboard, set a password under the user details.'
  }
  if (msg.toLowerCase().includes('fetch')) {
    return 'Could not reach Supabase. Check VITE_SUPABASE_URL in .env and restart the dev server.'
  }
  return msg
}

export default function Auth() {
  const navigate = useNavigate()
  const { user, loading: authLoading, signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isSupabaseConfigured) {
      toast.error('Supabase is not configured. Check your .env file and restart npm run dev.')
      return
    }

    setLoading(true)

    if (isSignUp) {
      const { data, error } = await signUp(form.email, form.password, form.fullName)
      if (error) {
        toast.error(formatAuthError(error))
      } else if (data?.session) {
        toast.success('Account created!')
        navigate('/', { replace: true })
      } else {
        toast.success('Check your email to confirm your account, then sign in.')
      }
    } else {
      const { data, error } = await signIn(form.email, form.password)
      if (error) {
        toast.error(formatAuthError(error))
      } else if (data?.session) {
        toast.success('Welcome back!')
        navigate('/', { replace: true })
      } else {
        toast.error('Sign in failed — no session returned. Your email may need confirmation.')
      }
    }

    setLoading(false)
  }

  const inputClass =
    'w-full px-4 py-3 bg-[#1E1E1E] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-[#404040] focus:outline-none focus:border-white/20 transition-colors'

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-bg">
      <LiquidBlob color="#2A2A2A" size={400} top="-128px" left="-128px" opacity={0.6} />
      <LiquidBlob color="#1E1E1E" size={350} bottom="-128px" right="-128px" delay={3} opacity={0.6} blur={90} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            💎
          </div>
          <h1 className="text-2xl font-clash font-bold text-white">BudgetFlow</h1>
          <p className="text-[#606060] text-sm mt-2">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm text-warning"
            style={{
              background: 'rgba(122,92,46,0.12)',
              border: '1px solid rgba(122,92,46,0.2)',
            }}
          >
            Supabase env vars are missing or invalid. Update <code className="text-white">.env</code> and restart the dev server.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={inputClass}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
            minLength={6}
            required
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#606060] mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#A0A0A0] hover:text-white transition-colors"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
