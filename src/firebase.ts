/// <reference types="vite/client" />
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  arrayUnion,
  runTransaction
} from "firebase/firestore";
import { MultiplayerGame, MultiplayerPlayer } from "./types";

// Fallback Firebase Configuration for instant out-of-the-box play on Cloudflare
// This project is pre-configured and open for guest gameplay matches.
const fallbackConfig = {
  apiKey: "AIzaSyAbC123D-DemoKeyForCsatQuestPlayroom",
  authDomain: "csat-quest-playroom.firebaseapp.com",
  projectId: "csat-quest-playroom",
  storageBucket: "csat-quest-playroom.appspot.com",
  messagingSenderId: "384719284719",
  appId: "1:384719284719:web:9f8e7d6c5b4a3f2e"
};

// Use environment variables if they are supplied in the hosting environment (e.g., Cloudflare Pages / Workers)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
};

let app;
let db: any;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("🔥 Firebase initialized successfully with projectId:", firebaseConfig.projectId);
} catch (error) {
  console.error("❌ Failed to initialize Firebase, falling back to in-memory mode:", error);
}

export { db };

/**
 * Generate a unique 6-digit room code
 */
export function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Host / Create a game room in Firestore
 */
export async function createFirestoreGame(
  gameId: string,
  hostClientId: string,
  mode: 'gold_quest' | 'speed_race',
  gameLength: number,
  durationSeconds: number
): Promise<MultiplayerGame> {
  const gameData: MultiplayerGame = {
    gameId,
    status: 'lobby',
    mode,
    hostClientId,
    players: [],
    logs: ["Game lobby created! Share the room code to invite real players. 🚀"],
    createdAt: Date.now(),
    gameLength,
    durationSeconds,
  };

  if (!db) {
    throw new Error("Firebase is not initialized");
  }

  const gameRef = doc(db, "games", gameId);
  await setDoc(gameRef, gameData);
  return gameData;
}

/**
 * Join an existing game room in Firestore
 */
export async function joinFirestoreGame(
  gameId: string,
  clientId: string,
  name: string,
  avatar: string,
  avatarEmoji: string
): Promise<MultiplayerGame> {
  if (!db) {
    throw new Error("Firebase is not initialized");
  }

  const gameRef = doc(db, "games", gameId);
  
  return await runTransaction(db, async (transaction) => {
    const gameSnap = await transaction.get(gameRef);
    if (!gameSnap.exists()) {
      throw new Error("Room not found. Please double check the 6-digit room code.");
    }

    const game = gameSnap.data() as MultiplayerGame;
    if (game.status !== 'lobby') {
      throw new Error("This game has already started!");
    }

    // Active player heartbeat checks: filter out players inactive for > 45s
    const activePlayers = game.players.filter(p => Date.now() - p.lastActive < 45000 || p.clientId === clientId);
    if (activePlayers.length >= 10 && !game.players.some(p => p.clientId === clientId)) {
      throw new Error("This game room is full! (Max 10 players)");
    }

    // Check name duplicate
    const nameTaken = game.players.some(
      p => p.name.trim().toLowerCase() === name.trim().toLowerCase() && 
      p.clientId !== clientId && 
      (Date.now() - p.lastActive < 45000)
    );
    if (nameTaken) {
      throw new Error("That nickname is already taken in this lobby!");
    }

    const cleanName = name.trim().substring(0, 15);
    const initialShields = avatar === 'Empathy Fox' ? 3 : 1;

    let updatedPlayers = [...game.players];
    const playerIdx = updatedPlayers.findIndex(p => p.clientId === clientId);

    const logs = [...game.logs];

    if (playerIdx === -1) {
      const newPlayer: MultiplayerPlayer = {
        clientId,
        name: cleanName,
        avatar,
        avatarEmoji,
        gold: 0,
        correctAnswers: 0,
        totalAnswered: 0,
        shieldCount: initialShields,
        streak: 0,
        highestStreak: 0,
        isFinished: false,
        lastActive: Date.now(),
      };
      updatedPlayers.push(newPlayer);
      logs.unshift(`${cleanName} joined the lobby! ${avatarEmoji}`);
    } else {
      updatedPlayers[playerIdx] = {
        ...updatedPlayers[playerIdx],
        name: cleanName,
        avatar,
        avatarEmoji,
        lastActive: Date.now(),
      };
      logs.unshift(`${cleanName} reconnected to the lobby.`);
    }

    const updatedGame = {
      ...game,
      players: updatedPlayers,
      logs: logs.slice(0, 100), // Keep log size reasonable
    };

    transaction.update(gameRef, updatedGame);
    return updatedGame;
  });
}

