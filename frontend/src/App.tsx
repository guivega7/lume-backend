import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { WalletPage } from '@/pages/WalletPage';
import { CashFlowPage } from '@/pages/CashFlowPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { AssetsPage } from '@/pages/AssetsPage';
import { RecurringPage } from '@/pages/RecurringPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { BudgetsPage } from '@/pages/BudgetsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { LandingPage } from '@/pages/LandingPage';
import { AuthProvider, AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';
import { Toaster } from 'sonner';

// Componente para proteger rotas privadas
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Carregando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rotas Privadas (Protegidas) */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <AppShell>
            <DashboardPage />
          </AppShell>
        </PrivateRoute>
      } />
      
      <Route path="/transactions" element={
        <PrivateRoute>
          <AppShell>
            <TransactionsPage />
          </AppShell>
        </PrivateRoute>
      } />

      <Route path="/wallet" element={
        <PrivateRoute>
          <AppShell>
            <WalletPage />
          </AppShell>
        </PrivateRoute>
      } />

      <Route path="/cashflow" element={
        <PrivateRoute>
          <AppShell>
            <CashFlowPage />
          </AppShell>
        </PrivateRoute>
      } />

      <Route path="/categories" element={
        <PrivateRoute>
          <AppShell>
            <CategoriesPage />
          </AppShell>
        </PrivateRoute>
      } />

      <Route path="/assets" element={
        <PrivateRoute>
          <AppShell>
            <AssetsPage />
          </AppShell>
        </PrivateRoute>
      } />

      <Route path="/recurring" element={
        <PrivateRoute>
          <AppShell>
            <RecurringPage />
          </AppShell>
        </PrivateRoute>
      } />

      <Route path="/reports" element={
        <PrivateRoute>
          <AppShell>
            <ReportsPage />
          </AppShell>
        </PrivateRoute>
      } />

      <Route path="/budgets" element={
        <PrivateRoute>
          <AppShell>
            <BudgetsPage />
          </AppShell>
        </PrivateRoute>
      } />

      <Route path="/settings" element={
        <PrivateRoute>
          <AppShell>
            <SettingsPage />
          </AppShell>
        </PrivateRoute>
      } />

      {/* Rota Coringa */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
