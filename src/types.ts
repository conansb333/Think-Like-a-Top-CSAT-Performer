/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: number;
  category: string;
  scenario: string;
  options: string[];
  correctAnswerIndex: number;
  tip: string;
  explanation: string;
  imageUrl?: string;
}

export interface Player {
  name: string;
  avatar: string;
  avatarEmoji: string;
  gold: number;
  correctAnswers: number;
  totalAnswered: number;
  shieldCount: number;
  doubleNext: boolean;
  tripleNext: boolean;
  streak?: number;
  highestStreak?: number;
}

export interface Competitor {
  id: string;
  name: string;
  avatar: string;
  avatarEmoji: string;
  role: string;
  gold: number;
  accuracy: number;
  shieldCount: number;
}

export type GamePhase = 'welcome' | 'multiplayer_setup' | 'lobby' | 'playing' | 'chest' | 'summary' | 'host_dashboard';

export interface ChestReward {
  type: 'gold_add' | 'gold_mult';
  value: number; // can represent amount of gold or multiplier
  label: string;
  description: string;
}

export interface MultiplayerPlayer {
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

export interface MultiplayerGame {
  gameId: string;
  status: 'lobby' | 'playing' | 'ended';
  mode: 'gold_quest' | 'speed_race';
  hostClientId: string;
  players: MultiplayerPlayer[];
  logs: string[];
  createdAt: number;
  gameLength: number; // e.g. 10 questions
  durationSeconds: number; // for timer
  startTime?: number;
}
