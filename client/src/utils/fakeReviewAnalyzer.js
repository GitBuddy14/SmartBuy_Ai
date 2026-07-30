/**
 * fakeReviewAnalyzer.js
 * Algorithm to estimate fake review probability based on heuristic signals.
 */

// ─────────────────────────────────────────────
// Pattern lists
// ─────────────────────────────────────────────
const SPAM_PHRASES = [
  'best product ever', 'must buy', 'amazing quality', 'highly recommend',
  'perfect product', 'love it so much', 'five stars', 'no complaints',
  'outstanding', 'exceeded expectations', 'mind blowing', 'very very good',
  'superb quality', 'worth every penny', 'game changer',
];

const NEGATIVE_SPAM_PHRASES = [
  'worst product', 'total waste', 'do not buy', 'very bad quality',
  'terrible', 'absolute garbage', 'stopped working', 'money wasted',
  'complete fraud', 'fake product',
];

const GENERIC_PHRASES = [
  'good product', 'nice product', 'ok product', 'average product',
  'decent', 'works fine', 'as expected', 'as described',
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function containsPhrase(text, phrases) {
  const lower = text.toLowerCase();
  return phrases.filter((p) => lower.includes(p)).length;
}

function wordCount(text) {
  return text.trim().split(/\s+/).length;
}

function hasExcessivePunctuation(text) {
  const exclCount = (text.match(/!/g) || []).length;
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  return exclCount > 3 || capsRatio > 0.4;
}

function hasRepetition(text) {
  const words = text.toLowerCase().split(/\s+/);
  const freq = {};
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  const repeated = Object.values(freq).filter((c) => c > 3).length;
  return repeated > 2;
}

// ─────────────────────────────────────────────
// Main analyzer
// ─────────────────────────────────────────────
export function analyzeReviewText(reviewText) {
  if (!reviewText || reviewText.trim().length < 5) {
    return { fake: 50, real: 50, confidence: 30, label: 'Insufficient Data', reason: 'Review is too short to analyze.' };
  }

  let fakeScore = 0;
  const signals = [];

  // 1. Word count check (very short or very long generic reviews)
  const wc = wordCount(reviewText);
  if (wc < 8) { fakeScore += 20; signals.push('Very short review'); }
  else if (wc > 200) { fakeScore += 10; signals.push('Unusually long review'); }

  // 2. Spam phrases
  const spamHits = containsPhrase(reviewText, SPAM_PHRASES);
  if (spamHits >= 3) { fakeScore += 30; signals.push(`${spamHits} promotional phrases detected`); }
  else if (spamHits >= 1) { fakeScore += 10; signals.push(`${spamHits} generic positive phrase`); }

  // 3. Negative spam
  const negHits = containsPhrase(reviewText, NEGATIVE_SPAM_PHRASES);
  if (negHits >= 2) { fakeScore += 25; signals.push(`${negHits} extreme negative phrases`); }

  // 4. Generic phrases
  const genericHits = containsPhrase(reviewText, GENERIC_PHRASES);
  if (genericHits >= 2) { fakeScore += 15; signals.push('Very generic language'); }

  // 5. Excessive punctuation / caps
  if (hasExcessivePunctuation(reviewText)) { fakeScore += 15; signals.push('Excessive caps/punctuation'); }

  // 6. Repetition
  if (hasRepetition(reviewText)) { fakeScore += 20; signals.push('Word repetition detected'); }

  // Cap at 95
  fakeScore = Math.min(95, fakeScore);
  const realScore = 100 - fakeScore;

  // Confidence based on number of signals
  const confidence = Math.min(95, 40 + signals.length * 10);

  let label = 'Likely Genuine';
  if (fakeScore >= 70) label = 'Likely Fake';
  else if (fakeScore >= 45) label = 'Suspicious';
  else if (fakeScore >= 25) label = 'Partially Suspicious';

  const reason = signals.length > 0
    ? `Detected: ${signals.join('; ')}`
    : 'No suspicious patterns found';

  return {
    fake: fakeScore,
    real: realScore,
    confidence,
    label,
    reason,
    signals,
  };
}

// ─────────────────────────────────────────────
// Batch analyzer for multiple reviews
// ─────────────────────────────────────────────
export function analyzeBatchReviews(reviews = []) {
  if (!reviews.length) return { avgFake: 0, avgReal: 100, totalAnalyzed: 0, results: [] };

  const results = reviews.map((r) => analyzeReviewText(typeof r === 'string' ? r : r.text));
  const avgFake = Math.round(results.reduce((s, r) => s + r.fake, 0) / results.length);

  return {
    avgFake,
    avgReal: 100 - avgFake,
    totalAnalyzed: reviews.length,
    overallLabel: avgFake >= 60 ? 'High Fake Risk' : avgFake >= 35 ? 'Moderate Risk' : 'Low Fake Risk',
    results,
  };
}

// ─────────────────────────────────────────────
// Sentiment classifier
// ─────────────────────────────────────────────
export function classifySentiment(text) {
  const lower = text.toLowerCase();
  const positive = containsPhrase(lower, ['good', 'great', 'excellent', 'love', 'amazing', 'perfect', 'best', 'happy', 'satisfied']);
  const negative = containsPhrase(lower, ['bad', 'worst', 'terrible', 'hate', 'disappointed', 'broken', 'waste', 'poor', 'awful']);

  if (positive > negative + 1) return { sentiment: 'Positive', score: Math.min(positive * 15, 90) };
  if (negative > positive + 1) return { sentiment: 'Negative', score: Math.min(negative * 15, 90) };
  return { sentiment: 'Neutral', score: 50 };
}
