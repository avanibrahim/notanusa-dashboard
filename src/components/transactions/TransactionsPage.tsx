import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { supabase, Transaction } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TransactionForm } from './TransactionForm';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | undefined>();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [transactions, filterType, dateFrom, dateTo]);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    if (dateFrom) {
      filtered = filtered.filter((t) => t.transaction_date >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter((t) => t.transaction_date <= dateTo);
    }

    setFilteredTransactions(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalIncome = () => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);
  };

  const getTotalExpense = () => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
          <p className="text-gray-600">Manage your income and expenses</p>
        </div>
        <button
          onClick={() => {
            setEditTransaction(undefined);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          New Transaction
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterType('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-green-100 text-sm font-medium mb-2">Total Income</p>
          <p className="text-3xl font-bold">{formatCurrency(getTotalIncome())}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-red-100 text-sm font-medium mb-2">Total Expense</p>
          <p className="text-3xl font-bold">{formatCurrency(getTotalExpense())}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-blue-100 text-sm font-medium mb-2">Net Balance</p>
          <p className="text-3xl font-bold">{formatCurrency(getTotalIncome() - getTotalExpense())}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{' '}
                        {formatCurrency(parseFloat(String(transaction.amount)))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditTransaction(transaction);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-4 transition"
                      >
                        <Edit className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          onClose={() => {
            setShowForm(false);
            setEditTransaction(undefined);
          }}
          onSuccess={loadTransactions}
          editTransaction={editTransaction}
        />
      )}
    </div>
  );
};
