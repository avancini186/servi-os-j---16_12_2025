import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import ProtectedRoute from './components/ProtectedRoute';

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
          path="/onboarding"
          element={
            <ProtectedRoute allowedRole="provider">
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;