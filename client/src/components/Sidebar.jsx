/**
 * Sidebar.jsx
 * Left navigation sidebar with chat history, nav links, and controls.
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  MessageSquare,
  BarChart2,
  Heart,
  Bell,
  Settings,
  Sun,
  Moon,
  Trash2,
  X,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { truncate, formatTime } from '../utils/helpers';

// ─────────────────────────────────────────────
export default function Sidebar({
  sessions = [],
  activeSessionId,
  onNewChat,
  onLoadSession,
  onDeleteSession,
  isDark,
  onToggleDark,
  isOpen,
  onClose,
}) {
  const location = useLocation();
  const [hoveredSession, setHoveredSession] = useState(null);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: BarChart2 },
    { to: '/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/alerts', label: 'Price Alerts', icon: Bell },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const sidebarClasses = `
    flex flex-col h-screen w-64 border-r transition-all duration-200
    bg-white dark:bg-[#111111]
    border-gray-200 dark:border-gray-800
    fixed top-0 left-0 z-40
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static md:flex-shrink-0
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* ── Header / Logo ── */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-7 h-7 bg-black dark:bg-white rounded-md flex items-center justify-center flex-shrink-0">
              <ShoppingBag size={15} className="text-white dark:text-black" />
            </div>
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight">
              AI Shopping<br />Agent
            </span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── New Chat Button ── */}
        <div className="px-3 pt-3">
          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700
                       text-sm font-medium text-gray-700 dark:text-gray-300
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        {/* ── Nav Links ── */}
        <nav className="px-3 pt-3 space-y-0.5">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                ${location.pathname === to
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Divider + History ── */}
        <div className="flex-1 overflow-y-auto mt-3 min-h-0">
          {sessions.length > 0 && (
            <div className="px-3">
              <p className="px-3 py-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                History
              </p>
              <div className="space-y-0.5">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer transition-colors
                      ${activeSessionId === session.id
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                    onClick={() => { onLoadSession(session.id); onClose(); }}
                    onMouseEnter={() => setHoveredSession(session.id)}
                    onMouseLeave={() => setHoveredSession(null)}
                  >
                    <MessageSquare size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">
                      {truncate(session.title, 28)}
                    </span>
                    {(hoveredSession === session.id || activeSessionId === session.id) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                        className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom: Dark Mode + IBM ── */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-3 space-y-1">
          <button
            onClick={onToggleDark}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                       text-gray-600 dark:text-gray-400
                       hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
            <div className={`w-9 h-5 rounded-full relative transition-colors ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isDark ? 'left-4' : 'left-0.5'}`} />
            </div>
          </button>
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 pt-1">
            Powered by IBM BOB
          </p>
        </div>
      </aside>
    </>
  );
}
