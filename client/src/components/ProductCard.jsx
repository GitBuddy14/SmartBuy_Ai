/**
 * ProductCard.jsx
 * Displays a product with score, trend badge, and wishlist action.
 */

import React from 'react';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { addToWishlist, removeFromWishlist, getWishlist } from '../services/ProductService';
import { getScoreColor } from '../utils/helpers';

export default function ProductCard({ product, onWishlistAdd }) {
  const wishlist = getWishlist();
  const isWishlisted = wishlist.some((p) => p.id === product.id);

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    if (onWishlistAdd) onWishlistAdd(product);
  };

  const TrendIcon = product.trend?.includes('↑')
    ? TrendingUp
    : product.trend?.includes('↓')
    ? TrendingDown
    : Minus;

  const trendColor = product.trend?.includes('↑')
    ? 'text-green-600'
    : product.trend?.includes('↓')
    ? 'text-red-500'
    : 'text-gray-500';

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4
                    bg-white dark:bg-[#1a1a1a] hover:border-gray-400 dark:hover:border-gray-500
                    transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{product.category}</p>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug truncate">
            {product.name}
          </h3>
        </div>
        <button
          onClick={handleWishlist}
          title={isWishlisted ? 'In wishlist' : 'Add to wishlist'}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0
            ${isWishlisted
              ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
        >
          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Price + Trend */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-gray-900 dark:text-gray-100">
          {product.price}
        </span>
        <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon size={12} />
          {product.trend?.replace(/[↑↓→]/g, '').trim()}
        </span>
      </div>

      {/* Score bar */}
      {product.score && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400">Score</span>
            <span className={`text-xs font-semibold ${getScoreColor(product.score)}`}>
              {product.score}/10
            </span>
          </div>
          <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full">
            <div
              className="h-1 rounded-full bg-gray-800 dark:bg-gray-200 transition-all"
              style={{ width: `${product.score * 10}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
