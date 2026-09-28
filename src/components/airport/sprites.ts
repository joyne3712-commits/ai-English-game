// Pixel Art Sprite & Environmental Renderer for AirportScene
import { TILE_SIZE, TileType, PALETTE, MAP_COLS, MAP_ROWS } from './tileset';
import { calculateTimeState, TimeState } from './timeCycle';

export interface PlayerSpriteState {
  x: number;
  y: number;
  facing: 0 | 1 | 2 | 3; // 0: Down, 1: Up, 2: Left, 3: Right
  isMoving: boolean;
  walkFrame: number;
  alertBubble?: string | null;
  hasBoardingPassVerified?: boolean;
  isBoardingCelebrating?: boolean;
  isReceivingPass?: boolean;
  speechBubble?: string | null;
}

export interface GateAgentAlexState {
  x: number;
  y: number;
  facing?: 0 | 1 | 2 | 3;
  isMoving?: boolean;
  walkFrame?: number;
  isInteracting?: boolean;
  questMarker?: '!' | '?' | null;
  hasBoardingPassVerified?: boolean;
  isBoardingCelebrating?: boolean;
  isHandingPass?: boolean;
  ticketProgress?: number; // 0 to 1 during handoff gliding
  speechBubble?: string | null;
}

// Draw entire static tile layer with frustum culling and time-of-day color tinting
export function renderTiles(
  ctx: CanvasRenderingContext2D,
  tiles: TileType[][],
  cameraX: number,
  cameraY: number,
  viewportW: number,
  viewportH: number,
  time: number,
  inGameMinutes: number = 1055 // Default 17:35 Sunset
) {
  const timeState = calculateTimeState(inGameMinutes);
  const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE));
  const endCol = Math.min(MAP_COLS - 1, Math.ceil((cameraX + viewportW) / TILE_SIZE));
  const startRow = Math.max(0, Math.floor(cameraY / TILE_SIZE));
  const endRow = Math.min(MAP_ROWS - 1, Math.ceil((cameraY + viewportH) / TILE_SIZE));

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const px = c * TILE_SIZE;
      const py = r * TILE_SIZE;
      const t = tiles[r][c];

      switch (t) {
        case TileType.TARMAC_EXTERIOR: {
          // Dynamic sky & runway tarmac outside window based on in-game time
          if (r === 0) {
            // Sky gradient based on time of day
            const skyGrad = ctx.createLinearGradient(px, py, px, py + TILE_SIZE);
            skyGrad.addColorStop(0, timeState.skyColors.top);
            skyGrad.addColorStop(1, timeState.skyColors.mid);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

            // Twinkling stars if deep night
            if (timeState.skyColors.isNight) {
              const starTwinkle = Math.sin(time * 0.003 + c * 5.7) > 0.15;
              if (starTwinkle) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(px + ((c * 17) % 26) + 3, py + ((c * 23) % 20) + 4, 2, 2);
              }
              if (c % 4 === 1) {
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(px + 10, py + 8, 1, 1);
              }
            }

            // Subtle animated drifting clouds
            const cloudOffset = ((time * 0.008 + c * 30) % 200) - 40;
            ctx.fillStyle = timeState.skyColors.clouds;
            ctx.beginPath();
            ctx.arc(px + cloudOffset, py + 18, 14, 0, Math.PI * 2);
            ctx.arc(px + cloudOffset + 12, py + 15, 18, 0, Math.PI * 2);
            ctx.arc(px + cloudOffset + 26, py + 19, 12, 0, Math.PI * 2);
            ctx.fill();

            // Distant mountain silhouette
            ctx.fillStyle = timeState.skyColors.isNight ? '#090d16' : '#1e1b4b';
            ctx.beginPath();
            ctx.moveTo(px, py + TILE_SIZE);
            ctx.lineTo(px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.45);
            ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE);
            ctx.fill();
          } else {
            // Tarmac concrete & runway markings with time tint
            ctx.fillStyle = timeState.skyColors.tarmacTint;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            // Yellow runway centerline
            if (r === 1 && c % 3 === 0) {
              ctx.fillStyle = PALETTE.runwayLightAmber;
              ctx.fillRect(px + 4, py + 14, 24, 3);
            }
            // Runway beacon lights (amber / green) with night glow
            if (c % 5 === 0) {
              const isNight = timeState.phase === 'night' || timeState.phase === 'twilight';
              const glow = Math.sin(time * 0.005 + c) > 0;
              ctx.fillStyle = glow ? PALETTE.runwayLightAmber : (isNight ? '#78350f' : '#451a03');
              ctx.fillRect(px + 14, py + 24, 4, 4);

              // Enhanced runway beacon bloom at night
              if (isNight && glow) {
                ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
                ctx.fillRect(px + 11, py + 21, 10, 10);
              }
            }
          }
          break;
        }

        case TileType.WINDOW_PANE: {
          // Large panoramic airport window glass
          ctx.fillStyle = timeState.skyColors.tarmacTint;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

          // Glass tint reflecting time-of-day ambient light
          ctx.fillStyle = timeState.windowGlowColor;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

          // Diagonal sun reflections across the glass
          ctx.fillStyle = PALETTE.windowReflection;
          ctx.beginPath();
          ctx.moveTo(px, py + TILE_SIZE);
          ctx.lineTo(px + 10, py + TILE_SIZE);
          ctx.lineTo(px + TILE_SIZE, py + 10);
          ctx.lineTo(px + TILE_SIZE, py);
          ctx.fill();

          // Black steel window mullions
          ctx.strokeStyle = PALETTE.windowMullion;
          ctx.lineWidth = 2;
          if (c % 4 === 0) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px, py + TILE_SIZE);
            ctx.stroke();
          }
          if (r === 2) {
            ctx.beginPath();
            ctx.moveTo(px, py + TILE_SIZE);
            ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE);
            ctx.stroke();
          }
          break;
        }

        case TileType.WALL_NORTH: {
          // Architectural interior wall below windows
          ctx.fillStyle = PALETTE.wallNorthBase;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          // Wall panel groove
          ctx.fillStyle = PALETTE.wallNorthShade;
          ctx.fillRect(px, py + 2, TILE_SIZE, 2);
          // Dark metallic baseboard / skirting
          ctx.fillStyle = '#475569';
          ctx.fillRect(px, py + TILE_SIZE - 6, TILE_SIZE, 6);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(px, py + TILE_SIZE - 2, TILE_SIZE, 2);
          break;
        }

        case TileType.WALL_SOLID: {
          // Boundary Wall
          ctx.fillStyle = '#334155';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(px, py, TILE_SIZE, 4);
          ctx.fillStyle = '#475569';
          ctx.fillRect(px, py + TILE_SIZE - 4, TILE_SIZE, 4);
          break;
        }

        case TileType.FLOOR_TERRAZZO: {
          // Polished Airport Terrazzo Tile (Warm Light)
          ctx.fillStyle = PALETTE.terrazzoLight;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          // Grout border lines
          ctx.strokeStyle = PALETTE.terrazzoBorder;
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
          // Micro marble flecks
          ctx.fillStyle = PALETTE.terrazzoSpeck1;
          ctx.fillRect(px + 8, py + 12, 2, 2);
          ctx.fillRect(px + 22, py + 24, 2, 2);
          ctx.fillStyle = PALETTE.terrazzoSpeck2;
          ctx.fillRect(px + 18, py + 6, 2, 2);
          break;
        }

        case TileType.FLOOR_TERRAZZO_DARK: {
          // Subtle darker accent terrazzo tile
          ctx.fillStyle = PALETTE.terrazzoDark;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = PALETTE.terrazzoBorder;
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
          break;
        }

        case TileType.FLOOR_GUIDE_LINE: {
          // Subtle & realistic airport wayfinding strip (refined champagne/brass inlay)
          ctx.fillStyle = PALETTE.terrazzoLight;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = PALETTE.terrazzoBorder;
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

          // Subtle centered brass/champagne wayfinding inlay strip (6px wide)
          const isVertical = c === 19;
          ctx.fillStyle = PALETTE.guideLineInlay;
          if (isVertical) {
            ctx.fillRect(px + 13, py, 6, TILE_SIZE);
            // Inset tactile studs
            ctx.fillStyle = PALETTE.guideLineDotted;
            ctx.fillRect(px + 15, py + 4, 2, 4);
            ctx.fillRect(px + 15, py + 14, 2, 4);
            ctx.fillRect(px + 15, py + 24, 2, 4);
          } else {
            ctx.fillRect(px, py + 13, TILE_SIZE, 6);
            ctx.fillStyle = PALETTE.guideLineDotted;
            ctx.fillRect(px + 4, py + 15, 4, 2);
            ctx.fillRect(px + 14, py + 15, 4, 2);
            ctx.fillRect(px + 24, py + 15, 4, 2);
          }
          break;
        }

        case TileType.FLOOR_CAFE_WOOD: {
          // Warm Parquet Hardwood Planks in Cafe
          ctx.fillStyle = PALETTE.woodPlankLight;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          // Horizontal wood planks
          ctx.fillStyle = PALETTE.woodPlankMid;
          ctx.fillRect(px, py + 10, TILE_SIZE, 1);
          ctx.fillRect(px, py + 21, TILE_SIZE, 1);
          // Staggered vertical plank joints
          ctx.fillStyle = PALETTE.woodPlankDark;
          if (r % 2 === 0) {
            ctx.fillRect(px + 16, py, 1, 10);
            ctx.fillRect(px + 8, py + 11, 1, 10);
            ctx.fillRect(px + 24, py + 22, 1, 10);
          } else {
            ctx.fillRect(px + 10, py, 1, 10);
            ctx.fillRect(px + 20, py + 11, 1, 10);
          }
          break;
        }

        case TileType.FLOOR_CARPET_NAVY: {
          // Airport Waiting Lounge Navy Carpet
          ctx.fillStyle = PALETTE.carpetNavy;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = PALETTE.carpetNavyPattern;
          ctx.fillRect(px + 6, py + 6, 4, 4);
          ctx.fillRect(px + 22, py + 22, 4, 4);
          break;
        }

        case TileType.FLOOR_ENTRANCE_MAT: {
          // Heavy-duty charcoal entrance rib-mat
          ctx.fillStyle = PALETTE.entranceMat;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = PALETTE.entranceMatRib;
          for (let i = 0; i < TILE_SIZE; i += 6) {
            ctx.fillRect(px, py + i, TILE_SIZE, 2);
          }
          break;
        }
      }
    }
  }

  // Apply Subtle Color-Tinting Effect to Floor and Walls based on in-game time:
  // - Warm golden hue for sunset with diagonal sunbeams streaming from north windows
  // - Cooler blue for deep night with cozy ambient downlights on desks and concourse
  // - Soft natural daylight for afternoon
  renderInteriorTimeTint(ctx, cameraX, cameraY, viewportW, viewportH, timeState, time);

  // Draw Parked Jet Plane outside windows (Cols 20 to 26, Rows 0 to 2)
  drawParkedAirplaneOutside(ctx, 22 * TILE_SIZE, 0.5 * TILE_SIZE, time);

  // Draw Distant Taxiing Airplane (Occasionally crosses in distance)
  drawDistantTaxiingAircraft(ctx, time);

  // Draw Apron Baggage Tug Vehicle driving along service road
  drawApronBaggageTug(ctx, time);
}

