import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { TransactionsPage } from './components/transactions/TransactionsPage';
import { CategoriesPage } from './components/categories/CategoriesPage';
import { DebtsPage } from './components/debts/DebtsPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading NotaNusa...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        {isLogin ? (
          <LoginForm onToggle={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggle={() => setIsLogin(true)} />
        )}
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'debts':
        return <DebtsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="lg:ml-64 min-h-screen">
        <main className="p-4 lg:p-8 pt-16 lg:pt-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
