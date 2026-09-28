import React, { useState } from 'react';
import { X, HelpCircle, Navigation, MessageSquare, MousePointer } from 'lucide-react';
import { sound } from '../services/soundService';

interface ControlsTutorialBannerProps {
  onDismiss: () => void;
}

export const ControlsTutorialBanner: React.FC<ControlsTutorialBannerProps> = ({
  onDismiss,
}) => {
  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-25 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-md w-full px-4">
      <div className="bg-[#0b101b]/95 backdrop-blur-md border border-amber-400/60 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] p-3 sm:p-3.5 font-mono text-slate-100">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>HOW TO PLAY (CONTROLS)</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onDismiss();
            }}
            className="text-slate-400 hover:text-white cursor-pointer px-1"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2.5 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="font-bold text-amber-300 text-[11px] mb-1">WASD / ARROWS</div>
            <div className="text-[10px] text-slate-300">Move Player</div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="font-bold text-sky-300 text-[11px] mb-1">WALK NEAR</div>
            <div className="text-[10px] text-slate-300">Interact Range</div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="font-bold text-emerald-300 text-[11px] mb-1">[ E ] / SPACE</div>
            <div className="text-[10px] text-slate-300">Talk & Inspect</div>
          </div>
        </div>

        <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-2">
          <span>Tip: You can also click anywhere on the floor to walk</span>
          <button
            onClick={() => {
              sound.playClick();
              onDismiss();
            }}
            className="text-amber-400 hover:underline font-bold cursor-pointer"
          >
            [ Got it ]
          </button>
        </div>
      </div>
    </div>
  );
};
