/**
 * index.js — SmartBuy AI Express Backend
 *
 * Routes:
 *   GET  /api/health       — health check
 *   POST /api/chat         — Groq chat completion
 *   POST /api/search       — product search (AI-powered)
 *   POST /api/compare      — product comparison (AI-powered)
 *   POST /api/price        — price prediction
 *   POST /api/reviews      — review analysis
 *   POST /api/alternatives — alternative finder
 *   GET  /api/alerts       — price alerts (in-memory store)
 *   POST /api/alerts       — create alert
 *   DELETE /api/alerts/:id — remove alert
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json({ limit: '10mb' })); // allow image uploads as base64

// Rate limiting — 100 requests per 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ─────────────────────────────────────────────
// Groq API config
// ─────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Updated: llama3-70b-8192 decommissioned

// ─────────────────────────────────────────────
// Helper: call Groq
// ─────────────────────────────────────────────
async function callGroq(systemPrompt, userContent, maxTokens = 2048) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables.');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 55000,
    }
  );

  return response.data.choices[0].message.content;
}

// ─────────────────────────────────────────────
// Helper: call Groq with full message history
// ─────────────────────────────────────────────
async function callGroqWithHistory(systemPrompt, messages, maxTokens = 2048) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables.');
  }

  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: GROQ_MODEL,
      messages: allMessages,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 55000,
    }
  );

  const choice = response.data.choices[0];
  return {
    content: choice.message.content,
    usage: response.data.usage,
    model: response.data.model,
  };
}

// ─────────────────────────────────────────────
// System Prompts
// ─────────────────────────────────────────────
const SHOPPING_SYSTEM_PROMPT = `You are SmartBuy AI, an expert shopping assistant with deep product knowledge.

When asked about products, ALWAYS structure your response in markdown with:

## 🛍️ Product Overview
Brief description

## 📊 Comparison Table (when comparing two products)
Use a markdown table: | Feature | Product A | Product B |

## ✅ Pros & Cons
### Pros
- list

### Cons  
- list

## 💰 Price & Value Analysis
- Price range in ₹ (Indian Rupees unless context says otherwise)
- Value for money score (X/10)
- Price trend: Rising / Stable / Falling

## ⭐ Review Analysis
- Overall rating estimate
- Fake review risk: Low / Medium / High
- Authenticity confidence: X%

## 🏆 Recommendation
**Overall Score:** X/10
**Buy Now or Wait:** clear recommendation with reasoning
**Best Time to Buy:** specific sale events, months

## 🔄 Better Alternatives
1. **Better pick:** name — reason
2. **Budget option:** name — reason  
3. **Premium option:** name — reason

---
Always mention real Indian sale events (Big Billion Days, Great Indian Festival, Republic Day Sale, etc.) for best buying time.
Be specific, accurate, and helpful.`;

const SEARCH_SYSTEM_PROMPT = `You are a product search engine assistant. When given a product query, return a structured list of the top 5 matching products.

Format as JSON array:
[
  {
    "name": "Product Name",
    "category": "Category",
    "priceRange": "₹X,XXX - ₹Y,YYY",
    "rating": "4.2/5",
    "highlights": ["feature1", "feature2"],
    "buyNow": true/false,
    "reason": "brief reason"
  }
]

Return ONLY valid JSON, no extra text.`;

const COMPARE_SYSTEM_PROMPT = `You are a product comparison expert. Compare the two given products and return structured JSON.

Return this exact JSON format:
{
  "product1": {
    "name": "Product 1 name",
    "price": "₹XX,XXX",
    "rating": "4.2/5",
    "battery": "value or N/A",
    "camera": "value or N/A",
    "display": "value or N/A",
    "processor": "value or N/A",
    "storage": "value or N/A",
    "valueScore": "8/10"
  },
  "product2": {
    "name": "Product 2 name",
    "price": "₹XX,XXX",
    "rating": "4.5/5",
    "battery": "value or N/A",
    "camera": "value or N/A",
    "display": "value or N/A",
    "processor": "value or N/A",
    "storage": "value or N/A",
    "valueScore": "7/10"
  },
  "winner": "Product Name",
  "reason": "Clear explanation of why the winner is better",
  "recommendation": "Buy Now / Wait",
  "bestAlternative": "Alternative product name if exists"
}

Return ONLY valid JSON.`;

const PRICE_SYSTEM_PROMPT = `You are a price analyst for Indian e-commerce. Analyze the given product and predict pricing trends.

Return JSON:
{
  "recommendation": "BUY NOW" or "WAIT" or "UPCOMING SALE",
  "currentPriceRange": "₹X - ₹Y",
  "expectedDrop": "X%",
  "bestTimeMonth": "Month name",
  "upcomingSale": "Sale event name",
  "confidence": "High/Medium/Low",
  "reasoning": "explanation"
}

Return ONLY valid JSON.`;

const REVIEW_SYSTEM_PROMPT = `You are a review authenticity analyst. Analyze the given product's typical review patterns.

Return JSON:
{
  "fakePercentage": number 0-100,
  "realPercentage": number 0-100,
  "confidence": number 0-100,
  "label": "Likely Genuine" or "Suspicious" or "Likely Fake",
  "positiveCount": estimated number,
  "negativeCount": estimated number,
  "spamCount": estimated number,
  "signals": ["signal1", "signal2"],
  "reason": "explanation",
  "overallSentiment": "Positive/Negative/Mixed"
}

Return ONLY valid JSON.`;

const ALTERNATIVES_SYSTEM_PROMPT = `You are a product recommendation expert. Find alternatives for the given product.

Return JSON:
{
  "betterProducts": [
    {"name": "...", "price": "₹...", "reason": "why it's better", "rating": "X/5"}
  ],
  "cheaperProducts": [
    {"name": "...", "price": "₹...", "reason": "cheaper but decent", "rating": "X/5"}
  ],
  "premiumProducts": [
    {"name": "...", "price": "₹...", "reason": "premium option", "rating": "X/5"}
  ]
}

Return ONLY valid JSON with 3 items in each array max.`;

// ─────────────────────────────────────────────
// In-memory price alerts store
// ─────────────────────────────────────────────
let alertsStore = [];

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    groqConfigured: !!GROQ_API_KEY,
    model: GROQ_MODEL,
    timestamp: new Date().toISOString(),
  });
});

// ── POST /api/chat ──────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [], userMessage, imageBase64, systemPrompt } = req.body;

    if (!userMessage && !imageBase64) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    // Build message history for Groq
    // If image provided, use vision-capable approach (describe image in prompt)
    let groqMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // If there's an image, append a system note about it
    if (imageBase64) {
      // Groq llama models don't support vision directly, so we add context
      const imageNote = userMessage
        ? `${userMessage}\n\n[User has uploaded a product image. Based on common products, analyze and recommend similar items, alternatives, and pricing.]`
        : '[User uploaded a product image. Analyze it as a product and provide shopping recommendations, price estimates, alternatives, and buying advice.]';

      // Replace last user message with image context
      groqMessages = groqMessages.filter((m, i) => i < groqMessages.length - 1);
      groqMessages.push({ role: 'user', content: imageNote });
    }

    const result = await callGroqWithHistory(
      systemPrompt || SHOPPING_SYSTEM_PROMPT,
      groqMessages,
      2048
    );

    res.json(result);
  } catch (error) {
    console.error('[/api/chat] Error:', error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: error.response?.data?.error?.message || error.message || 'Chat request failed',
    });
  }
});

// ── POST /api/search ────────────────────────
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const content = await callGroq(
      SEARCH_SYSTEM_PROMPT,
      `Search for: ${query}`,
      1024
    );

    let products = [];
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) products = JSON.parse(jsonMatch[0]);
    } catch {
      products = [];
    }

    res.json({ query, products, rawContent: content });
  } catch (error) {
    console.error('[/api/search] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/compare ───────────────────────
app.post('/api/compare', async (req, res) => {
  try {
    const { product1, product2 } = req.body;
    if (!product1 || !product2) {
      return res.status(400).json({ error: 'product1 and product2 are required' });
    }

    const content = await callGroq(
      COMPARE_SYSTEM_PROMPT,
      `Compare: "${product1}" vs "${product2}"`,
      1024
    );

    let comparison = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) comparison = JSON.parse(jsonMatch[0]);
    } catch {
      comparison = { rawContent: content };
    }

    res.json(comparison);
  } catch (error) {
    console.error('[/api/compare] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/price ─────────────────────────
app.post('/api/price', async (req, res) => {
  try {
    const { product } = req.body;
    if (!product) return res.status(400).json({ error: 'product is required' });

    const content = await callGroq(
      PRICE_SYSTEM_PROMPT,
      `Analyze price for: ${product}`,
      512
    );

    let prediction = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) prediction = JSON.parse(jsonMatch[0]);
    } catch {
      prediction = { rawContent: content };
    }

    res.json(prediction);
  } catch (error) {
    console.error('[/api/price] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/reviews ───────────────────────
app.post('/api/reviews', async (req, res) => {
  try {
    const { product, reviews = [] } = req.body;
    if (!product) return res.status(400).json({ error: 'product is required' });

    const reviewSample = reviews.length > 0
      ? `\nSample reviews:\n${reviews.slice(0, 5).join('\n')}`
      : '';

    const content = await callGroq(
      REVIEW_SYSTEM_PROMPT,
      `Analyze reviews for: ${product}${reviewSample}`,
      512
    );

    let analysis = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
    } catch {
      analysis = { rawContent: content };
    }

    res.json(analysis);
  } catch (error) {
    console.error('[/api/reviews] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/alternatives ──────────────────
app.post('/api/alternatives', async (req, res) => {
  try {
    const { product, budget } = req.body;
    if (!product) return res.status(400).json({ error: 'product is required' });

    const budgetNote = budget ? ` Budget constraint: ₹${budget}` : '';
    const content = await callGroq(
      ALTERNATIVES_SYSTEM_PROMPT,
      `Find alternatives for: ${product}.${budgetNote}`,
      768
    );

    let alternatives = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) alternatives = JSON.parse(jsonMatch[0]);
    } catch {
      alternatives = { rawContent: content };
    }

    res.json(alternatives);
  } catch (error) {
    console.error('[/api/alternatives] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/alerts ─────────────────────────
app.get('/api/alerts', (req, res) => {
  res.json(alertsStore);
});

// ── POST /api/alerts ────────────────────────
app.post('/api/alerts', (req, res) => {
  const { product, currentPrice, targetPrice } = req.body;
  if (!product || !currentPrice || !targetPrice) {
    return res.status(400).json({ error: 'product, currentPrice, and targetPrice are required' });
  }
  const alert = {
    id: `alert_${Date.now()}`,
    product,
    currentPrice,
    targetPrice,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  alertsStore = [alert, ...alertsStore];
  res.status(201).json(alert);
});

// ── DELETE /api/alerts/:id ──────────────────
app.delete('/api/alerts/:id', (req, res) => {
  const { id } = req.params;
  alertsStore = alertsStore.filter((a) => a.id !== id);
  res.json({ success: true });
});

// ─────────────────────────────────────────────
// 404 handler
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─────────────────────────────────────────────
// Error handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🛍️  SmartBuy AI Server running on http://localhost:${PORT}`);
  console.log(`📡  Groq API Key: ${GROQ_API_KEY ? '✅ Configured' : '❌ NOT SET — add to .env'}`);
  console.log(`🤖  Model: ${GROQ_MODEL}\n`);
});

module.exports = app;
