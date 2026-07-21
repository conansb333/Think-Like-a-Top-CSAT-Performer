/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, ShieldAlert, Award, Star, BookOpen, Play, Clock } from 'lucide-react';

interface AvatarOption {
  emoji: string;
  name: string;
  trait: string;
}

const AVATAR_OPTIONS: AvatarOption[] = [
  { emoji: '🦊', name: 'Empathy Fox', trait: 'Empathy bonus gives you an extra +20% Gold bonus on ticket resolutions.' },
  { emoji: '🦉', name: 'Wisdom Owl', trait: 'SOP recall gives you a 15% chance to double any gold chest reward!' },
  { emoji: '🐼', name: 'Chill Panda', trait: 'Soothing presence increases base points earned on all correct tickets by +50 Gold.' },
  { emoji: '🦁', name: 'FCR Lion', trait: 'Hunting resolutions adds +25% Gold to all ticket solutions!' },
  { emoji: '🐸', name: 'Rapport Frog', trait: 'Friendly connections add +15% more gold to all correct answers!' },
  { emoji: '🦄', name: 'Growth Unicorn', trait: 'Constructive coaching provides a +100 gold boost for any tricky scenario!' },
];

interface WelcomeScreenProps {
  onStartGame: (name: string, avatarEmoji: string, avatarName: string, length: number | 'endless') => void;
  onJoinMultiplayer: (gameId: string, nickname: string, avatarEmoji: string, avatarName: string) => Promise<string | null>;
  onHostMultiplayer: (mode: 'gold_quest' | 'case_race', gameLength: number, durationSeconds: number) => Promise<string | null>;
  isMuted: boolean;
  onToggleMute: () => void;
  initialJoinCode?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartGame,
  onJoinMultiplayer,
  onHostMultiplayer,
  isMuted,
  onToggleMute,
  initialJoinCode = '',
}) => {
  const [activeTab, setActiveTab] = useState<'solo' | 'join' | 'host'>('solo');
  const [name, setName] = useState('');
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(0);
  const [gameLength, setGameLength] = useState<number | 'endless'>(10);
  
  // Multiplayer Join States
  const [joinCode, setJoinCode] = useState(initialJoinCode);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Sync initialJoinCode if it updates dynamically
  React.useEffect(() => {
    if (initialJoinCode) {
      setJoinCode(initialJoinCode);
    }
  }, [initialJoinCode]);

  // Multiplayer Host States
  const [hostMode, setHostMode] = useState<'gold_quest' | 'case_race'>('gold_quest');
  const [hostLength, setHostLength] = useState<number>(10);
  const [hostDuration, setHostDuration] = useState<number>(180); // 3 mins default
  const [isHosting, setIsHosting] = useState(false);

  const handleSoloSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Agent Star';
    const avatar = AVATAR_OPTIONS[selectedAvatarIdx];
    onStartGame(finalName, avatar.emoji, avatar.name, gameLength);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    const code = joinCode.trim().toUpperCase();
    const nickname = name.trim() || 'Guest Advocate';
    
    if (!code) {
      setJoinError('Please enter a valid 6-character Room Code');
      return;
    }
    
    setIsJoining(true);
    const avatar = AVATAR_OPTIONS[selectedAvatarIdx];
    try {
      const err = await onJoinMultiplayer(code, nickname, avatar.emoji, avatar.name);
      if (err) {
        setJoinError(err);
      }
    } catch (error) {
      setJoinError('Could not connect to game. Please verify the room code.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleHostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsHosting(true);
    try {
      await onHostMultiplayer(hostMode, hostLength, hostDuration);
    } catch (error) {
      console.error(error);
    } finally {
      setIsHosting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Title Header with Floating Animation */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 text-amber-300 text-xs font-mono tracking-widest mb-4 shadow-lg uppercase">
          <Star className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
          Top CSAT Performer Training
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-3 font-sans">
          Think Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 font-extrabold drop-shadow-[0_2px_10px_rgba(234,179,8,0.2)]">Top CSAT</span> Performer
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto font-sans leading-relaxed">
          Master the secret best practices of elite support agents. Open gold chests, gather points, out-resolve other agents, and dominate the support floor!
        </p>
      </motion.div>

      {/* Main Configuration Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="w-full bg-slate-900/90 border-2 border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md space-y-6"
      >
        {/* Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
          {[
            { id: 'solo', label: '🎮 Practice Solo', isSoon: false },
            { id: 'join', label: '🤝 Join Room', isSoon: true },
            { id: 'host', label: '👑 Host Room', isSoon: true },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={tab.isSoon}
                onClick={() => {
                  if (tab.isSoon) return;
                  setActiveTab(tab.id as any);
                  setJoinError(null);
                }}
                className={`py-3 px-3 rounded-xl text-xs md:text-sm font-extrabold uppercase transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  tab.isSoon
                    ? 'opacity-60 cursor-not-allowed text-slate-500 bg-slate-950/40 border border-slate-850'
                    : isSelected
                    ? 'bg-indigo-600 text-white shadow-lg cursor-pointer'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer'
                }`}
              >
                <span>{tab.label}</span>
                {tab.isSoon && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Coming Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Audio & Quick Controls */}
        <div className="flex justify-between items-center bg-slate-800/40 border border-slate-700/50 rounded-2xl px-4 py-3">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 uppercase">
            <BookOpen className="w-4 h-4 text-slate-400" /> Blooket-Style Gold Quest
          </span>
          <button
            type="button"
            onClick={onToggleMute}
            className="flex items-center gap-1.5 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-1.5 rounded-lg border border-slate-600 transition-all cursor-pointer active:scale-95"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>SOUNDS: OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>SOUNDS: ON</span>
              </>
            )}
          </button>
        </div>

        {/* TAB 1: SOLO PRACTICE */}
        {activeTab === 'solo' && (
          <form onSubmit={handleSoloSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="agent-name" className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Agent Call Sign / Nickname
              </label>
              <input
                id="agent-name"
                type="text"
                maxLength={15}
                placeholder="e.g. Agent Phoenix"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white text-lg font-semibold focus:outline-none focus:border-amber-500 transition-colors shadow-inner font-sans"
              />
            </div>

            {/* Avatar Selection Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Choose Your Support Avatar & passive trait
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AVATAR_OPTIONS.map((avatar, idx) => {
                  const isSelected = selectedAvatarIdx === idx;
                  return (
                    <button
                      key={avatar.name}
                      type="button"
                      onClick={() => setSelectedAvatarIdx(idx)}
                      className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500 scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
                      }`}
                    >
                      <span className="text-4xl mb-2 filter drop-shadow-md select-none">{avatar.emoji}</span>
                      <span className="text-xs font-bold text-slate-100 mb-1">{avatar.name}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-sans px-1">
                        {avatar.trait}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode / Length Selection */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Select Case Load (Game Length)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 5, label: '5 Cases', desc: 'Quick Sprint' },
                  { value: 10, label: '10 Cases', desc: 'Full Challenge' },
                  { value: 'endless', label: 'Endless', desc: 'Coaching Arena' },
                ].map((opt) => {
                  const isSelected = gameLength === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setGameLength(opt.value as any)}
                      className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm font-extrabold text-slate-100">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black font-sans uppercase text-lg py-5 px-8 rounded-2xl shadow-[0_8px_20px_-4px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all border-b-4 border-amber-700 active:scale-95"
              >
                <Play className="w-5 h-5 fill-amber-950" />
                <span>Clock In & Play Solo</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: JOIN MULTIPLAYER */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-6">
            {/* Join Code Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="join-code" className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Lobby Code (6 Characters)
                </label>
                <input
                  id="join-code"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. ABCDEF"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white text-lg font-black tracking-widest uppercase focus:outline-none focus:border-indigo-500 transition-colors shadow-inner font-mono text-center"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="agent-nickname" className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Your Nickname
                </label>
                <input
                  id="agent-nickname"
                  type="text"
                  maxLength={12}
                  placeholder="e.g. Agent Speed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white text-lg font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-inner font-sans"
                />
              </div>
            </div>

            {/* Error Message */}
            {joinError && (
              <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-4 text-xs font-semibold text-rose-300 text-center animate-shake">
                ⚠️ {joinError}
              </div>
            )}

            {/* Avatar Selection Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Choose Your Support Avatar & passive trait
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AVATAR_OPTIONS.map((avatar, idx) => {
                  const isSelected = selectedAvatarIdx === idx;
                  return (
                    <button
                      key={avatar.name}
                      type="button"
                      onClick={() => setSelectedAvatarIdx(idx)}
                      className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500 scale-[1.02] shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
                      }`}
                    >
                      <span className="text-4xl mb-2 filter drop-shadow-md select-none">{avatar.emoji}</span>
                      <span className="text-xs font-bold text-slate-100 mb-1">{avatar.name}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-sans px-1">
                        {avatar.trait}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-4">
              <button
                type="button"
                disabled={true}
                className="w-full bg-slate-800/80 border-2 border-slate-700 text-slate-400 font-bold font-sans uppercase text-base py-5 px-8 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed opacity-75 shadow-none"
              >
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Join Room — Coming Soon (Demo Mode)</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: HOST GAME */}
        {activeTab === 'host' && (
          <form onSubmit={handleHostSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Host Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Session Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gold_quest', label: '🪙 Gold Quest', desc: 'Chest Looting' },
                    { id: 'case_race', label: '🏁 Case Race', desc: 'First to finish' },
                  ].map((opt) => {
                    const isSelected = hostMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setHostMode(opt.id as any)}
                        className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-extrabold text-slate-100">{opt.label}</span>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Targets (Length/Duration) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  {hostMode === 'gold_quest' ? 'Shift Duration' : 'Target Cases count'}
                </label>
                
                {hostMode === 'gold_quest' ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 180, label: '3 Mins' },
                      { value: 300, label: '5 Mins' },
                      { value: 600, label: '10 Mins' },
                    ].map((opt) => {
                      const isSelected = hostDuration === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setHostDuration(opt.value)}
                          className={`py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer border-2 ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500 text-slate-100'
                              : 'bg-slate-950/50 border-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 5, label: '5 Cases' },
                      { value: 10, label: '10 Cases' },
                      { value: 20, label: '20 Cases' },
                    ].map((opt) => {
                      const isSelected = hostLength === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setHostLength(opt.value)}
                          className={`py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer border-2 ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500 text-slate-100'
                              : 'bg-slate-950/50 border-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 text-xs text-slate-400 font-sans leading-relaxed">
              💡 <span className="font-semibold text-slate-200">As Host:</span> You will display the lobby and the control dashboard on your screen! Players will connect using their devices and they'll answer at their own pace. You will see real-time queue steals and hijacks!
            </div>

            {/* Action Trigger */}
            <div className="pt-4">
              <button
                type="button"
                disabled={true}
                className="w-full bg-slate-800/80 border-2 border-slate-700 text-slate-400 font-bold font-sans uppercase text-base py-5 px-8 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed opacity-75 shadow-none"
              >
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Host Arena — Coming Soon (Demo Mode)</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>


      {/* Funny Footnote */}
      <div className="mt-6 flex items-center gap-1.5 text-xs font-mono text-slate-500">
        <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
        <span>Warning: Side-effects include sudden increases in customer satisfaction ratings.</span>
      </div>
    </div>
  );
};
