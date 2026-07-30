/**
 * ProductService.js
 * Local product data management: wishlist, price alerts, history, comparisons.
 * Uses localStorage for persistence.
 */

// ─────────────────────────────────────────────
// Keys
// ─────────────────────────────────────────────
const KEYS = {
  WISHLIST: 'smartbuy_wishlist',
  PRICE_ALERTS: 'smartbuy_price_alerts',
  CHAT_SESSIONS: 'smartbuy_chat_sessions',
  COMPARISONS: 'smartbuy_comparisons',
  PREFERENCES: 'smartbuy_preferences',
  SPENDING: 'smartbuy_spending',
};

// ─────────────────────────────────────────────
// Generic helpers
// ─────────────────────────────────────────────
function load(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─────────────────────────────────────────────
// Wishlist
// ─────────────────────────────────────────────
export function getWishlist() {
  return load(KEYS.WISHLIST, []);
}

export function addToWishlist(product) {
  const list = getWishlist();
  const exists = list.find((p) => p.id === product.id);
  if (exists) return list;
  const updated = [{ ...product, addedAt: new Date().toISOString() }, ...list];
  save(KEYS.WISHLIST, updated);
  return updated;
}

export function removeFromWishlist(productId) {
  const list = getWishlist().filter((p) => p.id !== productId);
  save(KEYS.WISHLIST, list);
  return list;
}

// ─────────────────────────────────────────────
// Price Alerts
// ─────────────────────────────────────────────
export function getPriceAlerts() {
  return load(KEYS.PRICE_ALERTS, []);
}

export function addPriceAlert(alert) {
  const alerts = getPriceAlerts();
  const newAlert = {
    id: `alert_${Date.now()}`,
    ...alert,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  const updated = [newAlert, ...alerts];
  save(KEYS.PRICE_ALERTS, updated);
  return updated;
}

export function removePriceAlert(alertId) {
  const updated = getPriceAlerts().filter((a) => a.id !== alertId);
  save(KEYS.PRICE_ALERTS, updated);
  return updated;
}

export function updateAlertStatus(alertId, status) {
  const updated = getPriceAlerts().map((a) =>
    a.id === alertId ? { ...a, status } : a
  );
  save(KEYS.PRICE_ALERTS, updated);
  return updated;
}

// ─────────────────────────────────────────────
// Chat Sessions
// ─────────────────────────────────────────────
export function getChatSessions() {
  return load(KEYS.CHAT_SESSIONS, []);
}

export function saveChatSession(session) {
  const sessions = getChatSessions();
  const existing = sessions.findIndex((s) => s.id === session.id);
  let updated;
  if (existing >= 0) {
    updated = sessions.map((s) => (s.id === session.id ? session : s));
  } else {
    updated = [session, ...sessions];
  }
  // Keep only last 50 sessions
  save(KEYS.CHAT_SESSIONS, updated.slice(0, 50));
  return updated;
}

export function deleteChatSession(sessionId) {
  const updated = getChatSessions().filter((s) => s.id !== sessionId);
  save(KEYS.CHAT_SESSIONS, updated);
  return updated;
}

export function createNewSession() {
  return {
    id: `session_${Date.now()}`,
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────
// Recently Compared
// ─────────────────────────────────────────────
export function getComparisons() {
  return load(KEYS.COMPARISONS, []);
}

export function saveComparison(comparison) {
  const list = getComparisons();
  const updated = [{ ...comparison, id: `cmp_${Date.now()}`, date: new Date().toISOString() }, ...list].slice(0, 20);
  save(KEYS.COMPARISONS, updated);
  return updated;
}

// ─────────────────────────────────────────────
// User Preferences (memory for the agent)
// ─────────────────────────────────────────────
export function getPreferences() {
  return load(KEYS.PREFERENCES, {
    budget: null,
    preferredBrands: [],
    categories: [],
    recentSearches: [],
  });
}

export function updatePreferences(updates) {
  const prefs = getPreferences();
  const updated = { ...prefs, ...updates };
  save(KEYS.PREFERENCES, updated);
  return updated;
}

export function addRecentSearch(query) {
  const prefs = getPreferences();
  const searches = [query, ...(prefs.recentSearches || []).filter((s) => s !== query)].slice(0, 10);
  return updatePreferences({ recentSearches: searches });
}

// ─────────────────────────────────────────────
// Monthly Spending Estimate
// ─────────────────────────────────────────────
export function getSpendingData() {
  return load(KEYS.SPENDING, []);
}

export function recordSpending(amount, category) {
  const data = getSpendingData();
  const month = new Date().toISOString().slice(0, 7); // "2024-03"
  const existing = data.find((d) => d.month === month);
  let updated;
  if (existing) {
    updated = data.map((d) =>
      d.month === month
        ? { ...d, total: d.total + amount, items: d.items + 1, categories: { ...d.categories, [category]: (d.categories[category] || 0) + amount } }
        : d
    );
  } else {
    updated = [{ month, total: amount, items: 1, categories: { [category]: amount } }, ...data].slice(0, 12);
  }
  save(KEYS.SPENDING, updated);
  return updated;
}

// ─────────────────────────────────────────────
// Trending products (mock static data + AI-enhanced)
// ─────────────────────────────────────────────
export const TRENDING_PRODUCTS = [
  { id: 't1', name: 'OnePlus Nord CE 4', category: 'Smartphones', price: '₹24,999', trend: '↑ Hot', score: 8.7 },
  { id: 't2', name: 'boAt Rockerz 550', category: 'Headphones', price: '₹1,499', trend: '↑ Popular', score: 7.9 },
  { id: 't3', name: 'Acer Aspire 5', category: 'Laptops', price: '₹42,990', trend: '→ Stable', score: 8.2 },
  { id: 't4', name: 'Realme Watch 3', category: 'Smartwatches', price: '₹3,499', trend: '↑ Rising', score: 7.5 },
  { id: 't5', name: 'Logitech G102', category: 'Gaming', price: '₹1,395', trend: '↑ Trending', score: 9.0 },
  { id: 't6', name: 'Mi 80cm 4K TV', category: 'TVs', price: '₹44,999', trend: '↓ Price Drop', score: 8.4 },
];

export const CATEGORIES = [
  'Smartphones', 'Laptops', 'Headphones', 'Smartwatches', 'Cameras',
  'Gaming', 'TVs', 'Tablets', 'Speakers', 'Accessories',
];
