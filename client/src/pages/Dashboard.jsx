/**
 * Dashboard.jsx (page)
 * Analytics + product overview page.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardComponent from '../components/Dashboard';
import { useDarkMode } from '../hooks/useDarkMode';
import { useChat } from '../hooks/useChat';
import {
  getWishlist,
  getPriceAlerts,
  getComparisons,
  getSpendingData,
  getPreferences,
  removePriceAlert,
  updateAlertStatus,
} from '../services/ProductService';

export default function DashboardPage() {
  const { isDark, toggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sessions, activeSessionId, startNewChat, loadSession, removeSession } = useChat();

  const [wishlist, setWishlist] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [spending, setSpending] = useState([]);
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    setWishlist(getWishlist());
    setPriceAlerts(getPriceAlerts());
    setComparisons(getComparisons());
    setSpending(getSpendingData());
    setPreferences(getPreferences());
  }, []);

  const handleDeleteAlert = (id) => {
    const updated = removePriceAlert(id);
    setPriceAlerts(updated);
  };

  const handleToggleAlert = (id, status) => {
    const updated = updateAlertStatus(id, status);
    setPriceAlerts(updated);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#111111]">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={startNewChat}
        onLoadSession={loadSession}
        onDeleteSession={removeSession}
        isDark={isDark}
        onToggleDark={toggle}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Page Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111]">
          <button
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Chat
          </Link>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        </div>

        <DashboardComponent
          wishlist={wishlist}
          priceAlerts={priceAlerts}
          comparisons={comparisons}
          spending={spending}
          preferences={preferences}
          onDeleteAlert={handleDeleteAlert}
          onToggleAlert={handleToggleAlert}
        />
      </div>
    </div>
  );
}
