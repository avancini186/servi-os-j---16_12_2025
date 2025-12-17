import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import UserTypeSelectionPage from './pages/UserTypeSelectionPage';
import AuthPage from './pages/AuthPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth/selection" element={<UserTypeSelectionPage />} />
        <Route path="/auth/:type" element={<AuthPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;