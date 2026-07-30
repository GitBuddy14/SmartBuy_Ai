/**
 * Wishlist.jsx (page)
 * Saved products wishlist with remove functionality.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useDarkMode } from '../hooks/useDarkMode';
import { useChat } from '../hooks/useChat';
import { getWishlist, removeFromWishlist } from '../services/ProductService';
import { formatTime } from '../utils/helpers';

export default function WishlistPage() {
  const { isDark, toggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sessions, activeSessionId, startNewChat, loadSession, removeSession } = useChat();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    setWishlist(getWishlist());
  }, []);

  const handleRemove = (productId) => {
    const updated = removeFromWishlist(productId);
    setWishlist(updated);
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
            Back
          </Link>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Wishlist</h1>
          <span className="ml-auto text-xs text-gray-400">{wishlist.length} items</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#0d0d0d]">
          <div className="max-w-4xl mx-auto">
            {wishlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Heart size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your wishlist is empty</p>
                <p className="text-xs text-gray-400 mb-4">Save products from the Dashboard to track them here</p>
                <Link
                  to="/"
                  className="px-4 py-2 text-sm rounded-lg bg-gray-900 dark:bg-gray-100
                             text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlist.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 px-4 py-4 rounded-xl
                               border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800
                                    flex items-center justify-center flex-shrink-0">
                      <ShoppingBag size={16} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{product.category}</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{product.price}</span>
                        {product.score && (
                          <span className="text-xs text-gray-400">Score: {product.score}/10</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-gray-400">{formatTime(product.addedAt)}</span>
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500
                                   hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
