# Skill: supabase-patterns

## Purpose
Supabase query patterns, Auth helpers, RLS rules တွေ
consistent ဖြစ်အောင် define ထားသည်။

## When to use
- Supabase query ရေးသောအခါ
- Auth code ရေးသောအခါ
- Custom hooks ရေးသောအခါ

## Standard Query Pattern
const { data, error } = await supabase
  .from('transactions')
  .select('*, categories(name, color)')
  .eq('user_id', user.id)
  .order('date', { ascending: false })
if (error) throw error

## Auth Patterns
// Get user
const { data: { user } } = await supabase.auth.getUser()

// Sign in
const { error } = await supabase.auth.signInWithPassword({ email, password })

// Sign up
const { error } = await supabase.auth.signUp({ email, password })

// Google OAuth
const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })

// Sign out
await supabase.auth.signOut()

// Auth state listen
supabase.auth.onAuthStateChange((_event, session) => {
  setUser(session?.user ?? null)
})

## RLS Rules
- Query တိုင်း .eq('user_id', user.id) ထည့်ပါ
- service_role key ကို frontend မသုံးပါနဲ့
- user.id မရှိဘဲ query မလုပ်ပါနဲ့