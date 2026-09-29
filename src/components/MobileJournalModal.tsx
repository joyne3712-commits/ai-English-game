import React from 'react';
import { X, CheckCircle2, Circle, Backpack, Volume2, VolumeX, RotateCcw, Compass, Plane, Hotel } from 'lucide-react';
import { QuestGoal, InventoryItem, DiscoveredInfo } from '../types';
import { sound } from '../services/soundService';

interface MobileJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterTitle?: string;
  situation?: string;
  goals: QuestGoal[];
  inventory: InventoryItem[];
  discoveredInfo?: DiscoveredInfo;
  onOpenInventory: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
  inGameTimeFormatted: string;
}

export const MobileJournalModal: React.FC<MobileJournalModalProps> = ({
  isOpen,
  onClose,
  chapterTitle = 'CH. 01 · THE CONNECTION',
  situation = 'Your connecting flight UA889 to San Francisco has been cancelled.',
  goals,
  inventory,
  discoveredInfo,
  onOpenInventory,
  soundEnabled,
  onToggleSound,
  onRestart,
  inGameTimeFormatted,
}) => {
  if (!isOpen) return null;

  const completedGoals = goals.filter((g) => g.status === 'COMPLETED');
  const activeGoal = goals.find((g) => g.status === 'ACTIVE');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-[#090e1a] border-t-2 sm:border-2 border-slate-700 sm:rounded-3xl rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.9)] p-4 sm:p-5 text-slate-100 flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 uppercase tracking-widest">
              CH. 01
            </span>
            <h2 className="text-base font-bold font-mono tracking-wide text-white">
              JOURNAL
            </h2>
            <span className="text-xs text-slate-400 font-mono ml-1">
              ({completedGoals.length}/{goals.length})
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-slate-700"
            aria-label="Close Journal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Journal Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-0.5 font-sans">
          {/* Discovered Info Summary */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              <span>TRIP DETAILS · NINGBO ➔ TOKYO ➔ SF</span>
              <span className="text-slate-400">{inGameTimeFormatted}</span>
            </div>

            <div className="space-y-1 text-xs text-slate-300 font-mono">
              <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                <span className="text-slate-400">Connecting Flight:</span>
                <span className="text-rose-400 font-bold">UA889 (CANCELLED)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                <span className="text-slate-400">Rebooked Flight:</span>
                <span className={discoveredInfo?.selectedFlight ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {discoveredInfo?.selectedFlight
                    ? `${discoveredInfo.selectedFlight} (${discoveredInfo.selectedFlight === 'UA921' ? '21:30' : '23:10'})`
                    : 'Pending Rebooking with Sarah'}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Hotel Check-In:</span>
                <span className={discoveredInfo?.hotelContacted ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                  {discoveredInfo?.hotelContacted
                    ? 'Sunset Hotel (Held until Midnight)'
                    : 'Sunset Hotel (Until 23:00)'}
                </span>
              </div>
            </div>
          </div>

          {/* Single Current Objective Highlight */}
          {activeGoal && (
            <div className="p-3 rounded-2xl bg-amber-950/40 border-2 border-amber-400/80 space-y-1">
              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>CURRENT OBJECTIVE</span>
              </div>
              <div className="text-sm font-bold text-white leading-snug">
                {activeGoal.text}
              </div>
            </div>
          )}

          {/* Completed Objectives List */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider px-1">
              PROGRESS
            </div>
            <div className="space-y-1.5">
              {goals.map((goal) => {
                const isCompleted = goal.status === 'COMPLETED';
                const isActive = goal.status === 'ACTIVE';

                return (
                  <div
                    key={goal.id}
                    className={`min-h-[40px] p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400'
                        : isActive
                        ? 'bg-amber-950/20 border-amber-500/40 text-white font-bold'
                        : 'bg-slate-950/30 border-slate-800/60 text-slate-500 opacity-60'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs block leading-snug truncate ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {goal.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Menu Actions */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider px-1">
              TRAVEL GEAR & SETTINGS
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenInventory();
                }}
                className="min-h-[48px] p-2.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Backpack className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold font-mono">
                  Bag ({inventory.length})
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onToggleSound();
                }}
                className="min-h-[48px] p-2.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold font-mono">Sound: ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold font-mono text-slate-400">Sound: OFF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Close Button (Min 48px touch target) */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="min-h-[48px] px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Restart journey"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Restart</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex-1 min-h-[48px] rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-sm font-mono flex items-center justify-center cursor-pointer transition-all shadow-md"
          >
            RETURN TO GAME
          </button>
        </div>
      </div>
    </div>
  );
};
