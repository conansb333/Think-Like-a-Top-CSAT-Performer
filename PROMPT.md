# Master App Prompt: CSAT Challenge & Gold Quest Arena

> **Instructions**: Copy and paste the prompt below into an AI coding assistant (like Google AI Studio Build) to regenerate the complete "Think Like a Top CSAT Performer" application from scratch.

---

```markdown
Build a full-stack, gamified CSAT (Customer Satisfaction) Training Application called **"Think Like a Top CSAT Performer"** built with React, Vite, Tailwind CSS, Express (Node.js), and the Google Gemini API. 

The application is inspired by classic classroom gamification (like Blooket Gold Quest) where customer support advocates solve realistic customer service scenarios to earn keys, unlock mystery chests, multiply their CSAT Gold points, block rival attacks with shields, and steal or swap scores with real or AI competitors.

---

### Key Requirements & Features Architecture

#### 1. Gamified CSAT Scenario Engine
- **CSAT Scenario Bank**: A diverse set of realistic customer support scenarios covering categories such as:
  - *De-escalation & Angry Customers*
  - *Technical Troubleshooting & Edge Cases*
  - *Billing & Refund Requests*
  - *Product Defect & Delivery Delays*
  - *Policy Enforcement with Empathy*
- **Scenario Card Flow**:
  - Displays ticket metadata (Category, Case number / Progress indicator).
  - Clear scenario statement and 4 distinct, plausible answer options (A, B, C, D).
  - Sound effects for correct and incorrect answers using the Web Audio API (chimes, error buzzes, streak chimes).
  - Immediate coaching feedback explaining *why* the answer improves or harms CSAT, along with a **"Top Performer Golden Tip"**.
  - **Gemini AI Scene Generator**: On-the-fly AI illustration generation (`@google/genai` with `imagen-3.0-generate-002` or `gemini-2.5-flash`) providing an inline scene visual for the customer situation.

#### 2. Mystery Chest & Power-Up System (Gold Quest Mechanics)
When an advocate correctly resolves a scenario, they earn a Key to unlock 1 of 3 Mystery Chests. Chests contain random rewards:
- **Gold Rewards**: Small, medium, or large Gold gains (+50, +150, +500 Gold).
- **Gold Multipliers**: Boost current gold by 1.5x, 2x, or 3x.
- **Defensive Shields**: Acquire a shield to block incoming stealing or swapping attempts from competitors.
- **Steal Gold**: Choose a competitor from the live leaderboard to steal 10%–25% of their hard-earned Gold.
- **Swap Gold**: Swap total Gold balance with the leading player on the leaderboard (unless protected by a shield).
- **Nothing / Trap**: "Empty Ticket" or minor penalty (-10% Gold).

#### 3. Real-Time Multiplayer & Simulated AI Competitors
- **Multiplayer Lobby & Host System**:
  - **Host Mode**: Create a custom training room with a unique 6-character room code (e.g. `CSAT99`). Set game length (10 tickets, 20 tickets, or timed 3-minute / 5-minute shifts) and select game mode (*Gold Quest* vs. *Speed Race*).
  - **Join Mode**: Join an active room code or click a direct invite URL (`?join=CODE`).
  - **Shareable Invite Links**: Copy room invite links directly to clipboard.
  - **Host Controls**: Live Host Dashboard showing real-time advocate progress, total team Gold, leaderboards, shift logs, floor announcements, and the ability to start or end shifts.
- **Simulated AI Advocate Bots**:
  - Option to spawn simulated bot competitors (e.g., *CSAT Champ*, *Resolution Queen*, *Speedy Sam*, *Empathy Eric*) to enable single-player competition or fill empty seats in multiplayer rooms.
  - Bots dynamically solve scenarios, gain gold, open chests, and occasionally target human players with steals/swaps.

#### 4. Backend Express Server (`server.ts`)
- Express server running on port `3000` with full REST API endpoints:
  - `POST /api/multiplayer/create`: Spawns a new game room session.
  - `POST /api/multiplayer/join`: Registers a new advocate with a chosen nickname & avatar.
  - `GET /api/multiplayer/room/:gameId`: Real-time polling endpoint returning complete game state, player scores, active shields, and global floor announcements.
  - `POST /api/multiplayer/answer`: Processes scenario attempts, tracks accuracy streaks, and grants keys.
  - `POST /api/multiplayer/reward`: Executes chest rewards and applies gold multipliers.
  - `POST /api/multiplayer/action`: Handles interactive attacks (stealing / swapping gold with target client IDs and shield validation).
  - `POST /api/generate-illustration`: Proxies Gemini API requests server-side securely using `GEMINI_API_KEY`.

#### 5. User Interface & Design System
- **Theme & Atmosphere**:
  - Dark slate canvas with rich indigo, amber/gold, and emerald accents.
  - High-contrast typography pairing clean sans-serif UI font with bold monospaced data badges.
  - Fluid animations (using `motion/react`) for card flips, chest opening effects, floating gold counters, and leaderboard shifts.
  - Audio toggle control (mute/unmute) with persistent state.
- **Views**:
  1. *Welcome Screen*: Mode selection (Solo, Join Room, Host Room), avatar selector (8 CSAT advocate avatars with custom emojis and badges), nickname input, room code auto-fill from URL query parameters.
  2. *Lobby View*: Live room code display, player grid with avatar badges, shareable invite button, host start button, bot filler toggles.
  3. *Playing View*: Case ticket scenario view, option buttons, AI illustration preview, feedback box, key counter.
  4. *Chest View*: Interactive 3-chest opening screen with reward reveal modal.
  5. *Live Competitor Sidebar / Leaderboard*: Real-time ranking showing Gold totals, active shields, streaks, and floor activity feed.
  6. *Shift Summary View*: Final podium display, total CSAT rating, accuracy percentage, missed category breakdown, and "Re-clock In" buttons.

#### 6. Tech Stack Requirements
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, `motion/react` for animations.
- **Backend**: Express, TypeScript, `tsx` for dev, `esbuild` for CommonJS production build.
- **AI SDK**: `@google/genai` (Google Gen AI SDK for server-side Gemini integration).
- **Audio**: Web Audio API synthesizer helper (no external sound file assets required).
```
