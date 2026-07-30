/**
 * useChat.js
 * Custom hook managing chat state, sessions, and Groq communication.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/GroqService';
import {
  getChatSessions,
  saveChatSession,
  createNewSession,
  deleteChatSession,
  addRecentSearch,
  updatePreferences,
  getPreferences,
} from '../services/ProductService';
import { generateId, extractSessionTitle, extractBudget } from '../utils/helpers';

export function useChat() {
  const [sessions, setSessions] = useState(() => getChatSessions());
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // Active session derived from sessions list
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages = activeSession?.messages || [];

  // ── Start a new chat ──
  const startNewChat = useCallback(() => {
    const session = createNewSession();
    setSessions((prev) => {
      const updated = [session, ...prev];
      return updated;
    });
    setActiveSessionId(session.id);
    setError(null);
    return session;
  }, []);

  // ── Load a session ──
  const loadSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
    setError(null);
  }, []);

  // ── Delete a session ──
  const removeSession = useCallback((sessionId) => {
    const updated = deleteChatSession(sessionId);
    setSessions(updated);
    if (activeSessionId === sessionId) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null);
    }
  }, [activeSessionId]);

  // ── Send a message ──
  const sendMessage = useCallback(async (text, imageBase64 = null) => {
    if (!text.trim() && !imageBase64) return;

    // If no active session, create one
    let sessionId = activeSessionId;
    let currentSession = sessions.find((s) => s.id === sessionId);

    if (!currentSession) {
      const newSess = createNewSession();
      currentSession = newSess;
      sessionId = newSess.id;
      setSessions((prev) => [newSess, ...prev]);
      setActiveSessionId(sessionId);
    }

    // Build user message
    const userMsg = {
      id: generateId('msg'),
      role: 'user',
      content: text,
      imageBase64,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update UI
    const updatedMessages = [...currentSession.messages, userMsg];
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages,
      title: currentSession.title === 'New Chat' ? extractSessionTitle(text) : currentSession.title,
      updatedAt: new Date().toISOString(),
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? updatedSession : s))
    );
    saveChatSession(updatedSession);

    // Remember budget/search in preferences
    const budget = extractBudget(text);
    if (budget) updatePreferences({ budget });
    if (text.length > 3) addRecentSearch(text);

    setIsLoading(true);
    setError(null);

    try {
      // Build history for Groq (last 20 messages for context)
      const historyForGroq = updatedMessages.slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await sendChatMessage(historyForGroq, text, imageBase64);

      const assistantMsg = {
        id: generateId('msg'),
        role: 'assistant',
        content: result.content || result.message || 'No response received.',
        timestamp: new Date().toISOString(),
        usage: result.usage,
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      const finalSession = {
        ...updatedSession,
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? finalSession : s))
      );
      saveChatSession(finalSession);
    } catch (err) {
      setError(err.message);
      const errMsg = {
        id: generateId('msg'),
        role: 'assistant',
        content: `⚠️ **Error:** ${err.message}\n\nPlease try again or check your connection.`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      const errSession = {
        ...updatedSession,
        messages: [...updatedMessages, errMsg],
        updatedAt: new Date().toISOString(),
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? errSession : s))
      );
      saveChatSession(errSession);
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId, sessions]);

  // ── Clear current chat ──
  const clearChat = useCallback(() => {
    if (!activeSessionId) return;
    const cleared = sessions.find((s) => s.id === activeSessionId);
    if (!cleared) return;
    const updated = { ...cleared, messages: [], updatedAt: new Date().toISOString() };
    setSessions((prev) => prev.map((s) => (s.id === activeSessionId ? updated : s)));
    saveChatSession(updated);
  }, [activeSessionId, sessions]);

  return {
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
    setError,
  };
}
