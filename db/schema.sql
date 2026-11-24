CREATE TABLE IF NOT EXISTS expenses (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  amount     NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  category   TEXT NOT NULL DEFAULT 'Other',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses (created_at);

-- seed data (only runs on an empty table)
INSERT INTO expenses (title, amount, category)
SELECT * FROM (VALUES
  ('Lunch at office canteen', 150.00, 'Food'),
  ('Metro card recharge', 500.00, 'Travel'),
  ('Electricity bill', 1200.00, 'Bills')
) AS seed(title, amount, category)
WHERE NOT EXISTS (SELECT 1 FROM expenses);
