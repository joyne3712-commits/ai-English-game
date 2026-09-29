import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../services/soundService';
import { Plane, Compass, MapPin, ChevronRight, SkipForward, ArrowRight, Sparkles } from 'lucide-react';

export type CutsceneScene = 'title' | 'travel_setup' | 'travel_destination' | 'airplane';

interface OpeningCutsceneProps {
  onStartArrivalWalk?: () => void;
  onSkipAll?: () => void;
  onStartGameplay?: () => void;
}

export const OpeningCutscene: React.FC<OpeningCutsceneProps> = ({
  onStartArrivalWalk,
  onSkipAll,
  onStartGameplay,
}) => {
  const [currentScene, setCurrentScene] = useState<CutsceneScene>('title');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const airplaneCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scene transition helper
  const transitionTo = (nextScene: CutsceneScene) => {
    sound.playClick();
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScene(nextScene);
      setIsTransitioning(false);
    }, 250);
  };

  // Skip directly to gameplay
  const handleSkip = () => {
    sound.playClick();
    if (onSkipAll) {
      onSkipAll();
    } else if (onStartGameplay) {
      onStartGameplay();
    }
  };

  // 1. Title Screen -> Travel Setup
  const handleStartJourney = () => {
    sound.playTitleChime();
    sound.playClick();
    transitionTo('travel_setup');
  };

  // 4. Airplane Sequence Canvas
  useEffect(() => {
    if (currentScene !== 'airplane') return;
    const canvas = airplaneCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 1;
      const w = canvas.width;
      const h = canvas.height;

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, w, h);

      // Sky Gradient (Matches airport tarmac sunset palette)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#12142e'); // Deep dusk
      skyGrad.addColorStop(0.35, '#2c2554'); // Twilight indigo
      skyGrad.addColorStop(0.7, '#8b3d4f'); // Rose sunset
      skyGrad.addColorStop(0.9, '#dd6b38'); // Amber orange
      skyGrad.addColorStop(1, '#f59e0b'); // Horizon gold
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Twinkling Pixel Stars (Upper sky)
      const starPositions = [
        [30, 20], [90, 14], [150, 28], [220, 18], [280, 24],
        [60, 42], [130, 48], [195, 36], [260, 45], [310, 16],
      ];
      ctx.fillStyle = '#ffffff';
      starPositions.forEach(([sx, sy], i) => {
        const twinkle = Math.sin(t * 0.08 + i * 1.7) > -0.2;
        if (twinkle) {
          ctx.fillRect(sx, sy, 2, 2);
        }
      });

      // Distant Parallax Pixel Clouds Layer 1 (Slow)
      ctx.fillStyle = 'rgba(254, 215, 170, 0.25)';
      const cloudOffset1 = (t * 0.35) % (w + 100);
      ctx.fillRect(w - cloudOffset1 + 40, 50, 70, 10);
      ctx.fillRect(w - cloudOffset1 + 55, 44, 40, 8);
      ctx.fillRect(w - cloudOffset1 - 90, 68, 85, 12);
      ctx.fillRect(w - cloudOffset1 - 70, 62, 50, 8);

      // Midground Pixel Clouds Layer 2
      ctx.fillStyle = 'rgba(253, 230, 138, 0.35)';
      const cloudOffset2 = (t * 0.7) % (w + 120);
      ctx.fillRect(w - cloudOffset2 + 10, 85, 95, 14);
      ctx.fillRect(w - cloudOffset2 + 25, 76, 60, 12);
      ctx.fillRect(w - cloudOffset2 - 120, 95, 110, 16);
      ctx.fillRect(w - cloudOffset2 - 100, 86, 75, 12);

      // Distant Mountain Ridge Silhouette (Pixel stepped edges)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h - 35);
      ctx.lineTo(30, h - 42);
      ctx.lineTo(70, h - 30);
      ctx.lineTo(120, h - 48);
      ctx.lineTo(170, h - 36);
      ctx.lineTo(210, h - 44);
      ctx.lineTo(260, h - 32);
      ctx.lineTo(300, h - 40);
      ctx.lineTo(320, h - 34);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Glowing Pixel City Grid Lights Below
      const cityLights = [
        [15, h - 20, '#fbbf24'], [35, h - 14, '#f59e0b'], [55, h - 18, '#ffffff'],
        [75, h - 10, '#38bdf8'], [95, h - 22, '#ef4444'], [115, h - 12, '#fbbf24'],
        [135, h - 16, '#fde047'], [155, h - 11, '#ffffff'], [175, h - 20, '#38bdf8'],
        [195, h - 15, '#fbbf24'], [215, h - 18, '#f59e0b'], [235, h - 12, '#ffffff'],
        [255, h - 22, '#ef4444'], [275, h - 14, '#fbbf24'], [295, h - 16, '#38bdf8'],
      ];
      cityLights.forEach(([lx, ly, col]) => {
        const glow = Math.sin(t * 0.05 + Number(lx)) > -0.3;
        if (glow) {
          ctx.fillStyle = String(col);
          ctx.fillRect(Number(lx), Number(ly), 2, 2);
        }
      });

      // Jet Aircraft Cruising Sprite
      const planeBob = Math.sin(t * 0.04) * 3;
      const px = 110;
      const py = 75 + planeBob;

      // Plane Wing contrail
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(px - 45, py + 8, 40, 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(px - 70, py + 8, 25, 2);

      // Plane Fuselage (White)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px, py + 4, 48, 8);
      ctx.fillRect(px + 48, py + 5, 8, 6);
      ctx.fillRect(px + 56, py + 7, 4, 3); // Nose cone

      // Cockpit Window (Sky Cyan)
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 44, py + 5, 6, 3);

      // Passenger Cabin Windows
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(px + 12 + i * 5, py + 6, 2, 2);
      }

      // Pacific Sky Blue Tail Fin with Golden Globe Accent
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(px, py + 4);
      ctx.lineTo(px - 8, py - 8);
      ctx.lineTo(px + 6, py - 8);
      ctx.lineTo(px + 10, py + 4);
      ctx.closePath();
      ctx.fill();

      // Tail Logo
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px - 2, py - 6, 4, 4);

      // Wing & Jet Engine
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(px + 20, py + 10, 18, 4); // Main Wing
      ctx.fillStyle = '#475569';
      ctx.fillRect(px + 24, py + 12, 10, 4); // Engine Nacelle

      // Engine Jet Flame Glow
      const flamePuff = Math.sin(t * 0.2) > 0;
      ctx.fillStyle = flamePuff ? '#f97316' : '#eab308';
      ctx.fillRect(px + 22, py + 13, 2, 2);

      // Flashing Wing Navigation Lights
      const navFlash = Math.floor(t / 20) % 2 === 0;
      ctx.fillStyle = navFlash ? '#ef4444' : '#7f1d1d';
      ctx.fillRect(px + 18, py + 11, 2, 2); // Red Left Wingtip
      ctx.fillStyle = navFlash ? '#10b981' : '#064e3b';
      ctx.fillRect(px + 36, py + 11, 2, 2); // Green Right Wingtip
      ctx.fillStyle = navFlash ? '#ffffff' : '#475569';
      ctx.fillRect(px - 8, py - 8, 2, 2); // White Strobe Tail

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentScene]);

  const handleFinishCutscene = () => {
    sound.playAirportChime();
    setIsTransitioning(true);
    setTimeout(() => {
      if (onStartArrivalWalk) {
        onStartArrivalWalk();
      } else if (onStartGameplay) {
        onStartGameplay();
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 font-mono select-none overflow-hidden">
      {/* Global Skip Button (top right) */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-40 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-lg backdrop-blur-md"
        title="Skip intro cutscene"
      >
        <span>SKIP INTRO</span>
        <SkipForward className="w-3.5 h-3.5 text-amber-400" />
      </button>

      {/* =================================================================== */}
      {/* SCENE 1: TITLE SCREEN */}
      {/* =================================================================== */}
      {currentScene === 'title' && (
        <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#0f172a]">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo Badge */}
          <div className="relative z-20 pt-6 flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-widest uppercase flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>FLUENT TRIP</span>
            </div>
          </div>

          {/* Center Title & Start Button */}
          <div className="relative z-20 flex flex-col items-center text-center max-w-xl mx-auto my-auto">
            <span className="text-xs sm:text-sm font-black tracking-widest text-amber-400 uppercase mb-2 block">
              CHAPTER 01
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-wider mb-4 drop-shadow-[0_4px_24px_rgba(245,158,11,0.35)]">
              THE CONNECTION
            </h1>

            <p className="text-sm sm:text-lg text-amber-100/90 font-medium tracking-wide drop-shadow mb-8 sm:mb-10 font-sans">
              Your international travel adventure begins here.
            </p>

            <button
              onClick={handleStartJourney}
              className="group relative px-8 py-3.5 sm:px-10 sm:py-4 bg-[#e88548] hover:bg-[#f29457] active:translate-y-1 text-slate-950 font-black text-sm sm:text-base tracking-wider uppercase rounded-xl border-b-4 border-[#943924] shadow-[0_10px_25px_rgba(232,133,72,0.4)] transition-all cursor-pointer flex items-center gap-3"
            >
              <span>START JOURNEY</span>
              <ChevronRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Bottom Atmosphere Note */}
          <div className="relative z-20 pb-4 text-center text-[11px] text-amber-200/50">
            <span>[ Click START JOURNEY to begin ]</span>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SCENE 2: TRAVEL SETUP (Story Card - Player-Paced) */}
      {/* =================================================================== */}
      {currentScene === 'travel_setup' && (
        <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-950">
          <div className="w-full max-w-md bg-[#0b101b] border-2 border-amber-400/80 rounded-3xl shadow-[0_20px_60px_rgba(245,158,11,0.25)] p-6 sm:p-8 relative overflow-hidden text-slate-100 select-none animate-in fade-in zoom-in-95 duration-300">
            {/* Corner pixel brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400" />

            {/* Header */}
            <div className="text-center pb-4 border-b border-slate-800">
              <span className="text-[11px] font-bold text-amber-400/90 tracking-widest uppercase block mb-1">
                CHAPTER 01
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider">
                THE CONNECTION
              </h2>
            </div>

            {/* Story Text */}
            <div className="py-5 sm:py-6 space-y-4 text-center">
              <p className="text-base sm:text-lg font-bold text-amber-300 font-sans tracking-wide">
                Your first international trip alone.
              </p>
              <div className="space-y-2 text-sm sm:text-base text-slate-200 font-sans font-medium leading-relaxed">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono font-bold text-white tracking-wide">
                  NINGBO ➔ TOKYO ➔ SAN FRANCISCO
                </div>
                <p className="text-sky-300 font-semibold">First flight completed.</p>
                <p>Waiting in Tokyo for your connecting flight UA889.</p>
                <p className="text-rose-300 font-bold pt-1">Then something unexpected happens...</p>
              </div>
            </div>

            {/* Manual Advance Button - Self Paced */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-sans">
                Read at your own pace
              </span>
              <button
                onClick={() => transitionTo('travel_destination')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <span>NEXT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SCENE 3: TRAVEL DESTINATION (Pixel Boarding Ticket & Route) */}
      {/* =================================================================== */}
      {currentScene === 'travel_destination' && (
        <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-950">
          <div className="w-full max-w-md bg-[#0b101b] border-2 border-sky-400/80 rounded-3xl shadow-[0_20px_60px_rgba(2,132,199,0.25)] p-6 sm:p-7 relative overflow-hidden text-slate-100 select-none animate-in fade-in zoom-in-95 duration-300">
            {/* Pixel corners */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-sky-400" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-sky-400" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-sky-400" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-sky-400" />

            {/* Ticket Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-sky-300 tracking-wider">
                  FLIGHT ITINERARY
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                CONFIRMED
              </span>
            </div>

            {/* Origin & Destination Display */}
            <div className="py-4 grid grid-cols-3 items-center text-center">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  FROM
                </span>
                <span className="text-base sm:text-lg font-black text-white">NINGBO</span>
                <span className="text-[9px] text-emerald-400 block font-mono">ARRIVED IN TOKYO</span>
              </div>

              {/* Animated Route Line */}
              <div className="flex flex-col items-center justify-center px-2">
                <Plane className="w-5 h-5 text-amber-400 animate-pulse" />
                <div className="w-full flex items-center justify-center gap-1 my-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                </div>
                <span className="text-[9px] text-amber-300 font-mono">TRANSIT</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-sky-400 font-bold block uppercase tracking-wider">
                  TO
                </span>
                <span className="text-sm sm:text-base font-black text-amber-300">SAN FRANCISCO</span>
                <span className="text-[9px] text-slate-400 block font-mono">SFO · TERMINAL 2</span>
              </div>
            </div>

            {/* Simplified Pixel Map Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">
                  <strong className="text-white">CONNECTING:</strong> UA889
                </span>
                <span className="text-amber-300 font-bold">Gate 22 · Boarding 20:40</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1.5 border-t border-slate-800">
                <span>HOTEL: SUNSET HOTEL</span>
                <span className="text-emerald-400 font-bold">CHECK-IN: UNTIL 23:00</span>
              </div>
            </div>

            {/* Manual Advance Button - Self Paced */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-sans">
                Ready to enter terminal
              </span>
              <button
                onClick={() => transitionTo('airplane')}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-black text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-sky-600/20"
              >
                <span>NEXT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SCENE 4: AIRPLANE SEQUENCE (Pixel Art Canvas) */}
      {/* =================================================================== */}
      {currentScene === 'airplane' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-slate-950">
          {/* Native Pixel Canvas (320x180 scaled with pixelated interpolation) */}
          <canvas
            ref={airplaneCanvasRef}
            width={320}
            height={180}
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Minimal Atmospheric Flight Caption & Clear Continue Action */}
          <div className="absolute bottom-8 inset-x-0 flex flex-col items-center justify-center gap-3 z-30">
            <div className="px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-amber-200/95 text-xs sm:text-sm tracking-wider font-mono shadow-xl">
              [ FLIGHT TRANSIT · ARRIVED AT TOKYO AIRPORT TERMINAL ]
            </div>

            <button
              onClick={handleFinishCutscene}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm tracking-widest uppercase transition-all cursor-pointer flex items-center gap-2 shadow-[0_10px_30px_rgba(245,158,11,0.4)] border-b-2 border-amber-700"
            >
              <span>ENTER AIRPORT TERMINAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
