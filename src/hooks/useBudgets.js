import { useState, useEffect, useCallback, useMemo } from 'react'
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

function calcCategorySpent(transactions, monthStart, monthEnd) {
  return (transactions || [])
    .filter(
      (t) =>
        t.type === 'expense' &&
        isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
    )
    .reduce((sum, t) => sum + Number(t.amount), 0)
}

export function useBudgets() {
  const { user } = useAuth()
  const [rawCategories, setRawCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const monthStart = useMemo(() => startOfMonth(new Date()), [])
  const monthEnd = useMemo(() => endOfMonth(new Date()), [])

  const refetch = useCallback(async () => {
    if (!user) {
      setRawCategories([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*, transactions(amount, type, date)')
      .eq('user_id', user.id)
      .order('name')

    if (!error) setRawCategories(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`budgets:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${user.id}`,
        },
        () => refetch()
      )
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

  const categories = useMemo(
    () =>
      rawCategories.map((cat) => {
        const spent = calcCategorySpent(cat.transactions, monthStart, monthEnd)
        const limit = Number(cat.budget_limit) || 0
        const remaining = Math.max(limit - spent, 0)
        const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0

        return {
          ...cat,
          spent,
          remaining,
          percentage,
        }
      }),
    [rawCategories, monthStart, monthEnd]
  )

  const totalBudget = useMemo(
    () => categories.reduce((sum, c) => sum + Number(c.budget_limit || 0), 0),
    [categories]
  )

  const totalSpent = useMemo(
    () => categories.reduce((sum, c) => sum + c.spent, 0),
    [categories]
  )

  return { categories, totalBudget, totalSpent, loading }
}
