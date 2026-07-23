/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Player, Competitor } from '../types';
import { Trophy, Award, Heart, CheckCircle2, AlertCircle, RefreshCw, RefreshCw as ResetIcon, BookOpen, Star, AlertTriangle, Flame } from 'lucide-react';
import { sounds } from '../sound';

interface SummaryScreenProps {
  player: Player;
  competitors: Competitor[];
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
  missedCategories: string[];
  onRestart: () => void;
}

// Map categories to coaching tips derived directly from the interviews
const COACHING_TIPS: Record<string, { title: string; action: string }> = {
  'First Impressions': {
    title: 'First impressions matter immensely',
    action: 'Make a strong first impression. Start every interaction with a warm greeting, confidence, and professionalism to set a positive tone.'
  },
  'Active Listening': {
    title: 'Empower active listening',
    action: 'Practice active listening. Listen carefully, avoid interrupting, acknowledge the customer\'s concerns, and confirm your understanding before providing a solution.'
  },
  'Positive Language': {
    title: 'Use positive phrasing',
    action: 'Use positive language. Frame responses around available solutions and next steps instead of focusing on restrictions.'
  },
  'Process Knowledge': {
    title: 'Master your processes',
    action: 'Master your processes and focus on solutions. Know your tools well so you can confidently explain what you can do rather than emphasizing limitations.'
  },
  'Adaptability': {
    title: 'Be communication-adaptable',
    action: 'Be adaptable. Every customer is different, so adjust your communication style to meet the customer\'s needs instead of relying on one fixed approach.'
  },
  'Building Rapport': {
    title: 'Lower formal tone when appropriate',
    action: 'Adapt your tone appropriately. Start professionally and become more conversational when the situation allows, helping build rapport.'
  },
  'Empathy': {
    title: 'Put yourself in customer\'s shoes',
    action: 'Show empathy. Consider the situation from the customer\'s perspective and demonstrate genuine understanding throughout the interaction.'
  },
  'Tone of Voice': {
    title: 'Voice is your visual presence',
    action: 'Use your voice intentionally. Maintain a calm, confident, and friendly tone, as your voice is one of the strongest ways to build trust.'
  },
  'First Contact Resolution (FCR)': {
    title: 'Aim for First Contact Resolution',
    action: 'Aim for First Contact Resolution (FCR). Resolve the customer\'s issue whenever possible during the first interaction to reduce effort.'
  },
  'Growth Mindset': {
    title: 'Normalize being coached on detractors',
    action: 'Maintain a growth mindset. Treat every CSAT result as an opportunity to learn. Accept coaching positively and use feedback to continuously improve.'
  }
};

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  player,
  competitors,
  multiplayerPlayers,
  activeClientId,
  missedCategories,
  onRestart,
}) => {
  React.useEffect(() => {
    sounds.playGameOver();
  }, []);

  const total = player.totalAnswered || 1;
  const csatPercentage = Math.round((player.correctAnswers / total) * 100);

  // Determine CSAT Tier & Grade
  let csatTier = 'Neutral Support Apprentice';
  let csatColor = 'text-slate-400';
  let csatBg = 'bg-slate-950/50 border-slate-700';
  let feedbackMessage = 'A great start! Support mastery is built brick by brick. Focus on active listening and process knowledge to push into Promoter levels.';

  if (csatPercentage === 100) {
    csatTier = '👑 Elite Support Overlord (100% Promoter)';
    csatColor = 'text-yellow-400';
    csatBg = 'bg-yellow-950/30 border-yellow-500';
    feedbackMessage = 'Absolute perfection! You think exactly like a top performer. You resolved complex escalations with impeccable empathy, active listening, and solution focus!';
  } else if (csatPercentage >= 80) {
    csatTier = '⭐ Champion Support Advocate (Promoter)';
    csatColor = 'text-emerald-400';
    csatBg = 'bg-emerald-950/30 border-emerald-500';
    feedbackMessage = 'Incredible performance! You consistently use positive language and adapt to customer needs. Ready to coach others!';
  } else if (csatPercentage >= 60) {
    csatTier = '☕ Capable Customer Ally (Healthy Neutral)';
    csatColor = 'text-sky-400';
    csatBg = 'bg-sky-950/30 border-sky-500';
    feedbackMessage = 'Solid work. You have a good handle on processes, but sometimes lean into policy language. Use more positive framing to boost those promoter reviews.';
  } else {
    csatTier = '📋 Apprentice Agent (Needs Coaching)';
    csatColor = 'text-rose-400';
    csatBg = 'bg-rose-950/30 border-rose-500';
    feedbackMessage = 'Normalize being coached! This is a perfect learning opportunity. Use the coaching guides below to understand why top performers prioritize positive language and emotional empathy.';
  }

  // Calculate Rank on Support Floor
  let finalRank = 1;
  let totalFloorPlayers = 5;

  if (multiplayerPlayers) {
    const sortedFloor = [...multiplayerPlayers].sort((a, b) => b.gold - a.gold);
    finalRank = sortedFloor.findIndex(entry => entry.clientId === activeClientId) + 1;
    totalFloorPlayers = multiplayerPlayers.length;
  } else {
    const sortedFloor = [
      { name: player.name, gold: player.gold, isPlayer: true },
      ...competitors.map(c => ({ name: c.name, gold: c.gold, isPlayer: false }))
    ].sort((a, b) => b.gold - a.gold);
    finalRank = sortedFloor.findIndex(entry => entry.isPlayer) + 1;
    totalFloorPlayers = competitors.length + 1;
  }

  // Generated Badges based on performance
  const badges = [];
  if (player.gold > 5000) badges.push({ emoji: '💰', title: 'Support Tycoon', desc: 'Amassed over 5,000 Support Gold' });
  if (csatPercentage === 100) badges.push({ emoji: '🏅', title: 'Flawless Promoter', desc: 'Achieved a perfect 100% CSAT Rating' });
  if (finalRank === 1) badges.push({ emoji: '🏆', title: 'Floor Champion', desc: 'Finished #1 in gold balance on the floor' });
  if (player.correctAnswers >= 5) badges.push({ emoji: '🎯', title: 'FCR Sniper', desc: 'Answered at least 5 support scenarios correctly' });
  if (player.highestStreak && player.highestStreak >= 3) {
    badges.push({ emoji: '🔥', title: 'CSAT Overdrive', desc: `Resolved ${player.highestStreak} tickets in a row perfectly!` });
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Visual Header / Title */}
      <div className="text-center">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-bounce" />
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          Shift Summary & CSAT Scorecard
        </h1>
        <p className="text-slate-400 text-sm font-sans mt-1">
          Your support shift has concluded. Here is your official performance evaluation.
        </p>
      </div>

      {/* CSAT Score Card & Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CSAT Grade */}
        <div className={`md:col-span-2 border-2 rounded-3xl p-6 flex flex-col justify-between ${csatBg} shadow-xl`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Official CSAT Rating
              </span>
              <span className="text-xs font-black uppercase bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-full text-indigo-300">
                Shift Grade
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <h2 className={`text-5xl font-black font-mono tracking-tighter ${csatColor}`}>
                {csatPercentage}%
              </h2>
              <span className="text-slate-400 font-bold text-sm">CSAT Rating</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-100 mb-2">
              {csatTier}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed font-sans">
              {feedbackMessage}
            </p>
          </div>
        </div>

        {/* Support Gold Summary */}
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Floor Savings
            </span>
            <div className="text-4xl font-black font-mono text-amber-400 mb-1">
              🪙 {player.gold.toLocaleString()}
            </div>
            <p className="text-slate-400 text-xs font-mono mb-4 uppercase">
              Accumulated support gold
            </p>
          </div>
          <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-sm">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Award className="w-4 h-4 text-indigo-400" /> Team Rank
            </span>
            <span className="text-slate-100 font-black font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-base">
              #{finalRank} / {totalFloorPlayers}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Correct Tickets', value: player.correctAnswers, color: 'text-emerald-400', icon: CheckCircle2 },
          { label: 'Incorrect Slips', value: player.totalAnswered - player.correctAnswers, color: 'text-rose-400', icon: AlertCircle },
          { label: 'Highest Streak', value: player.highestStreak ? `${player.highestStreak} cases` : '0 cases', color: 'text-orange-400', icon: Flame },
          { label: 'Accuracy', value: player.totalAnswered > 0 ? `${Math.round((player.correctAnswers / player.totalAnswered) * 100)}%` : '0%', color: 'text-sky-400', icon: Award },
          { label: 'Response Rate', value: `${player.totalAnswered} cases`, color: 'text-slate-200', icon: BookOpen },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center shadow-md">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                {stat.label}
              </span>
              <div className={`text-2xl font-black font-mono flex items-center gap-1.5 ${stat.color}`}>
                <Icon className="w-5 h-5 shrink-0" />
                <span>{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unlocked Badges Panel */}
      {badges.length > 0 && (
        <div className="bg-slate-900/40 border-2 border-slate-800/80 rounded-3xl p-6 shadow-md">
          <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400" /> Shift Badges Unlocked ({badges.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {badges.map((b) => (
              <div key={b.title} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 shadow-inner">
                <span className="text-3xl select-none filter drop-shadow-sm">{b.emoji}</span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-100 uppercase tracking-wide">{b.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Targeted Coaching Guide Card */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-black text-white uppercase tracking-tight">
            Targeted CSAT Coaching Guide
          </h3>
        </div>

        {missedCategories.length === 0 ? (
          <div className="text-center py-6 bg-slate-950/40 rounded-2xl border border-slate-800 p-4">
            <span className="text-3xl">🏆</span>
            <h4 className="text-sm font-extrabold text-slate-100 mt-2">Zero Coaching Recommendations Required!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans mt-1">
              You answered every support scenario with pristine precision. You have fully internalized top-performer practices!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-sans">
              Based on your case resolutions, our learning engine recommends reviewing the following best practices used by top CSAT performers to defuse angry calls and maximize promoter feedback:
            </p>
            <div className="grid grid-cols-1 gap-3">
              {missedCategories.map((cat) => {
                const tip = COACHING_TIPS[cat] || { title: `Refine ${cat}`, action: 'Review related core support manuals.' };
                return (
                  <div key={cat} className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                      💡
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wide flex items-center gap-2">
                        <span>{cat}</span>
                        <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 text-slate-400 font-mono rounded normal-case font-normal">
                          Coaching Point
                        </span>
                      </h4>
                      <h5 className="text-xs font-extrabold text-slate-200 mt-1">
                        {tip.title}
                      </h5>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                        {tip.action}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Replay Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
        <button
          onClick={onRestart}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black font-sans uppercase py-4 px-8 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border-b-4 border-amber-700 active:scale-95 text-sm"
        >
          <RefreshCw className="w-4 h-4 fill-amber-950" />
          <span>Clock In for Next Shift</span>
        </button>
      </div>
    </div>
  );
};
