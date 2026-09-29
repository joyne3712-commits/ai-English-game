import React, { useEffect } from 'react';
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
  // Auto-dismiss automatically after 2.8 seconds as specified
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 2800);
    return () => clearTimeout(timer);
  }, [notification?.id, onDismiss]);

  if (!notification) return null;

  const isComplete = notification.type === 'complete';

  return (
    <div
      onClick={onDismiss}
      className="fixed top-16 sm:top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto cursor-pointer select-none max-w-sm sm:max-w-md w-[92%] animate-in fade-in slide-in-from-top-4 duration-250"
    >
      <div
        className={`p-3.5 sm:p-4 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.92)] border-2 backdrop-blur-xl relative overflow-hidden transition-all ${
          isComplete
            ? 'bg-[#091512]/95 border-emerald-400/90 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
            : 'bg-[#181106]/95 border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
        }`}
      >
        {/* Pixel decorative corner brackets */}
        <div
          className={`absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 ${
            isComplete ? 'border-emerald-400' : 'border-amber-400'
          }`}
        />
        <div
          className={`absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 ${
            isComplete ? 'border-emerald-400' : 'border-amber-400'
          }`}
        />
        <div
          className={`absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 ${
            isComplete ? 'border-emerald-400' : 'border-amber-400'
          }`}
        />
        <div
          className={`absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 ${
            isComplete ? 'border-emerald-400' : 'border-amber-400'
          }`}
        />

        <div className="flex items-center gap-3">
          {/* Emblem Icon */}
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border-2 shadow-inner ${
              isComplete
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                : 'bg-amber-950 border-amber-400 text-amber-300'
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Compass className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            )}
          </div>

          {/* Banner Text with Strong Hierarchy */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] sm:text-xs font-mono font-black tracking-widest uppercase ${
                  isComplete ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isComplete ? '✓ OBJECTIVE COMPLETE' : '★ NEW OBJECTIVE'}
              </span>

              {notification.xpGain ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black text-amber-300 bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-400" /> +{notification.xpGain} XP
                </span>
              ) : null}
            </div>

            <div className="text-sm sm:text-base font-black text-white font-sans leading-tight mt-0.5 truncate">
              {notification.title}
            </div>

            {notification.badge && (
              <div className="text-[11px] font-medium text-emerald-300 font-sans mt-0.5 truncate">
                {notification.badge}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
