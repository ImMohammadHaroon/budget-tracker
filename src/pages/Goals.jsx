import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import { useGoals } from '../hooks/useGoals'
import { useAuth } from '../hooks/useAuth'
import { supabase, formatCurrency } from '../lib/supabase'

const GOAL_COLORS = ['#404040', '#2A2A2A', '#525252', '#606060', '#808080']

const inputClass =
  'w-full px-4 py-2.5 bg-[#1E1E1E] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-[#404040] focus:outline-none focus:border-white/20 transition-colors'

export default function Goals() {
  const { user } = useAuth()
  const { goals, loading, addFunds } = useGoals()
  const [showForm, setShowForm] = useState(false)
  const [contributeId, setContributeId] = useState(null)
  const [contributeAmount, setContributeAmount] = useState('')
  const [form, setForm] = useState({
    title: '',
    target_amount: '',
    deadline: '',
    color: GOAL_COLORS[0],
  })

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: form.title,
      target_amount: Number(form.target_amount),
      deadline: form.deadline || null,
      color: form.color,
      saved_amount: 0,
    })

    if (error) toast.error(error.message)
    else {
      toast.success('Goal created!')
      setForm({ title: '', target_amount: '', deadline: '', color: GOAL_COLORS[0] })
      setShowForm(false)
    }
  }

  const handleContribute = async (id) => {
    if (!contributeAmount) return
    const { error } = await addFunds(id, contributeAmount)
    if (error) toast.error(error.message)
    else {
      toast.success('Contribution added!')
      setContributeId(null)
      setContributeAmount('')
    }
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) toast.error(error.message)
    else toast.success('Goal deleted')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Savings Goals</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Goal'}
        </Button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCreate}
        >
          <GlassCard className="space-y-4">
            <input
              type="text"
              placeholder="Goal title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              required
            />
            <input
              type="number"
              placeholder="Target amount"
              value={form.target_amount}
              onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
              className={inputClass}
              min="0"
              required
            />
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className={inputClass}
            />
            <div className="flex gap-2">
              {GOAL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    form.color === color ? 'scale-125 ring-2 ring-white/30' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Button type="submit">Create Goal</Button>
          </GlassCard>
        </motion.form>
      )}

      {goals.length === 0 ? (
        <GlassCard>
          <p className="text-[#606060] text-center py-12">No goals yet. Create your first savings goal!</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal, i) => {
            const saved = Number(goal.saved_amount) || 0
            const target = Number(goal.target_amount)
            const percent = target > 0 ? (saved / target) * 100 : 0

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-sm text-[#808080]"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                          {goal.icon || '🎯'}
                        </span>
                        <h3 className="font-semibold text-lg text-white">{goal.title}</h3>
                      </div>
                      {goal.deadline && (
                        <p className="text-xs text-[#404040]">
                          Deadline: {format(parseISO(goal.deadline), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="!text-danger" onClick={() => handleDelete(goal.id)}>
                      ✕
                    </Button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#A0A0A0]">{formatCurrency(saved)} saved</span>
                      <span className="text-[#606060]">of {formatCurrency(target)}</span>
                    </div>
                    <ProgressBar value={saved} max={target} showLabel />
                  </div>

                  {percent >= 100 ? (
                    <p className="text-success text-sm font-medium text-center">🎉 Goal reached!</p>
                  ) : contributeId === goal.id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Amount"
                        value={contributeAmount}
                        onChange={(e) => setContributeAmount(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#1E1E1E] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
                        min="0"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleContribute(goal.id)}>Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => setContributeId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => setContributeId(goal.id)}>
                      + Contribute
                    </Button>
                  )}
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
