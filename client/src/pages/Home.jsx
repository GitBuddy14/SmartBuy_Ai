/**
 * Home.jsx
 * Main chat page — renders Sidebar + ChatWindow + InputBox.
 */

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import InputBox from '../components/InputBox';
import { useChat } from '../hooks/useChat';
import { useDarkMode } from '../hooks/useDarkMode';

export default function Home() {
  const { isDark, toggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    sessions,
    activeSession,
    activeSessionId,
    messages,
    isLoading,
    error,
    sendMessage,
    startNewChat,
    loadSession,
    removeSession,
    clearChat,
  } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#111111]">
      {/* ── Sidebar ── */}
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

      {/* ── Main Area ── */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* Mobile top bar — only visible on small screens */}
        <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Shopping Agent</span>
        </div>

        {/* Chat Window — grows to fill space */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onClear={clearChat}
        />

        {/* Input Box — sticks to bottom */}
        <InputBox
          onSend={sendMessage}
          isLoading={isLoading}
          disabled={false}
        />
      </div>
    </div>
  );
}
