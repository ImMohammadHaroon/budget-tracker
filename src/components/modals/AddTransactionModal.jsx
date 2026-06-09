import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import LiquidBlob from '../ui/LiquidBlob'
import { supabase, ensureUserProfile } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { invalidateQueries } from '../../lib/invalidate'

const defaultForm = () => ({
  amount: '',
  description: '',
  type: 'expense',
  date: format(new Date(), 'yyyy-MM-dd'),
})

function Ripple({ x, y, color = 'rgba(255,255,255,0.08)' }) {
  return (
    <motion.span
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: 24,
        height: 24,
        marginLeft: -12,
        marginTop: -12,
        background: color,
      }}
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  )
}

export default function AddTransactionModal({ open, onClose, onOpen }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [fabRipples, setFabRipples] = useState([])
  const [submitRipples, setSubmitRipples] = useState([])

  const resetForm = useCallback(() => setForm(defaultForm()), [])

  const handleFabClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setFabRipples((prev) => [...prev, { id, x, y }])

    const openModal = () => {
      setFabRipples((prev) => prev.filter((r) => r.id !== id))
      onOpen?.()
    }

    setTimeout(openModal, 600)
  }

  const handleSubmit = async (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setSubmitRipples((prev) => [...prev, { id, x, y }])

    if (!form.amount || !form.description) {
      toast.error('Please fill in amount and description')
      return
    }

    if (!user) {
      toast.error('Not authenticated')
      return
    }

    setLoading(true)

    const { error: profileError } = await ensureUserProfile(user)
    if (profileError) {
      setLoading(false)
      toast.error('Could not set up your profile. Run supabase/fix-profiles.sql in the Supabase SQL Editor.')
      return
    }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: form.type,
      amount: Number(form.amount),
      description: form.description,
      category_id: null,
      date: form.date,
    })

    setLoading(false)
    setSubmitRipples((prev) => prev.filter((r) => r.id !== id))

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Transaction saved!')
    resetForm()
    invalidateQueries()
    onClose?.()
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={handleFabClick}
        whileHover={{ background: '#2A2A2A', borderColor: 'rgba(255,255,255,0.20)' }}
        transition={{ duration: 0.2 }}
        className="hidden lg:flex lg:fixed lg:bottom-8 lg:right-8 lg:z-50 h-14 w-14 items-center justify-center overflow-hidden rounded-full text-white"
        style={{
          background: '#222222',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
        aria-label="Add transaction"
      >
        {fabRipples.map((ripple) => (
          <Ripple key={ripple.id} x={ripple.x} y={ripple.y} />
        ))}
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.85)' }}
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative z-10 w-full max-w-[480px] rounded-3xl p-6 overflow-hidden"
              style={{
                background: 'rgba(20,20,20,0.95)',
                backdropFilter: 'blur(28px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <LiquidBlob color="#222222" size={200} top="-40px" right="-40px" opacity={0.5} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-clash text-xl text-white">Add Transaction</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-[#606060] hover:text-white hover:bg-white/5 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative flex rounded-xl p-1" style={{ background: '#1E1E1E' }}>
                    {['expense', 'income'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, type })}
                        className="relative flex-1 py-2.5 rounded-xl text-sm font-medium z-10"
                      >
                        {form.type === type && (
                          <motion.div
                            layoutId="typeIndicator"
                            className="absolute inset-0 rounded-xl"
                            style={{
                              background: '#2A2A2A',
                              border: '1px solid rgba(255,255,255,0.15)',
                            }}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <span
                          className={`relative z-10 capitalize ${
                            form.type === type ? 'text-white' : 'text-[#606060]'
                          }`}
                        >
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full text-center text-5xl font-clash text-white bg-transparent border-b outline-none transition-colors py-2 placeholder:text-[#404040]"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.10)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderBottomColor = 'rgba(255,255,255,0.35)'
                      e.target.style.boxShadow = '0 4px 0 rgba(255,255,255,0.08)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderBottomColor = 'rgba(255,255,255,0.10)'
                      e.target.style.boxShadow = 'none'
                    }}
                    min="0"
                    step="0.01"
                  />

                  <input
                    type="text"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-[#1E1E1E] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-[#404040] focus:border-white/20 outline-none transition-colors"
                  />

                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-[#1E1E1E] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:border-white/20 outline-none transition-colors [color-scheme:dark]"
                  />

                  <motion.button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ background: '#E0E0E0' }}
                    className="relative w-full h-14 rounded-2xl overflow-hidden font-semibold text-[#0D0D0D] disabled:opacity-50"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, #FFFFFF, #A0A0A0, #FFFFFF)',
                      backgroundSize: '200% 200%',
                      animation: 'liquidFlow 3s ease infinite',
                    }}
                  >
                    {submitRipples.map((ripple) => (
                      <Ripple
                        key={ripple.id}
                        x={ripple.x}
                        y={ripple.y}
                        color="rgba(0,0,0,0.15)"
                      />
                    ))}
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#0D0D0D]/30 border-t-[#0D0D0D] rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      'Save Transaction'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
