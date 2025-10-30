import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<{ month: string; income: number; expense: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; type: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const startDate = sixMonthsAgo.toISOString().split('T')[0];

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*, categories(name)')
        .gte('transaction_date', startDate)
        .order('transaction_date', { ascending: true });

      if (error) throw error;

      const monthlyMap = new Map<string, { income: number; expense: number }>();
      const categoryMap = new Map<string, { value: number; type: string }>();

      transactions?.forEach((t) => {
        const date = new Date(t.transaction_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        const existing = monthlyMap.get(monthKey) || { income: 0, expense: 0 };
        if (t.type === 'income') {
          existing.income += parseFloat(String(t.amount));
        } else {
          existing.expense += parseFloat(String(t.amount));
        }
        monthlyMap.set(monthKey, existing);

        const categoryName = t.categories?.name || 'Uncategorized';
        const catExisting = categoryMap.get(categoryName);
        if (catExisting) {
          catExisting.value += parseFloat(String(t.amount));
        } else {
          categoryMap.set(categoryName, {
            value: parseFloat(String(t.amount)),
            type: t.type,
          });
        }
      });

      const monthlyArray = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
          month: new Date(month + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
          income: data.income,
          expense: data.expense,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const categoryArray = Array.from(categoryMap.entries())
        .map(([name, data]) => ({
          name,
          value: data.value,
          type: data.type,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      setMonthlyData(monthlyArray);
      setCategoryData(categoryArray);
    } catch (error) {
      console.error('Error loading analytics:', error);
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

  const maxValue = Math.max(
    ...monthlyData.flatMap((d) => [d.income, d.expense]),
    1
  );

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Visual insights of your financial data</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Monthly Income vs Expense (Last 6 Months)</h3>
        </div>

        {monthlyData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No data available</p>
        ) : (
          <div className="space-y-6">
            {monthlyData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{data.month}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600 font-semibold">
                      Income: {formatCurrency(data.income)}
                    </span>
                    <span className="text-red-600 font-semibold">
                      Expense: {formatCurrency(data.expense)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-lg h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${(data.income / maxValue) * 100}%` }}
                      >
                        {data.income > 0 && (
                          <span className="text-xs text-white font-semibold">
                            {((data.income / maxValue) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-lg h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${(data.expense / maxValue) * 100}%` }}
                      >
                        {data.expense > 0 && (
                          <span className="text-xs text-white font-semibold">
                            {((data.expense / maxValue) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <PieChartIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top 10 Categories by Amount</h3>
        </div>

        {categoryData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No data available</p>
        ) : (
          <div className="space-y-4">
            {categoryData.map((category, index) => {
              const maxCategoryValue = categoryData[0].value;
              const percentage = (category.value / maxCategoryValue) * 100;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          category.type === 'income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.type}
                      </span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrency(category.value)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        category.type === 'income'
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Financial Trend</h3>
        </div>

        {monthlyData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No data available</p>
        ) : (
          <div className="space-y-4">
            {monthlyData.map((data, index) => {
              const profitLoss = data.income - data.expense;
              const isProfit = profitLoss >= 0;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isProfit ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{data.month}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${
                          isProfit ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isProfit ? '+' : ''}{formatCurrency(profitLoss)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isProfit
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {isProfit ? 'Profit' : 'Loss'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
