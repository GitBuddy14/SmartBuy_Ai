/**
 * helpers.js
 * Utility functions used across the app.
 */

// Generate unique ID
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Format timestamp to readable string
export function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Truncate text to max length
export function truncate(text, max = 60) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

// Extract a clean session title from the first user message
export function extractSessionTitle(message = '') {
  const cleaned = message.replace(/[#*`_~]/g, '').trim();
  return truncate(cleaned, 50) || 'New Chat';
}

// Convert file to base64
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]); // strip data: prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Detect if the message is asking about a comparison
export function isComparisonQuery(text) {
  return /vs|versus|compare|difference between|better|which one/i.test(text);
}

// Detect if the message is about price/budget
export function isPriceQuery(text) {
  return /price|cost|cheap|budget|afford|₹|rs\.|rupee|under|below|expensive/i.test(text);
}

// Extract budget from text
export function extractBudget(text) {
  const match = text.match(/(?:under|below|within|budget|₹|rs\.?)\s*(\d[\d,]*)/i);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''), 10);
  }
  return null;
}

// Format Indian currency
export function formatINR(amount) {
  if (!amount && amount !== 0) return 'N/A';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

// Debounce
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Capitalize first letter
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Score color
export function getScoreColor(score) {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  return 'text-red-500';
}
