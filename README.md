# MenuGuard AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-menuguard--ai.onrender.com-brightgreen?style=flat-square&logo=render)](https://menuguard-ai.onrender.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-shettysaikumar20%2FMenu--Gaurd-blue?style=flat-square&logo=github)](https://github.com/shettysaikumar20/Menu-Gaurd)
[![Tests Passing](https://img.shields.io/badge/Tests-19%2F19%20Passing-success?style=flat-square)](https://github.com/shettysaikumar20/Menu-Gaurd)
[![AI Engine](https://img.shields.io/badge/Backboard%20AI-Llama--3.1--70B-orange?style=flat-square)](https://app.backboard.io)

AI-powered menu quality and consistency auditor for independent restaurants, cafes, bakeries, and cloud kitchens. Built for the **Hacktoberfest 2026 Open-Source AI Challenge** (*Best Use of Backboard* category).

🌐 **Live Production URL:** [https://menuguard-ai.onrender.com](https://menuguard-ai.onrender.com)

---

## 1. Product Vision & Purpose

MenuGuard AI prevents menu errors, price conflicts, misleading wording, and dietary contradictions before publication. Unlike generic chatbots or basic QR generators, MenuGuard AI is purpose-built for reliable menu quality assurance:
- **Zero Surprises:** Restaurant managers catch kitchen ingredient mismatches and legal compliance risks before menus go to print or customer screens.
- **Evidence-Backed Findings:** Every issue quotes verbatim evidence directly from the input dish descriptions and kitchen ingredient specifications.
- **Controlled Manager Oversight:** AI proposed corrections are never applied silently. Managers review, approve, edit, or reject each finding before explicitly committing changes.

---

## 2. Key Features

- **Dual-Layer Menu Audit Engine**:
  - **Layer 1: Deterministic Rules Engine**: High-speed checks for duplicate items, conflicting prices across menu sections, missing prices/descriptions, and non-compliant dietary claims (e.g., dish labeled "Vegan" while kitchen recipe contains butter, egg, or cheese).
  - **Layer 2: Backboard AI**: Deep semantic reasoning using open-weight models (`meta-llama/llama-3.1-70b-instruct` via `openrouter`). Flags description-vs-recipe contradictions (e.g., "Wild Alaskan salmon" claimed in description while ingredients state "farm-raised Atlantic salmon"), deceptive health claims ("sugar-free" vs agave syrup), and flags allergen uncertainties requiring human kitchen verification.
- **Zero-Dependency High-Performance Storage**:
  - Pure in-memory operational data store with zero external database dependencies (no MongoDB or cloud database required).
  - Instant cold starts and frictionless one-click deployment on any host.
- **Resilient AI Pipeline**:
  - Uses the official **Backboard API** with `openrouter` and `meta-llama/llama-3.1-70b-instruct`.
  - Automatic fallback retry with Backboard's default model (`gpt-4o`) if OpenRouter encounters upstream limits.
  - Graceful fallback to clearly labeled mock findings if Backboard credentials are not provided or if network fails.
- **Menu Management & Robust CSV Importer**:
  - Full CRUD menu item management.
  - Strict line-by-line CSV validation that reports malformed rows clearly without discarding valid items.
- **Export Center**:
  - Export clean, corrected menus in CSV format.
  - Download structured audit summary reports in Markdown (`.md`) or JSON (`.json`).
- **Preloaded 24-Item Demonstration Dataset**:
  - Realistic cafe menu (*Artisan Hearth Cafe & Bakery*) with intentionally planted real-world errors to demonstrate full audit and resolution workflows.

---

## 3. Architecture

```text
menuguard-ai/
├── client/                 # React 18, Vite, Tailwind CSS, Lucide React
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, Toast notifications
│   │   ├── pages/          # Dashboard, MenuManager, FindingsReview, MenuExport
│   │   ├── services/       # API client
│   │   ├── shared/         # Shared schemas and demo datasets
│   │   └── tests/          # Vitest + React Testing Library suites
│   └── package.json        # Frontend dependencies & build scripts
├── server/                 # Node.js, Express, Zod
│   ├── src/
│   │   ├── controllers/    # menuController, auditController
│   │   ├── routes/         # /api/menu, /api/audits, /api/findings
│   │   ├── services/       # deterministicAuditor, backboardService, storageService
│   │   ├── utils/          # csvParser
│   │   ├── shared/         # Constants, schemas, demoMenu
│   │   └── tests/          # Vitest backend and integration test suites
│   └── package.json        # Backend dependencies & test scripts
├── shared/                 # Universal constants, Zod schemas, demo dataset
├── render.yaml             # Render infrastructure-as-code deployment blueprint
├── .env.example            # Environment variables template
└── package.json            # Root workspace orchestration
```

---

## 4. Prerequisites & Environment Setup

- **Node.js** >= v18 (Tested on Node v20, v24, v26)
- **npm** >= 9

Create a `.env` file in the root or `server/` directory:

```bash
# Server Port
PORT=5000

# Backboard AI Credentials
BACKBOARD_API_KEY=your_backboard_api_key_here
BACKBOARD_BASE_URL=https://app.backboard.io/api
BACKBOARD_MODEL_NAME=meta-llama/llama-3.1-70b-instruct
BACKBOARD_LLM_PROVIDER=openrouter

# Frontend API URL (leave blank in production to use relative /api)
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Note:** If `BACKBOARD_API_KEY` is omitted, MenuGuard AI automatically operates in clearly labeled simulation mode, allowing complete demonstration of the application and UI offline.

---

## 5. Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Both Frontend and Backend Concurrently
```bash
npm run dev
```

- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 6. Running Automated Tests

Run the complete 19-test automated test suite across frontend and backend:

```bash
npm test
```

Or run tests individually per workspace:

```bash
# Run server test suite (auditor checks, CSV parser, API routes)
npm run test --workspace=server

# Run client test suite (React components & review workflow)
npm run test --workspace=client
```

---

## 7. Deployment to Render

This repository includes a [`render.yaml`](./render.yaml) blueprint configured for seamless, zero-config deployment.

### Option A: 1-Click Blueprint Deploy (Recommended)
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your repository: `https://github.com/shettysaikumar20/Menu-Gaurd`.
4. Under Environment Variables, input your `BACKBOARD_API_KEY`.
5. Click **Apply**. Render will automatically:
   - Run build: `npm install --include=dev && npm run build`
   - Run start: `npm start`
   - Serve client assets and backend API from a single unified service.

### Option B: Manual Web Service
- **Build Command:** `npm install --include=dev && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- **Environment Variables:**
  - `NODE_ENV`: `production`
  - `PORT`: `10000`
  - `BACKBOARD_API_KEY`: `your_key`
  - `BACKBOARD_BASE_URL`: `https://app.backboard.io/api`
  - `BACKBOARD_MODEL_NAME`: `meta-llama/llama-3.1-70b-instruct`
  - `BACKBOARD_LLM_PROVIDER`: `openrouter`

---

## 8. API Reference

### Health Check
```bash
GET /api/health
```

### Run Menu Audit
```bash
POST /api/audits
Content-Type: application/json

{
  "items": [...],
  "restaurantName": "Artisan Hearth Cafe & Bakery"
}
```

### Get Audits History
```bash
GET /api/audits
```

### Update Finding Status (Approve / Reject / Edit)
```bash
PATCH /api/audits/findings/:id
Content-Type: application/json

{
  "status": "APPROVED",
  "correctedItemSnapshot": { ... }
}
```

### Apply Approved Corrections to Menu
```bash
POST /api/audits/:id/apply
```

### Reset Demo Menu
```bash
POST /api/menu/reset-demo
```

---

## 9. License

MIT License. Built with passion for open-source AI and Hacktoberfest 2026.
