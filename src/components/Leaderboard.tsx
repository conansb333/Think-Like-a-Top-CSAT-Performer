/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Competitor, Player } from '../types';
import { Shield, Sparkles, Trophy, Users } from 'lucide-react';

interface LeaderboardProps {
  player?: Player;
  competitors?: Competitor[];
  multiplayerPlayers?: {
    clientId: string;
    name: string;
    avatarEmoji: string;
    gold: number;
    streak: number;
    isFinished?: boolean;
    lastActive?: number;
  }[];
  activeClientId?: string;
  highlightAction?: 'steal' | 'swap' | null;
  onSelectCompetitor?: (id: string) => void;
  recentBotEvents: string[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  player,
  competitors = [],
  multiplayerPlayers,
  activeClientId,
  recentBotEvents,
}) => {
  // Determine entries list based on mode
  let allEntries = [];

  if (multiplayerPlayers) {
    allEntries = multiplayerPlayers.map(p => {
      const isPlayer = p.clientId === activeClientId;
      return {
        id: p.clientId,
        name: isPlayer ? `${p.name} (You)` : p.name,
        avatarEmoji: p.avatarEmoji,
        gold: p.gold,
        role: isPlayer ? 'Primary Advocate' : 'Support Advocate',
        isPlayer,
        streak: p.streak || 0,
        isFinished: p.isFinished || false,
        isOffline: p.lastActive ? (Date.now() - p.lastActive > 15000) : false,
      };
    });
  } else if (player) {
    allEntries = [
      {
        id: 'player',
        name: `${player.name} (You)`,
        avatarEmoji: player.avatarEmoji,
        gold: player.gold,
        role: 'Support Agent',
        isPlayer: true,
        streak: player.streak || 0,
        isFinished: false,
        isOffline: false,
      },
      ...competitors.map(c => ({
        id: c.id,
        name: c.name,
        avatarEmoji: c.avatarEmoji,
        gold: c.gold,
        role: c.role,
        isPlayer: false,
        streak: 0,
        isFinished: false,
        isOffline: false,
      })),
    ];
  }

  // Sort by gold descending
  allEntries.sort((a, b) => b.gold - a.gold);

  return (
    <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 flex flex-col h-full shadow-2xl overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold font-sans text-slate-100 uppercase tracking-wider">
            Live Support Floor
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full border border-slate-700">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>{allEntries.length} Agents Online</span>
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {allEntries.map((entry, index) => {
            const rankEmoji = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`relative flex items-center justify-between p-3 rounded-xl border transition-all ${
                  entry.isPlayer
                    ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-800/60 border-slate-700/60'
                } ${entry.isOffline ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Indicator */}
                  <div className="w-8 text-center text-sm font-black text-slate-400 flex justify-center items-center">
                    {typeof rankEmoji === 'string' && rankEmoji.startsWith('#') ? (
                      <span className="text-xs font-mono">{rankEmoji}</span>
                    ) : (
                      <span className="text-lg">{rankEmoji}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-xl border border-slate-600 shadow-inner">
                    <span>{entry.avatarEmoji}</span>
                  </div>

                  {/* Name and Role */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 flex-wrap">
                      {entry.name}
                      {entry.isFinished && (
                        <span className="text-[9px] bg-indigo-500 text-indigo-950 font-black px-1 rounded">
                          Done
                        </span>
                      )}
                      {entry.isOffline && (
                        <span className="text-[9px] bg-slate-600 text-slate-100 font-bold px-1 rounded animate-pulse">
                          Away
                        </span>
                      )}
                      {entry.streak >= 3 ? (
                        <span className="text-[10px] bg-orange-600/20 border border-orange-500/40 text-orange-400 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse shrink-0">
                          🔥 {entry.streak} Streak
                        </span>
                      ) : null}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{entry.role}</p>
                  </div>
                </div>

                {/* Score / Gold */}
                <div className="flex items-center gap-1 text-right">
                  <div className="text-amber-400 font-black font-mono text-base flex items-center gap-1">
                    🪙 {entry.gold.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>


      {/* Bot Live Feed Events */}
      <div className="mt-4 border-t border-slate-700/60 pt-3 bg-slate-950/40 -mx-5 -mb-5 px-5 py-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Support Floor Radio
        </h4>
        <div className="h-16 overflow-y-auto text-xs font-mono text-indigo-300 space-y-1.5 pr-1 select-none">
          {recentBotEvents.length === 0 ? (
            <p className="text-slate-500 italic">Waiting for agents to answer tickets...</p>
          ) : (
            recentBotEvents.slice(-3).reverse().map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-1 text-[11px]"
              >
                <span className="text-indigo-500">⚡</span>
                <span>{event}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
