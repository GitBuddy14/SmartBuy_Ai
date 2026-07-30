/**
 * ChatWindow.jsx
 * Main chat area: header, messages list, suggestions, loading indicator.
 */

import React, { useEffect, useRef } from 'react';
import { ShoppingBag, RefreshCw } from 'lucide-react';
import Message from './Message';

// ─────────────────────────────────────────────
// Suggestion chips shown before first message
// ─────────────────────────────────────────────
const SUGGESTIONS = [
  'Find best laptop under ₹50,000',
  'Compare iPhone 15 vs Samsung S24',
  'Best gaming mouse under ₹2000',
  'Find cheapest noise-cancelling headphones',
  'Budget smartwatch with GPS',
];

// ─────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-4 justify-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
        <ShoppingBag size={14} className="text-white dark:text-black" />
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty state with suggestions
// ─────────────────────────────────────────────
function EmptyState({ onSuggestion }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center overflow-auto">
      <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center mb-5 flex-shrink-0">
        <ShoppingBag size={26} className="text-white dark:text-black" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        AI Shopping Agent
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-8">
        Compare products, detect fake reviews, find alternatives, and get the best buying advice — powered by Groq AI.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="text-left px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                       text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a1a]
                       hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800
                       transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main ChatWindow component
// ─────────────────────────────────────────────
export default function ChatWindow({ messages = [], isLoading, onSend, onClear }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-[#111111]">
      {/* ── Chat Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-black dark:bg-white flex items-center justify-center">
            <ShoppingBag size={14} className="text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none">
              AI Shopping Agent
            </h1>
            <p className="text-[10px] text-gray-400 mt-0.5">Powered by Groq</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isEmpty && (
            <button
              onClick={onClear}
              title="Clear chat"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={15} />
            </button>
          )}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20
                          border border-green-200 dark:border-green-800">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* ── Messages / Empty State ── */}
      {isEmpty ? (
        <EmptyState onSuggestion={onSend} />
      ) : (
        <div className="flex-1 overflow-y-auto chat-scroll">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} className="h-4" />
        </div>
      )}
    </div>
  );
}
