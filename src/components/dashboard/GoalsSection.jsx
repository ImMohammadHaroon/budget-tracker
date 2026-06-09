import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import GlassCard from '../ui/GlassCard'
import { supabase, formatCurrency } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useInvalidate } from '../../hooks/useInvalidate'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function LiquidWaves() {
  const wavePath = 'M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z'

  return (
    <div className="absolute top-0 left-0 w-full -translate-y-[calc(100%-4px)] pointer-events-none">
      <div className="relative h-4 overflow-hidden">
        <div className="flex w-[200%] animate-wave">
          {[0, 1].map((i) => (
            <svg key={i} viewBox="0 0 1200 120" className="w-1/2 h-4" preserveAspectRatio="none">
              <path d={wavePath} fill="rgba(255,255,255,0.08)" />
            </svg>
          ))}
        </div>
        <div className="absolute inset-0 flex w-[200%] animate-wave" style={{ animationDelay: '1.5s' }}>
          {[0, 1].map((i) => (
            <svg key={i} viewBox="0 0 1200 120" className="w-1/2 h-4" preserveAspectRatio="none">
              <path d={wavePath} fill="rgba(255,255,255,0.08)" opacity={0.7} />
            </svg>
          ))}
        </div>
      </div>
    </div>
  )
}

function GoalCard({ goal, index }) {
  const navigate = useNavigate()
  const saved = Number(goal.saved_amount) || 0
  const target = Number(goal.target_amount) || 0
  const percentage = target > 0 ? Math.min((saved / target) * 100, 100) : 0
  const almostThere = percentage >= 90

  return (
    <motion.div variants={cardVariants} className="min-w-[240px] lg:min-w-[280px] flex-shrink-0">
      <GlassCard
        hover={false}
        animated={false}
        className="!p-0 h-[180px] overflow-hidden"
        style={
          almostThere
            ? { boxShadow: '0 0 12px rgba(255,255,255,0.10)' }
            : undefined
        }
      >
        <div className="relative h-full">
          <motion.div
            className="absolute bottom-0 left-0 right-0 overflow-hidden"
            initial={{ height: '0%' }}
            animate={{ height: `${percentage}%` }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: index * 0.2 }}
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <LiquidWaves />
          </motion.div>

          {almostThere && (
            <span
              className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 0 12px rgba(255,255,255,0.10)',
              }}
            >
              Almost There!
            </span>
          )}

          <div className="relative z-10 flex h-full flex-col justify-between p-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base text-[#808080]"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {goal.icon || '🎯'}
              </div>
              <p className="font-semibold text-white truncate">{goal.title}</p>
            </div>

            <div>
              <p className="font-clash text-3xl text-white">{Math.round(percentage)}%</p>
              <p className="text-xs text-[#606060] mt-0.5">
                {formatCurrency(saved)} of {formatCurrency(target)}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-[#404040]">
                {goal.deadline
                  ? format(parseISO(goal.deadline), 'MMM d, yyyy')
                  : 'No deadline'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/goals')}
                className="text-xs text-[#A0A0A0] hover:text-white transition-colors"
              >
                Add Funds →
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default function GoalsSection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)

    if (!error) setGoals(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  useInvalidate(fetchGoals)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Savings Goals</h3>
        <button
          type="button"
          onClick={() => navigate('/goals')}
          className="px-3 py-1.5 rounded-xl text-sm text-[#A0A0A0] transition-colors hover:text-white"
          style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
          }}
        >
          Add Goal
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-[#606060] text-sm">
          No savings goals yet. Create one to start tracking.
        </div>
      ) : (
        <motion.div
          className="flex overflow-x-auto gap-4 pb-4 scroll-smooth scrollbar-hide"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {goals.map((goal, index) => (
            <GoalCard key={goal.id} goal={goal} index={index} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
