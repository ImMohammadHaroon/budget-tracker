import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import GlassCard from '../components/ui/GlassCard'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency } from '../lib/supabase'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-sm">
      <p className="text-[#606060] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-white">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function Reports() {
  const { transactions, loading } = useTransactions()

  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    })

    return months.map((month) => {
      const start = startOfMonth(month)
      const end = endOfMonth(month)
      const label = format(month, 'MMM yyyy')

      const monthTx = transactions.filter((tx) => {
        const d = new Date(tx.date)
        return d >= start && d <= end
      })

      const income = monthTx
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + Number(t.amount), 0)

      const expenses = monthTx
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount), 0)

      return { month: label, income, expenses, savings: income - expenses }
    })
  }, [transactions])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#606060', fontSize: 12 }} />
              <YAxis tick={{ fill: '#606060', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" name="Income" fill="#4A7A4D" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#7A3535" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Savings Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#606060', fontSize: 12 }} />
              <YAxis tick={{ fill: '#606060', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#606060" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#606060" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="savings"
                name="Savings"
                stroke="#606060"
                fill="url(#savingsGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Net Cash Flow</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#606060', fontSize: 12 }} />
              <YAxis tick={{ fill: '#606060', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="savings"
                name="Net"
                stroke="#808080"
                strokeWidth={2}
                dot={{ fill: '#808080', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  )
}
