import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (fetchError) {
      setError(fetchError)
    } else {
      setTransactions(data || [])
      setError(null)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`transactions:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => refetch()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, refetch])

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  )

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  )

  const balance = totalIncome - totalExpenses

  return {
    transactions,
    totalIncome,
    totalExpenses,
    balance,
    loading,
    error,
    refetch,
  }
}
