import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  FileText,
  PieChart,
  CreditCard,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onToggle }) => {
  const { profile, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'debts', label: 'Debts & Receivables', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
  ];

  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              NotaNusa
            </h1>
            <p className="text-sm text-slate-400 mt-1">{profile?.business_name || 'UMKM Dashboard'}</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50'
                      : 'hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm font-medium">{profile?.full_name}</p>
              <p className="text-xs text-slate-400 capitalize">{profile?.role}</p>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};
