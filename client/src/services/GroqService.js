/**
 * GroqService.js
 * Handles all communication with the Groq LLM via the backend proxy.
 * IBM Langflow / IBM Orchestrate compatible architecture.
 */

import axios from 'axios';

const API_BASE = '/api';

// ─────────────────────────────────────────────
// System prompt for the shopping agent
// ─────────────────────────────────────────────
export const SHOPPING_SYSTEM_PROMPT = `You are SmartBuy AI, an expert shopping assistant with deep knowledge of products, pricing, and consumer electronics.

When a user asks about products, ALWAYS structure your response using markdown with these sections:

## 🛍️ Product Overview
Brief description of the product(s)

## 📊 Comparison Table (if comparing)
Use a markdown table with: Feature | Product A | Product B

## ✅ Pros & Cons
### Pros
- List pros

### Cons
- List cons

## 💰 Price & Value Analysis
- Current price range
- Value for money score (1-10)
- Price trend (Rising/Stable/Falling)

## ⭐ Review Analysis
- Overall rating
- Fake review risk: Low/Medium/High
- Review authenticity confidence

## 🏆 Recommendation
**Winner:** (product name if comparing)
**Overall Score:** X/10
**Buy Now or Wait:** (clear recommendation)
**Best Time to Buy:** (e.g., during sales, next month, etc.)

## 🔄 Alternatives
1. Better alternative: (name + reason)
2. Budget alternative: (name + reason)
3. Premium alternative: (name + reason)

---

Rules:
- Always compare Price, Ratings, Pros, Cons, Value for money
- Always mention best buying time (sale seasons, etc.)
- Always flag potential fake reviews if rating seems suspicious
- Be specific with Indian Rupee prices (₹) when context suggests Indian user
- Keep responses helpful, concise, and actionable
- If user uploads an image, analyze the visible product and provide recommendations`;

// ─────────────────────────────────────────────
// Send a chat message to Groq via backend
// ─────────────────────────────────────────────
export async function sendChatMessage(messages, userMessage, imageBase64 = null) {
  try {
    const payload = {
      messages,
      userMessage,
      imageBase64,
      systemPrompt: SHOPPING_SYSTEM_PROMPT,
    };

    const response = await axios.post(`${API_BASE}/chat`, payload, {
      timeout: 60000,
    });

    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || error.message || 'Unknown error';
    throw new Error(`Chat failed: ${msg}`);
  }
}

// ─────────────────────────────────────────────
// Tool 1: Search Products
// ─────────────────────────────────────────────
export async function searchProducts(productName) {
  try {
    const response = await axios.post(`${API_BASE}/search`, { query: productName });
    return response.data;
  } catch (error) {
    throw new Error(`Search failed: ${error.response?.data?.error || error.message}`);
  }
}

// ─────────────────────────────────────────────
// Tool 2: Compare Products
// ─────────────────────────────────────────────
export async function compareProducts(product1, product2) {
  try {
    const response = await axios.post(`${API_BASE}/compare`, { product1, product2 });
    return response.data;
  } catch (error) {
    throw new Error(`Compare failed: ${error.response?.data?.error || error.message}`);
  }
}

// ─────────────────────────────────────────────
// Tool 3: Price Prediction
// ─────────────────────────────────────────────
export async function getPricePrediction(productName) {
  try {
    const response = await axios.post(`${API_BASE}/price`, { product: productName });
    return response.data;
  } catch (error) {
    throw new Error(`Price prediction failed: ${error.response?.data?.error || error.message}`);
  }
}

// ─────────────────────────────────────────────
// Tool 4: Review Analyzer
// ─────────────────────────────────────────────
export async function analyzeReviews(productName, reviews = []) {
  try {
    const response = await axios.post(`${API_BASE}/reviews`, { product: productName, reviews });
    return response.data;
  } catch (error) {
    throw new Error(`Review analysis failed: ${error.response?.data?.error || error.message}`);
  }
}

// ─────────────────────────────────────────────
// Tool 5: Alternative Finder
// ─────────────────────────────────────────────
export async function findAlternatives(productName, budget = null) {
  try {
    const response = await axios.post(`${API_BASE}/alternatives`, { product: productName, budget });
    return response.data;
  } catch (error) {
    throw new Error(`Alternative finder failed: ${error.response?.data?.error || error.message}`);
  }
}
