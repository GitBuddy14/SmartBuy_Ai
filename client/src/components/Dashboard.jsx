/**
 * Dashboard.jsx (component)
 * Dashboard cards: trending, wishlist, price alerts, comparisons, sustainability, etc.
 */

import React from 'react';
import { TrendingUp, Heart, Bell, BarChart2, Leaf, Tag, DollarSign, RefreshCw } from 'lucide-react';
import ProductCard from './ProductCard';
import PriceCard from './PriceCard';
import { TRENDING_PRODUCTS } from '../services/ProductService';
import { getScoreColor, formatTime } from '../utils/helpers';

// ─────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <Icon size={14} className="text-gray-600 dark:text-gray-400" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {subtitle && <p className="text-[10px] text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Spending card
// ─────────────────────────────────────────────
function SpendingCard({ spending }) {
  const total = spending.reduce((s, m) => s + m.total, 0);
  const thisMonth = spending.find((m) => m.month === new Date().toISOString().slice(0, 7));

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-[#1a1a1a]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Monthly Spending</p>
        <DollarSign size={14} className="text-gray-400" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        ₹{(thisMonth?.total || 0).toLocaleString('en-IN')}
      </p>
      <p className="text-[10px] text-gray-400 mt-1">This month · {thisMonth?.items || 0} items</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sustainability card
// ─────────────────────────────────────────────
function SustainabilityCard({ score = 72 }) {
  const color = score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-500';
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-[#1a1a1a]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Sustainability Score</p>
        <Leaf size={14} className="text-green-500" />
      </div>
      <p className={`text-2xl font-bold ${color}`}>{score}%</p>
      <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
        <div className="h-1.5 rounded-full bg-green-500 transition-all" style={{ width: `${score}%` }} />
      </div>
      <p className="text-[10px] text-gray-400 mt-1">Eco-friendly shopping habits</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Favorite categories
// ─────────────────────────────────────────────
function FavoriteCategories({ categories = [] }) {
  const display = categories.length > 0
    ? categories
    : ['Smartphones', 'Laptops', 'Headphones'];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-[#1a1a1a]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Favorite Categories</p>
        <Tag size={14} className="text-gray-400" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {display.map((cat) => (
          <span key={cat} className="px-2 py-0.5 rounded-full text-[11px]
                                     bg-gray-100 dark:bg-gray-800
                                     text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dashboard component
// ─────────────────────────────────────────────
export default function DashboardComponent({
  wishlist = [],
  priceAlerts = [],
  comparisons = [],
  spending = [],
  preferences = {},
  onDeleteAlert,
  onToggleAlert,
  onWishlistAdd,
}) {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0d0d0d] p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Top stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SpendingCard spending={spending} />
          <SustainabilityCard score={72} />
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-[#1a1a1a]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Wishlist</p>
              <Heart size={14} className="text-red-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{wishlist.length}</p>
            <p className="text-[10px] text-gray-400 mt-1">Saved products</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-[#1a1a1a]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Price Alerts</p>
              <Bell size={14} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{priceAlerts.length}</p>
            <p className="text-[10px] text-gray-400 mt-1">Active alerts</p>
          </div>
        </div>

        {/* ── Trending Products ── */}
        <div>
          <SectionHeader icon={TrendingUp} title="Trending Products" subtitle="Hot picks right now" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TRENDING_PRODUCTS.map((p) => (
              <ProductCard key={p.id} product={p} onWishlistAdd={onWishlistAdd} />
            ))}
          </div>
        </div>

        {/* ── Price Alerts ── */}
        {priceAlerts.length > 0 && (
          <div>
            <SectionHeader icon={Bell} title="Price Alerts" subtitle="Tracking your targets" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {priceAlerts.slice(0, 6).map((alert) => (
                <PriceCard
                  key={alert.id}
                  alert={alert}
                  onDelete={onDeleteAlert}
                  onToggle={onToggleAlert}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Wishlist preview ── */}
        {wishlist.length > 0 && (
          <div>
            <SectionHeader icon={Heart} title="Wishlist" subtitle="Products you've saved" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {wishlist.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} onWishlistAdd={onWishlistAdd} />
              ))}
            </div>
          </div>
        )}

        {/* ── Recently Compared ── */}
        {comparisons.length > 0 && (
          <div>
            <SectionHeader icon={BarChart2} title="Recently Compared" subtitle="Your comparison history" />
            <div className="space-y-2">
              {comparisons.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-xl
                                           border border-gray-200 dark:border-gray-700
                                           bg-white dark:bg-[#1a1a1a]">
                  <BarChart2 size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {c.product1} vs {c.product2}
                  </span>
                  <span className="ml-auto text-[10px] text-gray-400">{formatTime(c.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Favorite categories ── */}
        <FavoriteCategories categories={preferences?.preferredBrands || []} />
      </div>
    </div>
  );
}
