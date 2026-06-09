import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
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
      .order('deadline', { ascending: true, nullsFirst: false })

    if (!error) setGoals(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`goals:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`,
        },
        () => refetch()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, refetch])

  const addFunds = useCallback(
    async (goalId, amount) => {
      if (!user) return { error: new Error('Not authenticated') }

      const goal = goals.find((g) => g.id === goalId)
      if (!goal) return { error: new Error('Goal not found') }

      const { data, error } = await supabase
        .from('goals')
        .update({
          saved_amount: Number(goal.saved_amount || 0) + Number(amount),
        })
        .eq('id', goalId)
        .select()
        .single()

      return { data, error }
    },
    [user, goals]
  )

  return { goals, loading, addFunds }
}
