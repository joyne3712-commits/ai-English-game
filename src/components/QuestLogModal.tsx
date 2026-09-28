import React from 'react';
import { QuestGoal } from '../types';
import { X, ScrollText, CheckCircle2, Circle, Trophy, ArrowRight } from 'lucide-react';
import { sound } from '../services/soundService';

interface QuestLogModalProps {
  isOpen: boolean;
  goals: QuestGoal[];
  onClose: () => void;
}

export const QuestLogModal: React.FC<QuestLogModalProps> = ({
  isOpen,
  goals,
  onClose,
}) => {
  if (!isOpen) return null;

  const completedCount = goals.filter((g) => g.status === 'COMPLETED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sky-400">
            <ScrollText className="w-5 h-5" />
            <span className="text-base font-bold tracking-wide">任务目标簿 (Quest Log)</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mission Brief */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-amber-400 font-bold uppercase tracking-wider">
              QUEST 01 — THE CANCELLED FLIGHT
            </span>
            <span className="text-slate-400 font-mono">
              进度: {completedCount}/{goals.length}
            </span>
          </div>
          <h4 className="text-base font-bold text-white">
            目标：解决航班取消危机，前往 Gate 22 登机
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            明天旧金山有重要日程，但原定航班 UA 889 突遭取消。你需要在机场与地勤 Sarah 协商替代航班、确认托运行李并争取合理餐券权益，顺利成行！
          </p>
        </div>

        {/* Quest Goals Checklist with LOCKED, ACTIVE, COMPLETED status */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            任务目标清单：
          </span>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {goals.map((goal) => {
              const isCompleted = goal.status === 'COMPLETED';
              const isActive = goal.status === 'ACTIVE';
              const isLocked = goal.status === 'LOCKED';

              return (
                <div
                  key={goal.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-slate-200'
                      : isActive
                      ? 'bg-amber-950/30 border-amber-500/60 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 animate-ping" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <div className="truncate">
                      <span
                        className={`text-xs sm:text-sm font-medium block truncate ${
                          isCompleted
                            ? 'line-through text-slate-400'
                            : isActive
                            ? 'text-white font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {goal.text}
                      </span>
                      {goal.completedBadge && isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-mono block">
                          ✓ {goal.completedBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        isCompleted
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : isActive
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      {goal.status}
                    </span>
                    {goal.rewardXp > 0 && (
                      <span className="text-[10px] font-mono text-amber-400/80 hidden sm:inline">
                        +{goal.rewardXp}XP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mission Reward Preview */}
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>通关奖励：+200 XP · $50 现金 · 旧金山新登机牌 · 贵宾室通行凭证</span>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
        >
          返回机场场景
        </button>
      </div>
    </div>
  );
};
