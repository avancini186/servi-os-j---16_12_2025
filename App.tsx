import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import AdminProvidersPage from './pages/AdminProvidersPage';
import AdminReviewPage from './pages/AdminReviewPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { getProviderDraft } from './lib/onboarding';

const ProfilePreviewRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    async function resolveDraft() {
      try {
        const draft = await getProviderDraft();
        if (draft?.id) {
          navigate(`/profile-preview/${draft.id}`, { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } catch (err) {
        navigate('/onboarding', { replace: true });
      }
    }
    resolveDraft();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark gap-3">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Carregando pré-visualização do perfil...
      </span>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/auth/:type" element={<AuthPage />} />
        <Route
          path="/provider"
          element={
            <ProtectedRoute allowedRole="provider">
              <ProviderDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute allowedRole="provider">
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-preview"
          element={
            <ProtectedRoute allowedRole="provider">
              <ProfilePreviewRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-preview/:id"
          element={
            <ProtectedRoute allowedRole="provider">
              <ProfilePage previewMode={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assinatura"
          element={
            <ProtectedRoute allowedRole="provider">
              <SubscriptionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRole="provider">
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <ProtectedRoute allowedRole="provider">
              <SubscriptionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminProvidersPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/providers"
          element={
            <AdminProtectedRoute>
              <AdminProvidersPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/providers/:id"
          element={
            <AdminProtectedRoute>
              <AdminReviewPage />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;