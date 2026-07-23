/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChestReward, Player, Competitor } from '../types';
import { sounds } from '../sound';
import { Shield, Sparkles, AlertTriangle, Coins, Eye, Users, ArrowRight } from 'lucide-react';

interface ChestStageProps {
  player: Player;
  competitors?: Competitor[];
  multiplayerPlayers?: {
    clientId: string;
    name: string;
    avatarEmoji: string;
    gold: number;
    shieldCount: number;
    streak: number;
    isFinished?: boolean;
    lastActive?: number;
  }[];
  activeClientId?: string;
  onSelectReward: (reward: ChestReward) => void;
  onExecuteStealOrSwap?: (targetId: string, reward: ChestReward) => void;
}

// Generate a randomized pool of Blooket-style rewards with support floor humor!
const generateRewards = (playerGold: number): ChestReward[] => {
  const pool: ChestReward[] = [
    { type: 'gold_add', value: 100, label: 'Warm Greeting Accent', description: 'The customer appreciated your energetic opening call sign!' },
    { type: 'gold_add', value: 250, label: 'Active Listening Bonus', description: 'You summarized a complex workflow perfectly, earning ticket credits.' },
    { type: 'gold_add', value: 500, label: 'Perfect FCR Resolution', description: 'Resolved the entire complication during the first chat! No transfers.' },
    { type: 'gold_add', value: 1000, label: 'Elite Promoter Survey', description: 'The caller left a 5-star review writing a literal poem about your service!' },
  ];

  // Only offer multipliers if the player has some gold to make it interesting
  if (playerGold > 100) {
    pool.push(
      { type: 'gold_mult', value: 1.5, label: 'x1.5 Gold Multiplier', description: 'Your support shift is on absolute fire! Increase your current savings.' },
      { type: 'gold_mult', value: 2, label: 'Double Gold', description: 'Legendary momentum! Your supervisor is literally weeping tears of joy.' },
      { type: 'gold_mult', value: 3, label: 'Triple Gold', description: 'Absolute legendary support floor performance! Triple your total savings!' }
    );
  } else {
    pool.push(
      { type: 'gold_add', value: 150, label: 'Standard Solution Applied', description: 'Followed standard procedures to solve an authentication issue.' },
      { type: 'gold_add', value: 350, label: 'Quick Response Award', description: 'Responded in under 45 seconds to a high priority chat ticket!' }
    );
  }

  // Pick 3 random rewards from the pool
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

export const ChestStage: React.FC<ChestStageProps> = ({
  player,
  onSelectReward,
}) => {
  const [chestPool] = useState<ChestReward[]>(() => generateRewards(player.gold));
  const [openedIdx, setOpenedIdx] = useState<number | null>(null);
  const [revealedReward, setRevealedReward] = useState<ChestReward | null>(null);
  const submittedRef = React.useRef(false);

  const handleOpenChest = (idx: number) => {
    if (openedIdx !== null) return;
    setOpenedIdx(idx);
    const reward = chestPool[idx];
    setRevealedReward(reward);

    // Play appropriate sound effect
    if (reward.type === 'gold_mult') {
      sounds.playCoins();
      sounds.playUnlock();
    } else {
      sounds.playCoins();
    }

    // For immediate rewards
    setTimeout(() => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      onSelectReward(reward);
    }, 2500); // give them time to read the card flip before continuing
  };

  const handleContinueImmediately = () => {
    if (revealedReward) {
      if (submittedRef.current) return;
      submittedRef.current = true;
      onSelectReward(revealedReward);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <AnimatePresence mode="wait">
        {openedIdx === null ? (
          <motion.div
            key="chest-selection"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-8 py-6 w-full"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                Case Resolved! Claim Your Reward
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                Unlock a Support Gold Chest
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto font-sans mt-1.5">
                Each chest contains a random floor event. Choose wisely to build your promoter scores!
              </p>
            </div>

            {/* 3 Bobbing Chest Cards */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
              {[0, 1, 2].map((idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleOpenChest(idx)}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    y: {
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: idx * 0.3,
                    },
                  }}
                  className="bg-slate-900 border-2 border-slate-700 hover:border-amber-400 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer shadow-[0_15px_30px_rgba(0,0,0,0.4)] aspect-square group transition-all relative overflow-hidden"
                >
                  {/* Subtle inner background glow */}
                  <div className="absolute inset-0 bg-radial from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <span className="text-5xl md:text-6xl filter drop-shadow-md select-none transform group-hover:rotate-6 transition-transform">
                    🎁
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono group-hover:text-amber-400 transition-colors">
                    Chest #{idx + 1}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Card Flip / Reveal Screen */
          <motion.div
            key="chest-reveal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Visual Header / Icons based on reward type */}
            <div className="flex flex-col items-center mb-6">
              <motion.div
                initial={{ rotateY: 180, scale: 0.8 }}
                animate={{ rotateY: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg border-2 bg-amber-950/40 border-amber-500 text-amber-400"
              >
                {revealedReward?.type === 'gold_add' ? (
                  <Coins className="w-10 h-10 text-amber-400" />
                ) : (
                  <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
                )}
              </motion.div>

              {/* Title & Amount */}
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 mt-4">
                Chest Reveal Event
              </h3>
              <h2 className="text-2xl font-black text-white uppercase mt-1">
                {revealedReward?.label}
              </h2>

              {/* Sub-value display */}
              <div className="mt-2 text-3xl font-black font-mono">
                {revealedReward?.type === 'gold_add' ? (
                  <span className="text-amber-400">🪙 +{revealedReward.value} Gold</span>
                ) : (
                  <span className="text-yellow-400">⚡ x{revealedReward?.value} Gold</span>
                )}
              </div>
            </div>

            {/* Context & Explanation */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 mb-6 text-sm text-slate-300 font-sans leading-relaxed text-left">
              <p>{revealedReward?.description}</p>
            </div>

            {/* Automatic Continue Button */}
            <button
              onClick={handleContinueImmediately}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-600 active:scale-95"
            >
              <span>Continue to Next Ticket</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