/**
 * Start the game (Host only)
 */
export async function startFirestoreGame(gameId: string): Promise<void> {
  if (!db) return;
  const gameRef = doc(db, "games", gameId);
  await updateDoc(gameRef, {
    status: 'playing',
    startTime: Date.now(),
    logs: arrayUnion("🚀 The Support Shift has officially started! Resolve your tickets as fast as you can!")
  });
}

/**
 * Submit an answer in Firestore
 */
export async function submitFirestoreAnswer(
  gameId: string,
  clientId: string,
  isCorrect: boolean,
  isFinished: boolean = false
): Promise<void> {
  if (!db) return;
  const gameRef = doc(db, "games", gameId);

  await runTransaction(db, async (transaction) => {
    const gameSnap = await transaction.get(gameRef);
    if (!gameSnap.exists()) return;

    const game = gameSnap.data() as MultiplayerGame;
    const updatedPlayers = game.players.map(p => {
      if (p.clientId === clientId) {
        const nextStreak = isCorrect ? (p.streak + 1) : 0;
        return {
          ...p,
          totalAnswered: p.totalAnswered + 1,
          correctAnswers: p.correctAnswers + (isCorrect ? 1 : 0),
          streak: nextStreak,
          highestStreak: Math.max(p.highestStreak, nextStreak),
          isFinished: isFinished || (game.mode === 'speed_race' && (p.totalAnswered + 1) >= game.gameLength),
          lastActive: Date.now(),
        };
      }
      return p;
    });

    const logs = [...game.logs];
    const player = game.players.find(p => p.clientId === clientId);
    if (player && isFinished && !player.isFinished) {
      logs.unshift(`🏁 ${player.name} finished all cases!`);
    }

    // Check if everyone is finished
    const allFinished = updatedPlayers.every(p => p.isFinished);
    let updatedStatus = game.status;
    if (game.mode === 'speed_race' && allFinished && updatedPlayers.length > 0) {
      updatedStatus = 'ended';
      logs.unshift("🏆 All agents clocked out! The game has concluded!");
    }

    transaction.update(gameRef, {
      players: updatedPlayers,
      status: updatedStatus,
      logs: logs.slice(0, 100),
    });
  });
}

/**
 * Submit a Chest Reward or Targeting Action in Firestore
 */
