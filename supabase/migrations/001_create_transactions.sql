-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount      NUMERIC NOT NULL CHECK (amount > 0),
  category    TEXT NOT NULL,
  description TEXT DEFAULT '',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast filtering & ordering
CREATE INDEX IF NOT EXISTS idx_transactions_type      ON transactions (type);
CREATE INDEX IF NOT EXISTS idx_transactions_category  ON transactions (category);
CREATE INDEX IF NOT EXISTS idx_transactions_date      ON transactions (date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created   ON transactions (created_at DESC);

-- Enable row-level security (safe by default)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (anon key can read/write)
-- Replace with user-specific policies when auth is added
CREATE POLICY "Allow all for anon" ON transactions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Seed some sample data so it's not empty
INSERT INTO transactions (type, amount, category, description, date) VALUES
  ('income',  500000, 'Salary',    'Monthly salary',       '2026-06-01'),
  ('expense',  25000, 'Food & Dining', 'Lunch at restaurant',  '2026-06-03'),
  ('expense',  15000, 'Transport', 'Taxi ride',            '2026-06-05'),
  ('income',  100000, 'Freelance', 'Side project payment', '2026-06-10'),
  ('expense',  45000, 'Shopping',  'New headphones',       '2026-06-12'),
  ('expense',  30000, 'Bills & Utilities', 'Electricity bill', '2026-06-15'),
  ('income',  200000, 'Business',  'Client payment',       '2026-06-18');
