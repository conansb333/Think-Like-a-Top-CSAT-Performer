import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
let quotaExhaustedUntil: number = 0; // circuit breaker timestamp

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

app.use(express.json());

// In-memory Multiplayer Game Storage
interface MultiplayerPlayer {
  clientId: string;
  name: string;
  avatar: string;
  avatarEmoji: string;
  gold: number;
  correctAnswers: number;
  totalAnswered: number;
  shieldCount: number;
  streak: number;
  highestStreak: number;
  isFinished: boolean;
  lastActive: number;
}

interface MultiplayerGame {
  gameId: string;
  status: 'lobby' | 'playing' | 'ended';
  mode: 'gold_quest' | 'speed_race';
  hostClientId: string;
  players: MultiplayerPlayer[];
  logs: string[];
  createdAt: number;
  gameLength: number; // e.g. 5, 10
  durationSeconds: number; // for timer, e.g. 180 (3 min)
  startTime?: number;
}

const games: Record<string, MultiplayerGame> = {};

// Cleanup idle games older than 3 hours or inactive for 30 mins
setInterval(() => {
  const now = Date.now();
  for (const gameId in games) {
    const game = games[gameId];
    const isTooOld = now - game.createdAt > 3 * 60 * 60 * 1000;
    const isInactive = game.players.every(p => now - p.lastActive > 30 * 60 * 1000) && (game.players.length > 0 || now - game.createdAt > 15 * 60 * 1000);
    
    if (isTooOld || isInactive) {
      console.log(`Cleaning up idle multiplayer game ${gameId}`);
      delete games[gameId];
    }
  }
}, 5 * 60 * 1000);

function generateGameId(): string {
  let id = "";
  do {
    id = Math.floor(100000 + Math.random() * 900000).toString();
  } while (games[id]);
  return id;
}

// Multiplayer API Endpoints
app.post("/api/multiplayer/create", (req, res) => {
  const { hostClientId, mode, gameLength, durationSeconds } = req.body;
  
  if (!hostClientId) {
    return res.status(400).json({ success: false, message: "Missing hostClientId" });
  }

  const gameId = generateGameId();
  
  const newGame: MultiplayerGame = {
    gameId,
    status: 'lobby',
    mode: mode || 'gold_quest',
    hostClientId,
    players: [],
    logs: ["Game lobby created. Share the code to invite teammates!"],
    createdAt: Date.now(),
    gameLength: gameLength || 10,
    durationSeconds: durationSeconds || 180,
  };

  games[gameId] = newGame;
  console.log(`Created multiplayer game lobby ${gameId} by host ${hostClientId}`);
  return res.json({ success: true, gameId, game: newGame });
});

app.post("/api/multiplayer/join", (req, res) => {
  const { gameId, clientId, name, avatar, avatarEmoji } = req.body;

  if (!gameId || !clientId || !name) {
    return res.status(400).json({ success: false, message: "Missing required join fields" });
  }

  const game = games[gameId];
  if (!game) {
    return res.json({ success: false, message: "Game lobby not found. Check the code and try again!" });
  }

  if (game.status !== 'lobby') {
    return res.json({ success: false, message: "This game has already started!" });
  }

  // Cap at 10 players maximum
  const activePlayers = game.players.filter(p => Date.now() - p.lastActive < 45 * 1000 || p.clientId === clientId);
  if (activePlayers.length >= 10 && !game.players.some(p => p.clientId === clientId)) {
    return res.json({ success: false, message: "This game room is full! (Max 10 players)" });
  }

  // Check if nickname is already taken by someone else
  const nicknameCollision = game.players.some(p => p.name.toLowerCase() === name.trim().toLowerCase() && p.clientId !== clientId && (Date.now() - p.lastActive < 45 * 1000));
  if (nicknameCollision) {
    return res.json({ success: false, message: "That nickname is already taken in this lobby!" });
  }

  // Find or insert player
  let playerIdx = game.players.findIndex(p => p.clientId === clientId);
  const cleanName = name.trim().substring(0, 15);

  const initialShields = avatar === 'Empathy Fox' ? 3 : 1;

  if (playerIdx === -1) {
    const newPlayer: MultiplayerPlayer = {
      clientId,
      name: cleanName,
      avatar: avatar || 'Empathy Fox',
      avatarEmoji: avatarEmoji || '🦊',
      gold: 0,
      correctAnswers: 0,
      totalAnswered: 0,
      shieldCount: initialShields,
      streak: 0,
      highestStreak: 0,
      isFinished: false,
      lastActive: Date.now(),
    };
    game.players.push(newPlayer);
    game.logs.unshift(`${cleanName} joined the floor! ${avatarEmoji}`);
  } else {
    // Rejoining / updating profile
    game.players[playerIdx].name = cleanName;
    game.players[playerIdx].avatar = avatar || game.players[playerIdx].avatar;
    game.players[playerIdx].avatarEmoji = avatarEmoji || game.players[playerIdx].avatarEmoji;
    game.players[playerIdx].lastActive = Date.now();
    game.logs.unshift(`${cleanName} reconnected to the floor.`);
  }

  console.log(`Player ${cleanName} (${clientId}) joined game ${gameId}`);
  return res.json({ success: true, game });
});

