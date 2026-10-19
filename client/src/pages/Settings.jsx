/**
 * Settings.jsx (page)
 * User preferences, API status, and app settings.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ArrowLeft, Save, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useDarkMode } from '../hooks/useDarkMode';
import { useChat } from '../hooks/useChat';
import {
  getPreferences,
  updatePreferences,
  CATEGORIES,
} from '../services/ProductService';
import axios from 'axios';

export default function SettingsPage() {
  const { isDark, toggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sessions, activeSessionId, startNewChat, loadSession, removeSession } = useChat();

  const [prefs, setPrefs] = useState({ budget: '', preferredBrands: [], categories: [], recentSearches: [] });
  const [saved, setSaved] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [brandInput, setBrandInput] = useState('');

  useEffect(() => {
    const p = getPreferences();
    setPrefs({
      ...p,
      budget: p.budget ? String(p.budget) : '',
    });
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';
      const res = await axios.get(`${apiBase}/health`);
      setApiStatus(res.data.status === 'ok' ? 'online' : 'error');
    } catch {
      setApiStatus('error');
    }
  };

  const handleSave = () => {
    updatePreferences({
      ...prefs,
      budget: prefs.budget ? parseInt(prefs.budget, 10) : null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleCategory = (cat) => {
    const cats = prefs.categories || [];
    const updated = cats.includes(cat)
      ? cats.filter((c) => c !== cat)
      : [...cats, cat];
    setPrefs({ ...prefs, categories: updated });
  };

  const addBrand = () => {
    const brand = brandInput.trim();
    if (!brand || (prefs.preferredBrands || []).includes(brand)) return;
    setPrefs({ ...prefs, preferredBrands: [...(prefs.preferredBrands || []), brand] });
    setBrandInput('');
  };

  const removeBrand = (brand) => {
    setPrefs({ ...prefs, preferredBrands: (prefs.preferredBrands || []).filter((b) => b !== brand) });
  };

  const clearSearchHistory = () => {
    setPrefs({ ...prefs, recentSearches: [] });
    updatePreferences({ recentSearches: [] });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#111111]">
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

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111]">
          <button className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <ArrowLeft size={15} />
            Back
          </Link>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
          <button
            onClick={handleSave}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg
                       bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
                       hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
          >
            {saved ? <CheckCircle size={13} /> : <Save size={13} />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#0d0d0d]">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* API Status */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1a1a]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">System Status</h3>
              <div className="flex items-center gap-2">
                {apiStatus === 'online' ? (
                  <><CheckCircle size={14} className="text-green-500" /><span className="text-xs text-green-600">Groq API connected</span></>
                ) : apiStatus === 'error' ? (
                  <><AlertCircle size={14} className="text-red-500" /><span className="text-xs text-red-500">API connection failed — check backend</span></>
                ) : (
                  <><span className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" /><span className="text-xs text-gray-400">Checking...</span></>
                )}
              </div>
            </div>

            {/* Budget */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1a1a]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Default Budget (₹)</h3>
              <p className="text-xs text-gray-400 mb-3">The AI will use this as context when you ask for recommendations</p>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={prefs.budget}
                onChange={(e) => setPrefs({ ...prefs, budget: e.target.value })}
                className="w-full max-w-xs px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100
                           focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 transition-colors"
              />
            </div>

            {/* Preferred Brands */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1a1a]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Preferred Brands</h3>
              <p className="text-xs text-gray-400 mb-3">The AI will prioritize these brands in recommendations</p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add brand..."
                  value={brandInput}
                  onChange={(e) => setBrandInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBrand()}
                  className="flex-1 max-w-xs px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                             bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100
                             focus:outline-none focus:border-gray-900 dark:focus:border-gray-400 transition-colors"
                />
                <button onClick={addBrand} className="px-3 py-2 text-xs rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(prefs.preferredBrands || []).map((brand) => (
                  <span key={brand} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                                              bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                                              border border-gray-200 dark:border-gray-700">
                    {brand}
                    <button onClick={() => removeBrand(brand)} className="hover:text-red-500 transition-colors">
                      ×
                    </button>
                  </span>
                ))}
                {(prefs.preferredBrands || []).length === 0 && (
                  <p className="text-xs text-gray-400">No brands added yet</p>
                )}
              </div>
            </div>

            {/* Favorite Categories */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1a1a]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Favorite Categories</h3>
              <p className="text-xs text-gray-400 mb-3">Select categories you shop in most</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-colors
                      ${(prefs.categories || []).includes(cat)
                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                        : 'bg-white dark:bg-[#111111] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search History */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1a1a]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Searches</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{(prefs.recentSearches || []).length} saved searches</p>
                </div>
                {(prefs.recentSearches || []).length > 0 && (
                  <button
                    onClick={clearSearchHistory}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {(prefs.recentSearches || []).slice(0, 8).map((s, i) => (
                  <p key={i} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    → {s}
                  </p>
                ))}
                {(prefs.recentSearches || []).length === 0 && (
                  <p className="text-xs text-gray-400">No recent searches</p>
                )}
              </div>
            </div>

            {/* Dark Mode */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a1a1a]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Dark Mode</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Toggle dark/light theme</p>
                </div>
                <button
                  onClick={toggle}
                  className={`w-11 h-6 rounded-full relative transition-colors ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isDark ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
