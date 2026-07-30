/**
 * Alerts.jsx (page)
 * Price alerts management page — add and track price targets.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ArrowLeft, Bell, Plus, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PriceCard from '../components/PriceCard';
import { useDarkMode } from '../hooks/useDarkMode';
import { useChat } from '../hooks/useChat';
import {
  getPriceAlerts,
  addPriceAlert,
  removePriceAlert,
  updateAlertStatus,
} from '../services/ProductService';

export default function AlertsPage() {
  const { isDark, toggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sessions, activeSessionId, startNewChat, loadSession, removeSession } = useChat();

  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product: '', currentPrice: '', targetPrice: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setAlerts(getPriceAlerts());
  }, []);

  const handleAdd = () => {
    if (!form.product.trim() || !form.currentPrice || !form.targetPrice) {
      setFormError('Please fill all fields.');
      return;
    }
    const updated = addPriceAlert(form);
    setAlerts(updated);
    setForm({ product: '', currentPrice: '', targetPrice: '' });
    setShowForm(false);
    setFormError('');
  };

  const handleDelete = (id) => {
    setAlerts(removePriceAlert(id));
  };

  const handleToggle = (id, status) => {
    setAlerts(updateAlertStatus(id, status));
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
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111]">
          <button
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <ArrowLeft size={15} />
            Back
          </Link>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Price Alerts</h1>
          <button
            onClick={() => setShowForm(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg
                       bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
                       hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
          >
            <Plus size={13} />
            Add Alert
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#0d0d0d]">
          <div className="max-w-4xl mx-auto">

            {/* Add Alert Form */}
            {showForm && (
              <div className="mb-6 p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1a1a]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">New Price Alert</h3>
                  <button onClick={() => { setShowForm(false); setFormError(''); }} className="p-1 text-gray-400 hover:text-gray-600">
                    <X size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 15"
                      value={form.product}
                      onChange={(e) => setForm({ ...form, product: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                                 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100
                                 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Current Price</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹79,999"
                      value={form.currentPrice}
                      onChange={(e) => setForm({ ...form, currentPrice: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                                 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100
                                 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Target Price</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹69,999"
                      value={form.targetPrice}
                      onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                                 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100
                                 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 transition-colors"
                    />
                  </div>
                </div>
                {formError && (
                  <p className="text-xs text-red-500 mb-2">{formError}</p>
                )}
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-900 dark:bg-gray-100
                             text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
                >
                  Create Alert
                </button>
              </div>
            )}

            {/* Alerts Grid */}
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Bell size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No price alerts yet</p>
                <p className="text-xs text-gray-400 mb-4">Track when a product hits your target price</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-900 dark:bg-gray-100
                             text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
                >
                  Add First Alert
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {alerts.map((alert) => (
                  <PriceCard
                    key={alert.id}
                    alert={alert}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
