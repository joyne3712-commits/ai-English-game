import React, { useEffect, useState } from 'react';
import { Hotspot } from '../types';
import { AirportGameEngine } from './airport/AirportGameEngine';
import { Plane, CheckCircle2, Sparkles, ShieldCheck, Ticket } from 'lucide-react';

export interface AirportSceneProps {
  hotspots: Hotspot[];
  activeHotspotId?: string | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  hasBoardingPass: boolean;
  playerPos: { x: number; y: number };
  onMovePlayer: (x: number, y: number) => void;
  floatingReward: { text: string; id: number } | null;
  interactingNpcId?: string | null;
  isDialogueActive?: boolean;
  playerAlert?: string | null;
  isIntroWalking?: boolean;
  onIntroWalkReachTarget?: () => void;
  inGameMinutes?: number;
  activeObjectiveId?: string | null;
  isGateChanged?: boolean;
  hasBoardingPassVerified?: boolean;
  isBoardingCelebrating?: boolean;
  isBoardingSequenceActive?: boolean;
  onBoardingSequenceComplete?: () => void;
  isBoardingEnteringDoor?: boolean;
  onBoardingEnteringDoorComplete?: () => void;
}

export const AirportScene: React.FC<AirportSceneProps> = (props) => {
  const {
    isBoardingEnteringDoor,
    isBoardingSequenceActive,
    isBoardingCelebrating,
    hasBoardingPassVerified,
    playerPos,
  } = props;

  // Track if avatar is in proximity of Gate 18 (x: ~20-30%, y: ~15-28%)
  const isNearGate18 =
    playerPos.x >= 18 &&
    playerPos.x <= 34 &&
    playerPos.y >= 15 &&
    playerPos.y <= 30;

  // Boarding scanner pulse state
  const [scannerPulse, setScannerPulse] = useState(false);

  useEffect(() => {
    if (isBoardingEnteringDoor || isBoardingSequenceActive) {
      setScannerPulse(true);
      const timer = setTimeout(() => setScannerPulse(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [isBoardingEnteringDoor, isBoardingSequenceActive]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 1. Underlying Airport Game Engine Canvas & Game World */}
      <AirportGameEngine {...props} />

      {/* 2. Gate 18 Approaching Proximity Indicator (Subtle bottom badge when near Gate 18 with verified pass) */}
      {isNearGate18 && hasBoardingPassVerified && !isBoardingEnteringDoor && !props.isDialogueActive && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-500 animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 border border-emerald-500/50 shadow-lg shadow-emerald-950/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Plane className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono font-bold text-emerald-300 tracking-wide">
              GATE 18 · READY FOR BOARDING
            </span>
            <span className="text-[10px] text-slate-400 font-sans">
              (Walk into doorway)
            </span>
          </div>
        </div>
      )}

      {/* 3. Cinematic Letterbox Bars (Glide in during Boarding Door Transition) */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 pointer-events-none transition-all duration-700 ease-out bg-gradient-to-b from-black via-black/80 to-transparent ${
          isBoardingEnteringDoor ? 'h-12 opacity-100' : 'h-0 opacity-0'
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 pointer-events-none transition-all duration-700 ease-out bg-gradient-to-t from-black via-black/80 to-transparent ${
          isBoardingEnteringDoor ? 'h-12 opacity-100' : 'h-0 opacity-0'
        }`}
      />

      {/* 4. Boarding Pass Verification HUD Shimmer (Active when walking into Jetbridge door) */}
      {isBoardingEnteringDoor && (
        <div className="absolute inset-0 z-40 pointer-events-none flex flex-col items-center justify-between p-6 transition-all duration-1000 animate-fade-in">
          {/* Top Boarding Confirmation Tag */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950/90 border border-emerald-400/60 shadow-2xl backdrop-blur-md animate-bounce-short">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-extrabold text-emerald-300 tracking-wider">
                  TICKET SCANNED ✓
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                  SFO BOUND
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Welcome aboard · Gate 18 Jet Bridge
              </p>
            </div>
          </div>

          {/* Center Optical Scanner Laser Beam Animation */}
          <div className="relative w-72 h-1 overflow-hidden rounded-full bg-emerald-950/50 border border-emerald-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
          </div>

          {/* Bottom Flight Departure Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700/60 backdrop-blur-sm text-slate-300 text-[11px] font-mono">
            <Plane className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>CONNECTING FLIGHT CONFIRMED · DESTINATION: SAN FRANCISCO</span>
          </div>

          {/* Luminous Golden / Sunset Wash overlay on entering cabin */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/15 via-sky-400/10 to-transparent mix-blend-screen pointer-events-none animate-pulse duration-1000" />
        </div>
      )}
    </div>
  );
};
