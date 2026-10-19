/**
 * Message.jsx
 * Renders a single chat message — user or assistant.
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, ShoppingBag } from 'lucide-react';
import { formatTime } from '../utils/helpers';

// ─────────────────────────────────────────────
export default function Message({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex gap-3 px-4 py-4 ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {/* ── Assistant Avatar ── */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black dark:bg-white
                        flex items-center justify-center mt-0.5">
          <ShoppingBag size={14} className="text-white dark:text-black" />
        </div>
      )}

      {/* ── Message bubble ── */}
      <div className={`max-w-[82%] md:max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        {/* Image preview (if user uploaded) */}
        {isUser && message.imageBase64 && (
          <div className="mb-2 flex justify-end">
            <img
              src={message.imageBase64.startsWith('data:') ? message.imageBase64 : `data:image/jpeg;base64,${message.imageBase64}`}
              alt="Uploaded product"
              className="max-w-[200px] max-h-[200px] rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
            />
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${isUser
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-br-sm'
              : isError
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-bl-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
            }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Override links to open in new tab
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 dark:text-blue-400 underline">
                      {children}
                    </a>
                  ),
                  // Style inline code (react-markdown v9 compatibility)
                  code: ({ className, children, ...props }) => {
                    const isInline = !className && !String(children).includes('\n');
                    return isInline ? (
                      <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className={`text-[10px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity
                       ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>

      {/* ── User Avatar ── */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700
                        flex items-center justify-center mt-0.5">
          <User size={14} className="text-gray-600 dark:text-gray-300" />
        </div>
      )}
    </div>
  );
}
