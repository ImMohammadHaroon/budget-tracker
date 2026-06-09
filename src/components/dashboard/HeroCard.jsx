import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, useSpring, useMotionValueEvent } from 'framer-motion'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts'
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
  startOfDay,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns'
import GlassCard from '../ui/GlassCard'
import LiquidBlob from '../ui/LiquidBlob'
import {
  supabase,
  formatCurrencyBalance,
  formatCurrencyCompact,
} from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useInvalidate } from '../../hooks/useInvalidate'

function AnimatedBalance({ value }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  const [display, setDisplay] = useState(formatCurrencyBalance(0))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  useMotionValueEvent(spring, 'change', (latest) => {
    setDisplay(formatCurrencyBalance(latest))
  })

  return (
    <p
      className="font-clash text-4xl lg:text-6xl font-bold text-white"
      style={{ textShadow: '0 0 40px rgba(255,255,255,0.15)' }}
    >
      {display}
    </p>
  )
}

export default function HeroCard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()))

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount, date')
      .eq('user_id', user.id)

    if (!error) setTransactions(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useInvalidate(fetchTransactions)

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => subMonths(startOfMonth(new Date()), i)),
    []
  )

  const filtered = useMemo(
    () => transactions.filter((t) => isSameMonth(parseISO(t.date), selectedMonth)),
    [transactions, selectedMonth]
  )

  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpenses

  const sparklineData = useMemo(() => {
    const end = isSameMonth(selectedMonth, new Date())
      ? startOfDay(new Date())
      : startOfDay(endOfMonth(selectedMonth))
    const start = subDays(end, 6)

    return eachDayOfInterval({ start, end }).map((day) => ({
      date: format(day, 'MMM d'),
      value: filtered
        .filter((t) => isSameDay(parseISO(t.date), day))
        .reduce(
          (sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
          0
        ),
    }))
  }, [filtered, selectedMonth])

  if (loading) {
    return (
      <GlassCard hover={false} className="w-full h-[150px] lg:min-h-[200px] lg:h-auto !p-6 lg:!p-8">
        <div className="flex items-center justify-center h-full lg:min-h-[136px]">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard
      hover={false}
      className="w-full h-[150px] lg:min-h-[200px] lg:h-auto !p-6 lg:!p-8 overflow-hidden"
    >
      <LiquidBlob color="#252525" size={350} top="-80px" left="-60px" opacity={0.7} />
      <LiquidBlob color="#1A1A1A" size={280} bottom="-60px" right="-40px" delay={2} opacity={0.6} blur={90} />
      <LiquidBlob color="#2E2E2E" size={220} top="20px" right="200px" delay={4} opacity={0.5} blur={80} />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#606060]">Total Balance</p>
            <select
              value={selectedMonth.toISOString()}
              onChange={(e) => setSelectedMonth(new Date(e.target.value))}
              className="text-xs text-[#A0A0A0] bg-[#1E1E1E] border border-white/[0.08] rounded-lg px-2 py-1 outline-none hover:border-white/[0.15] focus:border-white/[0.15] cursor-pointer transition-colors"
            >
              {monthOptions.map((month) => (
                <option key={month.toISOString()} value={month.toISOString()} className="bg-bg">
                  {format(month, 'MMMM yyyy')}
                </option>
              ))}
            </select>
          </div>

          <AnimatedBalance value={balance} />

          <div className="flex flex-wrap gap-2 mt-2 lg:gap-3 lg:mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium"
              style={{
                background: 'rgba(74,122,77,0.12)',
                border: '1px solid rgba(74,122,77,0.20)',
                color: '#4A7A4D',
              }}
            >
              ↑ Income {formatCurrencyCompact(totalIncome)}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium"
              style={{
                background: 'rgba(122,53,53,0.12)',
                border: '1px solid rgba(122,53,53,0.20)',
                color: '#7A3535',
              }}
            >
              ↓ Expenses {formatCurrencyCompact(totalExpenses)}
            </motion.div>
          </div>
        </div>

        <div className="hidden lg:block shrink-0 w-[200px] h-[80px]">
          <ResponsiveContainer width={200} height={80}>
            <AreaChart data={sparklineData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="heroSparkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#606060" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#606060" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#606060"
                strokeWidth={2}
                fill="url(#heroSparkGradient)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  )
}
