import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { supabase, Category } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    type: 'income' as 'income' | 'expense',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('type')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            type: formData.type,
          })
          .eq('id', editCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([
          {
            user_id: user?.id,
            name: formData.name,
            type: formData.type,
          },
        ]);

        if (error) throw error;
      }

      setShowForm(false);
      setEditCategory(undefined);
      setFormData({ name: '', type: 'income' });
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
    });
    setShowForm(true);
  };

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
          <p className="text-gray-600">Manage your transaction categories</p>
        </div>
        <button
          onClick={() => {
            setEditCategory(undefined);
            setFormData({ name: '', type: 'income' });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          New Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Tag className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Income Categories</h2>
            <span className="ml-auto bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
              {incomeCategories.length}
            </span>
          </div>
          <div className="space-y-2">
            {incomeCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No income categories yet</p>
            ) : (
              incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <Tag className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Expense Categories</h2>
            <span className="ml-auto bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
              {expenseCategories.length}
            </span>
          </div>
          <div className="space-y-2">
            {expenseCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No expense categories yet</p>
            ) : (
              expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition"
                >
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">
                {editCategory ? 'Edit Category' : 'New Category'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., Sales, Salary, Rent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`py-3 rounded-lg font-semibold transition ${
                      formData.type === 'income'
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`py-3 rounded-lg font-semibold transition ${
                      formData.type === 'expense'
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditCategory(undefined);
                    setFormData({ name: '', type: 'income' });
                  }}
                  className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
                >
                  {editCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