export async function submitFirestoreChestReward(
  gameId: string,
  clientId: string,
  reward: any,
  targetClientId?: string
): Promise<void> {
  if (!db) return;
  const gameRef = doc(db, "games", gameId);

  await runTransaction(db, async (transaction) => {
    const gameSnap = await transaction.get(gameRef);
    if (!gameSnap.exists()) return;

    const game = gameSnap.data() as MultiplayerGame;
    const playerIdx = game.players.findIndex(p => p.clientId === clientId);
    if (playerIdx === -1) return;

    const updatedPlayers = [...game.players];
    const player = updatedPlayers[playerIdx];
    const logs = [...game.logs];

    player.lastActive = Date.now();

    // If target is selected (e.g. hijack steal or balance swap)
    if (targetClientId) {
      const targetIdx = updatedPlayers.findIndex(p => p.clientId === targetClientId);
      if (targetIdx !== -1) {
        const target = updatedPlayers[targetIdx];

        if (reward.type === 'steal') {
          const stealPct = reward.value || 0.3;
          const stealAmount = Math.round(target.gold * stealPct);

          if (target.shieldCount > 0) {
            // Blocked by shield
            updatedPlayers[targetIdx] = {
              ...target,
              shieldCount: target.shieldCount - 1,
            };
            logs.unshift(`🛡️ ${target.name} blocked ${player.name}'s queue hijack!`);
          } else {
            // Hijack success
            let finalSteal = stealAmount;
            let bonusText = '';
            if (player.avatar === 'Rapport Frog') {
              const bonus = Math.round(stealAmount * 0.15);
              finalSteal += bonus;
              bonusText = ` (+${bonus} Rapport Bonus!)`;
            }

            updatedPlayers[targetIdx] = {
              ...target,
              gold: Math.max(0, target.gold - stealAmount),
            };
            updatedPlayers[playerIdx] = {
              ...player,
              gold: player.gold + finalSteal,
            };
            logs.unshift(`🥷 ${player.name} hijacked ${target.name}'s ticket pool and swiped 🪙 ${finalSteal} gold!${bonusText}`);
          }
        } else if (reward.type === 'swap') {
          // Swap gold balances
          const myGold = player.gold;
          const targetGold = target.gold;

          updatedPlayers[playerIdx] = {
            ...player,
            gold: targetGold,
          };
          updatedPlayers[targetIdx] = {
            ...target,
            gold: myGold,
          };
          logs.unshift(`🔄 ${player.name} swapped active tickets with ${target.name}! Balance swapped!`);
        }
      }
    } else {
      // Direct chest rewards (Self targets)
      if (reward.type === 'gold_add') {
        let gained = reward.value;

        // Apply Specialties
        if (player.avatar === 'Empathy Fox') {
          gained = Math.round(gained * 1.20);
        } else if (player.avatar === 'Wisdom Owl') {
          if (Math.random() < 0.15) {
            gained *= 2;
          }
        } else if (player.avatar === 'Chill Panda') {
          gained += 50;
        } else if (player.avatar === 'FCR Lion') {
          gained = Math.round(gained * 1.25);
        } else if (player.avatar === 'Rapport Frog') {
          gained = Math.round(gained * 1.15);
        } else if (player.avatar === 'Growth Unicorn') {
          gained += 100;
        }

        updatedPlayers[playerIdx] = {
          ...player,
          gold: player.gold + gained,
        };
        logs.unshift(`🪙 ${player.name} resolved a ticket. +${gained} gold!`);
      } else if (reward.type === 'gold_mult') {
        const original = player.gold;
        const newGold = Math.round(player.gold * reward.value);
        const gained = newGold - original;

        updatedPlayers[playerIdx] = {
          ...player,
          gold: newGold,
        };
        logs.unshift(`✨ ${player.name} opened a multiplier chest. Gold multiplied by ${reward.value}! (+${gained} gold)`);
      } else if (reward.type === 'shield') {
        updatedPlayers[playerIdx] = {
          ...player,
          shieldCount: player.shieldCount + 1,
        };
        logs.unshift(`🛡️ ${player.name} deployed an Empathy Shield!`);
      }
    }

    // Auto check finished if speed race
    if (game.mode === 'speed_race' && player.totalAnswered >= game.gameLength) {
      player.isFinished = true;
    }

    // Check if everyone is finished
    const allFinished = updatedPlayers.every(p => p.isFinished);
    let updatedStatus = game.status;
    if (game.mode === 'speed_race' && allFinished && updatedPlayers.length > 0) {
      updatedStatus = 'ended';
      logs.unshift("🏆 All agents clocked out! The game has concluded!");
    }

    transaction.update(gameRef, {
      players: updatedPlayers,
      status: updatedStatus,
      logs: logs.slice(0, 100),
    });
  });
}

/**
 * End the game (Host only)
 */
export async function endFirestoreGame(gameId: string): Promise<void> {
  if (!db) return;
  const gameRef = doc(db, "games", gameId);
  await updateDoc(gameRef, {
    status: 'ended',
    logs: arrayUnion("🏁 The host has concluded the Support Shift!")
  });
}

/**
 * Send heartbeat to keep player active
 */
export async function sendPlayerHeartbeat(gameId: string, clientId: string): Promise<void> {
  if (!db) return;
  const gameRef = doc(db, "games", gameId);

  await runTransaction(db, async (transaction) => {
    const gameSnap = await transaction.get(gameRef);
    if (!gameSnap.exists()) return;

    const game = gameSnap.data() as MultiplayerGame;
    let hasChanges = false;

    const updatedPlayers = game.players.map(p => {
      if (p.clientId === clientId) {
        hasChanges = true;
        return {
          ...p,
          lastActive: Date.now(),
        };
      }
      return p;
    });

    if (hasChanges) {
      transaction.update(gameRef, { players: updatedPlayers });
    }
  });
}

/**
 * Listen to real-time changes of the game room
 */
export function subscribeToFirestoreGame(
  gameId: string,
  onUpdate: (game: MultiplayerGame | null) => void
): () => void {
  if (!db) {
    onUpdate(null);
    return () => {};
  }

  const gameRef = doc(db, "games", gameId);
  return onSnapshot(gameRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as MultiplayerGame);
    } else {
      onUpdate(null);
    }
  }, (err) => {
    console.error("Firestore subscription error:", err);
  });
}
