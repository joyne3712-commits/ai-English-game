import React from 'react';
import { Volume2, VolumeX, Heart, Sparkles, Coins, Backpack, ScrollText, Clock, Smartphone, HelpCircle, Menu } from 'lucide-react';
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
  onOpenMobileMenu?: () => void;
  isDialogueActive?: boolean;
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
  onOpenMobileMenu,
  isDialogueActive = false,
}) => {
  const timeState = calculateTimeState(inGameMinutes);

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none select-none">
      {/* 1. MOBILE MINIMAL TOP HUD (< 768px, Hidden during dialogue for maximum immersion) */}
      {!isDialogueActive && (
        <div className="md:hidden px-3 pt-[max(env(safe-area-inset-top,0.5rem),0.5rem)] pb-1 w-full">
          <div className="w-full flex items-center justify-between gap-2 bg-[#090e1a]/95 backdrop-blur-md rounded-2xl px-3.5 py-2 border-2 border-slate-700/80 shadow-[0_8px_24px_rgba(0,0,0,0.85)] pointer-events-auto">
            {/* Left: Minimal Chapter & Current Objective */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30 uppercase tracking-widest shrink-0">
                  CH.01
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider truncate">
                  CURRENT GOAL
                </span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white truncate font-sans mt-0.5">
                {missionTitle}
              </div>
            </div>

            {/* Right: Hamburger Menu ☰ Button (48x48px Comfortable Touch Target) */}
            <button
              onClick={() => {
                if (onOpenMobileMenu) {
                  onOpenMobileMenu();
                } else if (onOpenPhone) {
                  onOpenPhone();
                }
              }}
              className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-amber-300 border border-slate-600 flex items-center justify-center cursor-pointer transition-all shrink-0 shadow-md"
              title="Open Travel Journal & Menu [ ☰ ]"
              aria-label="Open Travel Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. DESKTOP FULL RPG TOP HUD (>= 768px) */}
      <div className="hidden md:block px-5 py-2.5">
        <div className="w-full flex items-center justify-between gap-3 bg-[#090e1a]/90 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10 shadow-lg">
          {/* Left: Clean Game Title & Chapter */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={onRestart}
              className="flex items-center gap-1.5 group cursor-pointer text-left focus:outline-none"
              title="Restart Journey / Title Screen"
            >
              <span className="text-sm font-black tracking-widest text-amber-300 group-hover:text-amber-200 transition-colors uppercase font-mono">
                FLUENT TRIP
              </span>
              <span className="text-slate-500 text-xs font-mono">·</span>
              <span className="text-xs text-slate-300 font-mono">
                {chapterTitle}
              </span>
            </button>

            {/* Mission Objective Text */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
              <span className="text-slate-500">|</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-slate-400 text-[10px] uppercase font-bold">GOAL:</span>
              <span className="text-white font-medium truncate max-w-sm">{missionTitle}</span>
            </div>
          </div>

          {/* Right: Inline RPG Stats & Compact Action Buttons */}
          <div className="flex items-center gap-4 pointer-events-auto text-xs font-mono">
            {/* Stats */}
            <div className="flex items-center gap-3 text-slate-200">
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

            <span className="text-slate-700">|</span>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              {/* 🕒 Time Badge */}
              <button
                onClick={onCycleTime}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer border border-white/5 group"
                title="Click to cycle time of day"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
                <span className="font-bold text-amber-300 tabular-nums">{timeState.formattedTime}</span>
                <span className="text-[10px] text-slate-400 hidden lg:inline">
                  {timeState.phaseIcon} {timeState.phase.toUpperCase()}
                </span>
              </button>

              {/* 📜 Quests */}
              {onOpenQuestLog && (
                <button
                  onClick={onOpenQuestLog}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer border border-white/5"
                  title="Open Quest Log"
                >
                  <ScrollText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Quests</span>
                  {uncompletedQuestsCount > 0 && (
                    <span className="w-3.5 h-3.5 bg-sky-500 text-slate-950 rounded-full text-[9px] flex items-center justify-center font-bold">
                      {uncompletedQuestsCount}
                    </span>
                  )}
                </button>
              )}

              {/* 📱 Phone / Journal */}
              {onOpenPhone && (
                <button
                  onClick={onOpenPhone}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer border border-white/5"
                  title="Open Travel Companion [P]"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Journal</span>
                </button>
              )}

              {/* 🎒 Backpack */}
              <button
                onClick={onOpenInventory}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer border border-white/5"
                title="Open Backpack [I]"
              >
                <Backpack className="w-3.5 h-3.5 text-amber-400" />
                <span>Bag</span>
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
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer border border-white/5"
                  title="View Controls Tutorial"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px]">Help</span>
                </button>
              )}

              {/* 🔊 Audio Toggle */}
              <button
                onClick={onToggleSound}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/5"
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
      </div>
    </header>
  );
};
