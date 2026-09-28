import React, { useState } from 'react';
import { QuestGoal } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PersistentQuestTrackerProps {
  chapterTitle?: string;
  questName?: string;
  goals: QuestGoal[];
}

export const PersistentQuestTracker: React.FC<PersistentQuestTrackerProps> = ({
  chapterTitle = 'CHAPTER 01',
  questName = 'THE CANCELLED FLIGHT',
  goals,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeGoal = goals.find((g) => g.status === 'ACTIVE');
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED');

  return (
    <div className="absolute top-14 left-3 sm:left-5 z-20 pointer-events-auto select-none max-w-[300px] sm:max-w-xs w-full animate-in fade-in duration-300">
      <div className="bg-[#090d16]/95 backdrop-blur-md border-2 border-slate-700/90 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.85)] overflow-hidden text-slate-100 relative">
        {/* Subtle pixel-art corner accents */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-amber-400" />
        <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-amber-400" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-amber-400" />
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-amber-400" />

        {/* Header Bar */}
        <div
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition-colors"
        >
          <div className="space-y-0.5">
            <div className="text-[10px] font-black tracking-widest text-amber-400 uppercase font-mono">
              {chapterTitle}
            </div>
            <div className="text-xs font-bold text-white tracking-wide">
              {questName}
            </div>
          </div>

          <button className="text-slate-400 hover:text-white p-1">
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="p-3.5 space-y-2.5">
            {/* Current Objective - VISUALLY DOMINANT */}
            {activeGoal ? (
              <div className="p-3 rounded-xl bg-amber-950/40 border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.15)] space-y-1">
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
                  <span>CURRENT OBJECTIVE</span>
                </div>
                <div className="text-sm sm:text-[15px] font-bold text-white leading-snug flex items-start gap-1.5 font-sans pt-0.5">
                  <span className="text-amber-400 shrink-0 font-bold">●</span>
                  <span>{activeGoal.text}</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold text-center">
                ✓ ALL OBJECTIVES COMPLETE!
              </div>
            )}

            {/* Completed Goals - Visually Secondary & Muted */}
            {completedGoals.length > 0 && (
              <div className="pt-0.5 space-y-1">
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {completedGoals.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-900/40 text-xs text-slate-400 font-sans"
                    >
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span className="truncate line-through text-slate-400">{g.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
