import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/store/AuthContext'

// ── Default categories seeded once per user ──────────────────
const DEFAULT_CATEGORIES = [
  { name: 'လစာ',           type: 'income',  color: '#22c55e' },
  { name: 'Freelance',      type: 'income',  color: '#16a34a' },
  { name: 'စီးပွားရေး',     type: 'income',  color: '#15803d' },
  { name: 'ရင်းနှီးမြှုပ်နှံမှု', type: 'income',  color: '#0d9488' },
  { name: 'စားသောက်',      type: 'expense', color: '#ef4444' },
  { name: 'သယ်ယူပို့ဆောင်ရေး', type: 'expense', color: '#f97316' },
  { name: 'စျေးဝယ်',        type: 'expense', color: '#eab308' },
  { name: 'ဘေလ်များ',      type: 'expense', color: '#6366f1' },
  { name: 'ကျန်းမာရေး',    type: 'expense', color: '#ec4899' },
  { name: 'ဖျော်ဖြေရေး',    type: 'expense', color: '#8b5cf6' },
  { name: 'ပညာရေး',        type: 'expense', color: '#3b82f6' },
  { name: 'အခြား',          type: 'expense', color: '#64748b' },
]

// In-memory fallback for development without Supabase
let localCatId = 1
const localCategories = [
  { id: String(localCatId++), name: 'လစာ', type: 'income', color: '#22c55e' },
  { id: String(localCatId++), name: 'Freelance', type: 'income', color: '#16a34a' },
  { id: String(localCatId++), name: 'စီးပွားရေး', type: 'income', color: '#15803d' },
  { id: String(localCatId++), name: 'စားသောက်', type: 'expense', color: '#ef4444' },
  { id: String(localCatId++), name: 'သယ်ယူပို့', type: 'expense', color: '#f97316' },
  { id: String(localCatId++), name: 'စျေးဝယ်', type: 'expense', color: '#eab308' },
  { id: String(localCatId++), name: 'ဘေလ်များ', type: 'expense', color: '#6366f1' },
  { id: String(localCatId++), name: 'ကျန်းမာရေး', type: 'expense', color: '#ec4899' },
  { id: String(localCatId++), name: 'ဖျော်ဖြေရေး', type: 'expense', color: '#8b5cf6' },
  { id: String(localCatId++), name: 'ပညာရေး', type: 'expense', color: '#3b82f6' },
  { id: String(localCatId++), name: 'အခြား', type: 'expense', color: '#64748b' },
]

function useLocalFallback() {
  return (
    !import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL === 'https://your-project.supabase.co'
  )
}

function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fetched, setFetched] = useState(false)
  const seeding = useRef(false) // prevent double-seed

  // ── Seed default categories when user has none ──────────────
  const seedDefaults = useCallback(async () => {
    if (seeding.current) return
    seeding.current = true

    const rows = DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: user.id }))

    try {
      if (useLocalFallback()) {
        const now = new Date().toISOString()
        const seeded = rows.map((r) => ({ id: String(localCatId++), ...r, created_at: now }))
        localCategories.push(...seeded)
        setCategories(seeded)
        return
      }

      const { data, error: err } = await supabase
        .from('categories')
        .insert(rows)
        .select()

      if (err) throw err
      setCategories(data || [])
    } catch (err) {
      console.warn('Failed to seed default categories:', err.message)
      seeding.current = false // allow retry next time
    }
  }, [user])

  const fetchCategories = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      if (useLocalFallback()) {
        setCategories([...localCategories])
        return
      }

      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('type')
        .order('name')

      if (err) throw err

      if (!data || data.length === 0) {
        // No categories yet — seed defaults
        await seedDefaults()
      } else {
        setCategories(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setFetched(true)
    }
  }, [user, seedDefaults])

  // Auto-fetch on mount / user change
  useEffect(() => {
    if (user && !fetched) {
      fetchCategories()
    }
  }, [user, fetched, fetchCategories])

  const addCategory = useCallback(
    async (data) => {
      if (!user) {
        setError('အကောင့်ဝင်ရန် လိုအပ်ပါသည်။')
        return null
      }
      setError(null)

      try {
        if (useLocalFallback()) {
          const cat = { id: String(localCatId++), user_id: user.id, ...data, created_at: new Date().toISOString() }
          localCategories.push(cat)
          setCategories((prev) => [...prev, cat])
          return cat
        }

        const { data: inserted, error: err } = await supabase
          .from('categories')
          .insert([{ ...data, user_id: user.id }])
          .select()
          .single()

        if (err) throw err
        setCategories((prev) => {
          // maintain sort: income first, then expense, then by name
          const next = [...prev, inserted]
          next.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
          return next
        })
        return inserted
      } catch (err) {
        setError(err.message)
        return null
      }
    },
    [user]
  )

  const updateCategory = useCallback(
    async (id, data) => {
      if (!user) {
        setError('အကောင့်ဝင်ရန် လိုအပ်ပါသည်။')
        return null
      }
      setError(null)

      try {
        if (useLocalFallback()) {
          const idx = localCategories.findIndex((c) => c.id === id)
          if (idx !== -1) {
            localCategories[idx] = { ...localCategories[idx], ...data }
            setCategories((prev) =>
              prev.map((c) => (c.id === id ? { ...c, ...data } : c))
            )
          }
          return localCategories[idx]
        }

        const { data: updated, error: err } = await supabase
          .from('categories')
          .update(data)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (err) throw err
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? updated : c))
        )
        return updated
      } catch (err) {
        setError(err.message)
        return null
      }
    },
    [user]
  )

  const deleteCategory = useCallback(
    async (id) => {
      if (!user) {
        setError('အကောင့်ဝင်ရန် လိုအပ်ပါသည်။')
        return false
      }
      setError(null)

      try {
        if (useLocalFallback()) {
          const idx = localCategories.findIndex((c) => c.id === id)
          if (idx !== -1) localCategories.splice(idx, 1)
          setCategories((prev) => prev.filter((c) => c.id !== id))
          return true
        }

        const { error: err } = await supabase
          .from('categories')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (err) throw err
        setCategories((prev) => prev.filter((c) => c.id !== id))
        return true
      } catch (err) {
        setError(err.message)
        return false
      }
    },
    [user]
  )

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}

export default useCategories
