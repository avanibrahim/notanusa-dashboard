import React, { useEffect, useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    profitLoss: 0,
    transactionCount: 0,
    categoryBreakdown: [] as { name: string; type: string; total: number }[],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDateRange(period);
  }, [period]);

  useEffect(() => {
    if (startDate && endDate && user) {
      generateReport();
    }
  }, [startDate, endDate, user]);

  const setDateRange = (periodType: 'week' | 'month' | 'year') => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start = new Date();

    switch (periodType) {
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*, categories(name, type)')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (error) throw error;

      const income = transactions
        ?.filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0) || 0;

      const expense = transactions
        ?.filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0) || 0;

      const categoryMap = new Map<string, { type: string; total: number }>();
      transactions?.forEach((t) => {
        const categoryName = t.categories?.name || 'Uncategorized';
        const existing = categoryMap.get(categoryName);
        if (existing) {
          existing.total += parseFloat(String(t.amount));
        } else {
          categoryMap.set(categoryName, {
            type: t.type,
            total: parseFloat(String(t.amount)),
          });
        }
      });

      const breakdown = Array.from(categoryMap.entries())
        .map(([name, data]) => ({
          name,
          type: data.type,
          total: data.total,
        }))
        .sort((a, b) => b.total - a.total);

      setReportData({
        totalIncome: income,
        totalExpense: expense,
        profitLoss: income - expense,
        transactionCount: transactions?.length || 0,
        categoryBreakdown: breakdown,
      });
    } catch (error) {
      console.error('Error generating report:', error);
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

  const exportToCSV = () => {
    const headers = ['Category', 'Type', 'Amount'];
    const rows = reportData.categoryBreakdown.map((item) => [
      item.name,
      item.type,
      item.total,
    ]);

    const csvContent = [
      `Financial Report (${startDate} to ${endDate})`,
      '',
      `Total Income,${reportData.totalIncome}`,
      `Total Expense,${reportData.totalExpense}`,
      `Profit/Loss,${reportData.profitLoss}`,
      `Total Transactions,${reportData.transactionCount}`,
      '',
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${startDate}-${endDate}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Reports</h1>
          <p className="text-gray-600">Generate comprehensive financial reports</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={reportData.transactionCount === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Report Period</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setPeriod('week')}
            className={`py-3 rounded-lg font-semibold transition ${
              period === 'week'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`py-3 rounded-lg font-semibold transition ${
              period === 'month'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`py-3 rounded-lg font-semibold transition ${
              period === 'year'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last Year
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
              <p className="text-green-100 text-sm font-medium mb-2">Total Income</p>
              <p className="text-3xl font-bold">{formatCurrency(reportData.totalIncome)}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
              <p className="text-red-100 text-sm font-medium mb-2">Total Expense</p>
              <p className="text-3xl font-bold">{formatCurrency(reportData.totalExpense)}</p>
            </div>
            <div
              className={`text-white rounded-xl shadow-lg p-6 ${
                reportData.profitLoss >= 0
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-orange-500 to-orange-600'
              }`}
            >
              <p className="text-blue-100 text-sm font-medium mb-2">Profit/Loss</p>
              <p className="text-3xl font-bold">{formatCurrency(reportData.profitLoss)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
              <p className="text-purple-100 text-sm font-medium mb-2">Transactions</p>
              <p className="text-3xl font-bold">{reportData.transactionCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
            </div>

            {reportData.categoryBreakdown.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No data available for this period</p>
            ) : (
              <div className="space-y-4">
                {reportData.categoryBreakdown.map((item, index) => {
                  const percentage =
                    item.type === 'income'
                      ? (item.total / reportData.totalIncome) * 100
                      : (item.total / reportData.totalExpense) * 100;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.type === 'income'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{formatCurrency(item.total)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            item.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        {percentage.toFixed(1)}% of total {item.type}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
