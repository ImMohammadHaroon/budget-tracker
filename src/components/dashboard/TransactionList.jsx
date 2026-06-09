import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import GlassCard from '../ui/GlassCard'
import { supabase, formatCurrency } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useInvalidate } from '../../hooks/useInvalidate'

function TransactionRow({ transaction, index, isLast }) {
  const isIncome = transaction.type === 'income'
  const amount = formatCurrency(Math.abs(Number(transaction.amount)))

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`relative overflow-hidden ${isLast ? '' : 'border-b border-white/[0.04]'}`}
    >
      <motion.div
        className="relative flex items-center gap-4 py-4 lg:py-3 px-1 overflow-hidden"
        initial="rest"
        whileHover="hover"
        variants={{
          rest: { x: 0, backgroundColor: 'rgba(255,255,255,0)' },
          hover: {
            x: 4,
            backgroundColor: 'rgba(255,255,255,0.03)',
            transition: { duration: 0.2 },
          },
        }}
      >
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
          }}
          variants={{
            rest: { x: '-100%' },
            hover: { x: '100%', transition: { duration: 0.4, ease: 'easeInOut' } },
          }}
        />

        <div
          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            isIncome ? 'text-success' : 'text-[#808080]'
          }`}
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {isIncome ? '↑' : '↓'}
        </div>

        <div className="relative z-10 flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {transaction.description || 'No description'}
          </p>
          <p className="mt-1 text-xs text-[#606060] capitalize">{transaction.type}</p>
        </div>

        <p className="relative z-10 shrink-0 text-xs text-[#404040]">
          {format(parseISO(transaction.date), 'MMM d, yyyy')}
        </p>

        <p
          className={`relative z-10 shrink-0 text-sm font-semibold ${
            isIncome ? 'text-success' : 'text-white'
          }`}
        >
          {isIncome ? `+${amount}` : `-${amount}`}
        </p>
      </motion.div>
    </motion.div>
  )
}

export default function TransactionList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { openAddTransaction } = useOutletContext() || {}
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10)

    if (!error) setTransactions(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useInvalidate(fetchTransactions)

  return (
    <GlassCard hover={false}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Recent Transactions</h3>
        <button
          type="button"
          onClick={() => navigate('/transactions')}
          className="text-[#A0A0A0] text-sm hover:text-white transition-colors"
        >
          View All →
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <button
          type="button"
          onClick={() => openAddTransaction?.()}
          className="flex w-full flex-col items-center justify-center gap-2 py-12 text-[#606060] hover:text-[#A0A0A0] transition-colors"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] text-xl">
            +
          </span>
          <span className="text-sm">Add your first transaction</span>
        </button>
      ) : (
        <div>
          {transactions.map((tx, index) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              index={index}
              isLast={index === transactions.length - 1}
            />
          ))}
        </div>
      )}
    </GlassCard>
  )
}
