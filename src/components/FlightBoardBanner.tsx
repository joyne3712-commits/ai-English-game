import React from 'react';
import { Plane, AlertTriangle, Clock, MapPin } from 'lucide-react';

interface FlightBoardBannerProps {
  currentStepTitle: string;
}

export const FlightBoardBanner: React.FC<FlightBoardBannerProps> = ({ currentStepTitle }) => {
  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-6">
      {/* Top Ticker Bar */}
      <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Plane className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-200">PACIFIC RIM INTERNATIONAL AIRPORT</span>
          <span className="text-slate-600">·</span>
          <span>TERMINAL 2 · GATE B14</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>LOCAL: 14:15 PST</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-amber-400 font-medium">{currentStepTitle}</span>
        </div>
      </div>

      {/* Flight Row Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Flight Details */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-center shrink-0 text-sky-400 font-bold text-base">
            UA
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-lg sm:text-xl text-white tracking-wider">
                FLIGHT 889
              </span>
              <span className="text-xs text-slate-400">United Airlines</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono text-slate-300">Boeing 777-300ER</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 mt-1">
              <span className="font-medium text-slate-400">Origin: Counter B14</span>
              <span className="text-sky-400">➜</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                San Francisco (SFO)
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Scheduled</div>
            <div className="text-sm font-mono text-slate-300">14:30 PST</div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-950/80 border border-rose-600/80 text-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.2)] animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <div className="flex flex-col">
              <span className="font-mono font-black text-xs sm:text-sm tracking-widest text-rose-200">
                CANCELLED
              </span>
              <span className="text-[9px] text-rose-400 font-sans leading-none">航班取消 · 请至地勤柜台</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
