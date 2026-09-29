import React, { useState } from 'react';
import { QuestGoal, DiscoveredInfo } from '../types';
import { BookOpen, CheckCircle2, Circle, ChevronDown, ChevronUp, Compass, Sparkles, X } from 'lucide-react';
import { sound } from '../services/soundService';

interface PersistentQuestTrackerProps {
  chapterTitle?: string;
  questName?: string;
  situation?: string;
  goals: QuestGoal[];
  discoveredInfo?: DiscoveredInfo;
}

export const PersistentQuestTracker: React.FC<PersistentQuestTrackerProps> = ({
  chapterTitle = 'CHAPTER 01',
  questName = 'THE CONNECTION',
  situation = 'Your connecting flight UA889 to San Francisco has been cancelled.',
  goals,
  discoveredInfo,
}) => {
  const [isOpenJournal, setIsOpenJournal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const activeGoal = goals.find((g) => g.status === 'ACTIVE');

  return (
    <>
      {/* COMPACT FLOATING OBJECTIVE RIBBON (Positioned unobtrusively at Top-Center so it NEVER blocks Alex / Gate 18 on the left) */}
      <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto select-none max-w-md w-auto animate-in fade-in duration-300">
        <div className="bg-[#090d16]/90 hover:bg-[#090d16]/98 backdrop-blur-md border border-amber-500/50 hover:border-amber-400 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.7)] text-slate-100 transition-all">
          <div className="flex items-center gap-2.5 px-3.5 py-1.5">
            {/* Pulsing indicator */}
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />

            {/* Current Objective Text */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-mono font-black text-amber-400/90 uppercase tracking-wider shrink-0">
                OBJECTIVE:
              </span>
              <span className="text-xs font-bold text-white tracking-wide truncate max-w-[220px]">
                {activeGoal ? activeGoal.text : '✓ All Objectives Completed!'}
              </span>
            </div>

            {/* Quick Journal Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsOpenJournal(true);
              }}
              className="ml-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors border border-slate-700/80 shrink-0"
              title="Open Travel Journal [J]"
            >
              <BookOpen className="w-3 h-3 text-amber-400" />
              <span>JOURNAL</span>
            </button>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE TRAVEL JOURNAL MODAL */}
      {isOpenJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-5 space-y-4 text-slate-100 relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <BookOpen className="w-5 h-5" />
                <span className="text-base font-bold tracking-wide font-mono">
                  TRAVEL JOURNAL · {chapterTitle}
                </span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsOpenJournal(false);
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
                title="Close Journal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Travel Route & Discovered Facts */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                <span>ITINERARY: NINGBO ➔ TOKYO ➔ SAN FRANCISCO</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Original Flight:</span>
                  <span className="text-rose-400 font-bold">UA889 (CANCELLED)</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Selected Flight:</span>
                  <span className={discoveredInfo?.selectedFlight ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {discoveredInfo?.selectedFlight
                      ? `${discoveredInfo.selectedFlight} (${discoveredInfo.selectedFlight === 'UA921' ? '21:30' : '23:10'})`
                      : 'Pending Rebooking with Sarah'}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Hotel Check-In:</span>
                  <span className={discoveredInfo?.hotelContacted ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                    {discoveredInfo?.hotelContacted
                      ? 'Sunset Hotel (Held until Midnight)'
                      : 'Sunset Hotel (Until 23:00)'}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Checked Baggage:</span>
                  <span className="text-sky-300 font-bold">Auto-Transfers to SFO</span>
                </div>
              </div>
            </div>

            {/* Objectives Progress */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono block">
                CHAPTER OBJECTIVES
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {goals.map((goal) => {
                  const isCompleted = goal.status === 'COMPLETED';
                  const isActive = goal.status === 'ACTIVE';

                  return (
                    <div
                      key={goal.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                        isCompleted
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400'
                          : isActive
                          ? 'bg-amber-950/40 border-amber-500/70 text-white shadow-md'
                          : 'bg-slate-950/30 border-slate-800/60 text-slate-500 opacity-60'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isActive ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 animate-ping" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xs sm:text-sm font-medium block truncate ${
                            isCompleted ? 'line-through text-slate-400' : isActive ? 'text-white font-bold' : ''
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
          </div>
        </div>
      )}
    </>
  );
};