app.get("/api/multiplayer/room/:gameId", (req, res) => {
  const { gameId } = req.params;
  const { clientId } = req.query;

  const game = games[gameId];
  if (!game) {
    return res.json({ success: false, message: "Game not found" });
  }

  // Update heartbeat for the polling player
  if (clientId && typeof clientId === 'string') {
    const player = game.players.find(p => p.clientId === clientId);
    if (player) {
      player.lastActive = Date.now();
    }
  }

  // Auto end game if timer is up
  if (game.status === 'playing' && game.startTime) {
    const elapsed = (Date.now() - game.startTime) / 1000;
    if (elapsed >= game.durationSeconds) {
      game.status = 'ended';
      game.logs.unshift("⏱️ Time is up! The game has concluded!");
    }
  }

  return res.json({ success: true, game });
});

app.post("/api/multiplayer/start", (req, res) => {
  const { gameId, hostClientId } = req.body;

  const game = games[gameId];
  if (!game) {
    return res.json({ success: false, message: "Game not found" });
  }

  if (game.hostClientId !== hostClientId) {
    return res.status(403).json({ success: false, message: "Only the host can start the game!" });
  }

  game.status = 'playing';
  game.startTime = Date.now();
  game.logs.unshift("🚀 The Support Challenge has officially started! Solve cases as fast as you can!");
  
  console.log(`Started multiplayer game ${gameId}`);
  return res.json({ success: true, game });
});

app.post("/api/multiplayer/answer", (req, res) => {
  const { gameId, clientId, isCorrect } = req.body;

  const game = games[gameId];
  if (!game) {
    return res.json({ success: false, message: "Game not found" });
  }

  const player = game.players.find(p => p.clientId === clientId);
  if (!player) {
    return res.json({ success: false, message: "Player not found" });
  }

  player.lastActive = Date.now();
  player.totalAnswered += 1;

  if (isCorrect) {
    player.correctAnswers += 1;
    player.streak += 1;
    player.highestStreak = Math.max(player.highestStreak, player.streak);
  } else {
    player.streak = 0;
  }

  // If case-race mode and player reached target gameLength, mark finished
  if (game.mode === 'speed_race' && player.totalAnswered >= game.gameLength) {
    player.isFinished = true;
    game.logs.unshift(`🏁 ${player.name} finished all cases!`);
    
    // Check if everyone is finished
    const allFinished = game.players.every(p => p.isFinished);
    if (allFinished) {
      game.status = 'ended';
      game.logs.unshift("🏆 All agents clocked out! The game has concluded!");
    }
  }

  return res.json({ success: true, player, game });
});

