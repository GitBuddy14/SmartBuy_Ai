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

const path = require('path');
const fs = require('fs');

// Try server/.env first, then root .env
const serverEnv = path.resolve(__dirname, '.env');
const rootEnv = path.resolve(__dirname, '..', '.env');

if (fs.existsSync(serverEnv)) {
  require('dotenv').config({ path: serverEnv });
} else if (fs.existsSync(rootEnv)) {
  require('dotenv').config({ path: rootEnv });
} else {
  require('dotenv').config();
}

// Fallback in case of variable name variations
if (!process.env.GROQ_API_KEY && process.env.GROK_API_KEY) {
  process.env.GROQ_API_KEY = process.env.GROK_API_KEY;
}

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(null, true); // Permissive in dev
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' })); // allow image uploads as base64

// Rate limiting — 100 requests per 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ─────────────────────────────────────────────
// Groq API config & Model Candidate Selection
// ─────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const FALLBACK_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];

// Unique candidate models to try in order
const MODEL_CANDIDATES = Array.from(new Set([PRIMARY_MODEL, ...FALLBACK_MODELS]));

// ─────────────────────────────────────────────
// Helper: call Groq with model fallback
// ─────────────────────────────────────────────
async function callGroqWithModelFallback(messages, maxTokens = 2048) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables.');
  }

  let lastError = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model,
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

      const choice = response.data.choices?.[0];
      if (!choice || !choice.message) {
        throw new Error('Invalid response received from Groq API');
      }

      return {
        content: choice.message.content || '',
        usage: response.data.usage,
        model: response.data.model || model,
      };
    } catch (err) {
      lastError = err;
      const errorMsg = err.response?.data?.error?.message || err.message || '';
      console.warn(`[Groq] Model "${model}" failed: ${errorMsg}. Trying fallback...`);
      if (err.response?.status === 401) {
        throw err;
      }
    }
  }

  throw lastError || new Error('All Groq model attempts failed.');
}

async function callGroq(systemPrompt, userContent, maxTokens = 2048) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
  const res = await callGroqWithModelFallback(messages, maxTokens);
  return res.content;
}

async function callGroqWithHistory(systemPrompt, messages, maxTokens = 2048) {
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];
  return await callGroqWithModelFallback(allMessages, maxTokens);
}

// ─────────────────────────────────────────────
// Helper: safe JSON parsing
// ─────────────────────────────────────────────
function parseJsonSafely(rawText, expectedType = 'object') {
  if (!rawText || typeof rawText !== 'string') return expectedType === 'array' ? [] : {};

  // Strip markdown code fences if present
  let cleaned = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Continue with regex extraction
  }

  // Extract array or object
  const regex = expectedType === 'array' ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
  const match = cleaned.match(regex);
  if (match) {
    let jsonStr = match[0].trim();
    try {
      return JSON.parse(jsonStr);
    } catch (e1) {
      // Clean trailing commas before closing braces/brackets
      try {
        jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(jsonStr);
      } catch (e2) {
        console.warn('[parseJsonSafely] Failed to parse JSON snippet:', e2.message);
      }
    }
  }

  return expectedType === 'array' ? [] : { rawContent: rawText };
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
    "buyNow": true,
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
  "recommendation": "BUY NOW",
  "currentPriceRange": "₹X - ₹Y",
  "expectedDrop": "X%",
  "bestTimeMonth": "Month name",
  "upcomingSale": "Sale event name",
  "confidence": "High",
  "reasoning": "explanation"
}

Return ONLY valid JSON.`;

const REVIEW_SYSTEM_PROMPT = `You are a review authenticity analyst. Analyze the given product's typical review patterns.

Return JSON:
{
  "fakePercentage": 20,
  "realPercentage": 80,
  "confidence": 85,
  "label": "Likely Genuine",
  "positiveCount": 1200,
  "negativeCount": 150,
  "spamCount": 50,
  "signals": ["signal1", "signal2"],
  "reason": "explanation",
  "overallSentiment": "Positive"
}

Return ONLY valid JSON.`;

const ALTERNATIVES_SYSTEM_PROMPT = `You are a product recommendation expert. Find alternatives for the given product.

Return JSON:
{
  "betterProducts": [
    {"name": "...", "price": "₹...", "reason": "why it's better", "rating": "4.5/5"}
  ],
  "cheaperProducts": [
    {"name": "...", "price": "₹...", "reason": "cheaper but decent", "rating": "4.1/5"}
  ],
  "premiumProducts": [
    {"name": "...", "price": "₹...", "reason": "premium option", "rating": "4.8/5"}
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
    model: PRIMARY_MODEL,
    activeCandidates: MODEL_CANDIDATES,
    timestamp: new Date().toISOString(),
  });
});

// ── POST /api/chat ──────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [], userMessage, imageBase64, systemPrompt } = req.body;

    if (!userMessage && !imageBase64 && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    let groqMessages = (messages || []).map((m) => ({
      role: m.role,
      content: m.content || '',
    }));

    // If userMessage is provided and is not already the last user message, append it
    const lastMsg = groqMessages[groqMessages.length - 1];
    if (userMessage && (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userMessage)) {
      groqMessages.push({ role: 'user', content: userMessage });
    }

    // If there's an image, append context note
    if (imageBase64) {
      const imageNote =
        '[User uploaded a product image. Analyze this product, recommend similar items, compare pricing in ₹, and provide shopping advice.]';
      if (groqMessages.length > 0 && groqMessages[groqMessages.length - 1].role === 'user') {
        const lastContent = groqMessages[groqMessages.length - 1].content;
        groqMessages[groqMessages.length - 1].content = lastContent
          ? `${lastContent}\n\n${imageNote}`
          : imageNote;
      } else {
        groqMessages.push({ role: 'user', content: imageNote });
      }
    }

    if (groqMessages.length === 0) {
      return res.status(400).json({ error: 'No message content provided' });
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

    const products = parseJsonSafely(content, 'array');
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

    const comparison = parseJsonSafely(content, 'object');
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

    const prediction = parseJsonSafely(content, 'object');
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

    const analysis = parseJsonSafely(content, 'object');
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

    const alternatives = parseJsonSafely(content, 'object');
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
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🛍️  SmartBuy AI Server running on http://localhost:${PORT}`);
    console.log(`📡  Groq API Key: ${GROQ_API_KEY ? '✅ Configured' : '❌ NOT SET — add to .env'}`);
    console.log(`🤖  Primary Model: ${PRIMARY_MODEL}`);
    console.log(`🔄  Candidate Models: ${MODEL_CANDIDATES.join(', ')}\n`);
  });
}

module.exports = app;
