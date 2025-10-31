import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  full_name: string;
  role: string;
  business_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface DebtReceivable {
  id: string;
  user_id: string;
  type: 'debt' | 'receivable';
  party_name: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: 'pending' | 'partial' | 'paid';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CashFlow {
  id: string;
  user_id: string;
  opening_balance: number;
  period_start: string;
  period_end: string | null;
  created_at: string;
}
