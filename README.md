# CyberNest

A full-stack parental control platform that monitors children's browsing activity, blocks harmful content, and gives parents real-time visibility — without spying.

---

## Project Structure

```
CyberNest/
├── backend/          # Node.js + Express + MongoDB API
├── frontend/         # React + Vite dashboard (parent UI)
├── extension/        # Chrome extension (runs on child's browser)
└── desktop-agent/    # Electron agent (runs on child's PC)
```

---

## Prerequisites

- Node.js 18+
- MongoDB (local) or MongoDB Atlas
- Ollama (for voice assistant AI)
- Google Chrome (for the extension)

---

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/CyberNest
JWT_SECRET=your_long_random_secret_here
PORT=5000
NODE_ENV=development
```

Start:
```bash
npm run dev
```

Runs on `http://localhost:5000`

---

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_BACKENDURL=http://localhost:5000
VITE_OLLAMA_URL=http://localhost:11434
```

Start:
```bash
npm run dev
```

Runs on `http://localhost:8080`

---

### 3. Chrome Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** → select the `extension/` folder
4. CyberNest icon appears in the Chrome toolbar

---

### 4. Desktop Agent (child's PC)

```bash
cd desktop-agent
npm install
```

Create `desktop-agent/.env`:
```env
SPROUT_AGENT_PORT=3030
SPROUT_BACKEND_URL=http://localhost:5000
```

Start:
```bash
npm start
```

Runs silently on `http://127.0.0.1:3030`

---

### 5. Ollama (Voice Assistant)

```bash
ollama pull llama3
ollama serve
```

Runs on `http://localhost:11434`

---

## How It Works

```
Parent signs up → creates child profile → gets extension token
       ↓
Child installs Chrome extension → enters token + parent password
       ↓
Extension monitors URLs, searches, incognito attempts
       ↓
Desktop agent watches extension heartbeat (tamper detection)
       ↓
Parent sees everything in real-time on the dashboard
```

---

## Features

### Dashboard
| Panel | What it does |
|---|---|
| Overview | Real-time activity feed, analytics cards, usage charts |
| Profiles | Manage child profiles, view tokens, online/offline status |
| Reports | Generate PDF reports filtered by day/week/month |
| Timer Access | Grant temporary access to blocked sites for N minutes |
| Settings | Change password, logout |

### Protection (SuperSafe Mode)
- Block ALL sites except an allowed whitelist
- Block the Chrome extensions page (prevents disabling CyberNest)
- Add custom blocked keywords
- Upload a voice message that plays when a site is blocked

### Chrome Extension
- Monitors every URL visited and time spent per domain
- Detects and closes incognito/private windows
- Blocks sites based on parent rules → redirects to warning page
- Blocks and closes tabs for harmful search queries (see list below)
- Replaces offensive text on any page with `****`
- Blurs images with offensive alt text
- Requires parent password to deactivate
- Lockout for 1 hour after 3 wrong password attempts

### Desktop Agent
- Monitors extension heartbeat every 5 seconds
- Sends tamper alert if extension stops responding
- Logs agent start/stop events to dashboard

### Voice Assistant
- Floating mic button on the dashboard (bottom-right)
- Supports English and Hindi
- Powered by Ollama llama3 — fully local, no API key needed
- Speaks responses aloud via browser speech synthesis

---

## Blocked Search Keywords

The extension automatically closes the tab when any of these are searched on Google, Bing, or Yahoo:

**Bypass / VPN**
`proxy`, `vpn`, `unblock sites`, `bypass filter`, `bypass parental control`, `how to bypass`, `tor browser`, `disable CyberNest`, `remove extension` and more

**Violence / Harmful**
`how to kill`, `how to murder`, `how to make a bomb`, `suicide methods`

**Adult Content (English)**

**Adult Content (Hindi)**

---

## Activity Log Event Types

Every event is stored in MongoDB and shown in the dashboard feed:

| Type | Trigger |
|---|---|
| `BROWSING_ACTIVITY` | Child visits a website |
| `SEARCH_ACTIVITY` | Child performs a search |
| `INCOGNITO_ALERT` | Private/incognito window opened |
| `BLOCKED_URL` | Site blocked by parent's block list |
| `SUPERSAFE_BLOCK` | Site blocked by SuperSafe mode |
| `BLOCKED_SEARCH` | Harmful search query detected, tab closed |
| `EXTENSION_ACTIVATED` | Extension connected successfully |
| `EXTENSION_DISCONNECTED` | Extension turned off |
| `TAMPER_ALERT` | Extension stopped responding |
| `SECURITY_ALERT` | 3 wrong password attempts |
| `AGENT_EVENT` | Desktop agent started/stopped |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT |
| Extension | Chrome Manifest V3, Service Worker |
| Desktop Agent | Electron |
| AI / Voice | Ollama llama3 (local) |
| Auth | JWT (email + password, stored in MongoDB) |

---

## Environment Variables Reference

### `backend/.env`
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |

### `frontend/.env`
| Variable | Description |
|---|---|
| `VITE_BACKENDURL` | Backend API base URL |
| `VITE_OLLAMA_URL` | Ollama API URL (default: http://localhost:11434) |

### `desktop-agent/.env`
| Variable | Description |
|---|---|
| `SPROUT_AGENT_PORT` | Port for the local agent server |
| `SPROUT_BACKEND_URL` | Backend API base URL |

