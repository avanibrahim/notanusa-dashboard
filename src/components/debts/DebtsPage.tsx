import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase, DebtReceivable } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const DebtsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<DebtReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<DebtReceivable | undefined>();
  const [formData, setFormData] = useState({
    type: 'debt' as 'debt' | 'receivable',
    party_name: '',
    amount: '',
    paid_amount: '',
    due_date: '',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('debts_receivables')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading debts/receivables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const paidAmount = parseFloat(formData.paid_amount) || 0;
      const totalAmount = parseFloat(formData.amount);
      let status: 'pending' | 'partial' | 'paid' = 'pending';

      if (paidAmount >= totalAmount) {
        status = 'paid';
      } else if (paidAmount > 0) {
        status = 'partial';
      }

      const itemData = {
        user_id: user?.id,
        type: formData.type,
        party_name: formData.party_name,
        amount: totalAmount,
        paid_amount: paidAmount,
        due_date: formData.due_date,
        description: formData.description,
        status,
        updated_at: new Date().toISOString(),
      };

      if (editItem) {
        const { error } = await supabase
          .from('debts_receivables')
          .update(itemData)
          .eq('id', editItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('debts_receivables').insert([itemData]);
        if (error) throw error;
      }

      setShowForm(false);
      setEditItem(undefined);
      setFormData({
        type: 'debt',
        party_name: '',
        amount: '',
        paid_amount: '',
        due_date: '',
        description: '',
      });
      loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase.from('debts_receivables').delete().eq('id', id);
      if (error) throw error;
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = (item: DebtReceivable) => {
    setEditItem(item);
    setFormData({
      type: item.type,
      party_name: item.party_name,
      amount: String(item.amount),
      paid_amount: String(item.paid_amount),
      due_date: item.due_date,
      description: item.description || '',
    });
    setShowForm(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'paid';
  };

  const debts = items.filter((i) => i.type === 'debt');
  const receivables = items.filter((i) => i.type === 'receivable');

  const totalDebt = debts.reduce((sum, d) => sum + parseFloat(String(d.amount)) - parseFloat(String(d.paid_amount)), 0);
  const totalReceivable = receivables.reduce((sum, r) => sum + parseFloat(String(r.amount)) - parseFloat(String(r.paid_amount)), 0);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Debts & Receivables</h1>
          <p className="text-gray-600">Track money you owe and money owed to you</p>
        </div>
        <button
          onClick={() => {
            setEditItem(undefined);
            setFormData({
              type: 'debt',
              party_name: '',
              amount: '',
              paid_amount: '',
              due_date: '',
              description: '',
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-red-100 text-sm font-medium mb-2">Total Outstanding Debt</p>
          <p className="text-3xl font-bold">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-green-100 text-sm font-medium mb-2">Total Outstanding Receivables</p>
          <p className="text-3xl font-bold">{formatCurrency(totalReceivable)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            Debts
            <span className="ml-auto bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
              {debts.length}
            </span>
          </h2>
          <div className="space-y-3">
            {debts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No debts recorded</p>
            ) : (
              debts.map((debt) => {
                const remaining = parseFloat(String(debt.amount)) - parseFloat(String(debt.paid_amount));
                const progress = (parseFloat(String(debt.paid_amount)) / parseFloat(String(debt.amount))) * 100;
                const overdue = isOverdue(debt.due_date, debt.status);

                return (
                  <div
                    key={debt.id}
                    className={`p-4 rounded-lg border-2 ${
                      overdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{debt.party_name}</p>
                        <p className="text-sm text-gray-600">{debt.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(debt)}
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(debt.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-bold text-red-600">{formatCurrency(remaining)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                          Due: {new Date(debt.due_date).toLocaleDateString('id-ID')}
                          {overdue && ' (Overdue!)'}
                        </span>
                        <span className="text-gray-500">{progress.toFixed(0)}% paid</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            Receivables
            <span className="ml-auto bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
              {receivables.length}
            </span>
          </h2>
          <div className="space-y-3">
            {receivables.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No receivables recorded</p>
            ) : (
              receivables.map((receivable) => {
                const remaining = parseFloat(String(receivable.amount)) - parseFloat(String(receivable.paid_amount));
                const progress = (parseFloat(String(receivable.paid_amount)) / parseFloat(String(receivable.amount))) * 100;
                const overdue = isOverdue(receivable.due_date, receivable.status);

                return (
                  <div
                    key={receivable.id}
                    className={`p-4 rounded-lg border-2 ${
                      overdue ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{receivable.party_name}</p>
                        <p className="text-sm text-gray-600">{receivable.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(receivable)}
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(receivable.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-bold text-green-600">{formatCurrency(remaining)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={overdue ? 'text-orange-600 font-semibold' : 'text-gray-500'}>
                          Due: {new Date(receivable.due_date).toLocaleDateString('id-ID')}
                          {overdue && ' (Overdue!)'}
                        </span>
                        <span className="text-gray-500">{progress.toFixed(0)}% received</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">
                {editItem ? 'Edit Item' : 'Add New Debt/Receivable'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'debt' })}
                    className={`py-3 rounded-lg font-semibold transition ${
                      formData.type === 'debt'
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Debt
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'receivable' })}
                    className={`py-3 rounded-lg font-semibold transition ${
                      formData.type === 'receivable'
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Receivable
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Party Name
                </label>
                <input
                  type="text"
                  value={formData.party_name}
                  onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Name of person or company"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount (IDR)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="0"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid Amount (IDR)
                </label>
                <input
                  type="number"
                  value={formData.paid_amount}
                  onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditItem(undefined);
                    setFormData({
                      type: 'debt',
                      party_name: '',
                      amount: '',
                      paid_amount: '',
                      due_date: '',
                      description: '',
                    });
                  }}
                  className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
                >
                  {editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
