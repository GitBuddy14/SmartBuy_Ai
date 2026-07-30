/**
 * ComparisonTable.jsx
 * Renders a side-by-side product comparison with scores.
 */

import React from 'react';
import { CheckCircle, XCircle, Award } from 'lucide-react';

export default function ComparisonTable({ product1, product2, winner }) {
  const rows = [
    { label: 'Price', key: 'price' },
    { label: 'Rating', key: 'rating' },
    { label: 'Battery', key: 'battery' },
    { label: 'Camera', key: 'camera' },
    { label: 'Display', key: 'display' },
    { label: 'Processor', key: 'processor' },
    { label: 'Storage', key: 'storage' },
    { label: 'Value Score', key: 'valueScore' },
  ];

  if (!product1 || !product2) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a]">
      {/* Header */}
      <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-gray-50 dark:bg-gray-800" />
        <div className={`p-3 text-center border-r border-gray-200 dark:border-gray-700
                        ${winner === product1.name ? 'bg-gray-900 dark:bg-gray-100' : 'bg-white dark:bg-[#1a1a1a]'}`}>
          <p className={`text-xs font-semibold ${winner === product1.name ? 'text-white dark:text-gray-900' : 'text-gray-900 dark:text-gray-100'}`}>
            {product1.name}
          </p>
          {winner === product1.name && (
            <span className="inline-flex items-center gap-1 text-[10px] text-yellow-400 font-medium mt-0.5">
              <Award size={10} /> Winner
            </span>
          )}
        </div>
        <div className={`p-3 text-center ${winner === product2.name ? 'bg-gray-900 dark:bg-gray-100' : 'bg-white dark:bg-[#1a1a1a]'}`}>
          <p className={`text-xs font-semibold ${winner === product2.name ? 'text-white dark:text-gray-900' : 'text-gray-900 dark:text-gray-100'}`}>
            {product2.name}
          </p>
          {winner === product2.name && (
            <span className="inline-flex items-center gap-1 text-[10px] text-yellow-400 font-medium mt-0.5">
              <Award size={10} /> Winner
            </span>
          )}
        </div>
      </div>

      {/* Rows */}
      {rows.map(({ label, key }, i) => {
        const val1 = product1[key] || '—';
        const val2 = product2[key] || '—';

        return (
          <div
            key={key}
            className={`grid grid-cols-3 border-b border-gray-100 dark:border-gray-800 last:border-0
                        ${i % 2 === 0 ? 'bg-white dark:bg-[#1a1a1a]' : 'bg-gray-50/50 dark:bg-gray-900/30'}`}
          >
            <div className="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400 font-medium border-r border-gray-100 dark:border-gray-800">
              {label}
            </div>
            <div className="px-3 py-2.5 text-xs text-gray-900 dark:text-gray-100 text-center border-r border-gray-100 dark:border-gray-800">
              {val1}
            </div>
            <div className="px-3 py-2.5 text-xs text-gray-900 dark:text-gray-100 text-center">
              {val2}
            </div>
          </div>
        );
      })}
    </div>
  );
}
