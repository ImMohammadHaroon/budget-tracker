import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function getStatus(spent, limit) {
  if (limit <= 0) return 'on-track'
  const ratio = spent / limit
  if (ratio >= 1) return 'over'
  if (ratio >= 0.9) return 'near'
  return 'on-track'
}

const STATUS_STYLES = {
  'on-track': {
    label: 'On Track',
    pill: {
      background: 'rgba(74,122,77,0.12)',
      border: '1px solid rgba(74,122,77,0.2)',
      color: '#4A7A4D',
    },
    bar: {
      background: 'linear-gradient(90deg, #2A2A2A, #606060, #2A2A2A)',
      backgroundSize: '200% 100%',
      animation: 'liquidFlow 3s ease infinite',
    },
  },
  near: {
    label: 'Near Limit',
    pill: {
      background: 'rgba(122,92,46,0.12)',
      border: '1px solid rgba(122,92,46,0.2)',
      color: '#7A5C2E',
    },
    bar: {
      background: 'linear-gradient(90deg, #4A3A2A, #7A5C2E)',
      backgroundSize: '200% 100%',
      animation: 'liquidFlow 3s ease infinite',
    },
  },
  over: {
    label: 'Over Budget',
    pill: {
      background: 'rgba(122,53,53,0.12)',
      border: '1px solid rgba(122,53,53,0.2)',
      color: '#7A3535',
    },
    bar: {
      background: 'linear-gradient(90deg, #4A2A2A, #7A3535)',
      animation: 'pulse 2s ease-in-out infinite',
    },
  },
}

function calcSpent(category) {
  return (category.transactions || [])
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
}

function CategoryCard({ category, index }) {
  const [hovered, setHovered] = useState(false)
  const limit = Number(category.budget_limit) || 0
  const spent = calcSpent(category)
  const status = getStatus(spent, limit)
  const styles = STATUS_STYLES[status]
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0

  return (
    <motion.div variants={itemVariants}>
      <motion.div
        whileHover={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          borderColor: 'rgba(255,255,255,0.10)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="rounded-3xl"
      >
        <GlassCard hover={false} animated={false}>
          {hovered && (
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          )}

          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg text-[#A0A0A0]"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {category.icon || '📦'}
              </div>
              <p className="text-sm font-semibold text-white truncate">{category.name}</p>
            </div>
            <span
              className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
              style={styles.pill}
            >
              {styles.label}
            </span>
          </div>

          <div className="mb-4">
            <p className="text-white font-semibold">{formatCurrency(spent)} spent</p>
            <p className="text-sm text-[#606060] mt-0.5">of {formatCurrency(limit)} budget</p>
          </div>

          <div
            className="w-full rounded-full h-2 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={styles.bar}
              initial={{ width: '0%' }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: index * 0.2 }}
            />
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

export default function CategoryCards() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCategories([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*, transactions(amount, type)')
      .eq('user_id', user.id)

    if (!error) setCategories(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useInvalidate(fetchCategories)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="glass rounded-3xl p-8 text-center text-[#606060] text-sm">
        No categories yet. Add categories to track your budgets.
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {categories.slice(0, 3).map((category, index) => (
        <CategoryCard key={category.id} category={category} index={index} />
      ))}
    </motion.div>
  )
}
