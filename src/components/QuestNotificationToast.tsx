import React from 'react';
import { CheckCircle2, Compass, Sparkles } from 'lucide-react';

export interface QuestNotificationData {
  id: number;
  type: 'complete' | 'new_objective';
  title: string;
  badge?: string;
  xpGain?: number;
}

interface QuestNotificationToastProps {
  notification: QuestNotificationData | null;
  onDismiss: () => void;
}

export const QuestNotificationToast: React.FC<QuestNotificationToastProps> = ({
  notification,
  onDismiss,
}) => {
  if (!notification) return null;

  const isComplete = notification.type === 'complete';

  return (
    <div
      onClick={onDismiss}
      className="fixed top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-auto cursor-pointer select-none max-w-md w-[92%] sm:w-full animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div
        className={`p-4 sm:p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.92)] border-2 backdrop-blur-xl relative overflow-hidden transition-all ${
          isComplete
            ? 'bg-[#091512]/95 border-emerald-400/90 shadow-[0_0_30px_rgba(16,185,129,0.35)]'
            : 'bg-[#181106]/95 border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.35)]'
        }`}
      >
        {/* Pixel decorative corner brackets */}
        <div
          className={`absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${
            isComplete ? 'border-emerald-400' : 'border-amber-400'
          }`}
        />
        <div
          className={`absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${
            isComplete ? 'border-emerald-400' : 'border-amber-400'
          }`}
        />
        <div
          className={`absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${
            isComplete ? 'border-emerald-400' : 'border-amber-400'
          }`}
        />
        <div
          className={`absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${
            isComplete ? 'border-emerald-400' : 'border-amber-400'
          }`}
        />

        <div className="flex items-center gap-3.5">
          {/* Emblem Icon */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 shadow-inner ${
              isComplete
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                : 'bg-amber-950 border-amber-400 text-amber-300'
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <Compass className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            )}
          </div>

          {/* Banner Text with Strong Hierarchy */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-black tracking-widest uppercase ${
                  isComplete ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isComplete ? '✓ OBJECTIVE COMPLETE' : '★ NEW OBJECTIVE'}
              </span>

              {notification.xpGain ? (
                <span className="inline-flex items-center gap-1 text-xs font-mono font-black text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-400" /> +{notification.xpGain} XP
                </span>
              ) : null}
            </div>

            <div className="text-base sm:text-lg font-black text-white font-sans leading-tight mt-1 truncate">
              {notification.title}
            </div>

            {notification.badge && (
              <div className="text-xs font-medium text-emerald-300 font-sans mt-0.5 truncate">
                {notification.badge}
              </div>
            )}
          </div>

          {/* Close button */}
          <span className="text-xs text-slate-400 hover:text-white px-1.5 py-1 font-mono">
            ✕
          </span>
        </div>
      </div>
    </div>
  );
};
