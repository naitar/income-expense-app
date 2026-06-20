import { useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useTransactionContext } from '@/store/TransactionContext'
import { useAuth } from '@/store/AuthContext'

// In-memory fallback for development without Supabase
let localId = 1
const localStore = []

/**
 * Check if Supabase credentials are not configured.
 */
function useLocalFallback() {
  return (
    !import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL === 'https://your-project.supabase.co'
  )
}

/**
 * Detect if an error is a schema-cache miss (table or column doesn't exist).
 * PostgREST returns hints like "Could not find the ... in the schema cache".
 */
function isSchemaError(err) {
  const msg = (err?.message || err?.hint || '').toLowerCase()
  return msg.includes('schema cache') || (msg.includes('relation') && msg.includes('does not exist'))
}

function useTransactions() {
  const { state, dispatch } = useTransactionContext()
  const { user } = useAuth()
  // Once we detect schema issues, permanently switch to in-memory for this session
  const schemaBroken = useRef(false)

  const handleError = useCallback((err) => {
    if (isSchemaError(err)) {
      schemaBroken.current = true
      console.warn(
        '⚠️  Supabase table "transactions" not found. ' +
        'Run the migration in supabase/migrations/001_create_transactions.sql ' +
        'via the Supabase Dashboard SQL Editor. Falling back to in-memory storage.'
      )
      dispatch({ type: 'SET_ERROR', payload: null })
      return true // signal caller to use fallback
    }
    dispatch({ type: 'SET_ERROR', payload: err.message })
    return false
  }, [dispatch])

  const fetchTransactions = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // Only fetch if we have a user — otherwise show empty
      if (!user) {
        dispatch({ type: 'SET_TRANSACTIONS', payload: [] })
        return
      }

      if (useLocalFallback() || schemaBroken.current) {
        const userTxns = localStore.filter((t) => t.user_id === user.id)
        dispatch({ type: 'SET_TRANSACTIONS', payload: userTxns })
        return
      }
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      dispatch({ type: 'SET_TRANSACTIONS', payload: data || [] })
    } catch (err) {
      if (handleError(err)) {
        const userTxns = localStore.filter((t) => t.user_id === user?.id)
        dispatch({ type: 'SET_TRANSACTIONS', payload: userTxns })
      }
    }
  }, [dispatch, handleError, user])

  const addTransaction = useCallback(
    async (data) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        if (!user) {
          dispatch({ type: 'SET_ERROR', payload: 'အကောင့်ဝင်ရန် လိုအပ်ပါသည်။' })
          return null
        }

        if (useLocalFallback() || schemaBroken.current) {
          const newTx = {
            id: String(localId++),
            user_id: user.id,
            ...data,
            created_at: new Date().toISOString(),
          }
          localStore.unshift(newTx)
          dispatch({ type: 'ADD_TRANSACTION', payload: newTx })
          return newTx
        }
        const { data: inserted, error } = await supabase
          .from('transactions')
          .insert([{ ...data, user_id: user.id }])
          .select()
          .single()

        if (error) throw error
        dispatch({ type: 'ADD_TRANSACTION', payload: inserted })
        return inserted
      } catch (err) {
        if (handleError(err)) {
          const newTx = {
            id: String(localId++),
            user_id: user?.id,
            ...data,
            created_at: new Date().toISOString(),
          }
          localStore.unshift(newTx)
          dispatch({ type: 'ADD_TRANSACTION', payload: newTx })
          return newTx
        }
        return null
      }
    },
    [dispatch, handleError, user]
  )

  const updateTransaction = useCallback(
    async (id, data) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        if (!user) {
          dispatch({ type: 'SET_ERROR', payload: 'အကောင့်ဝင်ရန် လိုအပ်ပါသည်။' })
          return null
        }

        if (useLocalFallback() || schemaBroken.current) {
          const idx = localStore.findIndex((t) => t.id === id && t.user_id === user.id)
          if (idx !== -1) {
            localStore[idx] = { ...localStore[idx], ...data }
            dispatch({ type: 'UPDATE_TRANSACTION', payload: localStore[idx] })
          }
          return localStore[idx] ?? null
        }
        const { data: updated, error } = await supabase
          .from('transactions')
          .update(data)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) throw error
        dispatch({ type: 'UPDATE_TRANSACTION', payload: updated })
        return updated
      } catch (err) {
        if (handleError(err)) {
          const idx = localStore.findIndex((t) => t.id === id && t.user_id === user?.id)
          if (idx !== -1) {
            localStore[idx] = { ...localStore[idx], ...data }
            dispatch({ type: 'UPDATE_TRANSACTION', payload: localStore[idx] })
          }
          return localStore[idx] ?? null
        }
        return null
      }
    },
    [dispatch, handleError, user]
  )

  const deleteTransaction = useCallback(
    async (id) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        if (!user) {
          dispatch({ type: 'SET_ERROR', payload: 'အကောင့်ဝင်ရန် လိုအပ်ပါသည်။' })
          return false
        }

        if (useLocalFallback() || schemaBroken.current) {
          const idx = localStore.findIndex((t) => t.id === id && t.user_id === user.id)
          if (idx !== -1) localStore.splice(idx, 1)
          dispatch({ type: 'DELETE_TRANSACTION', payload: id })
          return true
        }
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error
        dispatch({ type: 'DELETE_TRANSACTION', payload: id })
        return true
      } catch (err) {
        if (handleError(err)) {
          const idx = localStore.findIndex((t) => t.id === id && t.user_id === user?.id)
          if (idx !== -1) localStore.splice(idx, 1)
          dispatch({ type: 'DELETE_TRANSACTION', payload: id })
          return true
        }
        return false
      }
    },
    [dispatch, handleError, user]
  )

  // True when no Supabase is configured OR schema is broken → using in-memory
  const usingFallback = useLocalFallback() || schemaBroken.current

  return {
    transactions: state.transactions,
    loading: state.loading,
    error: state.error,
    usingFallback,
    schemaMissing: schemaBroken.current,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
}

export default useTransactions