app.post("/api/multiplayer/chest", (req, res) => {
  const { gameId, clientId, reward, targetClientId } = req.body;

  const game = games[gameId];
  if (!game) {
    return res.json({ success: false, message: "Game not found" });
  }

  const player = game.players.find(p => p.clientId === clientId);
  if (!player) {
    return res.json({ success: false, message: "Player not found" });
  }

  player.lastActive = Date.now();
  const avatar = player.avatar;

  // Process targeting actions if targetClientId is provided
  if (targetClientId) {
    const target = game.players.find(p => p.clientId === targetClientId);
    if (target) {
      if (reward.type === 'steal') {
        const stealPct = reward.value || 0.3;
        const stealAmount = Math.round(target.gold * stealPct);

        if (target.shieldCount > 0) {
          target.shieldCount = Math.max(0, target.shieldCount - 1);
          game.logs.unshift(`🛡️ ${target.name} blocked ${player.name}'s queue hijack!`);
        } else {
          let finalSteal = stealAmount;
          let bonusText = '';
          if (avatar === 'Rapport Frog') {
            const bonus = Math.round(stealAmount * 0.15);
            finalSteal += bonus;
            bonusText = ` (+${bonus} Rapport Bonus!)`;
          }

          target.gold = Math.max(0, target.gold - stealAmount);
          player.gold += finalSteal;
          game.logs.unshift(`🥷 ${player.name} hijacked ${target.name}'s ticket pool and swiped 🪙 ${finalSteal} gold!${bonusText}`);
        }
      } else if (reward.type === 'swap') {
        const myGold = player.gold;
        const targetGold = target.gold;

        player.gold = targetGold;
        target.gold = myGold;
        game.logs.unshift(`🔄 ${player.name} swapped active tickets with ${target.name}! Balance swapped!`);
      }
    }
  } else {
    // Process single-player reward types
    switch (reward.type) {
      case 'gold_add': {
        let gained = reward.value;

        // Apply Avatar specialties:
        if (avatar === 'Empathy Fox') {
          gained = Math.round(gained * 1.20);
        } else if (avatar === 'Wisdom Owl') {
          if (Math.random() < 0.15) {
            gained *= 2;
          }
        } else if (avatar === 'Chill Panda') {
          gained += 50;
        } else if (avatar === 'FCR Lion') {
          gained = Math.round(gained * 1.25);
        } else if (avatar === 'Rapport Frog') {
          gained = Math.round(gained * 1.15);
        } else if (avatar === 'Growth Unicorn') {
          gained += 100;
        }

        player.gold += gained;
        game.logs.unshift(`🪙 ${player.name} resolved a ticket. +${gained} gold!`);
        break;
      }
      case 'gold_mult': {
        const original = player.gold;
        player.gold = Math.round(player.gold * reward.value);
        const gained = player.gold - original;
        game.logs.unshift(`✨ ${player.name} opened a multiplier chest. Gold multiplied by ${reward.value}! (+${gained} gold)`);
        break;
      }
      case 'shield': {
        player.shieldCount = (player.shieldCount || 0) + 1;
        game.logs.unshift(`🛡️ ${player.name} obtained an Empathy Shield!`);
        break;
      }
    }
  }

  // If in case-race mode and player has completed all questions, and this was their chest event, mark as finished
  if (game.mode === 'speed_race' && player.totalAnswered >= game.gameLength) {
    player.isFinished = true;
    
    // Check if everyone is finished
    const allFinished = game.players.every(p => p.isFinished);
    if (allFinished) {
      game.status = 'ended';
      game.logs.unshift("🏆 All agents clocked out! The game has concluded!");
    }
  }

  return res.json({ success: true, game });
});

app.post("/api/multiplayer/end", (req, res) => {
  const { gameId, hostClientId } = req.body;

  const game = games[gameId];
  if (!game) {
    return res.json({ success: false, message: "Game not found" });
  }

  if (game.hostClientId !== hostClientId) {
    return res.status(403).json({ success: false, message: "Only the host can end the game!" });
  }

  game.status = 'ended';
  game.logs.unshift("🏁 The host has concluded the Support Challenge!");
  console.log(`Ended multiplayer game ${gameId}`);
  return res.json({ success: true, game });
});