// Apply Subtle Color-Tinting Effect to Airport Floor and Walls based on in-game time:
export function renderInteriorTimeTint(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  cameraY: number,
  viewportW: number,
  viewportH: number,
  timeState: TimeState,
  time: number
) {
  const interiorTopY = 4 * TILE_SIZE; // Starts right at North Wall (row 4)
  const interiorBottomY = MAP_ROWS * TILE_SIZE; // Row 24
  const interiorLeftX = 0;
  const interiorRightX = MAP_COLS * TILE_SIZE;

  // Calculate visible intersection with interior floor & walls
  const clipX = Math.max(cameraX, interiorLeftX);
  const clipY = Math.max(cameraY, interiorTopY);
  const clipW = Math.min(cameraX + viewportW, interiorRightX) - clipX;
  const clipH = Math.min(cameraY + viewportH, interiorBottomY) - clipY;

  if (clipW <= 0 || clipH <= 0) return;

  ctx.save();

  // 1. Primary Floor & Wall Color-Tint:
  // - Warm golden hue for sunset (e.g. rgba(245, 158, 11, 0.16))
  // - Cooler blue for deep night (e.g. rgba(29, 78, 216, 0.16))
  // - Soft natural daylight for afternoon
  ctx.fillStyle = timeState.floorWallTint;
  ctx.fillRect(clipX, clipY, clipW, clipH);

  // 2. Sunset Feature: Warm golden sunlight shafts spilling from panoramic windows onto north wall and floor
  if (timeState.sunbeamAlpha > 0.01) {
    ctx.save();
    const rayCount = 8;
    for (let i = 0; i < rayCount; i++) {
      const originX = (4 + i * 4) * TILE_SIZE;
      const rayGrad = ctx.createLinearGradient(
        originX,
        interiorTopY,
        originX + 80,
        interiorTopY + 320
      );
      rayGrad.addColorStop(0, `rgba(251, 191, 36, ${(timeState.sunbeamAlpha * 0.75).toFixed(3)})`);
      rayGrad.addColorStop(0.35, `rgba(245, 158, 11, ${(timeState.sunbeamAlpha * 0.45).toFixed(3)})`);
      rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(originX, interiorTopY);
      ctx.lineTo(originX + 36, interiorTopY);
      ctx.lineTo(originX + 130, interiorTopY + 320);
      ctx.lineTo(originX + 74, interiorTopY + 320);
      ctx.closePath();
      ctx.fill();
    }

    // Warm golden highlight on the north architectural wall (row 4)
    const wallGrad = ctx.createLinearGradient(0, 4 * TILE_SIZE, 0, 5 * TILE_SIZE);
    wallGrad.addColorStop(0, `rgba(251, 191, 36, ${(timeState.sunbeamAlpha * 0.45).toFixed(3)})`);
    wallGrad.addColorStop(1, 'rgba(245, 158, 11, 0.05)');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(interiorLeftX, 4 * TILE_SIZE, interiorRightX, TILE_SIZE);

    ctx.restore();
  }

  // 3. Deep Night Feature: Cozy terminal downlights and spotlight pools on the floor!
  // Creates authentic night contrast: cooler blue floor with warm glowing pools around active stations
  if (timeState.nightLightAlpha > 0.05) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const spotlights = [
      // Sarah's Customer Service Counter
      { x: 19.5 * TILE_SIZE, y: 9.2 * TILE_SIZE, r: 85, color: 'rgba(254, 243, 199, ' },
      // Mike's Skyline Cafe Counter
      { x: 5 * TILE_SIZE, y: 8.5 * TILE_SIZE, r: 80, color: 'rgba(254, 243, 199, ' },
      // Main Departure Flight Board
      { x: 14 * TILE_SIZE, y: 4.8 * TILE_SIZE, r: 105, color: 'rgba(251, 191, 36, ' },
      // Baggage Carousel 03
      { x: 6.5 * TILE_SIZE, y: 19.5 * TILE_SIZE, r: 90, color: 'rgba(224, 242, 254, ' },
      // Lounge Seating Waiting Rows
      { x: 28 * TILE_SIZE, y: 13.5 * TILE_SIZE, r: 95, color: 'rgba(254, 243, 199, ' },
      // Self Check-In Kiosks
      { x: 12 * TILE_SIZE, y: 6.8 * TILE_SIZE, r: 65, color: 'rgba(224, 242, 254, ' },
      // Entrance Vestibule
      { x: 19.5 * TILE_SIZE, y: 22 * TILE_SIZE, r: 75, color: 'rgba(254, 243, 199, ' },
    ];

    for (const spot of spotlights) {
      const intensity = timeState.nightLightAlpha;
      const grad = ctx.createRadialGradient(spot.x, spot.y, 8, spot.x, spot.y, spot.r);
      grad.addColorStop(0, `${spot.color}${(0.35 * intensity).toFixed(3)})`);
      grad.addColorStop(0.6, `${spot.color}${(0.15 * intensity).toFixed(3)})`);
      grad.addColorStop(1, `${spot.color}0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  ctx.restore();
}

// Pixel art airplane on the exterior tarmac
function drawParkedAirplaneOutside(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  ctx.save();
  // Fuselage
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x, y + 20, 110, 24);
  // Nose cone
  ctx.beginPath();
  ctx.moveTo(x + 110, y + 20);
  ctx.lineTo(x + 130, y + 32);
  ctx.lineTo(x + 110, y + 44);
  ctx.closePath();
  ctx.fill();

  // Blue airline livery stripe
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x + 15, y + 30, 95, 4);

  // Cabin Windows
  ctx.fillStyle = '#0f172a';
  for (let i = 25; i < 100; i += 8) {
    ctx.fillRect(x + i, y + 24, 4, 4);
  }

  // Tail fin
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(x, y + 20);
  ctx.lineTo(x - 24, y - 10);
  ctx.lineTo(x - 8, y - 10);
  ctx.lineTo(x + 20, y + 20);
  ctx.closePath();
  ctx.fill();

  // Blinking red beacon light on tail
  const blink = Math.floor(time / 600) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x - 16, y - 12, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Jet Engine & Wing
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(x + 40, y + 36, 40, 6);
  ctx.fillStyle = '#475569';
  ctx.fillRect(x + 50, y + 42, 22, 10);

  ctx.restore();
}

// Distant taxiing aircraft moving across outer runway
function drawDistantTaxiingAircraft(ctx: CanvasRenderingContext2D, time: number) {
  // Crosses from left to right every ~18s
  const cyclePeriod = 18000;
  const progress = (time % cyclePeriod) / cyclePeriod;
  const startX = 2 * TILE_SIZE;
  const endX = 36 * TILE_SIZE;
  const x = startX + progress * (endX - startX);
  const y = 0.3 * TILE_SIZE;

  ctx.save();
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(x, y + 10, 40, 8);
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x - 8, y + 2);
  ctx.lineTo(x - 3, y + 2);
  ctx.lineTo(x + 6, y + 10);
  ctx.fill();
  // Nose
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(x + 40, y + 10);
  ctx.lineTo(x + 46, y + 14);
  ctx.lineTo(x + 40, y + 18);
  ctx.fill();
  // Wingtip light
  const blink = Math.floor(time / 400) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#34d399';
    ctx.fillRect(x + 20, y + 16, 2, 2);
  }
  ctx.restore();
}

// Apron service baggage tug vehicle
function drawApronBaggageTug(ctx: CanvasRenderingContext2D, time: number) {
  const cycle = (time * 0.035) % (30 * TILE_SIZE);
  const x = 32 * TILE_SIZE - cycle;
  const y = 1.3 * TILE_SIZE;

  if (x > 2 * TILE_SIZE && x < 35 * TILE_SIZE) {
    ctx.save();
    // Yellow Tug
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x, y + 8, 14, 10);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 2, y + 2, 8, 6); // Windshield
    ctx.fillRect(x + 1, y + 16, 4, 3); // Wheel 1
    ctx.fillRect(x + 9, y + 16, 4, 3); // Wheel 2

    // Trailer with cargo
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 18, y + 10, 16, 8);
    ctx.fillStyle = '#ef4444'; // Red baggage
    ctx.fillRect(x + 20, y + 6, 6, 5);
    ctx.fillStyle = '#0284c7'; // Blue baggage
    ctx.fillRect(x + 27, y + 5, 5, 6);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 20, y + 16, 3, 3);
    ctx.fillRect(x + 29, y + 16, 3, 3);
    ctx.restore();
  }
}

// Draw the Large Departure Board on the North Wall (Cols 11-17, Rows 2-3)
export function renderDepartureBoard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  formattedTime: string = '14:25',
  showQuestionMarker: boolean = true
) {
  const w = 6 * TILE_SIZE; // 192 px
  const h = 2 * TILE_SIZE + 10; // 74 px

  ctx.save();

  // Subtle in-world objective marker '?' above departure board
  if (showQuestionMarker) {
    const qBounce = Math.sin(time * 0.005) * 3;
    const qY = y - 10 + qBounce;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(x + w / 2, qY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('?', x + w / 2 - 2.5, qY + 3);
  }

  // Bezel / frame
  ctx.fillStyle = '#020617';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);

  // Screen background (dark CRT grid)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 4, y + 4, w - 8, h - 8);

  // Amber Header
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('TERMINAL 2 · DEPARTURES', x + 10, y + 15);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '8px monospace';
  ctx.fillText(`${formattedTime} PST`, x + w - 52, y + 15);

  ctx.strokeStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 19);
  ctx.lineTo(x + w - 6, y + 19);
  ctx.stroke();

  // Flight Row 1: UA889 CANCELLED (Flashing red alert!)
  const cancelFlash = Math.floor(time / 450) % 2 === 0;
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '8px monospace';
  ctx.fillText('UA 889', x + 8, y + 31);
  ctx.fillText('NEW YORK', x + 44, y + 31);
  ctx.fillText('14:30', x + 98, y + 31);

  ctx.fillStyle = cancelFlash ? '#ef4444' : '#b91c1c';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('CANCELLED', x + 128, y + 31);

  // Flight Row 2: SQ 012 ON TIME
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '8px monospace';
  ctx.fillText('SQ 012', x + 8, y + 44);
  ctx.fillText('SINGAPORE', x + 44, y + 44);
  ctx.fillText('15:10', x + 98, y + 44);
  ctx.fillStyle = '#10b981';
  ctx.fillText('ON TIME', x + 128, y + 44);

  // Flight Row 3: BA 221 ON TIME
  ctx.fillStyle = '#94a3b8';
  ctx.font = '8px monospace';
  ctx.fillText('BA 221', x + 8, y + 56);
  ctx.fillText('LONDON', x + 44, y + 56);
  ctx.fillText('15:45', x + 98, y + 56);
  ctx.fillStyle = '#10b981';
  ctx.fillText('ON TIME', x + 128, y + 56);

  // Flight Row 4: DL 412 BOARDING
  ctx.fillStyle = '#94a3b8';
  ctx.font = '8px monospace';
  ctx.fillText('DL 412', x + 8, y + 67);
  ctx.fillText('SEATTLE', x + 44, y + 67);
  ctx.fillText('16:00', x + 98, y + 67);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('BOARDING', x + 128, y + 67);

  ctx.restore();
}

// Render Furniture, Desks, Counters, Conveyor, Gate
export function renderStructures(
  ctx: CanvasRenderingContext2D,
  time: number,
  hasBoardingPass: boolean,
  isGateActiveObjective: boolean = false,
  isGateChanged: boolean = false,
  hasBoardingPassVerified: boolean = false,
  isGate18Active: boolean = false
) {
  // 1. Skyline Cafe Counter (Cols 2 to 7, Row 7-8)
  const cafeX = 2 * TILE_SIZE;
  const cafeY = 7 * TILE_SIZE;
  const cafeW = 6 * TILE_SIZE;
  const cafeH = 2 * TILE_SIZE;

  // Counter Top
  ctx.fillStyle = '#d97706';
  ctx.fillRect(cafeX, cafeY, cafeW, 10);
  // Counter front panel
  ctx.fillStyle = '#92400e';
  ctx.fillRect(cafeX, cafeY + 10, cafeW, cafeH - 10);
  ctx.fillStyle = '#78350f';
  for (let i = 0; i < cafeW; i += 16) {
    ctx.fillRect(cafeX + i, cafeY + 10, 2, cafeH - 10);
  }

  // Espresso Machine on Counter
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(cafeX + 16, cafeY - 14, 24, 18);
  ctx.fillStyle = '#475569';
  ctx.fillRect(cafeX + 22, cafeY - 6, 12, 10);
  // Steam particles
  const steamY = ((time * 0.04) % 18);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(cafeX + 26, cafeY - 16 - steamY, 2.5, 0, Math.PI * 2);
  ctx.arc(cafeX + 30, cafeY - 20 - steamY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Coffee cups & Glass Pastry Display Case
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(cafeX + 46, cafeY - 4, 6, 6);
  ctx.fillRect(cafeX + 54, cafeY - 4, 6, 6);

  ctx.fillStyle = 'rgba(224, 242, 254, 0.4)';
  ctx.strokeStyle = '#0284c7';
  ctx.fillRect(cafeX + 75, cafeY - 12, 45, 16);
  ctx.strokeRect(cafeX + 75, cafeY - 12, 45, 16);
  // Pastries
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(cafeX + 82, cafeY - 4, 8, 5);
  ctx.fillRect(cafeX + 96, cafeY - 4, 8, 5);
  ctx.fillRect(cafeX + 108, cafeY - 4, 8, 5);

  // Wall Chalkboard Menu Board behind Cafe
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(cafeX + 10, cafeY - 50, 120, 24);
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 2;
  ctx.strokeRect(cafeX + 10, cafeY - 50, 120, 24);
  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 7px monospace';
  ctx.fillText('☕ SKYLINE BREW · MENU', cafeX + 14, cafeY - 40);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '6px monospace';
  ctx.fillText('ESPRESSO $3.50 · LATTE $4.50 · PASTRY $3.00', cafeX + 14, cafeY - 30);

  // Cafe Round Tables & Chairs (Cols 3 & 6, Row 11)
  drawCafeTable(ctx, 3 * TILE_SIZE + 10, 11 * TILE_SIZE + 10);
  drawCafeTable(ctx, 6 * TILE_SIZE + 10, 11 * TILE_SIZE + 10);

  // Vending Machine at Col 1, Row 5-6
  drawVendingMachine(ctx, 1 * TILE_SIZE + 2, 5 * TILE_SIZE, time);

  // Self Check-in Kiosks at Cols 11-13, Row 6
  drawCheckInKiosk(ctx, 11 * TILE_SIZE + 4, 6 * TILE_SIZE, time);
  drawCheckInKiosk(ctx, 12 * TILE_SIZE + 4, 6 * TILE_SIZE, time + 500);
  drawCheckInKiosk(ctx, 13 * TILE_SIZE + 4, 6 * TILE_SIZE, time + 1000);

  // 2. Information Desk (Sarah's Desk: Cols 17 to 22, Rows 9-10)
  const infoX = 17 * TILE_SIZE;
  const infoY = 9 * TILE_SIZE;
  const infoW = 6 * TILE_SIZE;
  const infoH = 2 * TILE_SIZE;

  // Blue carpet mat under desk
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(infoX - 8, infoY - 8, infoW + 16, infoH + 16);

  // Desk White Top Counter
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(infoX, infoY, infoW, 12);
  // Desk Front Curved Modern Panel
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(infoX, infoY + 12, infoW, infoH - 12);
  // Pacific Blue accent stripe
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(infoX, infoY + 24, infoW, 4);
  // Counter Sign
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('COUNTER B · PASSENGER SERVICE', infoX + 14, infoY + 42);

  // Desktop Computer Monitors on desk
  // Monitor 1 (Main agent screen)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(infoX + 35, infoY - 16, 22, 18);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(infoX + 37, infoY - 14, 18, 12);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(infoX + 39, infoY - 12, 10, 2); // Text rows on screen
  ctx.fillRect(infoX + 39, infoY - 8, 14, 2);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(infoX + 44, infoY + 2, 4, 4);

  // Monitor 2 (Customer-facing screen)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(infoX + 105, infoY - 14, 20, 16);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(infoX + 107, infoY - 12, 16, 10);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(infoX + 113, infoY + 2, 4, 4);

  // Microphone
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(infoX + 80, infoY + 2);
  ctx.lineTo(infoX + 84, infoY - 10);
  ctx.stroke();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(infoX + 84, infoY - 11, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Paperwork / Documents on desk
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(infoX + 65, infoY + 2, 10, 8);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(infoX + 66, infoY + 4, 8, 1);
  ctx.fillRect(infoX + 66, infoY + 7, 6, 1);

  // Velvet Queue Stanchions in front of counter
  drawStanchionRow(ctx, infoX + 10, infoY + infoH + 8, 4);

  // 3. Waiting Seats (Cols 26-30, Row 11 & Row 14, plus Concourse Row 18)
  drawSeatRow(ctx, 26 * TILE_SIZE, 11 * TILE_SIZE, 5);
  drawSeatRow(ctx, 26 * TILE_SIZE, 14 * TILE_SIZE, 5);
  drawSeatRow(ctx, 24 * TILE_SIZE, 18 * TILE_SIZE, 4);

  // 4. Baggage Conveyor 03 (Cols 3 to 9, Rows 18-20)
  const bagX = 3 * TILE_SIZE;
  const bagY = 18 * TILE_SIZE;
  const bagW = 7 * TILE_SIZE;
  const bagH = 3 * TILE_SIZE;

  // Carousel border & rubber belt
  ctx.fillStyle = '#64748b';
  ctx.fillRect(bagX, bagY, bagW, bagH);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(bagX + 8, bagY + 8, bagW - 16, bagH - 16);

  // Smooth continuous belt cycle: ~13s per complete rotation
  const beltCycle = (time * 0.000075) % 1;
  drawCarouselBeltGrooves(ctx, bagX, bagY, bagW, bagH, beltCycle);

  // Inner stainless steel island
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(bagX + 26, bagY + 26, bagW - 52, bagH - 52);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(bagX + 26, bagY + 26, bagW - 52, bagH - 52);

  // Stainless steel bevel highlight & luggage sorting room chute
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(bagX + 28, bagY + 28, bagW - 56, 3);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(bagX + 32, bagY + 34, 32, 16);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(bagX + 34, bagY + 36, 28, 12);
  ctx.fillStyle = '#334155';
  ctx.fillRect(bagX + 40, bagY + 36, 1, 12);
  ctx.fillRect(bagX + 48, bagY + 36, 1, 12);
  ctx.fillRect(bagX + 54, bagY + 36, 1, 12);

  // Overhead Carousel Sign with LED
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(bagX + 34, bagY - 18, 114, 16);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(bagX + 34, bagY - 18, 114, 16);
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('🧳 CAROUSEL 03 · UA 889', bagX + 39, bagY - 7);
  const ledGlow = Math.sin(time * 0.006) > 0;
  ctx.fillStyle = ledGlow ? '#10b981' : '#065f46';
  ctx.beginPath();
  ctx.arc(bagX + 140, bagY - 10, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Circulating Suitcases on Belt (Continuous smooth racetrack loops)
  drawCirculatingBags(ctx, bagX, bagY, bagW, bagH, beltCycle, time);

  // Luggage Trolleys Bay (Near Entrance: Cols 13-15, Row 21)
  drawLuggageTrolleyBay(ctx, 13 * TILE_SIZE, 21 * TILE_SIZE);

  // 5. Security Metal Detector Frame (Cols 33-35, Rows 7-8)
  const secX = 33 * TILE_SIZE;
  const secY = 7 * TILE_SIZE;
  ctx.fillStyle = '#475569';
  ctx.fillRect(secX, secY, 8, 48); // Left column
  ctx.fillRect(secX + 48, secY, 8, 48); // Right column
  ctx.fillRect(secX, secY, 56, 10); // Arch top
  // Sensor light
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(secX + 28, secY + 5, 3, 0, Math.PI * 2);
  ctx.fill();

  // 6. Gate B22 Boarding Turnstiles & Desk (Cols 34-36, Rows 13-14)
  const gateX = 34 * TILE_SIZE;
  const gateY = 13 * TILE_SIZE;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(gateX, gateY, 64, 32);
  ctx.fillStyle = isGateChanged ? '#dc2626' : hasBoardingPass ? '#059669' : '#0284c7';
  ctx.fillRect(gateX + 4, gateY + 4, 56, 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText(isGateChanged ? 'GATE MOVED ➜ 18' : 'GATE B22 · SFO', gateX + 6, gateY + 13);

  // Gate Scanner Beacon Light
  ctx.fillStyle = isGateChanged ? '#ef4444' : hasBoardingPass ? '#10b981' : '#ef4444';
  const gateGlow = Math.sin(time * 0.005) > 0;
  if (gateGlow) {
    ctx.beginPath();
    ctx.arc(gateX + 54, gateY + 22, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle in-world quest marker '★' over Gate 22 when it is the active destination
  if (!isGateChanged && (hasBoardingPass || isGateActiveObjective)) {
    const starBounce = Math.sin(time * 0.006) * 4;
    const starY = gateY - 14 + starBounce;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(gateX + 32, starY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('★', gateX + 27, starY + 4);
  }

  // 6b. Gate 18 Boarding Turnstiles & Desk (Cols 8-10, Row 5)
  drawGate18(ctx, 8.5 * TILE_SIZE, 4.5 * TILE_SIZE, time, hasBoardingPassVerified, isGate18Active);

  // 6c. Concourse Escalator & Lift (Col 14, Row 5)
  drawEscalator(ctx, 13.5 * TILE_SIZE, 5 * TILE_SIZE, time);

  // 7. Structural Round Pillars with Travel Posters
  const pillars = [
    { x: 13 * TILE_SIZE, y: 8 * TILE_SIZE, poster: 'SAN FRANCISCO' },
    { x: 26 * TILE_SIZE, y: 8 * TILE_SIZE, poster: 'TOKYO ✈️' },
    { x: 13 * TILE_SIZE, y: 16 * TILE_SIZE, poster: 'NEW YORK' },
    { x: 26 * TILE_SIZE, y: 16 * TILE_SIZE, poster: 'LONDON' },
  ];
  pillars.forEach((p) => {
    drawArchitecturalPillar(ctx, p.x, p.y, p.poster);
  });

  // 8. Recycling Sorting Trio Stations
  drawRecyclingSortingTrio(ctx, 15 * TILE_SIZE, 9 * TILE_SIZE);
  drawRecyclingSortingTrio(ctx, 24 * TILE_SIZE, 11 * TILE_SIZE);

  // 9. Potted Terminal Plants
  drawPottedPlant(ctx, 11 * TILE_SIZE, 9 * TILE_SIZE);
  drawPottedPlant(ctx, 23 * TILE_SIZE, 9 * TILE_SIZE);
  drawPottedPlant(ctx, 16 * TILE_SIZE, 21 * TILE_SIZE);
  drawPottedPlant(ctx, 22 * TILE_SIZE, 21 * TILE_SIZE);

  // 10. Overhead Directional Wayfinding Signs (Center Concourse)
  drawOverheadAirportSign(ctx, 16 * TILE_SIZE, 5 * TILE_SIZE);
}

// Cafe Table & Chairs
function drawCafeTable(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Wood Table
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Coffee cup on table
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 2, y - 2, 4, 4);

  // 2 Chairs
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x - 16, y - 4, 5, 8);
  ctx.fillRect(x + 11, y - 4, 5, 8);
}

// Vending Machine
function drawVendingMachine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  ctx.save();
  // Machine Body
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x, y, 26, 48);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, 26, 48);

  // Glowing Drink Rows
  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.fillRect(x + 3, y + 4, 20, 28);
  // Colored sodas
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(x + 5, y + 8, 3, 5);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(x + 10, y + 8, 3, 5);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(x + 15, y + 8, 3, 5);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(x + 5, y + 18, 3, 5);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(x + 10, y + 18, 3, 5);
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(x + 15, y + 18, 3, 5);

  // Dispenser slot
  ctx.fillStyle = '#020617';
  ctx.fillRect(x + 4, y + 36, 18, 8);
  ctx.restore();
}

// Self Check-in Touchscreen Kiosk
function drawCheckInKiosk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  ctx.save();
  // Kiosk Pillar
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(x, y + 14, 16, 26);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x - 2, y + 38, 20, 4);

  // Screen Head
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x - 2, y, 20, 16);
  // Touchscreen Display with Pacific UI
  const screenBlink = Math.sin(time * 0.003) > 0;
  ctx.fillStyle = screenBlink ? '#38bdf8' : '#0ea5e9';
  ctx.fillRect(x, y + 2, 16, 10);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 5px monospace';
  ctx.fillText('CHECK IN', x + 1, y + 8);
  ctx.restore();
}

// Luggage Trolley Bay
function drawLuggageTrolleyBay(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 3 nested chrome carts
  for (let i = 0; i < 3; i++) {
    const cx = x + i * 16;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx, y + 8, 16, 16);
    // Push handle
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - 2, y + 6, 3, 8);
    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx + 2, y + 24, 3, 3);
    ctx.fillRect(cx + 12, y + 24, 3, 3);
  }
}

// Recycling Sorting Trio
function drawRecyclingSortingTrio(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Blue: Paper
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x, y, 7, 14);
  // Green: Bottles
  ctx.fillStyle = '#10b981';
  ctx.fillRect(x + 9, y, 7, 14);
  // Charcoal: Waste
  ctx.fillStyle = '#334155';
  ctx.fillRect(x + 18, y, 7, 14);
}

// Velvet Queue Stanchions
function drawStanchionRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  count: number
) {
  for (let i = 0; i < count; i++) {
    const sx = x + i * 36;
    // Gold post
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(sx, y, 3, 14);
    ctx.beginPath();
    ctx.arc(sx + 1.5, y - 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(sx - 2, y + 14, 7, 2);

    // Red velvet cord connecting posts
    if (i < count - 1) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + 3, y + 4);
      ctx.quadraticCurveTo(sx + 18, y + 9, sx + 36, y + 4);
      ctx.stroke();
    }
  }
}

// Seat Row
function drawSeatRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  count: number
) {
  for (let i = 0; i < count; i++) {
    const sx = x + i * 28;
    // Steel frame
    ctx.fillStyle = '#64748b';
    ctx.fillRect(sx, y + 16, 24, 6);
    ctx.fillRect(sx + 2, y + 20, 3, 10);
    ctx.fillRect(sx + 19, y + 20, 3, 10);
    // Blue padded seat
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(sx + 2, y, 20, 16);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(sx + 2, y + 12, 20, 4);
    // Armrest
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(sx, y + 6, 2, 10);
    ctx.fillRect(sx + 22, y + 6, 2, 10);
  }
}

// =========================================================================
// BAGGAGE CAROUSEL 03 (Continuous Smooth Loop Circulation)
// =========================================================================
interface CarouselPoint {
  x: number;
  y: number;
  angle: number; // In radians: 0 is moving Right, PI/2 Down, PI Left, 3PI/2 Up
}

// Calculates exact position & tangent orientation along the rounded-rectangular conveyor track
function getCarouselPoint(
  progress: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): CarouselPoint {
  const xMin = bx + 17;
  const xMax = bx + bw - 17;
  const yMin = by + 17;
  const yMax = by + bh - 17;
  const r = 10;

  const w = Math.max(1, xMax - xMin - 2 * r);
  const h = Math.max(1, yMax - yMin - 2 * r);
  const arc = 0.5 * Math.PI * r;
  const total = 2 * w + 2 * h + 4 * arc;

  // Normalized distance along perimeter (0 to total)
  let d = (((progress % 1) + 1) % 1) * total;

  // 1. Top straight (moving Left to Right)
  if (d < w) {
    return { x: xMin + r + d, y: yMin, angle: 0 };
  }
  d -= w;

  // 2. Top-right corner arc (curving Down)
  if (d < arc) {
    const theta = -Math.PI / 2 + (d / arc) * (Math.PI / 2);
    return {
      x: xMax - r + Math.cos(theta) * r,
      y: yMin + r + Math.sin(theta) * r,
      angle: theta + Math.PI / 2,
    };
  }
  d -= arc;

  // 3. Right straight (moving Top to Bottom)
  if (d < h) {
    return { x: xMax, y: yMin + r + d, angle: Math.PI / 2 };
  }
  d -= h;

  // 4. Bottom-right corner arc (curving Left)
  if (d < arc) {
    const theta = (d / arc) * (Math.PI / 2);
    return {
      x: xMax - r + Math.cos(theta) * r,
      y: yMax - r + Math.sin(theta) * r,
      angle: theta + Math.PI / 2,
    };
  }
  d -= arc;

  // 5. Bottom straight (moving Right to Left)
  if (d < w) {
    return { x: xMax - r - d, y: yMax, angle: Math.PI };
  }
  d -= w;

  // 6. Bottom-left corner arc (curving Up)
  if (d < arc) {
    const theta = Math.PI / 2 + (d / arc) * (Math.PI / 2);
    return {
      x: xMin + r + Math.cos(theta) * r,
      y: yMax - r + Math.sin(theta) * r,
      angle: theta + Math.PI / 2,
    };
  }
  d -= arc;

  // 7. Left straight (moving Bottom to Top)
  if (d < h) {
    return { x: xMin, y: yMax - r - d, angle: (3 * Math.PI) / 2 };
  }
  d -= h;

  // 8. Top-left corner arc (curving Right)
  const theta = Math.PI + (d / arc) * (Math.PI / 2);
  return {
    x: xMin + r + Math.cos(theta) * r,
    y: yMin + r + Math.sin(theta) * r,
    angle: theta + Math.PI / 2,
  };
}

// Rubber conveyor belt segmented rollers/grooves
function drawCarouselBeltGrooves(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  cycle: number
) {
  const numGrooves = 34;
  ctx.save();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;

  for (let i = 0; i < numGrooves; i++) {
    const prog = (cycle + i / numGrooves) % 1;
    const pt = getCarouselPoint(prog, bx, by, bw, bh);
    const perpX = -Math.sin(pt.angle) * 7;
    const perpY = Math.cos(pt.angle) * 7;

    ctx.beginPath();
    ctx.moveTo(pt.x - perpX, pt.y - perpY);
    ctx.lineTo(pt.x + perpX, pt.y + perpY);
    ctx.stroke();
  }
  ctx.restore();
}

// 6 Distinct luggage items circulating smoothly in sequence
const CAROUSEL_BAGS = [
  { color: '#ef4444', strapColor: '#991b1b', width: 17, height: 11, tagColor: '#fde047', hasSticker: true, stickerColor: '#38bdf8' },
  { color: '#0284c7', strapColor: '#0369a1', width: 16, height: 10, tagColor: '#ffffff', hasSticker: false },
  { color: '#b45309', strapColor: '#78350f', width: 18, height: 12, tagColor: '#fde047', hasSticker: true, stickerColor: '#fbbf24' },
  { color: '#059669', strapColor: '#064e3b', width: 15, height: 11, tagColor: '#fef08a', hasSticker: false },
  { color: '#f59e0b', strapColor: '#b45309', width: 16, height: 10, tagColor: '#ffffff', hasSticker: true, stickerColor: '#ef4444' },
  { color: '#8b5cf6', strapColor: '#5b21b6', width: 17, height: 11, tagColor: '#fde047', hasSticker: false },
];

// Circulating Bags - rotating in continuous loops around the carousel
function drawCirculatingBags(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  cycle: number,
  time: number = 0
) {
  CAROUSEL_BAGS.forEach((bag, idx) => {
    // Each bag is evenly spaced around the belt perimeter and moves continuously in loops
    const progress = (cycle + idx / CAROUSEL_BAGS.length) % 1;
    const pt = getCarouselPoint(progress, bx, by, bw, bh);

    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(pt.angle);

    const w = bag.width;
    const h = bag.height;
    const halfW = w / 2;
    const halfH = h / 2;

    // Drop shadow on the moving rubber belt
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(-halfW + 1, -halfH + 2, w, h);

    // Suitcase hard-shell body
    ctx.fillStyle = bag.color;
    ctx.fillRect(-halfW, -halfH, w, h);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-halfW, -halfH, w, h);

    // Upper highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(-halfW + 1, -halfH + 1, w - 2, 2);

    // Dark corner bumpers
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-halfW, -halfH, 3, 3);
    ctx.fillRect(halfW - 3, -halfH, 3, 3);
    ctx.fillRect(-halfW, halfH - 3, 3, 3);
    ctx.fillRect(halfW - 3, halfH - 3, 3, 3);

    // Luggage strap / zipper line
    ctx.fillStyle = bag.strapColor;
    ctx.fillRect(-halfW, -1, w, 2);

    // Handle
    ctx.fillStyle = '#475569';
    ctx.fillRect(-3, -halfH - 2, 6, 2);

    // Back wheels
    ctx.fillStyle = '#020617';
    ctx.fillRect(-halfW - 1, -halfH + 1, 2, 3);
    ctx.fillRect(-halfW - 1, halfH - 4, 2, 3);

    // Fluttering flight destination barcode tag
    const tagWiggle = Math.sin(time * 0.008 + pt.x) * 1.2;
    ctx.fillStyle = bag.tagColor;
    ctx.fillRect(halfW - 4, halfH - 1 + tagWiggle, 5, 3);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(halfW - 3, halfH + tagWiggle, 3, 1);

    // Optional destination sticker
    if (bag.hasSticker) {
      ctx.fillStyle = bag.stickerColor || '#ffffff';
      ctx.fillRect(-1, -halfH + 2, 4, 3);
    }

    ctx.restore();
  });
}

// Architectural Round Pillar with Travel Posters
function drawArchitecturalPillar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  posterText?: string
) {
  ctx.save();
  // Pillar body
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(x + 4, y - 10, 24, 40);
  // Highlight
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 8, y - 10, 6, 40);
  // Shadow
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(x + 20, y - 10, 8, 40);
  // Steel base rim
  ctx.fillStyle = '#475569';
  ctx.fillRect(x + 2, y + 26, 28, 6);

  // Advertising Poster Lightbox on Pillar
  if (posterText) {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 6, y + 2, 20, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 5px monospace';
    ctx.fillText(posterText, x + 7, y + 12);
  }

  // Floor drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x + 16, y + 32, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Potted Plant
function drawPottedPlant(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  // Pot
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 14);
  ctx.lineTo(x + 26, y + 14);
  ctx.lineTo(x + 22, y + 30);
  ctx.lineTo(x + 10, y + 30);
  ctx.closePath();
  ctx.fill();

  // Green foliage
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(x + 16, y + 8, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(x + 13, y + 5, 7, 0, Math.PI * 2);
  ctx.fill();
}

// Overhead Wayfinding Sign
function drawOverheadAirportSign(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.save();
  const w = 180;
  const h = 20;
  // Hanging steel rods
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 20, y - 16);
  ctx.lineTo(x + 20, y);
  ctx.moveTo(x + w - 20, y - 16);
  ctx.lineTo(x + w - 20, y);
  ctx.stroke();

  // Dark sign plate
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  // Sign text
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('🧳 BAGGAGE 03 ◀   ℹ️ INFO ▲   🚪 GATES B ▶', x + 6, y + 13);

  ctx.restore();
}

// Gate 18 Boarding Door & Turnstiles (Cols 8-10, Row 5)
function drawGate18(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  hasBoardingPassVerified: boolean,
  isGate18Active: boolean
) {
  ctx.save();
  // Turnstile Frame
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x, y, 64, 32);
  // Screen banner
  ctx.fillStyle = hasBoardingPassVerified ? '#059669' : '#0284c7';
  ctx.fillRect(x + 4, y + 4, 56, 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('GATE 18 · SFO', x + 6, y + 13);

  // Status Ticker
  const flash = Math.sin(time * 0.005) > 0;
  ctx.fillStyle = hasBoardingPassVerified
    ? (flash ? '#10b981' : '#059669')
    : (flash ? '#f59e0b' : '#b45309');
  ctx.fillRect(x + 4, y + 18, 56, 9);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 6px monospace';
  ctx.fillText(hasBoardingPassVerified ? 'BOARDING NOW' : 'PASS REQUIRED', x + 6, y + 25);

  // Beacon Light
  ctx.fillStyle = hasBoardingPassVerified ? '#10b981' : '#ef4444';
  if (flash) {
    ctx.beginPath();
    ctx.arc(x + 56, y + 22, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle Green Turnstile Laser Scanner Sweep when Boarding Pass is Verified
  if (hasBoardingPassVerified) {
    const sweep = (time * 0.05) % 52;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.fillRect(x + 6 + sweep, y + 28, 4, 3);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fillRect(x + 6, y + 28, 52, 3);
  }

  // Objective Star Marker '★'
  if (isGate18Active) {
    const starBounce = Math.sin(time * 0.006) * 4;
    const starY = y - 14 + starBounce;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x + 32, starY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('★', x + 27, starY + 4);
  }
  ctx.restore();
}

// Concourse Escalator to Gates 15-20 (Col 14, Row 5)
function drawEscalator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number
) {
  ctx.save();
  // Frame
  ctx.fillStyle = '#334155';
  ctx.fillRect(x, y, 48, 36);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 4, y + 4, 40, 28);

  // Moving step treads
  const stepOffset = (time * 0.02) % 6;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  for (let sy = y + 6; sy < y + 30; sy += 6) {
    const curY = sy - stepOffset;
    if (curY >= y + 4 && curY <= y + 30) {
      ctx.beginPath();
      ctx.moveTo(x + 8, curY);
      ctx.lineTo(x + 40, curY);
      ctx.stroke();
    }
  }

  // Glass Handrails
  ctx.fillStyle = '#38bdf8';
  ctx.globalAlpha = 0.4;
  ctx.fillRect(x + 4, y + 2, 4, 32);
  ctx.fillRect(x + 40, y + 2, 4, 32);
  ctx.globalAlpha = 1.0;

  // Overhead sign
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 4, y - 10, 40, 10);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 4, y - 10, 40, 10);
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 6px monospace';
  ctx.fillText('GATES 15–20 ▲', x + 5, y - 3);

  ctx.restore();
}

// =========================================================================
// SARAH NPC SPRITE (Information Desk Customer Service Agent - ~1.4x scale)
// =========================================================================
export function renderSarah(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isInteracting: boolean,
  questMarker?: '!' | '★' | null
) {
  ctx.save();
  const breathe = Math.sin(time * 0.003) * 1.2;
  const blink = Math.floor(time / 2800) % 10 === 0;
  const isTyping = Math.floor(time / 1400) % 2 === 0;

  // Subtle In-World Quest Marker over Sarah ('!' when she has active quest objective)
  if (questMarker) {
    const markerBounce = Math.sin(time * 0.007) * 4;
    const markerY = y - 50 + breathe + markerBounce;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x, markerY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(questMarker, x - 3, markerY + 4);
  }

  // Head & Hair (~1.4x scale)
  ctx.fillStyle = '#78350f'; // Brown hair bob
  ctx.beginPath();
  ctx.arc(x, y - 18 + breathe, 9, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = '#fed7aa'; // Peach skin
  ctx.fillRect(x - 7, y - 18 + breathe, 14, 11);

  // Earpiece Headset
  ctx.fillStyle = '#334155';
  ctx.fillRect(x + 6, y - 16 + breathe, 3, 5);

  // Eyes
  if (!blink) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 4, y - 14 + breathe, 2.5, 2.5);
    ctx.fillRect(x + 2, y - 14 + breathe, 2.5, 2.5);
  } else {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 4, y - 13 + breathe, 3, 1.5);
    ctx.fillRect(x + 2, y - 13 + breathe, 3, 1.5);
  }

  // Smile
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(x - 2, y - 9 + breathe, 4, 1.5);

  // Silk Neck Scarf (Sky Blue & Gold)
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x - 5, y - 6 + breathe, 10, 4);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(x - 1.5, y - 6 + breathe, 3, 6);

  // Navy Blazer Uniform with Lapels
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(x - 8, y - 2 + breathe, 16, 18);
  ctx.fillStyle = '#172554';
  ctx.fillRect(x - 8, y - 2 + breathe, 4, 18);
  ctx.fillRect(x + 4, y - 2 + breathe, 4, 18);

  // Gold Badge & Name
  ctx.fillStyle = '#facc15';
  ctx.fillRect(x - 6, y + 1 + breathe, 4, 3);

  // Hands on Keyboard (Typing animation)
  ctx.fillStyle = '#fed7aa';
  const typeOffset = isTyping ? Math.sin(time * 0.015) * 1.5 : 0;
  ctx.fillRect(x - 6, y + 14 + breathe + typeOffset, 4, 4);
  ctx.fillRect(x + 2, y + 14 + breathe - typeOffset, 4, 4);

  // Prominent In-World Nametag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(x - 26, y - 34 + breathe, 52, 12);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 26, y - 34 + breathe, 52, 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('SARAH · AGENT', x - 23, y - 25 + breathe);

  ctx.restore();
}

// =========================================================================
// MIKE NPC SPRITE (Skyline Brew Barista - ~1.4x scale)
// =========================================================================
export function renderMike(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isInteracting: boolean
) {
  ctx.save();
  const breathe = Math.sin(time * 0.0028) * 1.2;
  const wipeHand = Math.sin(time * 0.006) * 4;

  // Head & Wavy Hair (~1.4x scale)
  ctx.fillStyle = '#451a03'; // Dark wavy hair
  ctx.beginPath();
  ctx.arc(x, y - 18 + breathe, 9, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(x - 7, y - 18 + breathe, 14, 11);

  // Eyes & Smile
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - 4, y - 14 + breathe, 2.5, 2.5);
  ctx.fillRect(x + 2, y - 14 + breathe, 2.5, 2.5);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(x - 3, y - 9 + breathe, 6, 1.5);

  // White Shirt & Dark Green Barista Apron
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x - 8, y - 6 + breathe, 16, 5);
  ctx.fillStyle = '#14532d'; // Dark green apron
  ctx.fillRect(x - 7, y - 1 + breathe, 14, 18);
  // Apron Front Pocket
  ctx.fillStyle = '#166534';
  ctx.fillRect(x - 4, y + 6 + breathe, 8, 7);

  // Hands holding towel / wipe motion
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(x - 8 + wipeHand, y + 8 + breathe, 5, 5);
  ctx.fillStyle = '#e2e8f0'; // Clean barista towel
  ctx.fillRect(x - 5 + wipeHand, y + 10 + breathe, 8, 6);

  // Prominent In-World Nametag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(x - 26, y - 34 + breathe, 52, 12);
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 26, y - 34 + breathe, 52, 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('MIKE · BARISTA', x - 23, y - 25 + breathe);

  ctx.restore();
}

// =========================================================================
// DAVID NPC SPRITE (Airport Terminal Staff - ~1.4x scale)
// =========================================================================
export function renderStaffDavid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isInteracting: boolean,
  questMarker?: '!' | '?' | null
) {
  ctx.save();
  const breathe = Math.sin(time * 0.003) * 1.2;

  // Quest marker
  if (questMarker) {
    const markerBounce = Math.sin(time * 0.007) * 4;
    const markerY = y - 50 + breathe + markerBounce;
    ctx.fillStyle = questMarker === '!' ? '#f59e0b' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(x, markerY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(questMarker, x - 3.5, markerY + 4);
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 10, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head & Short dark hair
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(x, y - 18 + breathe, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(x - 6, y - 17 + breathe, 12, 10);
  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - 3, y - 14 + breathe, 2, 2);
  ctx.fillRect(x + 2, y - 14 + breathe, 2, 2);

  // Staff Uniform: High-visibility orange / navy jacket with reflective stripe
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(x - 7, y - 7 + breathe, 14, 16);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(x - 7, y - 3 + breathe, 14, 2.5);
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(x - 7, y + 2 + breathe, 14, 7);

  // Clipboard in hand
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x + 6, y - 2 + breathe, 6, 8);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 7, y - 1 + breathe, 4, 6);

  // Trousers
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - 5, y + 9, 4, 8);
  ctx.fillRect(x + 1, y + 9, 4, 8);

  // Nametag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(x - 26, y - 34 + breathe, 52, 12);
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 26, y - 34 + breathe, 52, 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('DAVID · STAFF', x - 23, y - 25 + breathe);

  ctx.restore();
}

// =========================================================================
// ELENA NPC SPRITE (Passenger Waiting in Lounge - ~1.4x scale)
// =========================================================================
export function renderPassengerElena(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isInteracting: boolean,
  questMarker?: '!' | '?' | null
) {
  ctx.save();
  const breathe = Math.sin(time * 0.0028) * 1.2;

  // Quest marker
  if (questMarker) {
    const markerBounce = Math.sin(time * 0.007) * 4;
    const markerY = y - 50 + breathe + markerBounce;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x, markerY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('!', x - 3.5, markerY + 4);
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 10, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head with Auburn ponytail
  ctx.fillStyle = '#9a3412';
  ctx.beginPath();
  ctx.arc(x, y - 18 + breathe, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + 5, y - 22 + breathe, 4, 8);
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(x - 6, y - 17 + breathe, 12, 10);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - 3, y - 14 + breathe, 2, 2);
  ctx.fillRect(x + 2, y - 14 + breathe, 2, 2);

  // Purple Traveler Trench Coat & Scarf
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(x - 7, y - 7 + breathe, 14, 16);
  ctx.fillStyle = '#f472b6';
  ctx.fillRect(x - 4, y - 7 + breathe, 8, 3);

  // Pants & Boots
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - 5, y + 9, 4, 8);
  ctx.fillRect(x + 1, y + 9, 4, 8);

  // Rolling luggage next to Elena
  ctx.fillStyle = '#0891b2';
  ctx.fillRect(x + 9, y, 8, 12);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x + 12, y - 6, 2, 6);

  // Nametag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(x - 28, y - 34 + breathe, 56, 12);
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 28, y - 34 + breathe, 56, 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('ELENA · TRAVELER', x - 26, y - 25 + breathe);

  ctx.restore();
}

// =========================================================================
// GATE 18 PODIUM (Stationary Counter & Monitor Screen)
// =========================================================================
export function renderGatePodium(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hasBoardingPassVerified: boolean = false
) {
  ctx.save();
  // Podium Desk Base
  ctx.fillStyle = '#334155';
  ctx.fillRect(x - 12, y + 4, 24, 14);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 12, y + 4, 24, 14);

  // Computer monitor on desk
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x - 8, y - 2, 10, 7);
  // Monitor Screen
  if (hasBoardingPassVerified) {
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x - 7, y - 1, 8, 5);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 5px monospace';
    ctx.fillText('OK', x - 6, y + 3);
  } else {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x - 7, y - 1, 8, 5);
  }
  ctx.restore();
}

// =========================================================================
// PIXEL SPEECH BUBBLE HELPER
// =========================================================================
export function renderPixelSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  bgColor = '#0f172a',
  borderColor = '#38bdf8',
  textColor = '#f8fafc'
) {
  ctx.save();
  ctx.font = 'bold 8px monospace';
  const textWidth = ctx.measureText(text).width;
  const padX = 6;
  const padY = 4;
  const bw = Math.max(textWidth + padX * 2, 34);
  const bh = 16;
  const bx = Math.round(x - bw / 2);
  const by = Math.round(y - bh);

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(bx + 2, by + 2, bw, bh);

  // Background box
  ctx.fillStyle = bgColor;
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(bx, by, bw, bh);

  // Tail
  ctx.fillStyle = bgColor;
  ctx.fillRect(x - 2, by + bh, 4, 3);
  ctx.fillStyle = borderColor;
  ctx.fillRect(x - 1, by + bh + 2, 2, 2);

  // Text
  ctx.fillStyle = textColor;
  ctx.fillText(text, bx + padX, by + bh - padY);
  ctx.restore();
}

// =========================================================================
// BOARDING CELEBRATION CONFETTI
// =========================================================================
export function renderBoardingConfetti(
  ctx: CanvasRenderingContext2D,
  gateX: number,
  gateY: number,
  time: number
) {
  ctx.save();
  const colors = ['#f59e0b', '#38bdf8', '#10b981', '#f43f5e', '#a855f7', '#fbbf24'];
  for (let i = 0; i < 20; i++) {
    const seed = i * 47.13;
    const speed = 0.045 + (i % 4) * 0.015;
    const fallY = (time * speed + seed * 12) % 95;
    const sway = Math.sin(time * 0.005 + seed) * 16;
    const px = gateX - 30 + (i * 7) % 75 + sway;
    const py = gateY - 25 + fallY;
    const sizeW = i % 3 === 0 ? 4 : 3;
    const sizeH = i % 2 === 0 ? 3 : 2;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(px, py, sizeW, sizeH);
  }
  ctx.restore();
}

// =========================================================================
// ALEX NPC SPRITE (Gate 18 Agent - ~1.4x scale)
// =========================================================================
export function renderGateAgentAlex(
  ctx: CanvasRenderingContext2D,
  alexOrX: GateAgentAlexState | number,
  yPos?: number,
  currentTime?: number,
  isInteractingParam?: boolean,
  questMarkerParam?: '!' | '?' | null,
  hasVerifiedParam: boolean = false,
  isCelebratingParam: boolean = false
) {
  // Support both object configuration and legacy parameters
  const isObj = typeof alexOrX === 'object';
  const x = isObj ? alexOrX.x : alexOrX;
  const y = isObj ? alexOrX.y : (yPos ?? 0);
  const time = isObj ? (currentTime ?? Date.now()) : (currentTime ?? 0);
  const isInteracting = isObj ? (alexOrX.isInteracting ?? false) : (isInteractingParam ?? false);
  const questMarker = isObj ? alexOrX.questMarker : questMarkerParam;
  const hasBoardingPassVerified = isObj
    ? (alexOrX.hasBoardingPassVerified ?? false)
    : hasVerifiedParam;
  const isBoardingCelebrating = isObj
    ? (alexOrX.isBoardingCelebrating ?? false)
    : isCelebratingParam;
  const facing = isObj ? (alexOrX.facing ?? 0) : 0;
  const isMoving = isObj ? (alexOrX.isMoving ?? false) : false;
  const walkFrame = isObj ? (alexOrX.walkFrame ?? 0) : 0;
  const isHandingPass = isObj ? (alexOrX.isHandingPass ?? false) : false;
  const ticketProgress = isObj ? alexOrX.ticketProgress : undefined;
  const speechBubble = isObj ? alexOrX.speechBubble : null;

  ctx.save();
  const breathe = isMoving ? 0 : Math.sin(time * 0.003) * 1.2;
  const legCycle = isMoving ? Math.sin(walkFrame * 0.6) * 5 : 0;
  const walkBob = isMoving ? Math.abs(Math.sin(walkFrame * 0.6)) * 2 : 0;
  const isCelebrating = isBoardingCelebrating || (isInteracting && hasBoardingPassVerified);

  // Quest marker (only show if boarding pass has not been verified yet)
  if (questMarker && !hasBoardingPassVerified) {
    const markerBounce = Math.sin(time * 0.007) * 4;
    const markerY = y - 50 + breathe + markerBounce;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x, markerY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('!', x - 3.5, markerY + 4);
  }

  // Floating celebration badge & sparkles above Alex when verified or celebrating
  if (hasBoardingPassVerified || isCelebrating) {
    const checkBounce = Math.sin(time * 0.007) * 3;
    const checkY = y - 48 + breathe + checkBounce;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(x, checkY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('✓', x - 3, checkY + 3);

    // Subtle floating sparkles near Alex
    const spX = x + Math.cos(time * 0.004) * 16;
    const spY = y - 32 + Math.sin(time * 0.005) * 8;
    ctx.fillStyle = '#fde047';
    ctx.fillRect(spX, spY, 2, 2);
    ctx.fillRect(spX - 1, spY, 4, 1);
    ctx.fillRect(spX, spY - 1, 1, 4);
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 10, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Alex Legs & Dark Shoes (visible when walking or stepping out)
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(x - 4, y + 6 - walkBob, 3, 7 + legCycle);
  ctx.fillRect(x + 1, y + 6 - walkBob, 3, 7 - legCycle);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - 5, y + 13 - walkBob, 4, 3);
  ctx.fillRect(x + 1, y + 13 - walkBob, 4, 3);

  // Head with dark blond hair & airline agent headset (subtle appreciative nod)
  const headBob = isCelebrating ? Math.sin(time * 0.008) * 1.6 : 0;
  const totalBob = breathe + headBob - walkBob;
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.arc(x, y - 18 + totalBob, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(x - 6, y - 17 + totalBob, 12, 10);

  // Eyes & Smile based on state
  if (isCelebrating || isHandingPass) {
    // Joyful curved smiling eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 4, y - 14 + totalBob, 3, 1.5);
    ctx.fillRect(x + 1, y - 14 + totalBob, 3, 1.5);
    ctx.fillRect(x - 3, y - 15 + totalBob, 1, 1);
    ctx.fillRect(x + 2, y - 15 + totalBob, 1, 1);
    // Warm encouraging smile
    ctx.fillStyle = '#be123c';
    ctx.fillRect(x - 2, y - 10 + totalBob, 4, 2);
  } else {
    // Normal neutral eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 3, y - 14 + totalBob, 2, 2);
    ctx.fillRect(x + 2, y - 14 + totalBob, 2, 2);
    ctx.fillStyle = '#be123c';
    ctx.fillRect(x - 1.5, y - 10 + totalBob, 3, 1.5);
  }

  // Headset
  ctx.fillStyle = '#334155';
  ctx.fillRect(x - 8, y - 17 + totalBob, 2, 6);
  ctx.fillRect(x - 8, y - 13 + totalBob, 5, 2);

  // Gate Agent Navy Blue Blazer & Sky Blue Tie
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(x - 7, y - 7 + totalBob, 14, 16);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x - 1, y - 7 + totalBob, 2, 6);

  // HANDOFF SEQUENCE ANIMATION: Reaching out arm with Golden Boarding Pass Ticket
  if (isHandingPass) {
    // Right arm extended to the right across counter towards player
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(x + 6, y - 8 + totalBob, 10, 5);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(x + 15, y - 9 + totalBob, 4, 4);

    // Boarding Pass Ticket gliding or held
    const prog = ticketProgress !== undefined ? Math.min(1, Math.max(0, ticketProgress)) : 0;
    // Glides from Alex's hand towards player position
    const tX = x + 16 + prog * 18;
    const tY = y - 11 + totalBob + Math.sin(prog * Math.PI) * -4;

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(tX, tY, 8, 6);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.strokeRect(tX, tY, 8, 6);
    // Ticket barcode
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(tX + 1, tY + 1, 1, 4);
    ctx.fillRect(tX + 3, tY + 1, 1, 4);
    ctx.fillRect(tX + 5, tY + 1, 2, 4);

    // Golden sparkles around ticket during transfer
    const spTime = time * 0.01;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(tX + Math.sin(spTime) * 6, tY - 3, 2, 2);
    ctx.fillRect(tX + 4, tY + 7, 2, 2);
  } else if (isCelebrating) {
    // Welcoming wave / hand pointing to Gate 18 turnstile
    const wave = Math.sin(time * 0.009) * 3;
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(x + 7, y - 9 + totalBob + wave, 5, 8);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(x + 8, y - 13 + totalBob + wave, 4, 4);

    // Left hand holding scanner
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 10, y + 1 + totalBob, 5, 4);
    const laserPulse = Math.sin(time * 0.012) > 0;
    if (laserPulse) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x - 12, y + 4 + totalBob, 2, 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.fillRect(x - 14, y + 3 + totalBob, 6, 4);
    }
  }

  // Nametag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(x - 26, y - 34 + totalBob, 52, 12);
  ctx.strokeStyle = hasBoardingPassVerified ? '#10b981' : '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 26, y - 34 + totalBob, 52, 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('ALEX · AGENT', x - 22, y - 25 + totalBob);

  // Speech Bubble if active
  if (speechBubble) {
    renderPixelSpeechBubble(ctx, x, y - 36 + totalBob, speechBubble, '#0f172a', '#38bdf8', '#f8fafc');
  }

  ctx.restore();
}

// =========================================================================
// BACKGROUND NPCS (Sitting passenger, walking traveler, board watcher & new populated airport crowd)
// =========================================================================
export function renderBackgroundNPCs(
  ctx: CanvasRenderingContext2D,
  time: number
) {
  ctx.save();

  // -----------------------------------------------------------------------
  // 1. Sitting passenger in chair reading on laptop (Col 27, Row 11)
  // -----------------------------------------------------------------------
  const p1X = 27 * TILE_SIZE + 10;
  const p1Y = 11 * TILE_SIZE + 4;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(p1X, p1Y + 12, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(p1X, p1Y - 8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(p1X - 4, p1Y - 7, 8, 7);
  // Red hoodie
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(p1X - 6, p1Y, 12, 14);
  // Laptop on lap (with glowing screen)
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(p1X - 7, p1Y + 7, 14, 2);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(p1X - 6, p1Y + 2, 12, 6);

  // -----------------------------------------------------------------------
  // 2. Sitting passenger looking at phone (Col 29, Row 14)
  // -----------------------------------------------------------------------
  const p2X = 29 * TILE_SIZE + 10;
  const p2Y = 14 * TILE_SIZE + 4;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(p2X, p2Y + 12, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(p2X, p2Y - 8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(p2X - 4, p2Y - 7, 8, 7);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(p2X - 6, p2Y, 12, 14);
  // Smartphone in hand
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(p2X - 2, p2Y + 4, 4, 6);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(p2X - 1, p2Y + 5, 2, 4);

  // -----------------------------------------------------------------------
  // 3. Passenger checking the Departure Board (Cols 15, Row 5)
  // -----------------------------------------------------------------------
  const p3X = 15 * TILE_SIZE;
  const p3Y = 5 * TILE_SIZE + 12;
  const headTilt = Math.sin(time * 0.002) * 1;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(p3X, p3Y + 12, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(p3X, p3Y - 18 + headTilt, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#059669'; // Emerald sweater
  ctx.fillRect(p3X - 6, p3Y - 11, 12, 15);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(p3X - 5, p3Y + 4, 4, 8);
  ctx.fillRect(p3X + 1, p3Y + 4, 4, 8);
  // Suitcase parked beside
  ctx.fillStyle = '#b45309';
  ctx.fillRect(p3X + 9, p3Y - 2, 8, 12);

  // -----------------------------------------------------------------------
  // 4. STATIC: Airline Captain / Pilot in Uniform (Col 32.5, Row 15 near Gate B22)
  // -----------------------------------------------------------------------
  const pilotX = 32.5 * TILE_SIZE;
  const pilotY = 15 * TILE_SIZE + 6;
  const pilotBreathe = Math.sin(time * 0.003) * 1;
  const isCheckingWatch = Math.floor(time / 2600) % 2 === 0;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(pilotX, pilotY + 12, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // White Captain Cap with gold wings insignia and black peak
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(pilotX - 6, pilotY - 24 + pilotBreathe, 12, 6);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(pilotX - 7, pilotY - 19 + pilotBreathe, 14, 2); // Black visor
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(pilotX - 2, pilotY - 22 + pilotBreathe, 4, 2); // Gold badge

  // Pilot Face
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(pilotX - 5, pilotY - 18 + pilotBreathe, 10, 8);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(pilotX - 3, pilotY - 15 + pilotBreathe, 2, 2);
  ctx.fillRect(pilotX + 1, pilotY - 15 + pilotBreathe, 2, 2);

  // Navy Double-Breasted Jacket
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(pilotX - 7, pilotY - 10 + pilotBreathe, 14, 15);
  // Gold 4-bar stripes on sleeve
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(pilotX - 7, pilotY - 2 + pilotBreathe, 2, 6);
  // White collar & black tie
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(pilotX - 2, pilotY - 10 + pilotBreathe, 4, 4);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(pilotX - 1, pilotY - 7 + pilotBreathe, 2, 6);

  // Arm checking watch
  if (isCheckingWatch) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(pilotX + 4, pilotY - 7 + pilotBreathe, 6, 4);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(pilotX + 8, pilotY - 6 + pilotBreathe, 2, 2); // Watch
  }

  // Trousers & Shoes
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(pilotX - 5, pilotY + 5, 4, 8);
  ctx.fillRect(pilotX + 1, pilotY + 5, 4, 8);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(pilotX - 6, pilotY + 12, 5, 2);
  ctx.fillRect(pilotX + 1, pilotY + 12, 5, 2);

  // Black Crew Rollaboard Flight Bag next to Pilot
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(pilotX + 9, pilotY - 2, 8, 12);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(pilotX + 12, pilotY - 9, 2, 7); // Chrome handle

  // -----------------------------------------------------------------------
  // 5. STATIC: Cafe Patron sipping coffee by Skyline Brew (Col 6.8, Row 9)
  // -----------------------------------------------------------------------
  const patronX = 6.8 * TILE_SIZE;
  const patronY = 9 * TILE_SIZE + 4;
  const patronBreathe = Math.sin(time * 0.0028) * 1;
  const isSipping = Math.sin(time * 0.0035) > 0.4;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(patronX, patronY + 12, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head & Wavy Auburn Hair
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(patronX, patronY - 18 + patronBreathe, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(patronX - 4, patronY - 17 + patronBreathe, 8, 8);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(patronX - 2, patronY - 14 + patronBreathe, 2, 2);

  // Cozy Mustard Yellow Knit Sweater
  ctx.fillStyle = '#d97706';
  ctx.fillRect(patronX - 6, patronY - 9 + patronBreathe, 12, 14);

  // Coffee cup in hand (raised if sipping)
  const cupY = isSipping ? patronY - 13 + patronBreathe : patronY - 5 + patronBreathe;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(patronX - 8, cupY, 5, 6);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(patronX - 8, cupY - 1, 5, 1.5); // Brown coffee lid

  // Dark Jeans & Boots
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(patronX - 4, patronY + 5, 3.5, 8);
  ctx.fillRect(patronX + 0.5, patronY + 5, 3.5, 8);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(patronX - 5, patronY + 12, 4.5, 2);
  ctx.fillRect(patronX + 0.5, patronY + 12, 4.5, 2);

  // -----------------------------------------------------------------------
  // 6. STATIC: Music Lover Passenger in Concourse Seat (Col 25, Row 18)
  // -----------------------------------------------------------------------
  const p6X = 25 * TILE_SIZE + 2;
  const p6Y = 18 * TILE_SIZE + 4;
  const headBob = Math.abs(Math.sin(time * 0.007)) * 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(p6X, p6Y + 12, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head with White Over-Ear Headphones
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(p6X, p6Y - 8 + headBob, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(p6X - 4, p6Y - 7 + headBob, 8, 7);

  // Headphone headband & ear cups
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(p6X - 6, p6Y - 13 + headBob, 12, 2.5); // Band
  ctx.fillRect(p6X - 7, p6Y - 9 + headBob, 3, 6); // Left cup
  ctx.fillRect(p6X + 4, p6Y - 9 + headBob, 3, 6); // Right cup

  // Teal Windbreaker Jacket
  ctx.fillStyle = '#0d9488';
  ctx.fillRect(p6X - 6, p6Y + 1 + headBob, 12, 13);

  // Purple Duffel Bag resting on floor
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(p6X + 8, p6Y + 2, 10, 8);
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(p6X + 9, p6Y, 8, 2); // Handle

  // -----------------------------------------------------------------------
  // 7. STATIC: Passenger at Baggage Claim 03 (Col 8.5, Row 17)
  // -----------------------------------------------------------------------
  const p7X = 8.5 * TILE_SIZE;
  const p7Y = 17 * TILE_SIZE + 10;
  const p7Tilt = Math.sin(time * 0.002) * 1.5;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(p7X, p7Y + 12, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head looking down towards conveyor
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.arc(p7X, p7Y - 16 + p7Tilt, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(p7X - 5, p7Y - 15 + p7Tilt, 8, 7);

  // Olive Trench Coat
  ctx.fillStyle = '#4d7c0f';
  ctx.fillRect(p7X - 6, p7Y - 8 + p7Tilt, 12, 16);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(p7X - 5, p7Y + 8, 4, 5);
  ctx.fillRect(p7X + 1, p7Y + 8, 4, 5);

  // -----------------------------------------------------------------------
  // 8. STATIC: Traveler tapping Self Check-in Kiosk (Col 11.5, Row 7)
  // -----------------------------------------------------------------------
  const p8X = 11.5 * TILE_SIZE + 2;
  const p8Y = 7 * TILE_SIZE + 8;
  const isTapping = Math.sin(time * 0.005) > 0;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(p8X, p8Y + 12, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head facing away/upward toward kiosk screen
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(p8X, p8Y - 16, 6, 0, Math.PI * 2);
  ctx.fill();

  // Striped Long Sleeve & Grey Backpack
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(p8X - 6, p8Y - 9, 12, 14);
  // Arm reaching up to tap kiosk screen
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(p8X - 2, isTapping ? p8Y - 14 : p8Y - 11, 4, 4);

  // Backpack on back
  ctx.fillStyle = '#475569';
  ctx.fillRect(p8X - 5, p8Y - 7, 10, 8);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(p8X - 4, p8Y + 5, 3.5, 8);
  ctx.fillRect(p8X + 0.5, p8Y + 5, 3.5, 8);

  // -----------------------------------------------------------------------
  // 9. WALKING: Walking Business Traveler with trolley along concourse (Row 13)
  // -----------------------------------------------------------------------
  const walkOffset1 = ((time * 0.02) % 400);
  const p4X = 13 * TILE_SIZE + walkOffset1;
  const p4Y = 13 * TILE_SIZE;
  if (p4X < 32 * TILE_SIZE) {
    const legSwing = Math.sin(time * 0.01) * 4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(p4X, p4Y + 10, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head & Suit
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(p4X, p4Y - 18, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.fillRect(p4X - 5, p4Y - 11, 10, 14);
    // Legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(p4X - 4 + legSwing, p4Y + 3, 3, 8);
    ctx.fillRect(p4X + 1 - legSwing, p4Y + 3, 3, 8);
    // Pulling rolling suitcase
    ctx.fillStyle = '#475569';
    ctx.fillRect(p4X - 12, p4Y + 1, 9, 11);
    ctx.fillRect(p4X - 7, p4Y - 6, 2, 7); // Handle
  }

  // -----------------------------------------------------------------------
  // 10. WALKING: Airport Ground Maintenance Staff pushing cart (Row 16)
  // -----------------------------------------------------------------------
  const staffOffset = ((time * 0.015) % 300);
  const staffX = 26 * TILE_SIZE - staffOffset;
  const staffY = 16 * TILE_SIZE;
  if (staffX > 11 * TILE_SIZE) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(staffX, staffY + 10, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Safety Vest
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(staffX, staffY - 18, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#eab308'; // High-vis yellow vest
    ctx.fillRect(staffX - 5, staffY - 11, 10, 14);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(staffX - 5, staffY - 6, 10, 3); // Silver reflective stripe
    // Pants
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(staffX - 4, staffY + 3, 3, 8);
    ctx.fillRect(staffX + 1, staffY + 3, 3, 8);
    // Service Cleaning Cart
    ctx.fillStyle = '#64748b';
    ctx.fillRect(staffX - 14, staffY - 2, 10, 14);
  }

  // -----------------------------------------------------------------------
  // 11. SLOWLY WALKING: Backpacker with roll-top pack (Row 19: Col 11 to 21 ping-pong)
  // -----------------------------------------------------------------------
  const walkCyclePeriod = 16000;
  const walkT = (time % walkCyclePeriod) / walkCyclePeriod; // 0 to 1
  // Ping-pong triangle wave (0 -> 1 -> 0)
  const pingPong = walkT < 0.5 ? walkT * 2 : (1 - walkT) * 2;
  const isFacingRight = walkT < 0.5;

  const bpStartX = 11.5 * TILE_SIZE;
  const bpEndX = 21.5 * TILE_SIZE;
  const bpX = bpStartX + pingPong * (bpEndX - bpStartX);
  const bpY = 19.5 * TILE_SIZE;
  const bpLegs = Math.sin(time * 0.008) * 4;

  ctx.save();
  ctx.translate(bpX, bpY);
  if (!isFacingRight) {
    ctx.scale(-1, 1);
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 10, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head with Cap
  ctx.fillStyle = '#065f46'; // Forest green baseball cap
  ctx.fillRect(-6, -24, 12, 5);
  ctx.fillRect(0, -21, 6, 2); // Visor
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(-5, -19, 10, 8);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(1, -16, 2, 2); // Eye

  // Khaki Outdoor Jacket
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(-6, -11, 12, 14);

  // Large Roll-top Backpacker Bag on back
  ctx.fillStyle = '#15803d'; // Green heavy canvas pack
  ctx.fillRect(-12, -18, 7, 18);
  // Sleeping mat / foam roll strapped on top
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(-13, -22, 9, 4);

  // Walking Cargo Shorts & Hiking Boots
  ctx.fillStyle = '#475569';
  ctx.fillRect(-4 + bpLegs, 3, 3.5, 8);
  ctx.fillRect(1 - bpLegs, 3, 3.5, 8);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-5 + bpLegs, 10, 5, 3);
  ctx.fillRect(1 - bpLegs, 10, 5, 3);

  ctx.restore();

  // -----------------------------------------------------------------------
  // 12. SLOWLY WALKING: Pacific Airline Cabin Crew Member with Roller (Col 23, Row 20 up to 12)
  // -----------------------------------------------------------------------
  const crewCycle = (time % 14000) / 14000;
  const crewPingPong = crewCycle < 0.5 ? crewCycle * 2 : (1 - crewCycle) * 2;
  const isWalkingUp = crewCycle < 0.5;

  const crewX = 23 * TILE_SIZE + 6;
  const crewStartY = 20 * TILE_SIZE;
  const crewEndY = 12 * TILE_SIZE;
  const crewY = crewStartY - crewPingPong * (crewStartY - crewEndY);
  const crewStep = Math.sin(time * 0.009) * 3;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(crewX, crewY + 11, 9, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head with neat hair bun
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.arc(crewX, crewY - 18, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(crewX - 4, crewY - 17, 8, 8);

  // Airline Crimson Red Uniform Blazer & Skirt
  ctx.fillStyle = '#be123c'; // Crimson airline red
  ctx.fillRect(crewX - 6, crewY - 9, 12, 13);
  // Sky-blue silk scarf
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(crewX - 3, crewY - 8, 6, 3);

  // Black tailored skirt & heels
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(crewX - 5, crewY + 4, 10, 5);
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(crewX - 3 + (isWalkingUp ? -crewStep : crewStep), crewY + 9, 2.5, 4);
  ctx.fillRect(crewX + 1 + (isWalkingUp ? crewStep : -crewStep), crewY + 9, 2.5, 4);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(crewX - 3.5, crewY + 13, 3, 2);
  ctx.fillRect(crewX + 0.5, crewY + 13, 3, 2);

  // Black Rolling Cabin Bag trailing
  const bagTrailingY = isWalkingUp ? crewY + 8 : crewY - 14;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(crewX + 7, bagTrailingY, 7, 10);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(crewX + 10, bagTrailingY - 5, 1.5, 5);

  ctx.restore();

  // -----------------------------------------------------------------------
  // 13. SLOWLY WALKING: Traveler with Turquoise Suitcase (Entrance Corridor)
  // -----------------------------------------------------------------------
  const travCycle = ((time * 0.014) % 220);
  const tX = 18 * TILE_SIZE + travCycle;
  const tY = 21 * TILE_SIZE + 4;
  if (tX < 24 * TILE_SIZE) {
    const tLeg = Math.sin(time * 0.009) * 3;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(tX, tY + 11, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(tX, tY - 17, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(tX - 4, tY - 16, 8, 8);
    // Lavender Cardigan
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(tX - 5, tY - 9, 10, 13);
    // Dark Pants & Walking
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(tX - 4 + tLeg, tY + 4, 3, 7);
    ctx.fillRect(tX + 1 - tLeg, tY + 4, 3, 7);
    // Turquoise Suitcase trailing behind
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(tX - 11, tY, 8, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(tX - 7, tY - 5, 2, 5);
  }

  ctx.restore();
}

// =========================================================================
// PLAYER SPRITE (The Playable Character - ~1.4x scale)
// =========================================================================
export function renderPlayer(
  ctx: CanvasRenderingContext2D,
  player: PlayerSpriteState,
  time: number
) {
  ctx.save();
  const { x, y, facing, isMoving, walkFrame, alertBubble, hasBoardingPassVerified, isBoardingCelebrating } = player;

  const isCelebrating = !!(isBoardingCelebrating || hasBoardingPassVerified);
  const celebrationHop = isBoardingCelebrating ? Math.abs(Math.sin(time * 0.009)) * 3 : 0;

  // Idle breathing oscillation (~1.2px)
  const breathe = isMoving ? 0 : Math.sin(time * 0.003) * 1.2;
  const legCycle = isMoving ? Math.sin(walkFrame * 0.6) * 5 : 0;
  const bobbing = (isMoving ? Math.abs(Math.sin(walkFrame * 0.6)) * 2.5 : breathe) - celebrationHop;

  // Achievement Celebration Floating Sparkles around player
  if (isCelebrating) {
    for (let i = 0; i < 4; i++) {
      const spPhase = time * 0.003 + i * 1.57;
      const spX = x + Math.cos(spPhase) * 20;
      const spY = y - 10 - ((time * 0.025 + i * 14) % 38);
      const spAlpha = Math.sin(time * 0.006 + i) * 0.5 + 0.5;
      if (spAlpha > 0.2) {
        ctx.fillStyle = i % 2 === 0 ? '#fbbf24' : '#38bdf8';
        ctx.fillRect(spX, spY, 2, 2);
        ctx.fillRect(spX - 1, spY, 4, 1);
        ctx.fillRect(spX, spY - 1, 1, 4);
      }
    }
  }

  // Floor Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rolling Leather Suitcase beside player (~1.4x scale)
  const suitX = facing === 2 ? x + 16 : x - 16;
  const suitY = y - 2 - (celebrationHop * 0.4);
  ctx.fillStyle = '#b45309'; // Warm leather brown
  ctx.fillRect(suitX - 6, suitY - 10, 11, 14);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1;
  ctx.strokeRect(suitX - 6, suitY - 10, 11, 14);
  // Leather corner protectors
  ctx.fillStyle = '#78350f';
  ctx.fillRect(suitX - 6, suitY - 10, 3, 3);
  ctx.fillRect(suitX + 2, suitY - 10, 3, 3);
  // Chrome handle
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(suitX - 1.5, suitY - 18, 3, 8);
  // Wheels
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(suitX - 4, suitY + 4, 3, 3);
  ctx.fillRect(suitX + 1, suitY + 4, 3, 3);

  // Player Legs & Shoes (~1.4x scale)
  ctx.fillStyle = '#1e293b'; // Dark blue denim
  if (facing === 0 || facing === 1) {
    // Facing Down / Up
    ctx.fillRect(x - 5, y - 4 + bobbing, 4, 8 + (isMoving ? legCycle : 0));
    ctx.fillRect(x + 1, y - 4 + bobbing, 4, 8 - (isMoving ? legCycle : 0));
  } else {
    // Facing Left / Right
    ctx.fillRect(x - 4, y - 4 + bobbing, 4, 8 + legCycle);
    ctx.fillRect(x + 1, y - 4 + bobbing, 4, 8 - legCycle);
  }
  // Shoes
  ctx.fillStyle = '#475569';
  ctx.fillRect(x - 6, y + 4 + bobbing, 5, 3);
  ctx.fillRect(x + 1, y + 4 + bobbing, 5, 3);

  // Player Body (Travel Jacket)
  ctx.fillStyle = '#0284c7'; // Sky-blue travel jacket
  ctx.fillRect(x - 8, y - 18 + bobbing, 16, 14);
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(x - 1, y - 18 + bobbing, 2, 14); // Zipper

  // Backpack on back
  ctx.fillStyle = '#b45309';
  if (facing === 1) {
    // Facing Up: backpack fully visible
    ctx.fillRect(x - 6, y - 16 + bobbing, 12, 11);
  } else if (facing === 2) {
    ctx.fillRect(x + 5, y - 16 + bobbing, 4, 11);
  } else if (facing === 3) {
    ctx.fillRect(x - 9, y - 16 + bobbing, 4, 11);
  }

  // Raised Arm holding Verified Boarding Pass (Achievement Animation!)
  if (isCelebrating) {
    const passArmX = facing === 2 ? x - 11 : x + 7;
    const passArmY = y - 20 + bobbing;

    // Sleeve
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(passArmX, passArmY + 2, 5, 6);
    // Hand
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(passArmX, passArmY, 4, 4);

    // Golden Boarding Pass Ticket
    const ticketX = facing === 2 ? x - 17 : x + 10;
    const ticketY = passArmY - 8;
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(ticketX, ticketY, 8, 6);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.strokeRect(ticketX, ticketY, 8, 6);
    // Barcode on ticket
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(ticketX + 1, ticketY + 1, 1, 4);
    ctx.fillRect(ticketX + 3, ticketY + 1, 1, 4);
    ctx.fillRect(ticketX + 5, ticketY + 1, 2, 4);
  } else if (player.isReceivingPass) {
    // Reaching out arm to receive pass across counter
    const rx = facing === 2 ? x - 11 : x + 5;
    const ry = y - 12 + bobbing;
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(rx, ry, 7, 4);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(rx + (facing === 2 ? -4 : 7), ry - 1, 4, 5);
  }

  // Player Head & Cap (~1.4x scale)
  const headY = y - 26 + bobbing;
  // Face
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(x - 7, headY, 14, 11);

  // Eyes & Facial Expression based on state
  if (isCelebrating) {
    // Joyful curved smiling eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 4, headY + 3, 3, 1.5);
    ctx.fillRect(x + 1, headY + 3, 3, 1.5);
    ctx.fillRect(x - 3, headY + 2, 1, 1);
    ctx.fillRect(x + 2, headY + 2, 1, 1);
    // Proud, accomplished warm smile
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(x - 2, headY + 7, 4, 1.5);
  } else {
    // Normal Eyes based on facing
    ctx.fillStyle = '#0f172a';
    if (facing === 0) {
      // Down
      ctx.fillRect(x - 4, headY + 4, 3, 3);
      ctx.fillRect(x + 1, headY + 4, 3, 3);
    } else if (facing === 2) {
      // Left
      ctx.fillRect(x - 5, headY + 4, 3, 3);
    } else if (facing === 3) {
      // Right
      ctx.fillRect(x + 2, headY + 4, 3, 3);
    }
  }

  // Blue Cap with visor
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(x - 8, headY - 5, 16, 6);
  // Visor
  if (facing === 0) {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x - 6, headY - 1, 12, 3);
  } else if (facing === 2) {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x - 11, headY - 1, 7, 3);
  } else if (facing === 3) {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 4, headY - 1, 7, 3);
  }

  // Alert / Thought Bubble (e.g. '!' or "Wait... what?")
  if (alertBubble) {
    if (alertBubble.length > 2) {
      ctx.font = 'bold 9px monospace';
      const textWidth = ctx.measureText(alertBubble).width;
      const bubbleW = textWidth + 14;
      const bubbleH = 20;
      const bubbleX = x - bubbleW / 2;
      const bubbleY = headY - 26;

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(bubbleX + 2, bubbleY + 2, bubbleW, bubbleH);

      // Bubble body
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bubbleX, bubbleY, bubbleW, bubbleH);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bubbleX, bubbleY, bubbleW, bubbleH);

      // Small thought tail dots
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 2, headY - 5, 4, 3);
      ctx.fillRect(x - 1, headY - 1, 2, 2);

      // Text
      ctx.fillStyle = '#0f172a';
      ctx.fillText(alertBubble, bubbleX + 7, bubbleY + 13.5);
    } else {
      const alertY = headY - 18;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x, alertY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(alertBubble, x - 3, alertY + 4);
    }
  }

  // Small 'YOU' nametag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(x - 14, y + 8, 28, 9);
  ctx.fillStyle = isCelebrating ? '#fde047' : '#38bdf8';
  ctx.font = 'bold 7px monospace';
  ctx.fillText('YOU', x - 6, y + 15);

  // Player Speech Bubble if active
  if (player.speechBubble) {
    renderPixelSpeechBubble(ctx, x, headY - 10, player.speechBubble, '#0f172a', '#fbbf24', '#fef08a');
  }

  ctx.restore();
}

// In-world interaction prompt badge
export function renderInteractionPrompt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  time: number
) {
  ctx.save();
  const bounce = Math.sin(time * 0.006) * 3;
  const promptY = y - 44 + bounce;

  ctx.font = 'bold 9px monospace';
  const textWidth = ctx.measureText(label).width;
  const pillW = textWidth + 26;
  const pillX = x - pillW / 2;

  // Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(pillX + 2, promptY + 2, pillW, 18);

  // Background Badge
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(pillX, promptY, pillW, 18);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pillX, promptY, pillW, 18);

  // Keycap indicator [ E ]
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(pillX + 3, promptY + 2, 16, 14);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('E', pillX + 7, promptY + 12);

  // Label text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(label, pillX + 22, promptY + 12.5);

  // Pointer triangle
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(x - 4, promptY + 18);
  ctx.lineTo(x + 4, promptY + 18);
  ctx.lineTo(x, promptY + 23);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
