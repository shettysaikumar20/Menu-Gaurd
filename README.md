# MenuGuard AI

AI-powered menu quality and consistency auditor for independent restaurants, cafes, bakeries, and cloud kitchens. Built for the **Hacktoberfest 2026 Open-Source AI Challenge** (*Best Use of Backboard* category).

---

## 1. Project Purpose

MenuGuard AI prevents menu errors, price conflicts, misleading wording, and dietary contradictions before publication. Restaurant managers import their menu, run a dual-layer audit, inspect evidence-backed findings, approve or edit corrections, and export a clean menu.

---

## 2. Key Features

- **Dual-Layer Menu Audit Engine**:
  - **Layer 1: Deterministic Rules Engine**: Checks duplicate dishes, conflicting prices across sections, missing prices, missing descriptions, missing required fields, and non-compliant dietary claims (e.g. marked "Vegan" but ingredients list butter/milk).
  - **Layer 2: Backboard AI**: Evaluates language nuances, description vs recipe ingredient mismatches (e.g., "Wild Alaskan salmon" claimed in description while ingredients state "farm-raised Atlantic salmon"), misleading sweetener claims, and flags allergen uncertainty requiring human verification.
- **Evidence-Backed Findings**: Every finding provides verbatim quotes from the input data, severity levels, actionable corrections, and manager verification notes.
- **Controlled Review Workflow**: Changes are never silently applied. Managers approve, reject, or edit proposals, then explicitly click *"Apply Approved Changes to Menu"*.
- **Fast Zero-Config Storage & AI Modes**:
  - Pure in-memory state engine for instant, reliable zero-config deployment.
  - Uses the **Backboard API** with open-weight models (`meta-llama/llama-3.1-70b-instruct`); provides a clearly labelled mock analysis mode when credentials are not configured.
- **Menu Management & CSV Importer**: CRUD interface with strict CSV row validation, reporting malformed rows line-by-line without discarding valid items.
- **Export Center**: Export clean menus as CSV and download structured audit reports in Markdown (`.md`) or JSON (`.json`).
- **24-Item Demonstration Dataset**: Curated demo cafe menu (*Artisan Hearth Cafe & Bakery*) with intentional test cases.

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
├── server/                 # Node.js, Express, Zod
│   ├── src/
│   │   ├── controllers/    # menuController, auditController
│   │   ├── routes/         # /api/menu, /api/audits, /api/findings
│   │   ├── services/       # deterministicAuditor, backboardService, storageService
│   │   ├── utils/          # csvParser
│   │   ├── shared/         # Constants, schemas, demoMenu
│   │   └── tests/          # Vitest backend and integration test suites
├── shared/                 # Universal constants, Zod schemas, demo dataset
├── .env.example            # Environment variables template
└── package.json            # Root workspaces orchestration
```

---

## 4. Prerequisites & Environment Setup

- **Node.js** >= v18 (Tested on Node v26)
- **npm** >= 9

Copy `.env.example` to `server/.env`:

```bash
# Server Port
PORT=5000

# Backboard AI Credentials
BACKBOARD_API_KEY=your_backboard_api_key_here
BACKBOARD_BASE_URL=https://app.backboard.io/api
BACKBOARD_MODEL_NAME=meta-llama/llama-3.1-70b-instruct
BACKBOARD_LLM_PROVIDER=featherless

# Frontend API URL
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 5. Setup & Running the Application

Install all dependencies for root, client, and server:

```bash
npm install
```

### Start Development Mode (Runs Frontend & Backend concurrently)

```bash
npm run dev
```

- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 6. Deploying to Render

This repository is pre-configured with [`render.yaml`](./render.yaml) for zero-config Render deployment.

### Option A: 1-Click Blueprint Deploy (Recommended)
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository: `https://github.com/shettysaikumar20/Menu-Gaurd`.
4. Render will detect `render.yaml`. Set `BACKBOARD_API_KEY` to your key:
   ```
   BACKBOARD_API_KEY=espr_cbp-6NnXbJUdoM4Ew5jd6UAGWJEk_cjbu_NldAAyDis
   ```
5. Click **Apply**. Render will run:
   - **Build Command:** `npm install --include=dev && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`

### Option B: Manual Web Service
If creating a Web Service manually:
- **Environment:** `Node`
- **Build Command:** `npm install --include=dev && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `NODE_ENV`: `production`
  - `PORT`: `10000`
  - `BACKBOARD_API_KEY`: `espr_cbp-6NnXbJUdoM4Ew5jd6UAGWJEk_cjbu_NldAAyDis`
  - `BACKBOARD_BASE_URL`: `https://app.backboard.io/api`
  - `BACKBOARD_MODEL_NAME`: `meta-llama/llama-3.1-70b-instruct`
  - `BACKBOARD_LLM_PROVIDER`: `featherless`

---

## 7. Running Automated Tests

Run all unit, integration, and UI tests across frontend and backend:

```bash
npm test
```

Or run individually:

```bash
# Run server test suite (auditor checks, CSV parser, API routes)
npm run test:server

# Run client test suite (React Testing Library components & review workflow)
npm run test:client
```

---

## 7. Example API Request

Run a menu audit via curl:

```bash
curl -X POST http://localhost:5000/api/audits \
  -H "Content-Type: application/json"
```

Response snippet:

```json
{
  "success": true,
  "audit": {
    "id": "audit-c0b7...",
    "restaurantName": "Artisan Hearth Cafe & Bakery",
    "totalItems": 24,
    "totalIssues": 7,
    "highPriorityCount": 5,
    "resolvedCount": 0,
    "unresolvedCount": 7,
    "isMock": true,
    "findings": [
      {
        "category": "PRICE_CONFLICT",
        "severity": "CRITICAL",
        "layer": "DETERMINISTIC",
        "menuItemName": "Truffle Wild Mushroom Risotto",
        "evidence": "Mains: $24.00 vs Chef Specials: $28.00",
        "suggestedCorrection": "Align both listings to the intended price ($24.00 or $28.00)."
      }
    ]
  }
}
```
