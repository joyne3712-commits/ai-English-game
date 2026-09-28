import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../services/soundService';
import { Plane, Compass, MapPin, ChevronRight, SkipForward } from 'lucide-react';

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
  const [sceneProgress, setSceneProgress] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const airplaneCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Timing constants (in ms)
  const SETUP_DURATION = 3800;
  const DESTINATION_DURATION = 3600;
  const AIRPLANE_DURATION = 3800;

  // Scene transition helper
  const transitionTo = (nextScene: CutsceneScene) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScene(nextScene);
      setIsTransitioning(false);
      setSceneProgress(0);
    }, 300);
  };

  // Skip everything directly to gameplay
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

  // 2. Travel Setup Timer
  useEffect(() => {
    if (currentScene !== 'travel_setup') return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setSceneProgress(Math.min(1, elapsed / SETUP_DURATION));
    }, 40);

    const timer = setTimeout(() => {
      transitionTo('travel_destination');
    }, SETUP_DURATION);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [currentScene]);

  // 3. Travel Destination Timer
  useEffect(() => {
    if (currentScene !== 'travel_destination') return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setSceneProgress(Math.min(1, elapsed / DESTINATION_DURATION));
    }, 40);

    const timer = setTimeout(() => {
      transitionTo('airplane');
    }, DESTINATION_DURATION);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [currentScene]);

  // 4. Airplane Sequence Canvas & Timer
  useEffect(() => {
    if (currentScene !== 'airplane') return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setSceneProgress(Math.min(1, elapsed / AIRPLANE_DURATION));
    }, 40);

    const timer = setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        if (onStartArrivalWalk) {
          onStartArrivalWalk();
        } else if (onStartGameplay) {
          onStartGameplay();
        }
      }, 400);
    }, AIRPLANE_DURATION);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [currentScene, onStartArrivalWalk]);

  // Pixel Airplane Canvas Rendering
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

      // Sky Gradient (Matches airport tarmac & window exterior sunset palette)
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
        [25, h - 8, '#f59e0b'], [60, h - 6, '#fbbf24'], [110, h - 7, '#ffffff'],
        [160, h - 5, '#fbbf24'], [220, h - 6, '#38bdf8'], [280, h - 7, '#ffffff'],
      ];
      cityLights.forEach(([lx, ly, col], idx) => {
        const pulse = Math.sin(t * 0.1 + idx) > -0.4;
        if (pulse) {
          ctx.fillStyle = col as string;
          ctx.fillRect(Number(lx), Number(ly), 2, 2);
        }
      });

      // Animated Pixel Airliner (UA889) Flying Across
      // Flight progression from left (x: 40) towards right (x: 230)
      const prog = Math.min(1, t / (AIRPLANE_DURATION / 16));
      const planeX = 35 + prog * 185;
      const planeY = 68 + Math.sin(t * 0.04) * 4;

      // Vapor Contrail Trail behind engines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(planeX - 55, planeY + 8, 48, 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(planeX - 85, planeY + 7, 30, 4);

      // Airliner Body (Pixel Art Jet - White Fuselage with Blue Stripe)
      // Fuselage Base
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(planeX - 6, planeY + 3, 38, 8);
      // Cockpit Nose (Aerodynamic stepped taper)
      ctx.fillRect(planeX + 32, planeY + 4, 4, 6);
      ctx.fillRect(planeX + 36, planeY + 5, 4, 4);
      ctx.fillRect(planeX + 40, planeY + 6, 2, 2);

      // Tail Fin (Swept back)
      ctx.fillStyle = '#0284c7'; // United blue
      ctx.fillRect(planeX - 6, planeY - 7, 7, 10);
      ctx.fillRect(planeX - 2, planeY - 11, 4, 5);
      ctx.fillStyle = '#38bdf8'; // Accent sky blue on fin
      ctx.fillRect(planeX, planeY - 10, 2, 4);

      // Blue Livery Cheatline Along Windows
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(planeX, planeY + 6, 34, 2);

      // Cabin Windows (Glowing warm yellow interior light)
      ctx.fillStyle = '#fef08a';
      for (let wx = planeX + 4; wx <= planeX + 28; wx += 4) {
        ctx.fillRect(wx, planeY + 5, 2, 2);
      }
      // Cockpit Windshield (Dark glass)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(planeX + 33, planeY + 4, 3, 2);

      // Main Wing (Swept)
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(planeX + 12, planeY + 11, 14, 4);
      ctx.fillRect(planeX + 16, planeY + 15, 8, 4);
      // Wing Engine Nacelle
      ctx.fillStyle = '#475569';
      ctx.fillRect(planeX + 14, planeY + 13, 8, 4);

      // Navigation Lights (Red port, Green starboard, Flashing beacon strobe)
      const flash = Math.floor(t / 15) % 2 === 0;
      if (flash) {
        // Red beacon on top of fuselage
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(planeX + 16, planeY + 1, 2, 2);
      }
      // Green starboard navigation light on wingtip
      ctx.fillStyle = '#10b981';
      ctx.fillRect(planeX + 23, planeY + 17, 2, 2);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentScene, AIRPLANE_DURATION]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none bg-slate-950 font-mono">
      {/* Global Skip Button (Always accessible) */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleSkip}
          className="px-3.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/10 hover:border-amber-400/50 text-[11px] text-amber-200/90 hover:text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-lg group"
        >
          <span>SKIP INTRO</span>
          <SkipForward className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Screen Fade Transition Overlay */}
      <div
        className={`absolute inset-0 bg-slate-950 pointer-events-none z-40 transition-opacity duration-300 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* =================================================================== */}
      {/* SCENE 1: TITLE SCREEN */}
      {/* =================================================================== */}
      {currentScene === 'title' && (
        <div className="relative w-full h-full flex flex-col items-center justify-between p-6 overflow-hidden">
          {/* Pixel Art Sky Background with Golden Sunset */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#241734] via-[#522544] via-[#a84334] to-[#df7c40] z-0">
            {/* Retro Pixel Sun */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#fde08a] shadow-[0_0_80px_rgba(253,224,138,0.4)] opacity-90">
              <div className="absolute inset-x-0 bottom-5 h-2 bg-[#df7c40]/40" />
              <div className="absolute inset-x-0 bottom-10 h-1.5 bg-[#df7c40]/30" />
              <div className="absolute inset-x-0 bottom-15 h-1 bg-[#df7c40]/20" />
            </div>

            {/* Distant Mountain / City Skyline Silhouette */}
            <div className="absolute bottom-0 inset-x-0 h-48 z-10 flex items-end">
              <svg
                viewBox="0 0 1000 240"
                preserveAspectRatio="none"
                className="w-full h-full text-[#140c1d] fill-current"
              >
                <path d="M0,240 L0,180 L80,160 L140,175 L220,130 L290,150 L360,110 L440,140 L520,95 L610,145 L700,105 L780,155 L860,120 L940,165 L1000,140 L1000,240 Z" opacity="0.6" fill="#20112c" />
                <path d="M0,240 L0,195 L60,190 L110,210 L180,180 L250,190 L320,165 L410,185 L500,160 L580,180 L670,150 L750,185 L840,160 L920,190 L1000,170 L1000,240 Z" opacity="0.9" fill="#140c1d" />
                {/* Glowing window lights in distant city blocks */}
                <rect x="235" y="160" width="14" height="60" fill="#0d0714" />
                <rect x="255" y="145" width="20" height="75" fill="#0d0714" />
                <rect x="635" y="140" width="18" height="80" fill="#0d0714" />
                <rect x="660" y="155" width="24" height="65" fill="#0d0714" />
                <circle cx="265" cy="155" r="1.5" fill="#fde08a" />
                <circle cx="242" cy="170" r="1.5" fill="#fde08a" />
                <circle cx="645" cy="150" r="1.5" fill="#fde08a" />
                <circle cx="672" cy="165" r="1.5" fill="#f87171" />
              </svg>
            </div>

            <div className="absolute bottom-0 inset-x-0 h-10 bg-[#0f0714] border-t-2 border-[#a84334]/30" />
          </div>

          {/* Top Tagline */}
          <div className="relative z-20 pt-8 sm:pt-12 text-center animate-in fade-in duration-600">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-amber-400/20 text-amber-200/90 text-xs tracking-widest uppercase">
              <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
              <span>Pixel Travel Adventure</span>
            </div>
          </div>

          {/* Center Main Title */}
          <div className="relative z-20 flex flex-col items-center text-center my-auto px-4 max-w-xl animate-in zoom-in-95 duration-500">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_0px_#522544] font-mono mb-3">
              <span className="text-[#fde08a]">FLUENT</span>{' '}
              <span className="text-white">TRIP</span>
            </h1>

            <p className="text-sm sm:text-lg text-amber-100/90 font-medium tracking-wide drop-shadow mb-8 sm:mb-10 font-sans">
              Your journey starts here.
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
            <span>[ Press START JOURNEY to begin ]</span>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SCENE 2: TRAVEL SETUP (Story Card) */}
      {/* =================================================================== */}
      {currentScene === 'travel_setup' && (
        <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-950">
          <div className="w-full max-w-md bg-[#0b101b] border-2 border-amber-400/80 rounded-3xl shadow-[0_20px_60px_rgba(245,158,11,0.25)] p-6 sm:p-8 relative overflow-hidden text-slate-100 select-none animate-in fade-in zoom-in-95 duration-400">
            {/* Corner pixel brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400" />

            {/* Header */}
            <div className="text-center pb-5 border-b border-slate-800">
              <span className="text-[11px] font-bold text-amber-400/90 tracking-widest uppercase block mb-1">
                CHAPTER 01
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider">
                THE CANCELLED FLIGHT
              </h2>
            </div>

            {/* Story Text */}
            <div className="py-6 sm:py-8 space-y-4 text-center">
              <p className="text-base sm:text-lg font-bold text-amber-300 font-sans tracking-wide">
                Your first trip alone.
              </p>
              <div className="space-y-1.5 text-sm sm:text-base text-slate-200 font-sans font-medium leading-relaxed">
                <p>One flight.</p>
                <p>One unfamiliar airport.</p>
                <p className="text-rose-300 font-semibold">One problem you didn't expect.</p>
              </div>
            </div>

            {/* Manual Advance Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Starting your adventure...
              </span>
              <button
                onClick={() => transitionTo('travel_destination')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-900">
              <div
                className="h-full bg-amber-400 transition-all duration-75"
                style={{ width: `${sceneProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SCENE 3: TRAVEL DESTINATION (Pixel Boarding Ticket & Route) */}
      {/* =================================================================== */}
      {currentScene === 'travel_destination' && (
        <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-950">
          <div className="w-full max-w-md bg-[#0b101b] border-2 border-sky-400/80 rounded-3xl shadow-[0_20px_60px_rgba(2,132,199,0.25)] p-6 sm:p-7 relative overflow-hidden text-slate-100 select-none animate-in fade-in zoom-in-95 duration-400">
            {/* Pixel corners */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-sky-400" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-sky-400" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-sky-400" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-sky-400" />

            {/* Ticket Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
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
            <div className="py-5 grid grid-cols-3 items-center text-center">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  FROM
                </span>
                <span className="text-lg sm:text-xl font-black text-white">HOME</span>
                <span className="text-[10px] text-slate-400 block font-mono">ORIGIN</span>
              </div>

              {/* Animated Route Line */}
              <div className="flex flex-col items-center justify-center px-2">
                <Plane className="w-5 h-5 text-amber-400 animate-pulse" />
                <div className="w-full flex items-center justify-center gap-1 my-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                </div>
                <span className="text-[9px] text-slate-400">NON-STOP</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-sky-400 font-bold block uppercase tracking-wider">
                  TO
                </span>
                <span className="text-base sm:text-lg font-black text-amber-300">SAN FRANCISCO</span>
                <span className="text-[10px] text-slate-400 block font-mono">SFO · TERMINAL 2</span>
              </div>
            </div>

            {/* Simplified Pixel Map Card */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300">
                  <strong className="text-white">FLIGHT:</strong> UA889
                </span>
                <span className="text-amber-300 font-bold">6:40 PM PST</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                <span>SEAT: 14A (WINDOW)</span>
                <span>STATUS: ON TIME</span>
              </div>
            </div>

            {/* Manual Advance Button */}
            <div className="pt-4 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Boarding aircraft...
              </span>
              <button
                onClick={() => transitionTo('airplane')}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-900">
              <div
                className="h-full bg-sky-400 transition-all duration-75"
                style={{ width: `${sceneProgress * 100}%` }}
              />
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

          {/* Minimal Atmospheric Flight Caption */}
          <div className="absolute bottom-8 inset-x-0 text-center z-30 pointer-events-none">
            <div className="inline-block px-4 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-amber-200/90 text-xs tracking-wider font-mono">
              [ FLIGHT UA889 · DESCENDING INTO SAN FRANCISCO ]
            </div>
          </div>

          {/* Scene Progress Bar at Bottom */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-900 z-30">
            <div
              className="h-full bg-amber-400 transition-all duration-75"
              style={{ width: `${sceneProgress * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