// Robust fallback image generator using curated funny/cartoon illustrations that perfectly match customer support categories!
function getFallbackImage(category: string, scenario: string): string {
  const cat = (category || "").toLowerCase();
  
  if (cat.includes("first impression")) {
    return "/images/first_impressions.jpg";
  }
  if (cat.includes("active listening")) {
    return "/images/active_listening.jpg";
  }
  if (cat.includes("positive language")) {
    return "/images/positive_language.jpg";
  }
  if (cat.includes("process knowledge")) {
    return "/images/process_knowledge.jpg";
  }
  if (cat.includes("adaptability")) {
    return "/images/adaptability.jpg";
  }
  if (cat.includes("empathy")) {
    return "/images/empathy.jpg";
  }
  if (cat.includes("rapport")) {
    return "/images/building_rapport.jpg";
  }
  if (cat.includes("tone of voice")) {
    return "/images/tone_of_voice.jpg";
  }
  if (cat.includes("first contact") || cat.includes("fcr")) {
    return "/images/first_contact_resolution.jpg";
  }
  if (cat.includes("growth")) {
    return "/images/growth_mindset.jpg";
  }

  // General default playful 3D cartoon shape image
  return "/images/first_impressions.jpg";
}

// API endpoint to generate/fetch an image for a question
app.post("/api/generate-image", async (req, res) => {
  const { scenario, category } = req.body;

  try {
    if (quotaExhaustedUntil > Date.now()) {
      console.log(`Bypassing Gemini API call due to recent 429 Quota Exhaustion. Returning instant fallback.`);
      return res.json({ 
        success: false, 
        message: "Gemini API in temporary circuit-breaker cooldown", 
        imageUrl: getFallbackImage(category, scenario) 
      });
    }

    if (!ai) {
      console.warn("GEMINI_API_KEY is not configured or initialized. Returning placeholder image.");
      return res.json({ 
        success: false, 
        message: "Gemini API key not configured", 
        imageUrl: getFallbackImage(category, scenario) 
      });
    }

    // We'll generate a cute, expressive 3D cartoon illustration representing the scenario
    const prompt = `A cute 3D cartoon style scene depicting this customer service scenario: "${scenario}".
Category: ${category}.
Style: 3D cartoon visuals, soft claymation, bright warm lighting, cute friendly characters with playful and happy facial expressions, vibrant colors, minimalist simple background, clean clay-like textures. 
Absolutely NO realistic elements, NO photos, NO serious corporate art. Make it lighthearted, amusing, and wittily creative. Keep background simple, clean and colorful. No words, text, or letters in the image.`;

    console.log(`Generating image for scenario using Gemini: "${scenario.substring(0, 40)}..."`);
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      },
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }
    }

    if (imageUrl) {
      return res.json({ success: true, imageUrl });
    } else {
      console.warn("No inlineData returned from Gemini. Falling back.");
      return res.json({ success: false, imageUrl: getFallbackImage(category, scenario) });
    }

  } catch (error: any) {
    const errMsg = String(error?.message || "").toLowerCase();
    const status = String(error?.status || "").toLowerCase();
    const isQuota = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("exhausted") || status.includes("resource_exhausted") || error?.code === 429;
    
    if (isQuota) {
      console.warn("Gemini API Quota is temporarily exhausted. Activating 10-minute circuit-breaker and gracefully falling back to high-quality static illustrations.");
      quotaExhaustedUntil = Date.now() + 10 * 60 * 1000;
    } else {
      console.warn("Soft warning during Gemini image generation:", error?.message || error);
    }

    return res.json({ 
      success: false, 
      error: error?.message || "Unknown error", 
      imageUrl: getFallbackImage(category, scenario) 
    });
  }
});

// Vite middleware for development or serving build assets in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
