import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../services/soundService';
import { Plane, ChevronRight, CheckCircle2, User, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { InventoryItem } from '../types';

interface BoardingCutsceneProps {
  inventory: InventoryItem[];
  selectedFlight?: string | null;
  onComplete: () => void;
}

export const BoardingCutscene: React.FC<BoardingCutsceneProps> = ({
  inventory,
  selectedFlight,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'jetbridge' | 'cabin_door' | 'seated'>('jetbridge');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine assigned seat from inventory
  const isWindowSeat = inventory.some((item) => item.name.includes('14A') || item.name.includes('Window'));
  const isAisleSeat = inventory.some((item) => item.name.includes('14C') || item.name.includes('Aisle'));
  const seatName = isAisleSeat ? 'Seat 14C (Aisle)' : 'Seat 14A (Window)';
  const flightNumber = selectedFlight || (inventory.some((i) => i.id === 'flight_rebook_slip_31') ? 'UA937' : 'UA921');

  useEffect(() => {
    sound.playAirportChime();
  }, []);

  // 1. Pixel Canvas for Jetbridge & Cabin Scenes
  useEffect(() => {
    const canvas = canvasRef.current;
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

      if (phase === 'jetbridge') {
        // === PHASE 1: JETBRIDGE WALKWAY (Panoramic Tarmac Dusk Window) ===
        // Exterior Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#090d16');
        skyGrad.addColorStop(0.4, '#1e1b4b');
        skyGrad.addColorStop(0.7, '#831843');
        skyGrad.addColorStop(0.9, '#c2410c');
        skyGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Twinkling stars
        ctx.fillStyle = '#ffffff';
        [[30, 15], [80, 25], [140, 10], [210, 20], [270, 12]].forEach(([sx, sy], idx) => {
          if (Math.sin(t * 0.08 + idx) > 0) ctx.fillRect(sx, sy, 1.5, 1.5);
        });

        // Tarmac Ground & Floodlights
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, h - 55, w, 55);
        // Yellow Taxiway Guide Line
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, h - 35, w, 2);

        // Huge Boeing 787 Docked Outside Jetbridge
        // Main Fuselage
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(60, h - 85, 200, 32);
        // Blue Stripe & Nose
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(60, h - 70, 200, 5);
        ctx.fillRect(260, h - 82, 24, 26); // Nose
        // Cockpit window
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(268, h - 80, 12, 6);
        // Cabin Windows glowing warm yellow
        ctx.fillStyle = '#fef08a';
        for (let i = 0; i < 18; i++) {
          ctx.fillRect(75 + i * 9, h - 78, 4, 5);
        }
        // Giant Jet Engine Nacelle & Red Nav Light
        ctx.fillStyle = '#475569';
        ctx.fillRect(130, h - 56, 32, 16);
        ctx.fillStyle = '#ef4444';
        if (Math.floor(t / 25) % 2 === 0) {
          ctx.beginPath();
          ctx.arc(80, h - 90, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Interior Glass Jetbridge Corridor (Foreground)
        // Jetbridge Ceiling & Floor
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(0, 0, w, 24);
        ctx.fillRect(0, h - 30, w, 30);
        // Glass mullions & steel frame pillars
        ctx.fillStyle = '#334155';
        for (let px = 20; px < w; px += 65) {
          ctx.fillRect(px, 20, 4, h - 50);
          // Glass tint
          ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
          ctx.fillRect(px - 61, 24, 61, h - 54);
          ctx.fillStyle = '#334155';
        }

        // Jetbridge Blue Carpet & Floor Runway LED Strip
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, h - 28, w, 28);
        const beaconPulse = (t * 0.03) % 1;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, h - 14, w, 2);

        // Protagonist Walking along Jetbridge towards the Plane (Smooth traversal)
        const walkProg = (t * 0.015) % 1;
        const playerX = 40 + walkProg * (w - 90);
        const playerY = h - 22;
        const legSwing = Math.sin(t * 0.25) * 4;

        // Player Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(playerX, playerY + 4, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rolling Suitcase
        ctx.fillStyle = '#b45309';
        ctx.fillRect(playerX - 14, playerY - 10, 9, 12);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(playerX - 10, playerY - 16, 2, 6);

        // Player Body (Blue Jacket & Backpack)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(playerX - 5, playerY - 18, 10, 12);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(playerX - 8, playerY - 16, 3, 9); // Backpack
        // Legs & Shoes
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(playerX - 3 + legSwing, playerY - 6, 3, 8);
        ctx.fillRect(playerX + 1 - legSwing, playerY - 6, 3, 8);
        // Head & Cap
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(playerX - 4, playerY - 26, 8, 8);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(playerX - 5, playerY - 29, 10, 4);
        ctx.fillRect(playerX + 2, playerY - 27, 4, 2); // Cap visor pointing forward
      } else if (phase === 'cabin_door') {
        // === PHASE 2: AIRCRAFT DOORWAY & FLIGHT ATTENDANT ===
        // Warm Cabin Interior Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        // Cabin Ceiling & Overhead Panels
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, w, 32);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, 30, w, 2); // Ambient mood lighting stripe

        // Airplane Curved Fuselage Door Frame (Left side)
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(30, h / 2, 85, -Math.PI / 2, Math.PI / 2);
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();

        // Carpeted Cabin Aisle
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, h - 35, w, 35);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(w / 2 - 20, h - 18, 40, 2);

        // Flight Attendant (Emily) standing at doorway
        const emilyX = w / 2 + 35;
        const emilyY = h - 25;
        const breathe = Math.sin(t * 0.05) * 1.5;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(emilyX, emilyY + 4, 11, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Uniform Dress (Navy Blue & Sky Blue Scarf)
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(emilyX - 6, emilyY - 24 + breathe, 12, 22);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(emilyX - 3, emilyY - 22 + breathe, 6, 4); // Scarf
        // Head & Hair Bun
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(emilyX, emilyY - 32 + breathe, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(emilyX - 5, emilyY - 32 + breathe, 10, 9);
        // Smile & Welcoming Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(emilyX - 3, emilyY - 29 + breathe, 2, 1.5);
        ctx.fillRect(emilyX + 1, emilyY - 29 + breathe, 2, 1.5);
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(emilyX - 2, emilyY - 25 + breathe, 4, 1.5);

        // Welcoming hand gesture pointing down aisle
        const wave = Math.sin(t * 0.08) * 2;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(emilyX + 6, emilyY - 22 + breathe, 8, 4);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(emilyX + 14, emilyY - 24 + breathe + wave, 4, 4);

        // Protagonist stepping through doorway
        const px = w / 2 - 40;
        const py = h - 25;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(px, py + 4, 11, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(px - 5, py - 24, 10, 16);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px - 4, py - 8, 3.5, 9);
        ctx.fillRect(px + 1, py - 8, 3.5, 9);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(px - 4, py - 32, 8, 8);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(px - 5, py - 35, 10, 4);
        ctx.fillRect(px + 2, py - 33, 4, 2);

        // Rolling Suitcase
        ctx.fillStyle = '#b45309';
        ctx.fillRect(px - 16, py - 12, 9, 13);
      } else {
        // === PHASE 3: SEATED IN SEAT 14A/14C LOOKING OUT WINDOW ===
        // Deep Night Sky & Shimmering City / Wing Outside Oval Window
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, w, h);

        // Aircraft Cabin Wall & Seat Frame
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, w, h);

        // Oval Airplane Window (Center Right)
        const winX = w / 2 + 45;
        const winY = h / 2 - 10;
        const winW = 55;
        const winH = 75;

        // Window Inner Sky View
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(winX, winY, winW / 2, winH / 2, 0, 0, Math.PI * 2);
        ctx.clip();

        // Sky Sunset & Stars
        const winGrad = ctx.createLinearGradient(winX, winY - winH / 2, winX, winY + winH / 2);
        winGrad.addColorStop(0, '#090d16');
        winGrad.addColorStop(0.5, '#1e1b4b');
        winGrad.addColorStop(0.8, '#831843');
        winGrad.addColorStop(1, '#ea580c');
        ctx.fillStyle = winGrad;
        ctx.fillRect(winX - winW, winY - winH, winW * 2, winH * 2);

        // Stars outside window
        ctx.fillStyle = '#ffffff';
        [[winX - 15, winY - 25], [winX + 10, winY - 30], [winX + 5, winY - 15], [winX - 10, winY - 5]].forEach(([sx, sy], i) => {
          if (Math.sin(t * 0.06 + i) > 0) ctx.fillRect(sx, sy, 1.5, 1.5);
        });

        // Aircraft Wing Tip & Navigation Strobe Light outside window
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(winX - 30, winY + 20);
        ctx.lineTo(winX + 40, winY - 5);
        ctx.lineTo(winX + 45, winY - 3);
        ctx.lineTo(winX - 25, winY + 30);
        ctx.closePath();
        ctx.fill();

        // Red / Green Wingtip Strobe Flash
        const strobe = Math.floor(t / 20) % 2 === 0;
        ctx.fillStyle = strobe ? '#10b981' : '#064e3b';
        ctx.fillRect(winX + 38, winY - 7, 3, 3);

        ctx.restore();

        // Window Frame & Bezel
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(winX, winY, winW / 2, winH / 2, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Ergonomic Airplane High-Back Seat (Navy Leather)
        const seatX = w / 2 - 50;
        const seatY = h / 2 - 5;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(seatX - 28, seatY - 45, 48, 80);
        // Headrest (Sky Blue Pillow)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(seatX - 22, seatY - 40, 36, 16);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(seatX - 18, seatY - 36, 28, 8);

        // Protagonist Relaxing in Seat
        const pSeatY = seatY - 20 + Math.sin(t * 0.03) * 0.8;
        // Head with headphones
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(seatX - 10, pSeatY, 14, 12);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(seatX - 12, pSeatY - 5, 18, 5);
        // Travel Headphones
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(seatX - 14, pSeatY + 1, 3, 8);
        ctx.fillRect(seatX + 4, pSeatY + 1, 3, 8);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(seatX - 3, pSeatY + 1, 9, Math.PI, 0);
        ctx.stroke();

        // Satisfied calm closed smiling eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(seatX - 6, pSeatY + 4, 3, 1.5);
        ctx.fillRect(seatX, pSeatY + 4, 3, 1.5);
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(seatX - 4, pSeatY + 8, 4, 1.5);

        // Travel Jacket Body & Fastened Seatbelt
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(seatX - 14, pSeatY + 12, 22, 28);
        // Chrome Seatbelt Buckle
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(seatX - 6, pSeatY + 28, 8, 4);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(seatX - 4, pSeatY + 29, 4, 2);

        // Window Shade Frame
        ctx.fillStyle = '#475569';
        ctx.fillRect(winX - 16, winY - winH / 2 - 6, 32, 4);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  const handleNextPhase = () => {
    sound.playClick();
    if (phase === 'jetbridge') {
      sound.playAirportChime();
      setPhase('cabin_door');
    } else if (phase === 'cabin_door') {
      sound.playItemGet();
      setPhase('seated');
    } else {
      sound.playTitleChime();
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 font-mono select-none overflow-hidden text-slate-100">
      {/* 1. Interactive Native Pixel Art Canvas Screen */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          className="w-full h-full object-cover"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* 2. Top Airline Boarding Status Banner */}
        <div className="absolute top-4 inset-x-0 flex justify-center z-30 pointer-events-none px-4">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-emerald-500/50 shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <Plane className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-300 font-mono tracking-wider">
              {flightNumber} · TOKYO ➔ SAN FRANCISCO · BOARDING
            </span>
          </div>
        </div>

        {/* 3. Bottom Narrative Card & Player-Paced Continue Button */}
        <div className="absolute bottom-6 inset-x-4 max-w-xl mx-auto z-30">
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0b101b]/95 border-2 border-amber-400/80 shadow-[0_15px_50px_rgba(0,0,0,0.9)] backdrop-blur-md space-y-3">
            {phase === 'jetbridge' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold uppercase">
                  <span>STEP 1 / 3 · WALKING THE JETBRIDGE</span>
                  <span className="text-emerald-400">BOARDING PASS VERIFIED ✓</span>
                </div>
                <p className="text-sm text-slate-200 font-sans leading-relaxed">
                  You walk through the glass jetbridge corridor. Outside, the wide-body aircraft waits on the twilight tarmac. You've officially made your connection!
                </p>
              </div>
            )}

            {phase === 'cabin_door' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-sky-400 font-bold uppercase">
                  <span>STEP 2 / 3 · WELCOME ABOARD</span>
                  <span className="text-amber-300">{seatName}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 font-sans text-xs sm:text-sm text-slate-300">
                  <p className="text-white font-semibold">
                    Flight Attendant: <span className="text-sky-300 italic">"Welcome aboard! Your {seatName} is down the left aisle. Have a wonderful flight to San Francisco!"</span>
                  </p>
                  <p className="text-slate-400">
                    You: <span className="text-amber-300 italic">"Thank you! So happy to be on my way."</span>
                  </p>
                </div>
              </div>
            )}

            {phase === 'seated' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold uppercase">
                  <span>STEP 3 / 3 · SETTLED IN YOUR SEAT</span>
                  <span className="text-amber-300">{seatName}</span>
                </div>
                <p className="text-sm text-slate-200 font-sans leading-relaxed">
                  Luggage safely stowed in the overhead bin. You buckle your seatbelt, put on your travel headphones, and look out the window. The jet engines spool up for the 10-hour flight across the Pacific!
                </p>
              </div>
            )}

            {/* Next / Continue Button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-sans">
                {phase === 'seated' ? 'Ready for mission recap' : 'Read at your own pace'}
              </span>

              <button
                onClick={handleNextPhase}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 shadow-[0_6px_20px_rgba(245,158,11,0.35)]"
              >
                <span>{phase === 'seated' ? 'COMPLETE CHAPTER 01' : 'CONTINUE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
