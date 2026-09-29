import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../services/soundService';
import { Plane, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
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
  const seatName = isAisleSeat ? 'Seat 14C (Aisle · Extra Legroom)' : 'Seat 14A (Window · Pacific View)';
  const flightNumber = selectedFlight || (inventory.some((i) => i.id === 'flight_rebook_slip_31') ? 'UA937' : 'UA921');

  useEffect(() => {
    sound.playAirportChime();
  }, []);

  // 1. High-Fidelity Indie Pixel Art Canvas Renderer
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
        // ====================================================================
        // PHASE 1: TELESCOPIC JETBRIDGE & TWILIGHT TARMAC PANORAMA
        // ====================================================================
        // 1. Twilight Sky Gradient with pixel gradient bands
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#060913');
        skyGrad.addColorStop(0.35, '#181236');
        skyGrad.addColorStop(0.65, '#4c0519');
        skyGrad.addColorStop(0.85, '#9a3412');
        skyGrad.addColorStop(1, '#ea580c');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Distant twinkling pixel stars
        ctx.fillStyle = '#ffffff';
        const starPositions = [
          [25, 12], [65, 18], [110, 8], [165, 22], [220, 14], [285, 9],
          [45, 30], [140, 28], [245, 26], [305, 19]
        ];
        starPositions.forEach(([sx, sy], idx) => {
          if ((Math.floor(t / 8) + idx) % 3 !== 0) {
            ctx.fillRect(sx, sy, 1, 1);
          }
        });

        // Distant Air Traffic Control Tower in background silhouette
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(290, h - 85, 12, 35);
        ctx.fillRect(286, h - 94, 20, 10);
        // Tower cab window & rotating red beacon
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(288, h - 92, 16, 4);
        const beaconFlash = Math.floor(t / 18) % 2 === 0;
        ctx.fillStyle = beaconFlash ? '#ef4444' : '#7f1d1d';
        ctx.fillRect(295, h - 97, 3, 3);

        // Tarmac Ground & Taxiway Lights
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, h - 58, w, 58);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, h - 56, w, 56);

        // Taxiway guide lines & runway centerlights
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, h - 38, w, 2);
        // Green taxiway edge lights
        for (let lx = 10; lx < w; lx += 45) {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(lx, h - 42, 2, 2);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
          ctx.fillRect(lx - 2, h - 44, 6, 6);
        }

        // Boeing 787 Dreamliner Widebody Docked Outside
        // Fuselage Main Body (Pixel shaded white & navy stripe)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(45, h - 88, 220, 36);
        // Nose Cone Contour
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(265, h - 86, 22, 30);
        ctx.fillRect(287, h - 82, 12, 20);
        // Cockpit Windows (Aerodynamic swept glass)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(272, h - 84, 8, 6);
        ctx.fillRect(281, h - 82, 7, 5);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(274, h - 83, 3, 2);

        // United-style Globe Blue Livery Band
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(45, h - 72, 220, 6);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(45, h - 66, 220, 2);

        // Passenger Windows (Glowing warm cabin lights)
        for (let wx = 60; wx < 260; wx += 9) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(wx, h - 81, 4, 6);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(wx + 1, h - 80, 2, 4);
        }

        // Engine Cowling & Pylon with spinning fan intake
        ctx.fillStyle = '#334155';
        ctx.fillRect(115, h - 60, 38, 20);
        ctx.fillStyle = '#475569';
        ctx.fillRect(110, h - 58, 8, 16);
        // Fan blade spinner spiral
        ctx.fillStyle = '#94a3b8';
        const spin = Math.floor(t / 4) % 4;
        ctx.fillRect(112, h - 52 + (spin % 2) * 2, 3, 4);

        // Red Anti-Collision Beacon Light on Top of Fuselage
        const fuseBeacon = Math.floor(t / 22) % 2 === 0;
        ctx.fillStyle = fuseBeacon ? '#ef4444' : '#7f1d1d';
        ctx.fillRect(125, h - 92, 4, 4);

        // Foreground: Telescopic Jetbridge Corridor
        // Jetbridge Ceiling & Structural Trusses
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, w, 26);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 24, w, 2);

        // Glass Jetbridge Window Mullions & Steel Pillars
        for (let jx = 0; jx < w + 60; jx += 55) {
          // Steel Vertical Support Beam with Rivets
          ctx.fillStyle = '#334155';
          ctx.fillRect(jx, 26, 6, h - 56);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(jx + 1, 26, 2, h - 56);
          // Rivet dots
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(jx + 2, 32, 2, 2);
          ctx.fillRect(jx + 2, h - 38, 2, 2);

          // Glass subtle tint & diagonal light reflections
          ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
          ctx.fillRect(jx - 49, 26, 49, h - 56);
          // Glass reflection highlights
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.beginPath();
          ctx.moveTo(jx - 40, 26);
          ctx.lineTo(jx - 25, 26);
          ctx.lineTo(jx - 45, h - 30);
          ctx.lineTo(jx - 49, h - 30);
          ctx.closePath();
          ctx.fill();
        }

        // Jetbridge Floor: Navy Carpet & Running Floor Guidance LED Strip
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, h - 30, w, 30);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, h - 28, w, 28);
        // Yellow safety edge border
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, h - 28, w, 2);
        // Running Cyan Floor LED Strip
        const ledOffset = (t * 0.8) % 18;
        for (let lx = -20; lx < w; lx += 18) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(lx + ledOffset, h - 14, 8, 2);
        }

        // Telescopic Accordion Bellows near the door (Right side)
        for (let bx = w - 40; bx < w; bx += 6) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(bx, 20, 4, h - 48);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(bx + 4, 20, 2, h - 48);
        }

        // Protagonist Smooth Pixel-Walk Cycle across Jetbridge
        const walkProg = (t * 0.012) % 1;
        const playerX = 35 + walkProg * (w - 85);
        const playerY = h - 22;
        const stepFrame = Math.floor(t / 8) % 4;
        const legOffsets = [
          [-3, 3],  // frame 0: right leg forward, left leg back
          [0, 0],   // frame 1: passing
          [3, -3],  // frame 2: left leg forward, right leg back
          [0, 0],   // frame 3: passing
        ][stepFrame];

        // Player Drop Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(playerX, playerY + 3, 11, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rolling Suitcase with Wheels & Luggage Tag
        ctx.fillStyle = '#78350f';
        ctx.fillRect(playerX - 16, playerY - 11, 10, 13);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(playerX - 15, playerY - 10, 8, 11);
        // Telescopic Handle & Luggage Tag
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(playerX - 11, playerY - 18, 2, 7);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(playerX - 13, playerY - 19, 5, 2); // handle grip
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(playerX - 8, playerY - 8, 3, 4); // yellow airport luggage tag
        // Suitcase Wheels
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(playerX - 16, playerY + 1, 3, 3);
        ctx.fillRect(playerX - 9, playerY + 1, 3, 3);

        // Player Legs & Shoes
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(playerX - 3 + legOffsets[0], playerY - 6, 3, 8);
        ctx.fillRect(playerX + 1 + legOffsets[1], playerY - 6, 3, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(playerX - 4 + legOffsets[0], playerY + 1, 4, 2);
        ctx.fillRect(playerX + legOffsets[1], playerY + 1, 4, 2);

        // Player Torso & Navy Windbreaker
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(playerX - 5, playerY - 19, 10, 13);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(playerX - 5, playerY - 19, 3, 13);
        // Backpack
        ctx.fillStyle = '#b45309';
        ctx.fillRect(playerX - 9, playerY - 17, 4, 10);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(playerX - 8, playerY - 13, 2, 3);

        // Player Head, Hair & Travel Cap
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(playerX - 4, playerY - 27, 8, 8);
        ctx.fillStyle = '#374151';
        ctx.fillRect(playerX - 5, playerY - 28, 4, 6); // hair side
        // Cap & Visor
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(playerX - 5, playerY - 30, 10, 4);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(playerX + 2, playerY - 28, 5, 2); // Cap bill pointing forward
        // Confident, relaxed smile
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(playerX + 2, playerY - 24, 2, 2); // eye
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(playerX + 1, playerY - 21, 3, 1); // smile

      } else if (phase === 'cabin_door') {
        // ====================================================================
        // PHASE 2: AIRCRAFT DOORWAY & FLIGHT ATTENDANT WELCOME
        // ====================================================================
        // Cabin Interior Warm Background & Mood Lighting
        ctx.fillStyle = '#0b1329';
        ctx.fillRect(0, 0, w, h);

        // Curved Airplane Door Cutout (Left side aluminum frame)
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(0, 0, 45, h);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(40, 0, 6, h);
        // Aluminum Door Threshold Plate
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(40, h - 36, 25, 6);
        ctx.fillStyle = '#64748b';
        for (let rx = 42; rx < 62; rx += 4) {
          ctx.fillRect(rx, h - 34, 2, 2);
        }

        // Aircraft Interior Ceiling & Overhead Bin Track
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(45, 0, w - 45, 36);
        ctx.fillStyle = '#334155';
        ctx.fillRect(45, 34, w - 45, 3);
        // Ambient Sky-Blue Cabin Mood Light Strip
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(45, 32, w - 45, 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fillRect(45, 34, w - 45, 12);

        // Overhead Storage Compartments with latches
        for (let bx = 65; bx < w; bx += 50) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(bx, 10, 44, 20);
          ctx.fillStyle = '#334155';
          ctx.fillRect(bx + 1, 11, 42, 18);
          // Chrome release latch
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(bx + 18, 23, 8, 3);
        }

        // Cabin Aisle Perspective & Carpet
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(45, h - 32, w - 45, 32);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(45, h - 30, w - 45, 2);

        // High-Back Plush Airline Seats visible down aisle
        for (let sx = 180; sx < w; sx += 38) {
          // Seat Back & Headrest
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(sx, h - 85, 28, 55);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(sx + 2, h - 83, 24, 50);
          // Leather headrest with United blue pillow
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(sx + 4, h - 80, 20, 14);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(sx + 6, h - 77, 16, 8);
          // Seat Row Number Label
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(sx + 10, h - 62, 8, 4);
        }

        // Flight Attendant (Emily) standing at galley doorway
        const emilyX = 145;
        const emilyY = h - 26;
        const breathe = Math.sin(t * 0.06) * 1.5;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.ellipse(emilyX, emilyY + 4, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Uniform: Navy Blue Fitted Dress with Sky Blue Silk Scarf
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(emilyX - 7, emilyY - 26 + breathe, 14, 25);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(emilyX - 6, emilyY - 25 + breathe, 12, 23);
        // Silk Neck Scarf
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(emilyX - 4, emilyY - 24 + breathe, 8, 4);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(emilyX - 2, emilyY - 20 + breathe, 4, 5);
        // Golden Wings Crew Badge
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(emilyX - 4, emilyY - 17 + breathe, 3, 2);

        // Head, Hair Bun & Friendly Expression
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(emilyX, emilyY - 35 + breathe, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(emilyX - 5, emilyY - 34 + breathe, 10, 10);
        // Eyes & Welcoming Smile
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(emilyX - 3, emilyY - 31 + breathe, 2, 2);
        ctx.fillRect(emilyX + 1, emilyY - 31 + breathe, 2, 2);
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(emilyX - 2, emilyY - 27 + breathe, 4, 2);

        // Welcoming Arm pointing gently towards seat 14A/14C
        const handWave = Math.sin(t * 0.09) * 2;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(emilyX + 6, emilyY - 24 + breathe, 12, 4);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(emilyX + 18, emilyY - 26 + breathe + handWave, 4, 4);

        // Protagonist stepping through doorway (Left)
        const px = 75;
        const py = h - 26;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
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
        ctx.fillStyle = '#78350f';
        ctx.fillRect(px - 16, py - 12, 9, 13);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(px - 15, py - 11, 7, 11);

      } else {
        // ====================================================================
        // PHASE 3: SEATED IN SEAT 14A/14C LOOKING OUT OVAL WINDOW (TAKEOFF)
        // ====================================================================
        // Aircraft Cabin Wall
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, w, h);

        // Airplane Oval Window (Center-Right)
        const winX = w / 2 + 55;
        const winY = h / 2 - 8;
        const winW = 68;
        const winH = 92;

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(winX, winY, winW / 2, winH / 2, 0, 0, Math.PI * 2);
        ctx.clip();

        // 1. Outside Window: Sunset Pacific Sky Gradient
        const winGrad = ctx.createLinearGradient(winX, winY - winH / 2, winX, winY + winH / 2);
        winGrad.addColorStop(0, '#020617');
        winGrad.addColorStop(0.35, '#1e1b4b');
        winGrad.addColorStop(0.65, '#831843');
        winGrad.addColorStop(0.88, '#c2410c');
        winGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = winGrad;
        ctx.fillRect(winX - winW, winY - winH, winW * 2, winH * 2);

        // Stars drifting across window as plane accelerates
        ctx.fillStyle = '#ffffff';
        const winStars = [
          [winX - 22, winY - 32], [winX + 8, winY - 36], [winX + 24, winY - 26],
          [winX - 12, winY - 18], [winX + 16, winY - 10], [winX - 26, winY - 4]
        ];
        winStars.forEach(([sx, sy], i) => {
          if ((Math.floor(t / 6) + i) % 3 !== 0) ctx.fillRect(sx, sy, 1.5, 1.5);
        });

        // Drifting Fluffy Twilight Clouds below wing
        const cloudScroll = (t * 0.8) % (winW * 2);
        ctx.fillStyle = 'rgba(253, 186, 116, 0.25)';
        ctx.beginPath();
        ctx.arc(winX - winW + cloudScroll, winY + 28, 14, 0, Math.PI * 2);
        ctx.arc(winX - winW + cloudScroll + 16, winY + 24, 18, 0, Math.PI * 2);
        ctx.arc(winX - winW + cloudScroll + 34, winY + 29, 12, 0, Math.PI * 2);
        ctx.fill();

        // Boeing 787 Flexed Composite Wing with Winglet
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(winX - 35, winY + 30);
        ctx.lineTo(winX + 45, winY - 12);
        ctx.lineTo(winX + 50, winY - 20); // Raked wingtip curving up
        ctx.lineTo(winX + 52, winY - 18);
        ctx.lineTo(winX - 25, winY + 42);
        ctx.closePath();
        ctx.fill();

        // Wing Upper Surface Shading & Panel Lines
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(winX - 28, winY + 34);
        ctx.lineTo(winX + 42, winY - 9);
        ctx.lineTo(winX + 44, winY - 7);
        ctx.lineTo(winX - 22, winY + 42);
        ctx.closePath();
        ctx.fill();

        // Green Wingtip Navigation Strobe Light (Flashes rhythmically)
        const strobe = Math.floor(t / 16) % 2 === 0;
        ctx.fillStyle = strobe ? '#10b981' : '#064e3b';
        ctx.fillRect(winX + 49, winY - 22, 3, 3);
        if (strobe) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
          ctx.beginPath();
          ctx.arc(winX + 50, winY - 21, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Jet Engine Heat Shimmer Distortion Plume
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(winX - 20, winY + 18, 25, 4);

        ctx.restore();

        // Oval Airplane Window Multi-Layered Bezel Frame
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.ellipse(winX, winY, winW / 2 + 2, winH / 2 + 2, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(winX, winY, winW / 2, winH / 2, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Window Glass Highlight Curved Glare
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(winX - 10, winY - 14, 22, Math.PI * 0.8, Math.PI * 1.4);
        ctx.stroke();

        // Window Pull-Down Shade Top Track
        ctx.fillStyle = '#475569';
        ctx.fillRect(winX - 22, winY - winH / 2 - 8, 44, 5);

        // Seat 14A / 14C Ergonomic High-Back Recliner (Navy Blue Leather)
        const seatX = w / 2 - 55;
        const seatY = h / 2 - 2;

        // Seat Shell Frame
        ctx.fillStyle = '#090d16';
        ctx.fillRect(seatX - 32, seatY - 50, 52, 90);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(seatX - 30, seatY - 48, 48, 86);

        // Headrest Cushion with United Blue Pillow
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(seatX - 24, seatY - 44, 38, 18);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(seatX - 20, seatY - 40, 30, 10);

        // Protagonist Relaxing in Seat (Subtle gentle breathing vibration)
        const pSeatY = seatY - 22 + Math.sin(t * 0.04) * 0.8;

        // Head, Hair & Noise-Cancelling Headphones
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(seatX - 12, pSeatY, 16, 14);
        ctx.fillStyle = '#374151';
        ctx.fillRect(seatX - 14, pSeatY - 4, 18, 6);

        // Over-Ear Premium Travel Headphones
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(seatX - 16, pSeatY + 2, 4, 10);
        ctx.fillRect(seatX + 3, pSeatY + 2, 4, 10);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(seatX - 5, pSeatY + 1, 10, Math.PI, 0);
        ctx.stroke();

        // Peaceful Smiling Eyes & Content Expression
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(seatX - 8, pSeatY + 5, 3, 2);
        ctx.fillRect(seatX - 1, pSeatY + 5, 3, 2);
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(seatX - 6, pSeatY + 10, 5, 2);

        // Travel Jacket Body & Fastened Seatbelt
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(seatX - 18, pSeatY + 14, 26, 32);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(seatX - 18, pSeatY + 14, 6, 32);

        // Fastened Chrome Seatbelt Buckle
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(seatX - 18, pSeatY + 30, 26, 4);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(seatX - 8, pSeatY + 29, 10, 6);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(seatX - 6, pSeatY + 30, 6, 4);

        // In-Flight Entertainment Screen Bezel on Left Edge
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, h / 2 - 40, 22, 55);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, h / 2 - 36, 18, 47);
        // Map Flight Line on IFE Screen
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(2, h / 2 - 15, 14, 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(8, h / 2 - 16, 3, 3); // plane icon on map
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
