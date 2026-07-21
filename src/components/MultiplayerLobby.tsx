import React from 'react';
import { motion } from 'motion/react';
import { Users, LogOut, Copy, Check, Sparkles, HelpCircle } from 'lucide-react';
import { MultiplayerPlayer } from '../types';

interface MultiplayerLobbyProps {
  gameId: string;
  players: MultiplayerPlayer[];
  activeClientId: string;
  onLeave: () => void;
  isHost?: boolean;
  onStartGame?: () => void;
  isSimulated?: boolean;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  gameId,
  players,
  activeClientId,
  onLeave,
  isHost,
  onStartGame,
  isSimulated,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 10 spots for Blooket-style look
  const totalSlots = 10;
  const lobbySlots = Array.from({ length: totalSlots }, (_, i) => players[i] || null);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Lobby Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          Multiplayer Training Lobby
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          Support Floor Session
        </h1>
        <p className="text-slate-400 text-sm font-sans max-w-md mx-auto">
          Warm up your queue resolution muscles. The host will start the challenge when everyone is clocked in!
        </p>
      </div>

      {/* Lobby Card */}
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel: Room ID & Copy Code */}
          <div className="md:col-span-1 bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Lobby Code
              </span>
              <div className="space-y-2">
                <h2 className="text-4xl font-black font-mono text-amber-400 tracking-wider">
                  {gameId}
                </h2>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-mono font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-400" />
                      <span>COPY LOBBY LINK</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-semibold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" /> Clocked In
                </span>
                <span className="font-bold font-mono text-slate-200">
                  {players.length} / {totalSlots}
                </span>
              </div>
              
              <div className="text-[11px] leading-relaxed text-slate-500 font-sans">
                💡 <span className="font-semibold text-slate-400">Golden Tip:</span> Keep your Empathy Shields active during gold chests to block hijacks and detractor hits!
              </div>
            </div>

            {isHost && onStartGame && (
              <button
                type="button"
                onClick={onStartGame}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black font-sans uppercase py-4 px-4 rounded-xl text-sm flex items-center justify-center gap-1.5 cursor-pointer border-b-4 border-emerald-700 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <span>START TRAINING SESSION</span>
              </button>
            )}

            {!isHost && isSimulated && onStartGame && (
              <button
                type="button"
                onClick={onStartGame}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-black font-sans uppercase py-4 px-4 rounded-xl text-sm flex items-center justify-center gap-1.5 cursor-pointer border-b-4 border-indigo-700 active:scale-95 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
              >
                <span>SIMULATE HOST START</span>
              </button>
            )}

            <button
              onClick={onLeave}
              className="w-full bg-slate-900 hover:bg-rose-950/30 hover:border-rose-800/50 text-slate-400 hover:text-rose-400 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-800 transition-all active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Lobby</span>
            </button>
          </div>

          {/* Right panel: Active Players Grid */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400">
              Active Agents on Floor
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {lobbySlots.map((player, idx) => {
                if (player) {
                  const isMe = player.clientId === activeClientId;
                  return (
                    <motion.div
                      key={player.clientId}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border aspect-square relative text-center ${
                        isMe
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                          : 'bg-slate-950/40 border-slate-800'
                      }`}
                    >
                      {isMe && (
                        <span className="absolute top-1.5 right-1.5 text-[8px] bg-amber-500 text-amber-950 font-black px-1 rounded uppercase">
                          You
                        </span>
                      )}
                      <span className="text-3xl mb-1.5 filter drop-shadow select-none">{player.avatarEmoji}</span>
                      <span className="text-xs font-bold text-slate-200 truncate w-full px-1">{player.name}</span>
                      <span className="text-[9px] text-slate-500 truncate font-mono mt-0.5">{player.avatar}</span>
                    </motion.div>
                  );
                } else {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="border-2 border-dashed border-slate-800/60 rounded-2xl aspect-square flex flex-col items-center justify-center text-slate-700 font-mono text-[10px]"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-800 mb-1" />
                      <span>{idx + 1} / 10</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
