/**
 * App.jsx
 * Root application component — sets up routing and global dark mode.
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDarkMode } from './hooks/useDarkMode';

import Home from './pages/Home';
import DashboardPage from './pages/Dashboard';
import WishlistPage from './pages/Wishlist';
import AlertsPage from './pages/Alerts';
import SettingsPage from './pages/Settings';

export default function App() {
  // Initialize dark mode at the app root so the class is applied early
  const { isDark } = useDarkMode();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
