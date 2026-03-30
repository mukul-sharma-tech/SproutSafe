# CyberNest — Hackathon Pitch Script
### 10-Minute Presentation (including live demo)

---

## [0:00 – 1:00] THE HOOK — Open with the problem

> "Every parent gives their child a smartphone. And every parent worries about what happens next."

- 1 in 3 children encounter harmful content online before age 10
- Kids spend 6+ hours a day on screens
- Existing parental controls are either too invasive, too easy to bypass, or require expensive subscriptions
- Parents feel helpless. Kids feel spied on. Nobody wins.

> "We built CyberNest — a free, open-source parental control platform that actually works."

---

## [1:00 – 2:30] WHAT IS CYBERNEST?

CyberNest is a full-stack parental control system with 4 components working together:

| Component | What it does |
|---|---|
| Chrome Extension | Runs on the child's browser — blocks sites, censors words, detects incognito |
| Parent Dashboard | Web app where parents monitor activity, set rules, view reports |
| Desktop Agent | Silent background process on child's PC — reports activity even outside Chrome |
| Backend API | Node.js + MongoDB — stores logs, manages rules, handles auth |

> "One parent account. One dashboard. Full visibility."

---

## [2:30 – 3:00] TECH STACK (30 seconds)

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express + MongoDB
- Extension: Chrome Manifest V3
- AI: Ollama (llama3) locally, Groq cloud as fallback
- Auth: JWT — no third-party auth dependency
- Deployment: Render (backend), Vercel (frontend)

---

## [3:00 – 7:30] LIVE DEMO (4.5 minutes)

### Demo Step 1 — The Landing Page (30s)
- Open `https://cybernest.vercel.app`
- Show the home page — clean, professional
- Point out the "How to install the extension" button
- Click it — show the 3-step install guide modal

### Demo Step 2 — Parent Signs Up (45s)
- Click "Get Started Free"
- Sign up with email + password
- Land on the dashboard
- Show the sidebar: Overview, Profiles, Reports, Timer Access, Settings

### Demo Step 3 — Add a Child Profile (30s)
- Click "Add Child" in the sidebar
- Fill in child's name and email
- Show the child card appear with online/offline status

### Demo Step 4 — Extension in Action (1 min)
- Switch to the child's browser (pre-loaded with extension)
- Search "how to kill" on Google → tab closes automatically
- Visit a blocked site → warning page appears with "This website isn't allowed"
- Try to open `chrome://extensions` → tab closes immediately
- Try incognito window → closes instantly

### Demo Step 5 — Parent Dashboard Updates (45s)
- Switch back to parent dashboard
- Refresh the Activity Feed — show the blocked search logged
- Show the incognito alert logged
- Show the site visit history

### Demo Step 6 — AI Report Summary (1 min)
- Go to Reports panel
- Click "Generate AI Report"
- Watch it stream a plain-English summary of the child's activity
- Show the provider badge — "Powered by Groq (cloud)" or "Powered by Ollama (local)"
- Point out: "This uses real browsing data — not fake summaries"

---

## [7:30 – 8:30] KEY DIFFERENTIATORS

> "Why CyberNest over everything else?"

1. **Free & open source** — no subscription, no lock-in
2. **AI-powered reports** — Ollama locally, Groq as cloud fallback. Works offline AND online
3. **Bypass-proof** — blocks incognito, blocks `chrome://extensions`, detects VPN searches
4. **Dual-layer protection** — extension + desktop agent means coverage even outside Chrome
5. **Voice assistant** — parents can ask questions about their child's activity in English or Hindi
6. **No spying** — we don't record keystrokes or private messages. Just URLs and search queries

---

## [8:30 – 9:15] IMPACT & SCALE

- Works on any Chromium browser (Chrome, Edge, Brave)
- Supports multiple child profiles per parent
- Blocks 500+ offensive words across English and Hindi
- Blocks 40+ harmful search keyword patterns
- Activity logs with timestamps — exportable as PDF
- Timed access — parents can schedule when sites are accessible

> "A parent in Delhi can set this up in 5 minutes and know their child is protected."

---

## [9:15 – 10:00] CLOSE

> "The internet isn't going anywhere. Our kids are growing up in it. CyberNest gives parents the tools to make that safer — without turning into surveillance software."

**What we built in this hackathon:**
- Full authentication system (JWT, no Auth0)
- Chrome extension with real-time blocking
- AI activity report with Ollama + Groq fallback
- Desktop agent for system-level monitoring
- Complete parent dashboard with analytics

**GitHub:** https://github.com/mukul-sharma-tech/CyberNest

> "Thank you. We're happy to take questions."

---

## BACKUP — If demo breaks

If live demo fails, have these ready:
- Screenshots of the dashboard in `/public/screenshots/`
- Screen recording of the extension blocking a site
- The AI report output copy-pasted into a text file

## TIMING CHEATSHEET

| Segment | Time | Duration |
|---|---|---|
| Hook / Problem | 0:00 | 1 min |
| What is CyberNest | 1:00 | 1.5 min |
| Tech Stack | 2:30 | 0.5 min |
| Live Demo | 3:00 | 4.5 min |
| Differentiators | 7:30 | 1 min |
| Impact | 8:30 | 0.75 min |
| Close | 9:15 | 0.75 min |
