import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { StatCard } from './StatCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  profitLoss: number;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    profitLoss: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const monthStart = startOfMonth.toISOString().split('T')[0];

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('transaction_date', monthStart)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      const income = transactions
        ?.filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      const expense = transactions
        ?.filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      setSummary({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        profitLoss: income - expense,
      });

      setRecentTransactions(transactions?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Financial summary for this month</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={formatCurrency(summary.totalIncome)}
          icon={TrendingUp}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Total Expense"
          value={formatCurrency(summary.totalExpense)}
          icon={TrendingDown}
          color="bg-gradient-to-br from-red-500 to-red-600"
        />
        <StatCard
          title="Profit/Loss"
          value={formatCurrency(summary.profitLoss)}
          icon={DollarSign}
          color={summary.profitLoss >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'}
        />
        <StatCard
          title="Current Balance"
          value={formatCurrency(summary.balance)}
          icon={Wallet}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {transaction.description || 'No description'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.transaction_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{' '}
                    {formatCurrency(parseFloat(transaction.amount))}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
