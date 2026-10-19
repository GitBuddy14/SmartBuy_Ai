# SmartBuy AI — Intelligent Shopping Agent

> A production-ready AI shopping assistant powered by **Groq AI** with a minimal ChatGPT-like UI.

---

## Features

- **AI Chat** — Ask anything about products, get structured comparisons, buying advice
- **Product Comparison** — Side-by-side analysis with winner declaration
- **Price Prediction** — Buy Now vs Wait based on Indian sale seasons  
- **Fake Review Detection** — Heuristic + AI-based review authenticity analysis
- **Alternative Finder** — Better, cheaper, and premium alternatives
- **Voice Input** — Browser speech recognition
- **Image Upload** — Upload product images for AI analysis
- **Price Alerts** — Track target prices with notifications
- **Wishlist** — Save products across sessions
- **Dashboard** — Trending products, spending analytics, sustainability score
- **Dark Mode** — Full dark/light theme toggle
- **Chat History** — Persistent sessions in localStorage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| Routing | React Router v6 |
| HTTP | Axios |
| Markdown | React Markdown + remark-gfm |
| Backend | Node.js + Express |
| AI | Groq API (`openai/gpt-oss-120b` + auto-fallbacks) |
| State | React hooks + localStorage |

---

## Project Structure

```
smartbuy-ai/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── InputBox.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PriceCard.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ComparisonTable.jsx
│   │   ├── pages/           # Route-level pages
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   ├── Alerts.jsx
│   │   │   └── Settings.jsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useChat.js
│   │   │   ├── useDarkMode.js
│   │   │   └── useVoiceInput.js
│   │   ├── services/        # API + data services
│   │   │   ├── GroqService.js
│   │   │   └── ProductService.js
│   │   ├── utils/           # Utility functions
│   │   │   ├── helpers.js
│   │   │   ├── pricePrediction.js
│   │   │   └── fakeReviewAnalyzer.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                  # Express backend
│   ├── index.js             # Main server file
│   ├── .env.example         # Example server env file
│   └── package.json
│
├── .env.example             # Root example env file
├── .gitignore               # Excludes secrets & node_modules
├── package.json             # Root package with concurrently
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd smartbuy-ai
```

### 2. Set up environment

```bash
# Copy template to .env
cp server/.env.example server/.env

# Or at the root:
cp .env.example .env

# Edit .env and paste your Groq API key:
# GROQ_API_KEY=gsk_...
```

### 3. Install all dependencies

```bash
# From the root directory:
npm run install:all

# OR manually:
npm install
npm --prefix client install
npm --prefix server install
```

### 4. Run the app

```bash
# From root — starts both frontend and backend concurrently:
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## Individual Run Commands

```bash
# Backend only
npm run server

# Frontend only
npm run client

# Both (from root)
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health + API status |
| POST | `/api/chat` | AI chat with Groq |
| POST | `/api/search` | Search products by name |
| POST | `/api/compare` | Compare two products |
| POST | `/api/price` | Price prediction |
| POST | `/api/reviews` | Review analysis |
| POST | `/api/alternatives` | Find alternatives |
| GET | `/api/alerts` | Get price alerts |
| POST | `/api/alerts` | Create price alert |
| DELETE | `/api/alerts/:id` | Delete price alert |

---

## AI Tools (IBM Orchestrate Compatible)

| Tool | Input | Output |
|---|---|---|
| Search Products | Product name | Product list with ratings |
| Compare Products | 2 product names | Comparison table + winner |
| Price Prediction | Product name | Buy Now / Wait / Upcoming Sale |
| Review Analyzer | Product name | Fake %, Real %, Confidence |
| Alternative Finder | Product name | 3 better/cheaper/premium picks |

---

## IBM BOB / Langflow Integration

The architecture is designed to be compatible with IBM Orchestrate / IBM BOB agent framework:

- Each AI tool is a discrete function in `GroqService.js`
- Tools are independently callable via REST endpoints
- System prompts follow structured output patterns
- Chat history is maintained for multi-turn context
- Agent memory stores: budget, brands, categories, recent searches

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | — | Groq API key from [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | No | `openai/gpt-oss-120b` | AI model name (has automatic fallback to `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`) |
| `PORT` | No | `5000` | Express backend server port |

---

## License

MIT — Built for IBM Hackathon 2024
