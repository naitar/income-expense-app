-- ============================================================
-- Migration 002: Auth-ready schema with per-user isolation
-- ============================================================
-- Requires: 001_create_transactions.sql already applied
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add user_id column to transactions
--    UUID type matches auth.users.id
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  type      TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color     TEXT DEFAULT '#6366f1',  -- tailwind indigo-500 default
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 4. Drop the old permissive policy on transactions
DROP POLICY IF EXISTS "Allow all for anon" ON transactions;

-- 5. RLS policy: users can only SELECT their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. RLS policy: users can INSERT their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 7. RLS policy: users can UPDATE their own transactions
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. RLS policy: users can DELETE their own transactions
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 9. RLS policies for categories
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 10. Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id   ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_categories_user_id     ON categories (user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type        ON categories (type);

-- 11. (Optional) Clean up seeded data that has no user_id
DELETE FROM transactions WHERE user_id IS NULL;
