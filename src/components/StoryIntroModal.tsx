import React from 'react';
import { Plane, AlertTriangle, ArrowRight, User, MapPin } from 'lucide-react';
import { sound } from '../services/soundService';

interface StoryIntroModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export const StoryIntroModal: React.FC<StoryIntroModalProps> = ({
  isOpen,
  onContinue,
}) => {
  if (!isOpen) return null;

  const handleStart = () => {
    sound.playClick();
    sound.playItemGet();
    onContinue();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0b101b] border-2 border-amber-400/80 rounded-3xl shadow-[0_20px_60px_rgba(245,158,11,0.25)] p-6 sm:p-7 relative overflow-hidden font-mono text-slate-100 select-none">
        {/* Pixel decorative corner brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400" />

        {/* Header Badge */}
        <div className="text-center space-y-1.5 pb-5 border-b border-slate-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black tracking-widest uppercase">
            <span>FLUENT TRIP</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider pt-2">
            CHAPTER 01
          </h2>
          <div className="text-amber-300 font-bold text-base tracking-widest uppercase">
            THE CANCELLED FLIGHT
          </div>
        </div>

        {/* Narrative Core Brief */}
        <div className="py-6 space-y-3 text-center">
          <p className="text-sm sm:text-base font-medium text-slate-300 leading-relaxed font-sans">
            You are travelling to San Francisco.
          </p>
          <p className="text-sm sm:text-base font-bold text-rose-300 leading-relaxed font-sans">
            Your flight has just been cancelled.
          </p>
          <p className="text-sm sm:text-base font-bold text-amber-300 leading-relaxed font-sans">
            You need to find someone who can help you.
          </p>
        </div>

        {/* Quick First-Time Controls */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider text-center">
            HOW TO PLAY
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
            <div className="p-2 rounded-xl bg-black/40 border border-slate-800/80">
              <span className="font-bold text-white block">WASD / ARROW KEYS</span>
              <span className="text-slate-400 text-[10px]">Move</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-slate-800/80">
              <span className="font-bold text-amber-300 block">[ E ]</span>
              <span className="text-slate-400 text-[10px]">Talk</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleStart}
          className="mt-6 w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
        >
          <span>CONTINUE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
