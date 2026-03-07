import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthCallback } from './pages/AuthCallback';
import { DashboardLayout } from './pages/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { WorkflowBuilder } from './pages/WorkflowBuilder';
import { LogsPage } from './pages/LogsPage';
import { SettingsPage } from './pages/SettingsPage';
import IntegrationsPage from './pages/IntegrationsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(139,92,246,0.3)' },
            success: { iconTheme: { primary: '#8b5cf6', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="workflows/new" element={<WorkflowBuilder />} />
              <Route path="workflows/:id" element={<WorkflowBuilder />} />
              <Route path="logs" element={<LogsPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
