/**
 * PriceCard.jsx
 * Displays a price alert card with current price, target, and status.
 */

import React from 'react';
import { Bell, BellOff, Trash2, TrendingDown, CheckCircle } from 'lucide-react';
import { formatTime } from '../utils/helpers';

export default function PriceCard({ alert, onDelete, onToggle }) {
  const isTriggered = parseFloat(String(alert.currentPrice).replace(/[^0-9.]/g, ''))
    <= parseFloat(String(alert.targetPrice).replace(/[^0-9.]/g, ''));

  const statusColor = isTriggered
    ? 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    : alert.status === 'active'
    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    : 'text-gray-500 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4
                    bg-white dark:bg-[#1a1a1a] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {alert.product}
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">{formatTime(alert.createdAt)}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle?.(alert.id, alert.status === 'active' ? 'paused' : 'active')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {alert.status === 'active' ? <Bell size={13} /> : <BellOff size={13} />}
          </button>
          <button
            onClick={() => onDelete?.(alert.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500
                       hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Prices */}
      <div className="flex items-center gap-4 mb-3">
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">Current</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{alert.currentPrice}</p>
        </div>
        <TrendingDown size={16} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">Target</p>
          <p className="text-sm font-bold text-green-600">{alert.targetPrice}</p>
        </div>
      </div>

      {/* Status badge */}
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColor}`}>
        {isTriggered ? (
          <><CheckCircle size={10} /> Price Reached!</>
        ) : alert.status === 'active' ? (
          <><Bell size={10} /> Watching</>
        ) : (
          <><BellOff size={10} /> Paused</>
        )}
      </div>
    </div>
  );
}
