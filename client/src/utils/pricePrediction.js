/**
 * pricePrediction.js
 * Heuristic-based price prediction and buying recommendation engine.
 */

// ─────────────────────────────────────────────
// Sale seasons (India-focused)
// ─────────────────────────────────────────────
const SALE_EVENTS = [
  { name: 'Republic Day Sale', month: 1, days: [24, 25, 26] },
  { name: 'Holi Sale', month: 3, days: [24, 25] },
  { name: 'Amazon Summer Sale', month: 5, days: [15, 16, 17] },
  { name: 'Independence Day Sale', month: 8, days: [13, 14, 15] },
  { name: 'Onam Sale', month: 9, days: [5, 6, 7, 8] },
  { name: 'Big Billion Days', month: 10, days: [8, 9, 10, 11, 12] },
  { name: 'Great Indian Festival', month: 10, days: [7, 8, 9, 10] },
  { name: 'Diwali Sale', month: 11, days: [1, 2, 3, 4] },
  { name: 'Black Friday', month: 11, days: [28, 29, 30] },
  { name: 'Year End Sale', month: 12, days: [25, 26, 27, 28, 29, 30, 31] },
];

// ─────────────────────────────────────────────
// Get upcoming sale
// ─────────────────────────────────────────────
export function getUpcomingSale() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  // Check if any sale is active now
  for (const event of SALE_EVENTS) {
    if (event.month === currentMonth && event.days.includes(currentDay)) {
      return { name: event.name, status: 'active', daysAway: 0 };
    }
  }

  // Find next upcoming sale
  for (const event of SALE_EVENTS) {
    const saleDate = new Date(now.getFullYear(), event.month - 1, event.days[0]);
    if (saleDate > now) {
      const daysAway = Math.ceil((saleDate - now) / (1000 * 60 * 60 * 24));
      return { name: event.name, status: 'upcoming', daysAway };
    }
  }

  // Next year's first sale
  const firstSale = SALE_EVENTS[0];
  const nextYear = new Date(now.getFullYear() + 1, firstSale.month - 1, firstSale.days[0]);
  const daysAway = Math.ceil((nextYear - now) / (1000 * 60 * 60 * 24));
  return { name: firstSale.name, status: 'upcoming', daysAway };
}

// ─────────────────────────────────────────────
// Price prediction for a category
// ─────────────────────────────────────────────
const CATEGORY_PRICE_TRENDS = {
  smartphone: { trend: 'stable', volatility: 'medium', bestTime: 'Festive season (Oct–Nov)' },
  laptop: { trend: 'falling', volatility: 'low', bestTime: 'Back-to-school (Jul–Aug) or Year-end' },
  headphones: { trend: 'stable', volatility: 'low', bestTime: 'Any major sale event' },
  smartwatch: { trend: 'falling', volatility: 'medium', bestTime: 'Big Billion Days or Black Friday' },
  tv: { trend: 'falling', volatility: 'high', bestTime: 'IPL season (Mar–Apr) or Diwali' },
  camera: { trend: 'stable', volatility: 'low', bestTime: 'Year-end sale' },
  gaming: { trend: 'stable', volatility: 'medium', bestTime: 'Year-end or Summer sale' },
  tablet: { trend: 'falling', volatility: 'medium', bestTime: 'Festive or Back-to-school' },
  default: { trend: 'stable', volatility: 'medium', bestTime: 'Any major sale event' },
};

export function detectCategory(productName) {
  const lower = productName.toLowerCase();
  if (/phone|iphone|samsung|oneplus|redmi|oppo|vivo|pixel|mobile/.test(lower)) return 'smartphone';
  if (/laptop|macbook|notebook|chromebook|thinkpad|dell|hp|lenovo|asus/.test(lower)) return 'laptop';
  if (/headphone|earphone|earbud|airpod|boat|jbl|sony wh|bose/.test(lower)) return 'headphones';
  if (/watch|band|fitbit|garmin|amazfit|mi band/.test(lower)) return 'smartwatch';
  if (/tv|television|monitor|oled|qled/.test(lower)) return 'tv';
  if (/camera|dslr|mirrorless|gopro|canon|nikon/.test(lower)) return 'camera';
  if (/mouse|keyboard|gpu|gaming|headset|controller|joystick/.test(lower)) return 'gaming';
  if (/tablet|ipad|samsung tab/.test(lower)) return 'tablet';
  return 'default';
}

export function getPricePrediction(productName) {
  const category = detectCategory(productName);
  const categoryData = CATEGORY_PRICE_TRENDS[category] || CATEGORY_PRICE_TRENDS.default;
  const sale = getUpcomingSale();

  let recommendation;
  let signal;

  if (sale.status === 'active') {
    recommendation = 'BUY NOW';
    signal = `🟢 ${sale.name} is active — great time to buy!`;
  } else if (sale.daysAway <= 14) {
    recommendation = 'WAIT';
    signal = `🟡 ${sale.name} in ${sale.daysAway} days — wait for better deal`;
  } else if (categoryData.trend === 'falling') {
    recommendation = 'WAIT';
    signal = `🟡 Prices for this category are trending down. Consider waiting.`;
  } else {
    recommendation = 'BUY NOW';
    signal = `🟢 Price is stable. No major sale soon (${sale.daysAway} days away).`;
  }

  return {
    recommendation,
    signal,
    category,
    priceTrend: categoryData.trend,
    volatility: categoryData.volatility,
    bestTime: categoryData.bestTime,
    upcomingSale: sale,
  };
}

// ─────────────────────────────────────────────
// Overall buying score calculator
// ─────────────────────────────────────────────
export function calculateBuyingScore({ priceScore = 7, qualityScore = 7, reviewScore = 7, valueScore = 7 }) {
  const overall = Math.round((priceScore * 0.3 + qualityScore * 0.3 + reviewScore * 0.2 + valueScore * 0.2) * 10) / 10;
  let label;
  if (overall >= 8.5) label = 'Excellent Buy';
  else if (overall >= 7) label = 'Good Buy';
  else if (overall >= 5.5) label = 'Average';
  else label = 'Poor Value';
  return { overall, label, priceScore, qualityScore, reviewScore, valueScore };
}
