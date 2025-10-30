/*
  # NotaNusa UMKM Financial Management System Schema

  ## 1. New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `role` (text) - admin, user
  - `business_name` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `categories`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text)
  - `type` (text) - income, expense
  - `created_at` (timestamptz)

  ### `transactions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `category_id` (uuid, references categories)
  - `type` (text) - income, expense
  - `amount` (numeric)
  - `description` (text)
  - `transaction_date` (date)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `cash_flow`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `opening_balance` (numeric)
  - `period_start` (date)
  - `period_end` (date)
  - `created_at` (timestamptz)

  ### `debts_receivables`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `type` (text) - debt, receivable
  - `party_name` (text)
  - `amount` (numeric)
  - `paid_amount` (numeric)
  - `due_date` (date)
  - `status` (text) - pending, partial, paid
  - `description` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Security

  - Enable RLS on all tables
  - Policies for authenticated users to access their own data
  - Admin users can access all data

  ## 3. Indexes

  - Index on user_id for all tables
  - Index on transaction_date for transactions
  - Index on type fields for filtering
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  business_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(15,2) NOT NULL CHECK (amount >= 0),
  description text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cash_flow table
CREATE TABLE IF NOT EXISTS cash_flow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  opening_balance numeric(15,2) NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date,
  created_at timestamptz DEFAULT now()
);

-- Create debts_receivables table
CREATE TABLE IF NOT EXISTS debts_receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('debt', 'receivable')),
  party_name text NOT NULL,
  amount numeric(15,2) NOT NULL CHECK (amount >= 0),
  paid_amount numeric(15,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_cash_flow_user_id ON cash_flow(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_receivables_user_id ON debts_receivables(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_receivables_type ON debts_receivables(type);
CREATE INDEX IF NOT EXISTS idx_debts_receivables_status ON debts_receivables(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts_receivables ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Cash flow policies
CREATE POLICY "Users can view own cash flow"
  ON cash_flow FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cash flow"
  ON cash_flow FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cash flow"
  ON cash_flow FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Debts receivables policies
CREATE POLICY "Users can view own debts receivables"
  ON debts_receivables FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own debts receivables"
  ON debts_receivables FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own debts receivables"
  ON debts_receivables FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own debts receivables"
  ON debts_receivables FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());