/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, Competitor, GamePhase, ChestReward, MultiplayerGame, MultiplayerPlayer, Question } from './types';
import { questions } from './questions';
import { sounds } from './sound';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Leaderboard } from './components/Leaderboard';
import { ChestStage } from './components/ChestStage';
import { SummaryScreen } from './components/SummaryScreen';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { HostDashboard } from './components/HostDashboard';
import { 
  Shield, 
  Coins, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';

const getClientId = () => {
  // Generate a brand new unique ID per page load to ensure separate tabs have separate client IDs,
  // preventing conflicts when players test multiplayer using multiple tabs in the same browser session.
  return 'client_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
};

const clientId = getClientId();

// Deep clone helper
const deepCloneQuestions = (list: typeof questions): Question[] => {
  return list.map(q => ({
    ...q,
    options: [...q.options]
  }));
};

// Helper to shuffle the choices of a single question and update the correct index dynamically
const shuffleQuestionOptions = (q: Question): Question => {
  const originalCorrectOption = q.options[q.correctAnswerIndex];
  const shuffledOptions = [...q.options];
  
  // Robust Fisher-Yates shuffle
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffledOptions[i];
    shuffledOptions[i] = shuffledOptions[j];
    shuffledOptions[j] = temp;
  }
  
  const newCorrectAnswerIndex = shuffledOptions.indexOf(originalCorrectOption);
  
  return {
    ...q,
    options: shuffledOptions,
    correctAnswerIndex: newCorrectAnswerIndex !== -1 ? newCorrectAnswerIndex : q.correctAnswerIndex,
  };
};

// Helper to shuffle questions and shuffle their options
const prepareQuestionPool = (list: typeof questions): Question[] => {
  const cloned = deepCloneQuestions(list);
  const pool = cloned.map(q => shuffleQuestionOptions(q));
  
  // Robust Fisher-Yates shuffle for the entire question pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }
  
  return pool;
};


const INITIAL_COMPETITORS: Competitor[] = [
  { id: 'bot-sarah', name: 'Sarah (FCR Queen)', avatar: 'lion', avatarEmoji: '🦁', role: 'Support Specialist II', gold: 150, accuracy: 0.85, shieldCount: 1 },
  { id: 'bot-john', name: 'John (Ticket Crusher)', avatar: 'frog', avatarEmoji: '🐸', role: 'Senior Specialist', gold: 120, accuracy: 0.80, shieldCount: 0 },
  { id: 'bot-marcus', name: 'Marcus (Script Reader)', avatar: 'panda', avatarEmoji: '🐼', role: 'Billing Advocate', gold: 90, accuracy: 0.70, shieldCount: 0 },
  { id: 'bot-empathy', name: 'Agent X (The Bot)', avatar: 'owl', avatarEmoji: '🦉', role: 'AI Agent V1', gold: 50, accuracy: 0.65, shieldCount: 0 },
];

