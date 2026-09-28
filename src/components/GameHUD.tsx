import React from 'react';
import { Volume2, VolumeX, Heart, Sparkles, Coins, Backpack, ScrollText, Clock, Smartphone, HelpCircle } from 'lucide-react';
import { calculateTimeState } from './airport/timeCycle';

interface GameHUDProps {
  chapterTitle?: string;
  missionTitle: string;
  hp: number;
  maxHp: number;
  xp: number;
  money: number;
  inventoryCount: number;
  uncompletedQuestsCount?: number;
  soundEnabled: boolean;
  inGameMinutes?: number;
  onCycleTime?: () => void;
  onToggleSound: () => void;
  onOpenInventory: () => void;
  onOpenQuestLog?: () => void;
  onOpenPhone?: () => void;
  onOpenControls?: () => void;
  onRestart: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  chapterTitle = 'Chapter 01 · Airport',
  missionTitle,
  hp,
  maxHp,
  xp,
  money,
  inventoryCount,
  uncompletedQuestsCount = 0,
  soundEnabled,
  inGameMinutes = 1055,
  onCycleTime,
  onToggleSound,
  onOpenInventory,
  onOpenQuestLog,
  onOpenPhone,
  onOpenControls,
  onRestart,
}) => {
  const timeState = calculateTimeState(inGameMinutes);

  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-3 sm:px-5 py-2 pointer-events-none select-none">
      <div className="w-full flex items-center justify-between gap-3 bg-black/40 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/10 shadow-lg">
        {/* Left: Clean Game Title & Chapter */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 group cursor-pointer text-left focus:outline-none"
            title="Restart Journey / Title Screen"
          >
            <span className="text-xs sm:text-sm font-black tracking-widest text-amber-300 group-hover:text-amber-200 transition-colors uppercase font-mono">
              FLUENT TRIP
            </span>
            <span className="text-slate-500 text-xs font-mono">·</span>
            <span className="text-[10px] sm:text-xs text-slate-300 font-mono">
              {chapterTitle}
            </span>
          </button>

          {/* Minimal Mission Objective Text */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-300">
            <span className="text-slate-500">|</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-400 text-[10px] uppercase">MISSION:</span>
            <span className="text-white font-medium truncate max-w-xs">{missionTitle}</span>
          </div>
        </div>

        {/* Right: Lightweight Inline RPG Stats & Compact Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto text-xs font-mono">
          {/* Stats: Clean unboxed typography */}
          <div className="flex items-center gap-2 sm:gap-3 text-slate-200">
            {/* ❤️ HP */}
            <div className="flex items-center gap-1" title="Social Confidence (HP)">
              <Heart
                className={`w-3.5 h-3.5 ${
                  hp <= 25 ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-rose-400 fill-rose-400'
                }`}
              />
              <span className="font-bold tabular-nums text-xs">{hp}</span>
              <span className="text-slate-500 text-[10px]">/{maxHp}</span>
            </div>

            <span className="text-slate-600 text-[10px]">·</span>

            {/* ⭐ XP */}
            <div className="flex items-center gap-1 text-amber-300" title="Experience Points (XP)">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold tabular-nums text-xs">{xp}</span>
              <span className="text-slate-500 text-[10px]">XP</span>
            </div>

            <span className="text-slate-600 text-[10px]">·</span>

            {/* 💰 Money */}
            <div className="flex items-center gap-1 text-emerald-300" title="Travel Cash">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold tabular-nums text-xs">${money}</span>
            </div>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Action Buttons: Minimal and crisp */}
          <div className="flex items-center gap-1.5">
            {/* 🕒 In-Game Time Badge & Cycle Button */}
            <button
              onClick={onCycleTime}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer border border-white/5 group"
              title="In-Game Airport Time: Click to cycle time of day (Afternoon ☀️ / Sunset 🌅 / Twilight 🌆 / Deep Night 🌙)"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
              <span className="font-bold text-amber-300 tabular-nums">{timeState.formattedTime}</span>
              <span className="text-[10px] text-slate-400 hidden md:inline">
                {timeState.phaseIcon} {timeState.phase.toUpperCase()}
              </span>
            </button>
            {/* 📜 Quest Log */}
            {onOpenQuestLog && (
              <button
                onClick={onOpenQuestLog}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer border border-white/5"
                title="Open Quest Log"
              >
                <ScrollText className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Quests</span>
                {uncompletedQuestsCount > 0 && (
                  <span className="w-3.5 h-3.5 bg-sky-500 text-slate-950 rounded-full text-[9px] flex items-center justify-center font-bold">
                    {uncompletedQuestsCount}
                  </span>
                )}
              </button>
            )}

            {/* 📱 Phone / Travel Companion */}
            {onOpenPhone && (
              <button
                onClick={onOpenPhone}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer border border-white/5"
                title="Open Phone & Travel Info [P]"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Phone</span>
              </button>
            )}

            {/* 🎒 Backpack */}
            <button
              onClick={onOpenInventory}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer border border-white/5"
              title="Open Backpack"
            >
              <Backpack className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Bag</span>
              {inventoryCount > 0 && (
                <span className="w-3.5 h-3.5 bg-amber-500 text-slate-950 rounded-full text-[9px] flex items-center justify-center font-bold">
                  {inventoryCount}
                </span>
              )}
            </button>

            {/* ❓ Controls Help */}
            {onOpenControls && (
              <button
                onClick={onOpenControls}
                className="px-1.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer border border-white/5"
                title="View Controls Tutorial"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline text-[10px]">Help</span>
              </button>
            )}

            {/* 🔊 Sound */}
            <button
              onClick={onToggleSound}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/5"
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
