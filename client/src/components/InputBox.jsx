/**
 * InputBox.jsx
 * Bottom input area with text, image upload, and voice input.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Send, Image, Mic, MicOff, X, Paperclip } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { fileToBase64 } from '../utils/helpers';

// ─────────────────────────────────────────────
export default function InputBox({ onSend, isLoading, disabled }) {
  const [text, setText] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Voice input
  const { isListening, isSupported, startListening, stopListening } = useVoiceInput((transcript) => {
    setText((prev) => prev ? `${prev} ${transcript}` : transcript);
    textareaRef.current?.focus();
  });

  // Auto-resize textarea
  const handleTextChange = (e) => {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  };

  // Submit
  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if ((!trimmed && !imageBase64) || isLoading || disabled) return;
    onSend(trimmed, imageBase64);
    setText('');
    setImageBase64(null);
    setImagePreview(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, imageBase64, isLoading, disabled, onSend]);

  // Enter key (Shift+Enter = newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Image upload
  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const b64 = await fileToBase64(file);
    setImageBase64(b64);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = '';
  };

  // Drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111] px-4 py-3">
      {/* ── Image Preview ── */}
      {imagePreview && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
            />
            <button
              onClick={() => { setImageBase64(null); setImagePreview(null); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 text-white
                         flex items-center justify-center hover:bg-red-500 transition-colors"
            >
              <X size={11} />
            </button>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Image attached</span>
        </div>
      )}

      {/* ── Input Container ── */}
      <div
        className={`flex items-end gap-2 border rounded-xl px-3 py-2.5 transition-colors
          ${dragOver ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-900' : 'border-gray-300 dark:border-gray-700'}
          bg-white dark:bg-[#1a1a1a] focus-within:border-gray-900 dark:focus-within:border-gray-400`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Image upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors
                     disabled:opacity-40 flex-shrink-0"
          title="Upload product image"
        >
          <Image size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? '🎤 Listening...' : 'Ask about any product…'}
          rows={1}
          disabled={isLoading || disabled}
          className={`flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100
                      placeholder-gray-400 dark:placeholder-gray-500
                      resize-none outline-none min-h-[24px] max-h-[160px] py-0.5
                      ${isListening ? 'placeholder-red-400' : ''}`}
        />

        {/* Voice input button */}
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          disabled={!isSupported || disabled}
          className={`p-1.5 transition-colors flex-shrink-0
            ${isListening
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }
            disabled:opacity-40`}
          title={isSupported ? (isListening ? 'Stop listening' : 'Voice input') : 'Voice not supported'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={(!text.trim() && !imageBase64) || isLoading || disabled}
          className="p-1.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
                     hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors flex-shrink-0"
          title="Send message"
        >
          <Send size={16} />
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-2">
        SmartBuy AI may make mistakes. Verify prices before purchasing.
      </p>
    </div>
  );
}
