# Cipher Desktop Agent

Lightweight Electron desktop application that runs on a child's computer and works with the CipherGuard Chrome extension and parent dashboard. It acts as a local monitoring agent that:

- Receives browsing activity from the Chrome extension
- Forwards activity to the remote backend
- Polls the extension (via heartbeat) to verify it is active
- Sends tamper alerts when the extension stops responding
- Runs in the system tray and starts automatically on boot

## Requirements

- Node.js 18+
- Electron 28+

## Install & Run

```bash
cd desktop-agent
npm install
npm start
```

> If you see "Cannot read properties of undefined (reading 'whenReady')", ensure `ELECTRON_RUN_AS_NODE` is not set in your environment (e.g. `unset ELECTRON_RUN_AS_NODE` before running).

## Environment Variables

- `CIPHER_AGENT_PORT` – Local server port (default: 3030)
- `CIPHER_BACKEND_URL` – Backend API URL (default: https://cipher-shds.onrender.com)

## Local API (Port 3030)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check for the extension |
| `/activity` | POST | Receive browsing activity from extension |
| `/heartbeat` | POST | Extension heartbeat (every 5 seconds) |
| `/status` | GET | Agent state (extension active, logs) |

## Tamper Protection

The agent includes password protection to prevent children from easily stopping or removing it:

- **First run**: A setup window prompts the parent to set a password (min 6 characters).
- **Password storage**: Password is hashed with bcrypt and stored locally via electron-store.
- **Quit protection**: Clicking "Quit" in the tray shows a password dialog. Without the correct password, the agent continues running.
- **Uninstall protection**: "Uninstall Agent" in the tray requires the password, then shows OS-specific uninstall instructions.
- **before-quit interception**: Any attempt to close the app (e.g. Cmd+Q) triggers the password dialog.
- **Auto-launch**: Agent is configured to start at login (`openAtLogin: true`).
- **File integrity**: On startup, the agent checks that its data directory and config exist; if tampered, a tamper alert is sent to the backend when a token is available.
- **Agent events**: The backend receives `started`, `stopped`, and `files_tampered` events via `POST /api/monitor/agent-event`.

## How It Works

1. **Extension → Agent**: The extension sends activity and heartbeats to `http://127.0.0.1:3030` when the agent is running.
2. **Agent → Backend**: The agent forwards activity to the backend with a unique device ID.
3. **Tamper Detection**: If no heartbeat is received for ~20 seconds (4 missed 5-second cycles), the agent sends a tamper alert to the backend.
4. **Fallback**: If the agent is not running, the extension sends activity directly to the backend.

## Build

```bash
npm run build        # Current platform
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```
