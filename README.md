# 🏆 CSAT Quest — Think Like a Top CSAT Performer

A Blooket-style "Gold Quest" training game for support agents. Three play modes:

- **🎮 Practice Solo** — compete against bot agents on a simulated support floor.
- **👑 Host Room** — create a lobby, share the code. The host can **Spectate** (watch the dashboard) **or Play** alongside everyone else.
- **🤝 Join Room** — enter a friend's lobby code and play together.

**No sign-up. No login.** Multiplayer is real-time over a tiny Express backend.

---

## 🏗️ Architecture

This app is split into **two deployed pieces**:

| Piece | Tech | Hosted on | Purpose |
|---|---|---|---|
| **Frontend** | React + Vite + Tailwind | Cloudflare Pages (`csat.com`) | The game UI (static files) |
| **Backend** | Express (`server.ts`) | Render (free Node host) | Multiplayer state + REST API |

The frontend talks to the backend via `VITE_API_BASE_URL` (see `src/api.ts`). In dev it's empty (relative → `localhost:3000`); in production it points to the Render URL.

---

## 💻 Run locally

```bash
npm install
npm run dev        # starts Express + Vite on http://localhost:3000
```

Visit `http://localhost:3000`. Solo, Host, and Join all work locally with no config.

> Optional: set `GEMINI_API_KEY` in `.env.local` to enable AI-generated scenario images. Without it, the server uses the static images in `public/images/`.

### Let friends join from the internet (quick tunnel)

While `npm run dev` is running, expose it publicly without deploying:

```bash
cloudflared tunnel --url http://localhost:3000
# or: ngrok http 3000
```

Share the resulting URL. (The URL is temporary — it changes each run.)

---

## 🚀 Deploy (permanent, free)

### Step 1 — Push to GitHub

This repo should already be pushed to:
`https://github.com/conansb333/Think-Like-a-Top-CSAT-Performer`

### Step 2 — Deploy the backend to Render

1. Go to [render.com](https://render.com), create a free account.
2. **New → Web Service → Connect** your GitHub repo.
3. Render auto-detects `render.yaml`. Confirm:
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/server.cjs`
4. Deploy. Note the URL, e.g. `https://csat-quest-server.onrender.com`.

### Step 3 — Deploy the frontend to Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com).
2. **Create a project → Connect to Git** → select the repo.
3. Set:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - **Environment variable**: `VITE_API_BASE_URL` = your Render URL from Step 2
4. Deploy. You'll get a `*.pages.dev` URL.

### Step 4 — Point your domain (csat.com)

In Cloudflare Pages → **Custom domains** → add `csat.com`. Cloudflare manages DNS automatically since the domain is already on Cloudflare.

---

## 🎮 The 3 play modes

### Solo
Pick a nickname + avatar (each has a passive trait) + case load. Answer CSAT scenarios before the timer. Bot agents earn gold in parallel and open chests that shake the leaderboard.

### Host
1. Click **Host Room**, choose mode (Gold Quest / Case Race) + duration.
2. You get a **6-digit lobby code** + shareable link.
3. **Choose your role** before starting:
   - **👁️ Spectate** — watch the live dashboard (timer, leaderboard, floor logs). You control start/end.
   - **🎮 Play Too** — you join as a contestant AND keep host controls.
4. When everyone's in, click **Start Training Session**.

### Join
Click **Join Room** (or open a lobby link), enter the code + nickname, wait for host to start.

---

## 🎨 Avatars & traits

| Avatar | Passive trait |
|---|---|
| 🦊 Empathy Fox | +20% Gold on resolutions |
| 🦉 Wisdom Owl | 15% chance to double chest rewards |
| 🐼 Chill Panda | +50 Gold on correct tickets |
| 🦁 FCR Lion | +25% Gold on ticket solutions |
| 🐸 Rapport Frog | +15% Gold on correct answers |
| 🦄 Growth Unicorn | +100 Gold boost per scenario |

---

## 📁 Project structure

```
├── index.html              ← SPA entry
├── server.ts               ← Express backend (multiplayer API + image proxy)
├── render.yaml             ← Render Blueprint (backend deploy)
├── vite.config.ts          ← Vite config (allowedHosts for tunnels)
├── src/
│   ├── api.ts              ← API_BASE resolver (dev vs prod)
│   ├── App.tsx             ← main game orchestrator
│   ├── main.tsx            ← React root
│   ├── questions.ts        ← 40 CSAT scenario questions
│   ├── types.ts            ← TypeScript interfaces
│   ├── sound.ts            ← Web Audio synth
│   └── components/
│       ├── WelcomeScreen.tsx   ← menu + solo/host/join setup
│       ├── MultiplayerLobby.tsx ← lobby + Play/Spectate toggle
│       ├── HostDashboard.tsx   ← host spectate view
│       ├── ChestStage.tsx      ← chest reward reveal
│       ├── Leaderboard.tsx     ← live ranking
│       └── SummaryScreen.tsx   ← end-game scorecard
└── public/images/          ← scenario illustrations
```

---

## ⚠️ Notes

- **Free-tier limits:** Render free services sleep after 15 min of inactivity (first request after sleep takes ~30s to wake). Cloudflare Pages is always-on.
- **No persistence:** game state lives in memory on the server. Restarting the Render service clears active games.
- **Lobby codes are public:** anyone with the code can join (by design — share with friends).

## 📝 License

MIT.