export default function App() {
  // Game state
  const [phase, setPhase] = useState<GamePhase>('welcome');
  const [isMuted, setIsMuted] = useState(() => sounds.getMuteState());
  const [initialJoinCode, setInitialJoinCode] = useState<string>('');

  // Handle URL join parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinParam = params.get('join');
    if (joinParam && joinParam.trim().length === 6) {
      const code = joinParam.trim().toUpperCase();
      setInitialJoinCode(code);
      // Clean query parameter from address bar so it doesn't linger
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Multiplayer integration states
  const [multiplayerMode, setMultiplayerMode] = useState<'single_player' | 'multiplayer_player' | 'multiplayer_host' | null>(null);
  const [gameId, setGameId] = useState<string>('');
  const [multiplayerGame, setMultiplayerGame] = useState<MultiplayerGame | null>(null);
  const [isSimulatedMultiplayer, setIsSimulatedMultiplayer] = useState<boolean>(false);

  // Player state
  const [player, setPlayer] = useState<Player>({
    name: 'Agent Star',
    avatar: 'Empathy Fox',
    avatarEmoji: '🦊',
    gold: 0,
    correctAnswers: 0,
    totalAnswered: 0,
    shieldCount: 1, // Start with 1 friendly shield
    doubleNext: false,
    tripleNext: false,
    streak: 0,
    highestStreak: 0,
  });

  // Competitors
  const [competitors, setCompetitors] = useState<Competitor[]>(INITIAL_COMPETITORS);
  const [recentBotEvents, setRecentBotEvents] = useState<string[]>([]);
  const [systemToast, setSystemToast] = useState<{ message: string; type: 'info' | 'warning' | 'success' } | null>(null);

  // Question selection
  const [gameLength, setGameLength] = useState<number | 'endless'>(10);
  const [questionPool, setQuestionPool] = useState(() => prepareQuestionPool(questions));
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Active question choices
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [missedCategories, setMissedCategories] = useState<string[]>([]);
  const [currentQuestionImage, setCurrentQuestionImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  // Chest phase
  const [activeChestReward, setActiveChestReward] = useState<ChestReward | null>(null);
  const [targetingAction, setTargetingAction] = useState<'steal' | 'swap' | null>(null);

  // Auto-clear toast timer
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'info' | 'warning' | 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setSystemToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setSystemToast(null);
    }, 4500);
  };

  // Sound toggle handler
  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Keep refs of state variables to avoid resetting the simulation interval on every state update
  const playerRef = useRef(player);
  playerRef.current = player;

  const competitorsRef = useRef(competitors);
  competitorsRef.current = competitors;

  const currentQuestionIdxRef = useRef(currentQuestionIdx);
  currentQuestionIdxRef.current = currentQuestionIdx;

  // Tick simulated support agents (the live Blooket feel with upgraded dynamics!)
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'chest') return;
    if (multiplayerMode && multiplayerMode !== 'single_player') return;

    // Fast, stable heartbeat timer
    const interval = setInterval(() => {
      const currentCompetitors = competitorsRef.current;
      const currentPlayer = playerRef.current;
      const currentIdx = currentQuestionIdxRef.current;

      // 1. Dynamic action probability calculation (Intensity escalates over time + rubber banding)
      let botActionChance = 0.22;
      
      // Escalates as user progresses through cases
      botActionChance += (currentIdx * 0.015);

      // Rubber banding modifiers
      const botGolds = currentCompetitors.map(c => c.gold);
      const maxBotGold = Math.max(...botGolds, 1);
      const minBotGold = Math.min(...botGolds, 0);

      if (currentPlayer.gold > maxBotGold) {
        // Player is leading! Bots speed up to challenge them
        botActionChance += 0.12;
      } else if (currentPlayer.gold < minBotGold) {
        // Player is trailing! Slow down bots slightly to allow user to catch up
        botActionChance = Math.max(0.12, botActionChance - 0.06);
      }

      const roll = Math.random();

      if (roll < botActionChance) {
        // Pick a random bot
        const botIdx = Math.floor(Math.random() * currentCompetitors.length);
        const bot = currentCompetitors[botIdx];

        // Assess bot standings
        const isBotLeader = bot.gold === maxBotGold && bot.gold > currentPlayer.gold;
        const isBotTrailing = bot.gold === minBotGold && bot.gold < currentPlayer.gold;

        // Adaptive Bot accuracy based on workload/pressure
        let finalAccuracy = bot.accuracy;
        if (isBotLeader) finalAccuracy = Math.max(0.60, bot.accuracy - 0.10); // Leading bot feels pressure
        if (isBotTrailing) finalAccuracy = Math.min(0.95, bot.accuracy + 0.12); // Trailing bot buckles down

        const isCorrectChoice = Math.random() < finalAccuracy;

        if (isCorrectChoice) {
          const rewardRoll = Math.random();
          let eventText = '';

          if (rewardRoll < 0.15 && bot.gold > 100) {
            // Bot gets a multiplier from chest (e.g. x1.5 or x2)
            const multiplier = Math.random() < 0.3 ? 2 : 1.5;
            setCompetitors(prev => prev.map((c, idx) => idx === botIdx ? { ...c, gold: Math.round(c.gold * multiplier) } : c));
            eventText = `${bot.name} opened a gold chest and multiplied their support points by ${multiplier}x! ⚡`;
          } else {
            // Simple gold reward
            const gainedGold = Math.floor(100 + Math.random() * 200);
            setCompetitors(prev => prev.map((c, idx) => idx === botIdx ? { ...c, gold: c.gold + gainedGold } : c));
            eventText = `${bot.name} resolved a ticket. +${gainedGold} Gold!`;
          }

          if (eventText) {
            setRecentBotEvents(logs => [...logs, eventText]);
          }
        } else {
          // Bot made an incorrect choice, gets no gold this ticket
          setRecentBotEvents(logs => [...logs, `${bot.name} spent extra time researching standard guidelines.`]);
        }
      }
    }, 2500); // 2.5 second heartbeat - snappy, fast, competitive feel!

    return () => clearInterval(interval);
  }, [phase, multiplayerMode]);

  // Real-time Express Multiplayer State Synchronizer (via regular pollRoom calls)
  useEffect(() => {
    if (!multiplayerMode || multiplayerMode === 'single_player' || !gameId) return;
    if (isSimulatedMultiplayer) return; // Skip in simulated mode!

    console.log("🔔 Subscribing to Express room polling:", gameId);

    let isSubscribed = true;

    const pollRoom = async () => {
      try {
        const res = await fetch(`/api/multiplayer/room/${gameId}?clientId=${clientId}`);
        if (!res.ok) {
          if (res.status === 404) {
            showToast('The game session has been closed by the host.', 'warning');
            setPhase('welcome');
            setMultiplayerMode(null);
          }
          return;
        }
        const responseData = await res.json();
        if (!isSubscribed) return;

        if (responseData.success && responseData.game) {
          const game = responseData.game;
          setMultiplayerGame(game);

          // Map competitors from other players in the room
          const mappedCompetitors = game.players
            .filter((p: any) => p.clientId !== clientId)
            .map((p: any) => ({
              id: p.clientId,
              name: p.name,
              avatar: p.avatar,
              avatarEmoji: p.avatarEmoji,
              role: p.isFinished ? 'Clocked Out 🏁' : `Streak: ${p.streak || 0} 🔥`,
              gold: p.gold,
              accuracy: p.totalAnswered > 0 ? p.correctAnswers / p.totalAnswered : 0.8,
              shieldCount: p.shieldCount,
            }));
          setCompetitors(mappedCompetitors);

          // Update host dashboard logs and route phases
          if (multiplayerMode === 'multiplayer_host') {
            setRecentBotEvents(game.logs);
            if (game.status === 'playing') {
              setPhase('host_dashboard');
            } else if (game.status === 'ended') {
              setPhase('summary');
            } else {
              setPhase('lobby');
            }
          }

          // Sync active player stats and navigate phases based on game updates
          if (multiplayerMode === 'multiplayer_player') {
            if (game.status === 'lobby') {
              setPhase('lobby');
            } else if (game.status === 'playing') {
              if (phase === 'welcome' || phase === 'lobby') {
                // First time transitioning to playing - configure active player statistics from lobby choice
                const me = game.players.find((p: any) => p.clientId === clientId);
                if (me) {
                  setPlayer({
                    name: me.name,
                    avatar: me.avatar,
                    avatarEmoji: me.avatarEmoji,
                    gold: me.gold,
                    shieldCount: me.shieldCount,
                    correctAnswers: me.correctAnswers,
                    totalAnswered: me.totalAnswered,
                    streak: me.streak || 0,
                    highestStreak: me.highestStreak || 0,
                    doubleNext: false,
                    tripleNext: false,
                  });
                }
                
                setGameLength(game.gameLength);
                const shuffled = prepareQuestionPool(questions);
                setQuestionPool(shuffled);
                setCurrentQuestionIdx(0);
                setPhase('playing');
                sounds.playUnlock();
              } else {
                // Actively playing: synchronize state changes (hijacks, swaps, shields) from other players
                const me = game.players.find((p: any) => p.clientId === clientId);
                if (me) {
                  setPlayer(prev => {
                    if (prev.shieldCount > me.shieldCount) {
                      showToast('Your Empathy Shield blocked a hijack attempt! 🛡️', 'warning');
                      sounds.playShield();
                    }
                    if (prev.gold !== me.gold) {
                      const diff = me.gold - prev.gold;
                      if (diff < 0) {
                        sounds.playIncorrect();
                      } else if (diff > 0 && prev.totalAnswered === me.totalAnswered) {
                        sounds.playCoins();
                      }
                    }
                    return {
                      ...prev,
                      gold: me.gold,
                      shieldCount: me.shieldCount,
                      correctAnswers: me.correctAnswers,
                      totalAnswered: me.totalAnswered,
                      streak: me.streak || 0,
                      highestStreak: Math.max(prev.highestStreak || 0, me.highestStreak || 0),
                    };
                  });
                }
              }
            } else if (game.status === 'ended') {
              setPhase('summary');
            }
          }
        } else {
          showToast('The game session has been closed or does not exist.', 'warning');
          setPhase('welcome');
          setMultiplayerMode(null);
        }
      } catch (err) {
        console.error('Error polling room:', err);
      }
    };

    pollRoom();
    const interval = setInterval(pollRoom, 1500);

    return () => {
      console.log("🔌 Stopped polling Express room:", gameId);
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [multiplayerMode, gameId, clientId, phase, isSimulatedMultiplayer]);

  // Local or Host-mediated Bot gameplay tick
  useEffect(() => {
    if (!multiplayerGame || multiplayerGame.status !== 'playing') return;

    // Run this tick only if:
    // 1. We are in simulated offline mode OR
    // 2. We are the host of a real multiplayer room
    const isHostAndOnline = multiplayerMode === 'multiplayer_host' && !isSimulatedMultiplayer;
    if (!isSimulatedMultiplayer && !isHostAndOnline) return;

    const interval = setInterval(() => {
      // Find bot players (clientId starts with 'sim-bot-')
      const botPlayers = multiplayerGame.players.filter(p => p.clientId.startsWith('sim-bot-'));
      if (botPlayers.length === 0) return;

      const randomBot = botPlayers[Math.floor(Math.random() * botPlayers.length)];
      const isCorrect = Math.random() < 0.82; // 82% accuracy rate

      if (isSimulatedMultiplayer) {
        // Offline simulated game logic
        setMultiplayerGame(prev => {
          if (!prev) return null;

          let updatedPlayers = [...prev.players];
          let updatedLogs = [...prev.logs];
          const botIdx = updatedPlayers.findIndex(p => p.clientId === randomBot.clientId);
          if (botIdx === -1) return prev;

          const currentBot = updatedPlayers[botIdx];

          if (isCorrect) {
            const rewardRoll = Math.random();
            if (rewardRoll < 0.15) {
              // Steal action
              const targets = updatedPlayers.filter(p => p.clientId !== currentBot.clientId);
              if (targets.length > 0) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                const isTargetMe = target.clientId === clientId;
                const stealPct = Math.random() < 0.5 ? 0.25 : 0.5;
                const stealAmount = Math.round(target.gold * stealPct);

                if (target.shieldCount > 0) {
                  const targetIdx = updatedPlayers.findIndex(p => p.clientId === target.clientId);
                  updatedPlayers[targetIdx] = {
                    ...target,
                    shieldCount: target.shieldCount - 1,
                  };
                  updatedLogs.unshift(`🛡️ ${target.name} blocked ${currentBot.name}'s queue hijack!`);
                  if (isTargetMe) {
                    showToast(`Your Empathy Shield blocked a queue hijack from ${currentBot.name}! 🛡️`, 'success');
                    sounds.playShield();
                    setPlayer(p => ({ ...p, shieldCount: p.shieldCount - 1 }));
                  }
                } else {
                  const targetIdx = updatedPlayers.findIndex(p => p.clientId === target.clientId);
                  updatedPlayers[targetIdx] = {
                    ...target,
                    gold: Math.max(0, target.gold - stealAmount),
                  };
                  updatedPlayers[botIdx] = {
                    ...currentBot,
                    gold: currentBot.gold + stealAmount,
                    streak: (currentBot.streak || 0) + 1,
                  };
                  updatedLogs.unshift(`🥷 ${currentBot.name} hijacked ${target.name}'s ticket pool and swiped 🪙 ${stealAmount.toLocaleString()} gold!`);
                  if (isTargetMe) {
                    showToast(`🥷 ${currentBot.name} hijacked your tickets and swiped 🪙 ${stealAmount} gold!`, 'warning');
                    sounds.playIncorrect();
                    setPlayer(p => ({ ...p, gold: Math.max(0, p.gold - stealAmount) }));
                  }
                }
              }
            } else if (rewardRoll < 0.22) {
              // Swap action
              const targets = updatedPlayers.filter(p => p.clientId !== currentBot.clientId);
              if (targets.length > 0) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                const isTargetMe = target.clientId === clientId;

                const targetIdx = updatedPlayers.findIndex(p => p.clientId === target.clientId);
                const botGold = currentBot.gold;
                const targetGold = target.gold;

                updatedPlayers[botIdx] = {
                  ...currentBot,
                  gold: targetGold,
                  streak: (currentBot.streak || 0) + 1,
                };
                updatedPlayers[targetIdx] = {
                  ...target,
                  gold: botGold,
                };

                updatedLogs.unshift(`🔄 ${currentBot.name} swapped active tickets with ${target.name}! Balance swapped!`);
                if (isTargetMe) {
                  showToast(`🔄 ${currentBot.name} swapped active tickets with you! Your gold is now 🪙 ${botGold.toLocaleString()}!`, 'info');
                  sounds.playCoins();
                  setPlayer(p => ({ ...p, gold: botGold }));
                }
              }
            } else {
              // Normal gold addition
              const earned = Math.floor(150 + Math.random() * 200);
              updatedPlayers[botIdx] = {
                ...currentBot,
                gold: currentBot.gold + earned,
                correctAnswers: currentBot.correctAnswers + 1,
                totalAnswered: currentBot.totalAnswered + 1,
                streak: (currentBot.streak || 0) + 1,
                highestStreak: Math.max(currentBot.highestStreak || 0, (currentBot.streak || 0) + 1),
              };
              updatedLogs.unshift(`🪙 ${currentBot.name} resolved a complex case. +${earned} Gold!`);
            }
          } else {
            updatedPlayers[botIdx] = {
              ...currentBot,
              totalAnswered: currentBot.totalAnswered + 1,
              streak: 0,
            };
            updatedLogs.unshift(`⚠️ ${currentBot.name} spent extra time researching standard guidelines.`);
          }

          return {
            ...prev,
            players: updatedPlayers,
            logs: updatedLogs,
          };
        });
      } else {
        // Online real room -> post bot actions to the backend server!
        fetch('/api/multiplayer/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, clientId: randomBot.clientId, isCorrect }),
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.game && isCorrect) {
            const rewardRoll = Math.random();
            if (rewardRoll < 0.15) {
              const targets = data.game.players.filter((p: any) => p.clientId !== randomBot.clientId);
              if (targets.length > 0) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                const stealPct = Math.random() < 0.5 ? 0.25 : 0.5;
                fetch('/api/multiplayer/chest', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    gameId,
                    clientId: randomBot.clientId,
                    reward: { type: 'steal', value: stealPct },
                    targetClientId: target.clientId,
                  }),
                }).catch(err => console.error("Error submitting bot steal chest:", err));
              }
            } else if (rewardRoll < 0.22) {
              const targets = data.game.players.filter((p: any) => p.clientId !== randomBot.clientId);
              if (targets.length > 0) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                fetch('/api/multiplayer/chest', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    gameId,
                    clientId: randomBot.clientId,
                    reward: { type: 'swap' },
                    targetClientId: target.clientId,
                  }),
                }).catch(err => console.error("Error submitting bot swap chest:", err));
              }
            } else {
              const earned = Math.floor(150 + Math.random() * 200);
              fetch('/api/multiplayer/chest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  gameId,
                  clientId: randomBot.clientId,
                  reward: { type: 'gold_add', value: earned },
                }),
              }).catch(err => console.error("Error submitting bot gold add chest:", err));
            }
          }
        })
        .catch(err => console.error("Error in bot answer:", err));
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulatedMultiplayer, multiplayerMode, multiplayerGame, gameId, clientId]);

  // Local simulated multiplayer synchronization and player sync
  useEffect(() => {
    if (!isSimulatedMultiplayer || !multiplayerGame) return;

    // Sync competitors
    const mappedCompetitors = multiplayerGame.players
      .filter((p: any) => p.clientId !== clientId)
      .map((p: any) => ({
        id: p.clientId,
        name: p.name,
        avatar: p.avatar,
        avatarEmoji: p.avatarEmoji,
        role: p.isFinished ? 'Clocked Out' : `Streak: ${p.streak || 0} 🔥`,
        gold: p.gold,
        accuracy: p.totalAnswered > 0 ? p.correctAnswers / p.totalAnswered : 0.8,
        shieldCount: p.shieldCount,
      }));
    setCompetitors(mappedCompetitors);

    // Sync logs / bot events
    setRecentBotEvents(multiplayerGame.logs);

    // If host
    if (multiplayerMode === 'multiplayer_host') {
      if (multiplayerGame.status === 'playing') {
        setPhase('host_dashboard');
      } else if (multiplayerGame.status === 'ended') {
        setPhase('summary');
      } else {
        setPhase('lobby');
      }
    }

    // If player
    if (multiplayerMode === 'multiplayer_player') {
      if (multiplayerGame.status === 'lobby') {
        setPhase('lobby');
      } else if (multiplayerGame.status === 'playing') {
        if (phase === 'welcome' || phase === 'lobby') {
          // Initialize player stats from simulated game
          const me = multiplayerGame.players.find((p: any) => p.clientId === clientId);
          if (me) {
            setPlayer({
              name: me.name,
              avatar: me.avatar,
              avatarEmoji: me.avatarEmoji,
              gold: me.gold,
              shieldCount: me.shieldCount,
              correctAnswers: me.correctAnswers,
              totalAnswered: me.totalAnswered,
              streak: me.streak || 0,
              highestStreak: me.highestStreak || 0,
              doubleNext: false,
              tripleNext: false,
            });
          }
          setGameLength(multiplayerGame.gameLength);
          const shuffled = prepareQuestionPool(questions);
          setQuestionPool(shuffled);
          setCurrentQuestionIdx(0);
          setPhase('playing');
          sounds.playUnlock();
        } else {
          // Sync player's gold and shields if updated from a bot steal/swap
          const me = multiplayerGame.players.find((p: any) => p.clientId === clientId);
          if (me) {
            setPlayer(prev => {
              return {
                ...prev,
                gold: me.gold,
                shieldCount: me.shieldCount,
              };
            });
          }
        }
      } else if (multiplayerGame.status === 'ended') {
        setPhase('summary');
      }
    }
  }, [isSimulatedMultiplayer, multiplayerGame, multiplayerMode, clientId]);

  // Handle Game Setup
  const handleStartGame = (
    name: string,
    avatarEmoji: string,
    avatarName: string,
    length: number | 'endless'
  ) => {
    setPlayer({
      name,
      avatar: avatarName,
      avatarEmoji,
      gold: 0,
      correctAnswers: 0,
      totalAnswered: 0,
      shieldCount: 0,
      doubleNext: false,
      tripleNext: false,
      streak: 0,
      highestStreak: 0,
    });

    setGameLength(length);
    setCompetitors(INITIAL_COMPETITORS.map(c => ({
      ...c,
      gold: Math.floor(100 + Math.random() * 200), // randomize bot starting gold slightly
      shieldCount: 0
    })));

    setRecentBotEvents(['Floor is active. Get ready to resolve scenarios!']);
    setMissedCategories([]);

    // Set up questions. If endless, shuffle full set. Otherwise, pick a slice.
    const shuffled = prepareQuestionPool(questions);
    if (length === 'endless') {
      setQuestionPool(shuffled);
    } else {
      setQuestionPool(shuffled.slice(0, length));
    }

    setCurrentQuestionIdx(0);
    setPhase('playing');
    setSelectedAnswerIdx(null);
    setIsCorrect(null);
    setShowExplanation(false);
    sounds.playUnlock();

    // Trigger passive announcers
    if (avatarName === 'Empathy Fox') {
      setTimeout(() => {
        showToast("🦊 Empathy Fox specialty: Active listening gives you +20% Gold on ticket resolutions! 📈", "success");
      }, 1000);
    } else if (avatarName === 'Wisdom Owl') {
      setTimeout(() => {
        showToast("🦉 Wisdom Owl specialty: SOP Mastery gives you a 15% chance to double any gold chest reward! 📖", "success");
      }, 1000);
    } else if (avatarName === 'Chill Panda') {
      setTimeout(() => {
        showToast("🐼 Chill Panda specialty: Soothing presence increases base gold earned by +50! 🧘‍♂️", "success");
      }, 1000);
    } else if (avatarName === 'FCR Lion') {
      setTimeout(() => {
        showToast("🦁 FCR Lion specialty: Hunting resolutions adds +25% Gold to all ticket solutions! 🎯", "success");
      }, 1000);
    } else if (avatarName === 'Rapport Frog') {
      setTimeout(() => {
        showToast("🐸 Rapport Frog specialty: Friendly connections add +15% more gold to all correct answers! 🤝", "success");
      }, 1000);
    } else if (avatarName === 'Growth Unicorn') {
      setTimeout(() => {
        showToast("🦄 Growth Unicorn specialty: Constructive coaching provides a +100 gold boost for any tricky scenario! 🦄✨", "success");
      }, 1000);
    }
  };

  // Multiplayer setup actions
  const handleJoinMultiplayer = async (
    roomCode: string,
    nickname: string,
    avatarEmoji: string,
    avatarName: string
  ): Promise<string | null> => {
    try {
      setIsSimulatedMultiplayer(false);
      const res = await fetch('/api/multiplayer/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: roomCode,
          clientId,
          name: nickname,
          avatar: avatarName,
          avatarEmoji,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.game) {
        setIsSimulatedMultiplayer(false);
        setGameId(roomCode);
        setMultiplayerMode('multiplayer_player');
        setPhase('lobby');
        setMultiplayerGame(data.game);
        showToast('Successfully connected to the training floor!', 'success');
        sounds.playUnlock();
        return null;
      } else {
        return data.message || 'Could not join room';
      }
    } catch (err: any) {
      console.warn('REST join failed:', err);
      return 'Unable to connect to the multiplayer server. Please verify your internet connection or try again later.';
    }
  };

  const handleHostMultiplayer = async (
    mode: 'gold_quest' | 'case_race',
    gameLength: number,
    durationSeconds: number
  ): Promise<string | null> => {
    try {
      setIsSimulatedMultiplayer(false);
      const res = await fetch('/api/multiplayer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode === 'gold_quest' ? 'gold_quest' : 'speed_race',
          gameLength,
          durationSeconds,
          hostClientId: clientId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.game) {
        setIsSimulatedMultiplayer(false);
        setGameId(data.game.gameId);
        setMultiplayerMode('multiplayer_host');
        setPhase('lobby');
        setMultiplayerGame(data.game);
        showToast('Multiplayer training lobby created! Share the code with real players.', 'success');
        sounds.playUnlock();
        return null;
      } else {
        return data.message || 'Could not create multiplayer session';
      }
    } catch (err: any) {
      console.warn('REST host failed:', err);
      return 'Unable to host training arena. Please verify your internet connection or try again later.';
    }
  };

  const handleAddBot = async () => {
    if (!multiplayerGame) return;

    const botPool = [
      { name: 'Sarah Owl 🦉', avatar: 'Wisdom Owl', emoji: '🦉' },
      { name: 'Alex Lion 🦁', avatar: 'FCR Lion', emoji: '🦁' },
      { name: 'Miku Panda 🐼', avatar: 'Chill Panda', emoji: '🐼' },
      { name: 'Dave Fox 🦊', avatar: 'Empathy Fox', emoji: '🦊' },
      { name: 'Emily Frog 🐸', avatar: 'Rapport Frog', emoji: '🐸' },
    ];

    // Pick a bot name that isn't already in the lobby
    const currentBotNames = multiplayerGame.players.map(p => p.name);
    const availableBots = botPool.filter(b => !currentBotNames.includes(b.name));

    if (availableBots.length === 0) {
      showToast('Maximum simulated bots added!', 'warning');
      return;
    }

    const randomBot = availableBots[Math.floor(Math.random() * availableBots.length)];
    const botClientId = 'sim-bot-' + Math.random().toString(36).substr(2, 9);

    if (isSimulatedMultiplayer) {
      // Offline / Simulated mode -> add locally
      const newPlayer: MultiplayerPlayer = {
        clientId: botClientId,
        name: randomBot.name,
        avatar: randomBot.avatar,
        avatarEmoji: randomBot.emoji,
        gold: 0,
        correctAnswers: 0,
        totalAnswered: 0,
        shieldCount: 0,
        streak: 0,
        highestStreak: 0,
        isFinished: false,
        lastActive: Date.now(),
      };

      setMultiplayerGame(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: [...prev.players, newPlayer],
          logs: [`👋 ${randomBot.name} clocked onto the support floor!`, ...prev.logs],
        };
      });
      showToast(`${randomBot.name} joined the lobby!`, 'success');
      sounds.playUnlock();
    } else {
      // Real Online room -> hit the REST api join endpoint!
      try {
        const res = await fetch('/api/multiplayer/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            clientId: botClientId,
            name: randomBot.name,
            avatar: randomBot.avatar,
            avatarEmoji: randomBot.emoji,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.game) {
            setMultiplayerGame(data.game);
            showToast(`${randomBot.name} joined the online lobby!`, 'success');
            sounds.playUnlock();
          } else {
            showToast(data.message || 'Could not add bot to online lobby', 'warning');
          }
        }
      } catch (err) {
        console.error('Error adding bot to online lobby:', err);
        showToast('Error adding bot to online lobby', 'warning');
      }
    }
  };

  // Handle Scenario Choice
  const handleAnswerClick = (optionIdx: number) => {
    if (selectedAnswerIdx !== null) return; // locked

    sounds.playTick();
    setSelectedAnswerIdx(optionIdx);
    const activeQuestion = questionPool[currentQuestionIdx] || questions[0];
    const correct = optionIdx === activeQuestion.correctAnswerIndex;

    // Check Wisdom Owl Save Chance BEFORE sealing the result
    if (!correct && player.avatar === 'Wisdom Owl' && Math.random() < 0.35) {
      setTimeout(() => {
        showToast("🦉 Wisdom Owl Specialty Activated! Your SOP recall gives you a second chance on this ticket! Try another option. 📖", "success");
      }, 400);
      setSelectedAnswerIdx(null);
      setIsCorrect(null);
      setShowExplanation(false);
      sounds.playUnlock();
      return;
    }

    setIsCorrect(correct);
    setShowExplanation(true);

    // Start generating/fetching image for this question
    setIsImageLoading(true);
    setCurrentQuestionImage(null);

    if (activeQuestion.imageUrl) {
      // Instantly retrieve the dedicated 3D cartoon illustration stored inside the files of the application
      setCurrentQuestionImage(activeQuestion.imageUrl);
      setIsImageLoading(false);
    } else {
      fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: activeQuestion.scenario,
          category: activeQuestion.category,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.imageUrl) {
            setCurrentQuestionImage(data.imageUrl);
          }
        })
        .catch(err => {
          console.error('Failed to fetch scenario image:', err);
        })
        .finally(() => {
          setIsImageLoading(false);
        });
    }

    if (multiplayerMode === 'multiplayer_player') {
      const isFinished = gameLength !== 'endless' && (currentQuestionIdx + 1) >= Number(gameLength);
      if (isSimulatedMultiplayer) {
        setMultiplayerGame(prev => {
          if (!prev) return null;
          const updated = prev.players.map(p => {
            if (p.clientId === clientId) {
              const nextStreak = correct ? ((p.streak || 0) + 1) : 0;
              return {
                ...p,
                correctAnswers: p.correctAnswers + (correct ? 1 : 0),
                totalAnswered: p.totalAnswered + 1,
                streak: nextStreak,
                highestStreak: Math.max(p.highestStreak || 0, nextStreak),
              };
            }
            return p;
          });
          return { ...prev, players: updated };
        });
      } else {
        fetch('/api/multiplayer/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, clientId, isCorrect: correct }),
        }).catch(err => console.error('Error submitting answer:', err));
      }
    }

    if (correct) {
      sounds.playCorrect();
      setPlayer(prev => {
        const nextStreak = (prev.streak || 0) + 1;
        const nextHighest = Math.max(prev.highestStreak || 0, nextStreak);
        let doubleNext = prev.doubleNext;
        let tripleNext = prev.tripleNext;
        let shieldCount = prev.shieldCount;

        if (nextStreak === 3) {
          doubleNext = true;
          setTimeout(() => {
            showToast("🔥 3-Case Streak! First Contact Resolution bonus active: Next Chest is DOUBLE! ⚡", "success");
          }, 300);
        } else if (nextStreak === 5) {
          tripleNext = true;
          shieldCount += 1;
          setTimeout(() => {
            showToast("👑 5-Case Streak! Support Overdrive: Earned an Empathy Shield & TRIPLE Next Chest! 🛡️⚡", "success");
          }, 300);
        } else if (nextStreak > 5 && nextStreak % 3 === 0) {
          doubleNext = true;
          setTimeout(() => {
            showToast(`🔥 ${nextStreak}-Case Streak! Legendary support! Next Chest is DOUBLE! ⚡`, "success");
          }, 300);
        }

        return {
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
          totalAnswered: prev.totalAnswered + 1,
          streak: nextStreak,
          highestStreak: nextHighest,
          doubleNext,
          tripleNext,
          shieldCount,
        };
      });
    } else {
      sounds.playIncorrect();
      setPlayer(prev => {
        if (prev.streak && prev.streak >= 3) {
          setTimeout(() => {
            showToast(`📉 Streak broken! You resolved ${prev.streak} cases consecutively. Back to training queue!`, "info");
          }, 300);
        }
        return {
          ...prev,
          totalAnswered: prev.totalAnswered + 1,
          streak: 0,
        };
      });
      // Track missed category for coaching card
      if (!missedCategories.includes(activeQuestion.category)) {
        setMissedCategories(prev => [...prev, activeQuestion.category]);
      }
    }
  };

  // Proceed from Answer Card
  const handleProceedAfterAnswer = () => {
    if (isCorrect) {
      // Answered correctly -> Win a Key and go to Chest Selection stage!
      setPhase('chest');
    } else {
      // Answered incorrectly -> Skip Chest and go to next scenario immediately
      handleNextScenario();
    }
  };

  // Progress to next scenario or complete game
  const handleNextScenario = () => {
    // Reset answer fields
    setSelectedAnswerIdx(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setCurrentQuestionImage(null);
    setIsImageLoading(false);

    const isLast = currentQuestionIdx >= questionPool.length - 1;

    if (isLast) {
      if (gameLength === 'endless') {
        // Loop questions: shuffle pool and reset to 0
        const reshuffled = prepareQuestionPool(questions);
        setQuestionPool(reshuffled);
        setCurrentQuestionIdx(0);
        setPhase('playing');
        showToast('Next case-load dispatched! Great grinding!', 'success');
      } else {
        // Complete game
        setPhase('summary');
      }
    } else {
      setCurrentQuestionIdx(prev => prev + 1);
      setPhase('playing');
    }
  };

  // Handle Chest Selection Event
  const handleSelectChestReward = (reward: ChestReward) => {
    if (phase !== 'chest') return;
    setActiveChestReward(reward);

    // Apply immediate rewards/hazards
    setPlayer(prev => {
      let finalGold = prev.gold;
      let finalDouble = prev.doubleNext;
      let finalTriple = prev.tripleNext;

      if (reward.type === 'gold_add') {
        let gained = reward.value;

        // Apply Avatar specialties:
        if (prev.avatar === 'Empathy Fox') {
          gained = Math.round(gained * 1.20);
          setTimeout(() => {
            showToast("🦊 Empathy Fox specialty: +20% Gold on ticket resolution! 📈", "success");
          }, 300);
        } else if (prev.avatar === 'Wisdom Owl') {
          if (Math.random() < 0.15) {
            gained *= 2;
            setTimeout(() => {
              showToast("🦉 Wisdom Owl specialty: SOP Mastery doubled your chest reward! 📖✨", "success");
            }, 300);
          }
        } else if (prev.avatar === 'Chill Panda') {
          gained += 50;
          setTimeout(() => {
            showToast("🐼 Chill Panda specialty: Soothing presence added +50 Gold! 🧘‍♂️", "success");
          }, 300);
        } else if (prev.avatar === 'FCR Lion') {
          gained = Math.round(gained * 1.25);
          setTimeout(() => {
            showToast("🦁 FCR Lion specialty: +25% Gold on ticket resolution! 🎯", "success");
          }, 300);
        } else if (prev.avatar === 'Rapport Frog') {
          gained = Math.round(gained * 1.15);
          setTimeout(() => {
            showToast("🐸 Rapport Frog specialty: Friendly connections added +15% Gold! 🤝", "success");
          }, 300);
        } else if (prev.avatar === 'Growth Unicorn') {
          gained += 100;
          setTimeout(() => {
            showToast("🦄 Growth Unicorn specialty: Constructive coaching added +100 Gold! 🦄✨", "success");
          }, 300);
        }

        if (prev.tripleNext) {
          gained *= 3;
          finalTriple = false;
        } else if (prev.doubleNext) {
          gained *= 2;
          finalDouble = false;
        }
        finalGold += gained;
      } else if (reward.type === 'gold_mult') {
        finalGold = Math.round(finalGold * reward.value);
      }

      return {
        ...prev,
        gold: finalGold,
        doubleNext: finalDouble,
        tripleNext: finalTriple,
      };
    });

    // Submit non-targeting reward to server
    if (multiplayerMode === 'multiplayer_player') {
      let finalReward = { ...reward };
      if (reward.type === 'gold_add') {
        if (player.tripleNext) {
          finalReward.value *= 3;
        } else if (player.doubleNext) {
          finalReward.value *= 2;
        }
      }
      if (isSimulatedMultiplayer) {
        setMultiplayerGame(prev => {
          if (!prev) return null;
          const updated = prev.players.map(p => {
            if (p.clientId === clientId) {
              let gained = finalReward.type === 'gold_add' ? finalReward.value : 0;
              let currentGold = p.gold;
              if (finalReward.type === 'gold_add') {
                currentGold += gained;
              } else {
                currentGold = Math.round(currentGold * finalReward.value);
              }
              return {
                ...p,
                gold: currentGold,
                shieldCount: p.shieldCount,
              };
            }
            return p;
          });
          return {
            ...prev,
            players: updated,
            logs: [`🎁 You opened a chest and got: ${reward.label}!`, ...prev.logs],
          };
        });
      } else {
        fetch('/api/multiplayer/chest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, clientId, reward: finalReward }),
        }).catch(err => console.error('Error submitting chest:', err));
      }
    }

    // Clear reward and progress after small timing window
    setActiveChestReward(null);
    handleNextScenario();
  };

  // Handle Targeting execution (clicking target bot on Leaderboard)
  const handleExecuteTargetAction = (targetId: string) => {
    if (!targetingAction || !activeChestReward) return;

    if (multiplayerMode === 'multiplayer_player') {
      if (isSimulatedMultiplayer) {
        const targetBot = multiplayerGame?.players.find(p => p.clientId === targetId);
        if (targetBot) {
          setMultiplayerGame(prev => {
            if (!prev) return null;
            let updatedPlayers = [...prev.players];
            let updatedLogs = [...prev.logs];
            
            const myIdx = updatedPlayers.findIndex(p => p.clientId === clientId);
            const targetIdx = updatedPlayers.findIndex(p => p.clientId === targetId);
            
            const me = updatedPlayers[myIdx];
            const bot = updatedPlayers[targetIdx];
            
            if (targetingAction === 'steal') {
              const stealAmount = Math.round(bot.gold * activeChestReward.value);
              if (bot.shieldCount > 0) {
                // Blocked
                updatedPlayers[targetIdx] = { ...bot, shieldCount: bot.shieldCount - 1 };
                updatedLogs.unshift(`🛡️ ${bot.name} blocked your queue hijack with a Shield!`);
                showToast(`${bot.name} blocked your queue hijack with a Shield! 🛡️`, 'warning');
                sounds.playShield();
              } else {
                // Success
                let finalSteal = stealAmount;
                let bonusText = '';
                if (player.avatar === 'Rapport Frog') {
                  const bonus = Math.round(stealAmount * 0.15);
                  finalSteal += bonus;
                  bonusText = ` (+${bonus} Rapport Bonus!)`;
                  setTimeout(() => {
                    showToast("🐸 Rapport Frog Specialty: +15% Rapport Boost on queue steal! 🤝", "success");
                  }, 300);
                }
                
                updatedPlayers[targetIdx] = { ...bot, gold: Math.max(0, bot.gold - stealAmount) };
                updatedPlayers[myIdx] = { ...me, gold: me.gold + finalSteal };
                updatedLogs.unshift(`🥷 You hijacked ${bot.name}'s ticket pool and swiped 🪙 ${finalSteal} gold!${bonusText}`);
                showToast(`Stole 🪙 ${finalSteal} from ${bot.name}!${bonusText} 🥷`, 'success');
                sounds.playCoins();
                
                // Update single player state too
                setPlayer(p => ({ ...p, gold: p.gold + finalSteal }));
              }
            } else if (targetingAction === 'swap') {
              const myGold = me.gold;
              const botGold = bot.gold;
              
              updatedPlayers[myIdx] = { ...me, gold: botGold };
              updatedPlayers[targetIdx] = { ...bot, gold: myGold };
              
              updatedLogs.unshift(`🔄 You swapped active tickets with ${bot.name}!`);
              showToast(`Swapped balance with ${bot.name}! Balance is now 🪙 ${botGold}! 🔄`, 'success');
              sounds.playCoins();
              
              setPlayer(p => ({ ...p, gold: botGold }));
            }
            
            return {
              ...prev,
              players: updatedPlayers,
              logs: updatedLogs,
            };
          });
        }
      } else {
        fetch('/api/multiplayer/chest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            clientId,
            reward: { type: targetingAction, value: activeChestReward.value },
            targetClientId: targetId,
          }),
        }).catch(err => console.error('Error executing targeting reward:', err));
      }

      setTargetingAction(null);
      setActiveChestReward(null);
      handleNextScenario();
      return;
    }

    const targetBotIdx = competitors.findIndex(c => c.id === targetId);
    if (targetBotIdx === -1) return;

    const targetBot = competitors[targetBotIdx];

    if (targetingAction === 'steal') {
      const percentage = activeChestReward.value; // e.g. 0.25 or 0.50
      const stealAmount = Math.round(targetBot.gold * percentage);

      if (targetBot.shieldCount > 0) {
        // Blocked!
        showToast(`${targetBot.name} blocked your steal with a Shield! 🛡️`, 'warning');
        sounds.playShield();
        setCompetitors(prev => prev.map((c, idx) => idx === targetBotIdx ? { ...c, shieldCount: c.shieldCount - 1 } : c));
        setRecentBotEvents(logs => [...logs, `You tried to steal from ${targetBot.name}, but their Shield blocked it!`]);
      } else {
        // Success!
        let finalSteal = stealAmount;
        let bonusText = '';
        if (player.avatar === 'Rapport Frog') {
          const bonus = Math.round(stealAmount * 0.15);
          finalSteal += bonus;
          bonusText = ` (+${bonus} Rapport Bonus!)`;
          setTimeout(() => {
            showToast("🐸 Rapport Frog Specialty: +15% Rapport Boost on queue steal! 🤝", "success");
          }, 300);
        }
        showToast(`Stole 🪙 ${finalSteal} from ${targetBot.name}!${bonusText} 🥷`, 'success');
        sounds.playCoins();
        setPlayer(prev => ({ ...prev, gold: prev.gold + finalSteal }));
        setCompetitors(prev => prev.map((c, idx) => idx === targetBotIdx ? { ...c, gold: Math.max(0, c.gold - stealAmount) } : c));
        setRecentBotEvents(logs => [...logs, `You stole 🪙 ${finalSteal} from ${targetBot.name}!`]);
      }
    } else if (targetingAction === 'swap') {
      // Swapping balances
      const originalPlayerGold = player.gold;
      const originalBotGold = targetBot.gold;

      showToast(`Swapped balance with ${targetBot.name}! Balance is now 🪙 ${originalBotGold}! 🔄`, 'success');
      sounds.playCoins();

      setPlayer(prev => ({ ...prev, gold: originalBotGold }));
      setCompetitors(prev => prev.map((c, idx) => idx === targetBotIdx ? { ...c, gold: originalPlayerGold } : c));
      setRecentBotEvents(logs => [...logs, `You swapped seats/gold with ${targetBot.name}!`]);
    }

    // Reset targeting state and progress
    setTargetingAction(null);
    setActiveChestReward(null);
    handleNextScenario();
  };

  // Replay
  const handleRestart = () => {
    setPhase('welcome');
    setMultiplayerMode(null);
    setGameId('');
    setMultiplayerGame(null);
  };

  const activeQuestion = questionPool[currentQuestionIdx] || questions[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-amber-950 font-sans">
      {/* Top Navigation / Status Header Bar */}
      <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Logo & Call sign */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl filter drop-shadow select-none">🏆</span>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-slate-100 font-sans">
                Think Like a Top Performer
              </h1>
              <p className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest">
                Support Team Challenge
              </p>
            </div>
          </div>

          {/* Player stats bar (only visible during gameplay) */}
          {(phase === 'playing' || phase === 'chest') && (
            <div className="flex items-center gap-4">
              {/* Gold Counter with pulse effect */}
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-400 text-sm font-bold font-mono">
                <span className="animate-pulse">🪙</span>
                <span>{player.gold.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Sound & Controls toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700/60 cursor-pointer active:scale-95 transition-all"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col justify-center relative">
        
        {/* Real-time system warning toast popups */}
        <AnimatePresence>
          {systemToast && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 w-full max-w-md border-2 p-4 rounded-2xl shadow-2xl flex items-start gap-3 ${
                systemToast.type === 'warning'
                  ? 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-rose-950/40'
                  : systemToast.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-950/40'
                  : 'bg-indigo-950/90 border-indigo-500 text-indigo-200 shadow-indigo-950/40'
              }`}
            >
              {systemToast.type === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : systemToast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-normal font-sans">
                <span className="font-bold block mb-0.5">Floor Announcement</span>
                {systemToast.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Game Phases render */}
        <div className="w-full">
          {phase === 'welcome' && (
            <WelcomeScreen
              onStartGame={(name, emoji, avatarName, len) => {
                setMultiplayerMode('single_player');
                handleStartGame(name, emoji, avatarName, len);
              }}
              onJoinMultiplayer={handleJoinMultiplayer}
              onHostMultiplayer={handleHostMultiplayer}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              initialJoinCode={initialJoinCode}
            />
          )}

          {phase === 'lobby' && (
            <MultiplayerLobby
              gameId={gameId}
              players={multiplayerGame?.players || []}
              activeClientId={clientId}
              isHost={multiplayerMode === 'multiplayer_host'}
              isSimulated={isSimulatedMultiplayer}
              onStartGame={async () => {
                if (isSimulatedMultiplayer) {
                  setMultiplayerGame(prev => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      status: 'playing',
                      startTime: Date.now(),
                      logs: ['The host started the training shift! Go solve scenarios! 🚀', ...prev.logs],
                    };
                  });
                  sounds.playUnlock();
                  return;
                }
                await fetch('/api/multiplayer/start', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ gameId, hostClientId: clientId }),
                }).catch(err => {
                  console.error("Error starting game:", err);
                });
              }}
              onLeave={handleRestart}
              onAddBot={handleAddBot}
            />
          )}

          {phase === 'host_dashboard' && (
            <HostDashboard
              gameId={gameId}
              players={multiplayerGame?.players || []}
              logs={recentBotEvents}
              durationSeconds={multiplayerGame?.durationSeconds || 180}
              startTime={multiplayerGame?.startTime}
              onEndGame={async () => {
                await fetch('/api/multiplayer/end', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ gameId, hostClientId: clientId }),
                }).catch(err => {
                  console.error("Error ending game:", err);
                });
              }}
            />
          )}

          {phase === 'summary' && (
            <SummaryScreen
              player={player}
              competitors={competitors}
              multiplayerPlayers={multiplayerMode !== 'single_player' ? (multiplayerGame?.players || []) : undefined}
              activeClientId={clientId}
              missedCategories={missedCategories}
              onRestart={handleRestart}
            />
          )}

          {(phase === 'playing' || phase === 'chest') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Gameplay Left / Center Section */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Active Question Panel */}
                {phase === 'playing' && (
                  <motion.div
                    key={currentQuestionIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden"
                  >
                    {/* Header bar of Case */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 border border-indigo-800 px-3 py-1 rounded-full">
                          Case Category: {activeQuestion.category}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 font-bold">
                        Progress: {currentQuestionIdx + 1} / {gameLength === 'endless' ? '∞' : gameLength}
                      </div>
                    </div>

                    {/* Scenario Prompt */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest">
                        Incoming Support Scenario
                      </h3>
                      <p className="text-lg md:text-xl font-bold font-sans text-white leading-relaxed">
                        {activeQuestion.scenario}
                      </p>
                    </div>

                    {/* Answer choices list */}
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      {activeQuestion.options.map((opt, idx) => {
                        const isSelected = selectedAnswerIdx === idx;
                        const isAnswered = selectedAnswerIdx !== null;
                        const isCorrectOption = idx === activeQuestion.correctAnswerIndex;

                        let btnStyle = 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950/80';
                        if (isAnswered) {
                          if (isSelected) {
                            btnStyle = isCorrectOption 
                              ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200' 
                              : 'bg-rose-950/30 border-rose-500 text-rose-200';
                          } else if (isCorrectOption) {
                            btnStyle = 'bg-emerald-950/30 border-emerald-500 text-emerald-200';
                          } else {
                            btnStyle = 'bg-slate-950/20 border-slate-850/40 text-slate-500 opacity-60';
                          }
                        }

                        const badgeLetter = String.fromCharCode(65 + idx); // A, B, C, D

                        return (
                          <button
                            key={idx}
                            disabled={isAnswered}
                            onClick={() => handleAnswerClick(idx)}
                            className={`flex items-start text-left gap-4 p-4 rounded-2xl border-2 font-sans font-semibold text-sm transition-all cursor-pointer ${btnStyle} ${!isAnswered ? 'active:scale-99' : ''}`}
                          >
                            <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? isCorrectOption
                                  ? 'bg-emerald-500 text-emerald-950 border-emerald-400'
                                  : 'bg-rose-500 text-rose-950 border-rose-400'
                                : isCorrectOption && isAnswered
                                ? 'bg-emerald-500 text-emerald-950 border-emerald-400'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {badgeLetter}
                            </span>
                            <span className="leading-normal">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Post-answer feedback display */}
                    <AnimatePresence>
                      {showExplanation && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 pt-4 border-t border-slate-800"
                        >
                          {/* Generated/Fallback Scenario Illustration */}
                          <div className="relative overflow-hidden rounded-2xl border-2 border-slate-850 bg-slate-950 aspect-[16/9] flex items-center justify-center shadow-lg">
                            {(isImageLoading || (!currentQuestionImage && !isImageLoading)) && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10 space-y-3 p-4 text-center">
                                {isImageLoading ? (
                                  <>
                                    <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                                    <span className="text-xs font-mono text-slate-400 animate-pulse">Generating scenario illustration with Gemini AI...</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-800 flex items-center justify-center text-slate-600 font-mono text-xs">!</div>
                                    <span className="text-xs font-mono text-slate-600">Preparing scene fallback...</span>
                                  </>
                                )}
                              </div>
                            )}
                            {currentQuestionImage && (
                              <motion.img
                                initial={{ scale: 1.05, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                src={currentQuestionImage}
                                alt="Scenario Illustration"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          {/* Correctness banner */}
                          <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
                            isCorrect 
                              ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200' 
                              : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                          }`}>
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                            )}
                            <div className="text-xs leading-normal">
                              <strong className="block text-sm font-bold uppercase mb-0.5">
                                {isCorrect ? 'Outstanding Case Resolution!' : 'Coaching Feedback Available'}
                              </strong>
                              {activeQuestion.explanation}
                            </div>
                          </div>

                          {/* Top Performer Tip */}
                          <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 shadow-inner">
                            <span className="text-xl shrink-0 mt-0.5 select-none">💡</span>
                            <div className="text-xs leading-normal">
                              <strong className="block text-amber-400 font-bold uppercase tracking-wider font-mono text-[10px] mb-1">
                                Top Performer Golden Tip
                              </strong>
                              <p className="text-slate-300 font-sans italic leading-relaxed">
                                "{activeQuestion.tip}"
                              </p>
                            </div>
                          </div>

                          {/* Action Navigation */}
                          <button
                            onClick={handleProceedAfterAnswer}
                            className={`w-full font-black uppercase text-sm py-4 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border-b-4 ${
                              isCorrect 
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 border-amber-700' 
                                : 'bg-slate-800 hover:bg-slate-750 text-slate-100 border-slate-900'
                            }`}
                          >
                            <span>{isCorrect ? 'Earn Key & Open Chest' : 'Proceed to Next Ticket'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Chest selection stage */}
                {phase === 'chest' && (
                  <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-xl min-h-[400px] flex items-center justify-center">
                    <ChestStage
                      player={player}
                      competitors={competitors}
                      multiplayerPlayers={multiplayerMode !== 'single_player' ? (multiplayerGame?.players || []) : undefined}
                      activeClientId={clientId}
                      onSelectReward={handleSelectChestReward}
                      onExecuteStealOrSwap={handleExecuteTargetAction}
                    />
                  </div>
                )}
              </div>

              {/* Live Floor Team Leaderboard Right Side panel */}
              <div className="lg:col-span-1 h-full">
                <Leaderboard
                  player={player}
                  competitors={competitors}
                  multiplayerPlayers={multiplayerMode !== 'single_player' ? (multiplayerGame?.players || []) : undefined}
                  activeClientId={clientId}
                  highlightAction={targetingAction}
                  onSelectCompetitor={handleExecuteTargetAction}
                  recentBotEvents={recentBotEvents}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding credits */}
      <footer className="border-t border-slate-800/80 py-4 bg-slate-950/60 mt-8 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Think Like a Top CSAT Performer. All rights reserved.</span>
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" /> Inspired by Gold Quest gamification
          </span>
        </div>
      </footer>
    </div>
  );
}
