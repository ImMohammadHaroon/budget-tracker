import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { useTransactions } from '../hooks/useTransactions'
import { supabase, formatCurrency } from '../lib/supabase'

export default function Transactions() {
  const { transactions, loading } = useTransactions()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = transactions.filter((tx) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'income' && tx.type === 'income') ||
      (filter === 'expense' && tx.type === 'expense')
    const description = (tx.description || '').toLowerCase()
    const matchesSearch = description.includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleDelete = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) toast.error(error.message)
    else toast.success('Transaction deleted')
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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Transactions</h1>
        <div className="flex gap-2">
          {['all', 'income', 'expense'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-all ${
                filter === f
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-[#606060] hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <input
        type="text"
        placeholder="Search transactions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2.5 bg-[#1E1E1E] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-[#404040] focus:outline-none focus:border-white/20"
      />

      <GlassCard className="!p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-[#606060] text-sm text-center py-12">No transactions found</p>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((tx, i) => {
              const isIncome = tx.type === 'income'

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors group"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 ${
                      isIncome ? 'text-success' : 'text-[#808080]'
                    }`}
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    {isIncome ? '↑' : '↓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{tx.description || 'No description'}</p>
                    <p className="text-xs text-[#404040] capitalize">
                      {format(parseISO(tx.date), 'MMM d, yyyy')} · {tx.type}
                    </p>
                  </div>
                  <p className={`font-semibold shrink-0 ${isIncome ? 'text-success' : 'text-white'}`}>
                    {isIncome ? '+' : '-'}
                    {formatCurrency(Math.abs(Number(tx.amount)))}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 !text-danger"
                    onClick={() => handleDelete(tx.id)}
                  >
                    ✕
                  </Button>
                </motion.div>
              )
            })}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
