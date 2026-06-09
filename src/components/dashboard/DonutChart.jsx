import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell } from 'recharts'
import GlassCard from '../ui/GlassCard'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useInvalidate } from '../../hooks/useInvalidate'

const SEGMENT_GREYS = ['#404040', '#2A2A2A', '#525252', '#333333', '#606060', '#1A1A1A']

function calcSpent(category) {
  return (category.transactions || [])
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
}

export default function DonutChart() {
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

  const data = useMemo(
    () =>
      categories
        .map((cat, i) => ({
          name: cat.name,
          value: calcSpent(cat),
          color: SEGMENT_GREYS[i % SEGMENT_GREYS.length],
        }))
        .filter((d) => d.value > 0),
    [categories]
  )

  const totalSpent = data.reduce((sum, d) => sum + d.value, 0)
  const totalBudget = categories.reduce((sum, c) => sum + Number(c.budget_limit || 0), 0)
  const usedPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  const legendItems = useMemo(
    () =>
      [...data]
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map((d) => ({
          ...d,
          pct: totalSpent > 0 ? Math.round((d.value / totalSpent) * 100) : 0,
        })),
    [data, totalSpent]
  )

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <GlassCard hover={false} animated={false} className="flex items-center justify-center min-h-[320px]">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </GlassCard>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <GlassCard hover={false} animated={false} className="flex flex-col items-center">
        {data.length === 0 ? (
          <div className="flex items-center justify-center text-[#606060] text-sm py-16">
            No expense data yet
          </div>
        ) : (
          <>
            <div className="relative w-[220px] h-[220px]">
              <PieChart width={220} height={220}>
                <Pie
                  data={data}
                  cx={110}
                  cy={110}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  animationBegin={0}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  className="absolute w-20 h-20 rounded-full"
                  style={{ border: '1px solid rgba(255,255,255,0.10)' }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative z-10 text-center">
                  <p className="font-clash text-3xl font-bold text-white">{usedPct}%</p>
                  <p className="text-xs text-[#606060]">Used</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {legendItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-[#A0A0A0]"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                  <span className="text-[#606060]">{item.pct}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </GlassCard>
    </motion.div>
  )
}
