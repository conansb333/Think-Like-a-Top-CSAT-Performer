import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Play, AlertCircle, Copy, Check, Sparkles, Trophy, Award, Clock, ArrowRight, Shield } from 'lucide-react';
import { MultiplayerGame, MultiplayerPlayer } from '../types';

interface HostDashboardProps {
  game: MultiplayerGame;
  onStart: () => void;
  onEnd: () => void;
  onBackToMenu: () => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  game,
  onStart,
  onEnd,
  onBackToMenu,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(game.gameId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Timer countdown hook for playing state
  useEffect(() => {
    if (game.status !== 'playing' || !game.startTime) return;

    const tick = () => {
      const elapsed = (Date.now() - game.startTime!) / 1000;
      const remaining = Math.max(0, game.durationSeconds - elapsed);
      setTimeLeft(Math.floor(remaining));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [game.status, game.startTime, game.durationSeconds]);

  // Sort players by gold
  const sortedPlayers = [...game.players].sort((a, b) => b.gold - a.gold);

  // Format countdown string
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {/* PHASE 1: LOBBY */}
        {game.status === 'lobby' && (
          <motion.div
            key="lobby-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                Host Panel
              </span>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                CSAT Arena Control
              </h1>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Invite team members to join with your Room Code below.
              </p>
            </div>

            {/* Main Card */}
            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Info and Copy */}
                <div className="md:col-span-1 bg-slate-950/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      Game Room ID
                    </span>
                    <h2 className="text-4xl font-black font-mono text-amber-400 tracking-wider">
                      {game.gameId}
                    </h2>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-mono font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>CODE COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-indigo-400" />
                          <span>COPY ROOM CODE</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs text-slate-400 space-y-1 font-mono">
                      <div className="flex justify-between border-b border-slate-850 pb-1.5">
                        <span>Mode:</span>
                        <span className="text-indigo-400 font-bold uppercase">
                          {game.mode === 'gold_quest' ? 'Gold Quest' : 'Speed Case Race'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-850 pb-1.5">
                        <span>Target:</span>
                        <span className="text-slate-200 font-bold">
                          {game.mode === 'gold_quest' ? `${game.durationSeconds / 60} Mins` : `${game.gameLength} Cases`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="text-slate-200 font-bold">{game.players.length} / 10 Agents</span>
                      </div>
                    </div>
                  </div>

                  {game.players.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500 italic bg-slate-900/40 rounded-xl border border-slate-800">
                      Waiting for players to connect...
                    </div>
                  ) : (
                    <button
                      onClick={onStart}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black uppercase py-4 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-all border-b-4 border-emerald-700 active:scale-95 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                    >
                      <Play className="w-4 h-4 fill-emerald-950" />
                      <span>Start Shift</span>
                    </button>
                  )}
                </div>

                {/* Players Connected List */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400">
                      Clocked In Agents
                    </h3>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full">
                      {game.players.length} Connected
                    </span>
                  </div>

                  {game.players.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-600 border border-dashed border-slate-800 rounded-2xl">
                      <Users className="w-10 h-10 mb-2 animate-pulse" />
                      <p className="text-xs text-center font-mono max-w-xs">
                        Open a new tab or device, input room code <strong className="text-amber-400 font-bold">{game.gameId}</strong> and join the floor!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[350px] overflow-y-auto pr-1">
                      {game.players.map((p) => (
                        <motion.div
                          key={p.clientId}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-inner relative"
                        >
                          <span className="text-3xl mb-1 filter drop-shadow select-none">{p.avatarEmoji}</span>
                          <span className="text-xs font-bold text-slate-100 truncate w-full px-1">{p.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase truncate w-full">{p.avatar}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: PLAYING */}
        {game.status === 'playing' && (
          <motion.div
            key="playing-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
          >
            {/* Left/Center: Leaderboard and Timer */}
            <div className="lg:col-span-2 space-y-6">
              {/* Host Timer and Control Block */}
              <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Lobby Timer
                    </span>
                    <h3 className="text-2xl font-black font-mono text-white tracking-tight">
                      {timeLeft !== null ? formatTime(timeLeft) : '∞'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="text-right text-xs font-mono hidden sm:block">
                    <div className="text-slate-400 font-bold">Room Code: <span className="text-amber-400">{game.gameId}</span></div>
                    <div className="text-slate-500">{game.players.length} Active Agents</div>
                  </div>
                  
                  <button
                    onClick={onEnd}
                    className="bg-rose-950/40 hover:bg-rose-900 text-rose-300 font-bold uppercase tracking-wider text-xs px-4 py-3 border border-rose-800 rounded-xl transition-all cursor-pointer active:scale-95 w-full sm:w-auto text-center"
                  >
                    End Session
                  </button>
                </div>
              </div>

              {/* Leaderboard panel */}
              <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3">
                  Live Resolution Scoreboard
                </h3>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {sortedPlayers.map((p, idx) => {
                    const rankEmoji = idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                    return (
                      <div
                        key={p.clientId}
                        className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 font-mono text-xs font-black text-slate-500 text-center">{rankEmoji}</span>
                          <span className="text-2xl filter drop-shadow select-none">{p.avatarEmoji}</span>
                          <div>
                            <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                              {p.name}
                              {p.streak >= 3 && (
                                <span className="text-[9px] bg-orange-600/20 text-orange-400 border border-orange-500/30 px-1 py-0.2 rounded font-bold animate-pulse font-mono">
                                  🔥 {p.streak} Streak
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              Acc: {p.totalAnswered > 0 ? Math.round((p.correctAnswers / p.totalAnswered) * 100) : 0}% ({p.totalAnswered} cases)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {p.shieldCount > 0 && (
                            <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-0.5 shrink-0">
                              <Shield className="w-2.5 h-2.5 fill-current" /> {p.shieldCount}
                            </span>
                          )}
                          <span className="text-base font-black font-mono text-amber-400">🪙 {p.gold.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Server Live scrolling feed */}
            <div className="lg:col-span-1 h-full">
              <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-5 h-[500px] flex flex-col justify-between shadow-xl">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3 mb-4">
                    Floor Logs & Events
                  </h3>
                  
                  <div className="space-y-3 h-[400px] overflow-y-auto pr-1 font-mono text-xs text-indigo-300">
                    {game.logs.length === 0 ? (
                      <p className="text-slate-500 italic">No shifts dispatched yet...</p>
                    ) : (
                      game.logs.map((log, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-1.5 leading-relaxed py-1 border-b border-slate-850/40"
                        >
                          <span className="text-indigo-500 font-bold">⚡</span>
                          <span>{log}</span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: ENDED (PODIUM CEREMONY!) */}
        {game.status === 'ended' && (
          <motion.div
            key="ended-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-bounce" />
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                Challenge Concluded!
              </h1>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Shift evaluation complete. All promoter score summaries finalized!
              </p>
            </div>

            {/* 3D Podium Ceremony */}
            <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-2xl mx-auto pt-12 pb-6 items-end">
              {/* SECOND PLACE */}
              <div className="flex flex-col items-center">
                {sortedPlayers[1] ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center space-y-2 flex flex-col items-center"
                  >
                    <span className="text-4xl filter drop-shadow select-none">{sortedPlayers[1].avatarEmoji}</span>
                    <span className="text-xs font-bold text-slate-300 truncate w-24 block">{sortedPlayers[1].name}</span>
                    <span className="text-xs font-mono font-black text-amber-400">🪙 {sortedPlayers[1].gold}</span>
                    <div className="w-20 md:w-28 bg-slate-800 border-t-2 border-slate-500 rounded-t-xl h-24 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-mono font-black text-slate-400">2nd</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-20 md:w-28 bg-slate-900/40 h-12 rounded-t-xl" />
                )}
              </div>

              {/* FIRST PLACE */}
              <div className="flex flex-col items-center">
                {sortedPlayers[0] ? (
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 100, delay: 0.5 }}
                    className="text-center space-y-2 flex flex-col items-center"
                  >
                    <div className="relative">
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg">👑</span>
                      <span className="text-5xl filter drop-shadow select-none">{sortedPlayers[0].avatarEmoji}</span>
                    </div>
                    <span className="text-sm font-black text-white truncate w-28 block">{sortedPlayers[0].name}</span>
                    <span className="text-xs font-mono font-black text-yellow-400">🪙 {sortedPlayers[0].gold}</span>
                    <div className="w-24 md:w-32 bg-gradient-to-b from-amber-500 to-amber-600 border-t-2 border-yellow-300 rounded-t-xl h-36 flex items-center justify-center shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-radial from-white/10 to-transparent" />
                      <span className="text-3xl font-mono font-black text-amber-950">1st</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-24 md:w-32 bg-slate-900/40 h-20 rounded-t-xl" />
                )}
              </div>

              {/* THIRD PLACE */}
              <div className="flex flex-col items-center">
                {sortedPlayers[2] ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center space-y-2 flex flex-col items-center"
                  >
                    <span className="text-4xl filter drop-shadow select-none">{sortedPlayers[2].avatarEmoji}</span>
                    <span className="text-xs font-bold text-slate-300 truncate w-24 block">{sortedPlayers[2].name}</span>
                    <span className="text-xs font-mono font-black text-amber-400">🪙 {sortedPlayers[2].gold}</span>
                    <div className="w-20 md:w-28 bg-slate-800 border-t-2 border-slate-600 rounded-t-xl h-16 flex items-center justify-center shadow-lg">
                      <span className="text-xl font-mono font-black text-amber-800">3rd</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-20 md:w-28 bg-slate-900/40 h-8 rounded-t-xl" />
                )}
              </div>
            </div>

            {/* Standings Table Card */}
            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl max-w-2xl mx-auto space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">
                Complete Shift Scoreboard
              </h3>

              <div className="space-y-2">
                {sortedPlayers.map((p, idx) => (
                  <div
                    key={p.clientId}
                    className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-500 w-6">#{idx + 1}</span>
                      <span className="text-xl select-none">{p.avatarEmoji}</span>
                      <span className="text-xs font-bold text-slate-200">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-slate-500">
                        {p.correctAnswers} / {p.totalAnswered} Correct
                      </span>
                      <span className="font-bold text-amber-400 font-mono text-sm">🪙 {p.gold.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 flex justify-center">
                <button
                  onClick={onBackToMenu}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black font-sans uppercase py-4 px-8 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border-b-4 border-amber-700 active:scale-95 text-sm"
                >
                  <span>Clock Out & Exit</span>
                  <ArrowRight className="w-4 h-4 text-amber-950" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
