import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  generateAirportMap,
  WORLD_HOTSPOTS,
  WorldHotspot,
} from './tileset';
import {
  renderTiles,
  renderDepartureBoard,
  renderStructures,
  renderSarah,
  renderMike,
  renderStaffDavid,
  renderPassengerElena,
  renderGateAgentAlex,
  renderGatePodium,
  renderBoardingConfetti,
  renderJetbridgeBoardingEffects,
  renderBackgroundNPCs,
  renderPlayer,
  renderInteractionPrompt,
  PlayerSpriteState,
  GateAgentAlexState,
} from './sprites';
import { formatMinutes } from './timeCycle';
import { Hotspot } from '../../types';
import { sound } from '../../services/soundService';
import { Sparkles } from 'lucide-react';

interface AirportGameEngineProps {
  hotspots: Hotspot[];
  activeHotspotId?: string | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  hasBoardingPass: boolean;
  playerPos: { x: number; y: number }; // percentage (0 - 100)
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

export const AirportGameEngine: React.FC<AirportGameEngineProps> = ({
  hotspots,
  activeHotspotId,
  onSelectHotspot,
  hasBoardingPass,
  playerPos,
  onMovePlayer,
  floatingReward,
  interactingNpcId,
  isDialogueActive,
  playerAlert,
  isIntroWalking = false,
  onIntroWalkReachTarget,
  inGameMinutes = 1055, // default ~17:35 sunset golden hour
  activeObjectiveId,
  isGateChanged = false,
  hasBoardingPassVerified = false,
  isBoardingCelebrating = false,
  isBoardingSequenceActive = false,
  onBoardingSequenceComplete,
  isBoardingEnteringDoor = false,
  onBoardingEnteringDoorComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Map & Collision Data
  const mapDataRef = useRef(generateAirportMap());

  // Player position in World Coordinates (pixels)
  // Convert initial percentage pos to world px:
  const playerWorldRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: 0 | 1 | 2 | 3;
    isMoving: boolean;
    walkFrame: number;
    targetX: number | null;
    targetY: number | null;
  }>({
    x: (playerPos.x / 100) * WORLD_WIDTH,
    y: (playerPos.y / 100) * WORLD_HEIGHT,
    vx: 0,
    vy: 0,
    facing: 0,
    isMoving: false,
    walkFrame: 0,
    targetX: null,
    targetY: null,
  });

  // Camera coordinates (pixels)
  const cameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Keys currently held
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Active in-range hotspot
  const [nearestHotspot, setNearestHotspot] = useState<WorldHotspot | null>(null);

  // Mobile viewport detection
  const checkIsMobile = () => {
    if (typeof window === 'undefined') return false;
    const isTouch = 'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
    return window.innerWidth < 768 || (isTouch && window.innerWidth <= 1024);
  };

  const [isMobile, setIsMobile] = useState<boolean>(checkIsMobile());

  useEffect(() => {
    const handleResize = () => setIsMobile(checkIsMobile());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Virtual Joystick State (Mobile touch & mouse dragging fallback)
  const joystickVectorRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [joystickThumb, setJoystickThumb] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState<boolean>(false);
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const joystickTouchIdRef = useRef<number | null>(null);

  const updateJoystickFromCoords = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2 - 8; // ~40px

    let diffX = clientX - centerX;
    let diffY = clientY - centerY;
    const dist = Math.hypot(diffX, diffY);

    if (dist > maxRadius) {
      diffX = (diffX / dist) * maxRadius;
      diffY = (diffY / dist) * maxRadius;
    }

    setJoystickThumb({ x: diffX, y: diffY });

    if (dist < 6) {
      joystickVectorRef.current = { dx: 0, dy: 0 };
    } else {
      joystickVectorRef.current = { dx: diffX / maxRadius, dy: diffY / maxRadius };
    }
  };

  const updateJoystickFromTouch = (touch: React.Touch) => {
    updateJoystickFromCoords(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    if (isDialogueActive) return;
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    setIsJoystickActive(true);
    updateJoystickFromTouch(touch);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    if (!isJoystickActive) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        updateJoystickFromTouch(e.changedTouches[i]);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setIsJoystickActive(false);
        setJoystickThumb({ x: 0, y: 0 });
        joystickVectorRef.current = { dx: 0, dy: 0 };
        break;
      }
    }
  };

  // Mouse drag listeners for testing in browser mobile emulation
  const handleJoystickMouseDown = (e: React.MouseEvent) => {
    if (isDialogueActive) return;
    setIsJoystickActive(true);
    updateJoystickFromCoords(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isJoystickActive) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      updateJoystickFromCoords(e.clientX, e.clientY);
    };

    const handleWindowMouseUp = () => {
      setIsJoystickActive(false);
      setJoystickThumb({ x: 0, y: 0 });
      joystickVectorRef.current = { dx: 0, dy: 0 };
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isJoystickActive]);

  // Boarding Sequence Animation State Refs
  const boardingSeqTimerRef = useRef<number>(0);
  const hasPlayedHandoffChimeRef = useRef<boolean>(false);
  const alexSeqRef = useRef<GateAgentAlexState>({
    x: 7.5 * TILE_SIZE,
    y: 5.5 * TILE_SIZE,
    facing: 3,
    isMoving: false,
    walkFrame: 0,
    isHandingPass: false,
    ticketProgress: 0,
    speechBubble: null,
  });
  const playerSeqRef = useRef<{
    isReceivingPass: boolean;
    speechBubble: string | null;
  }>({
    isReceivingPass: false,
    speechBubble: null,
  });

  // Reset sequence state whenever boarding sequence activates
  useEffect(() => {
    if (isBoardingSequenceActive) {
      boardingSeqTimerRef.current = 0;
      hasPlayedHandoffChimeRef.current = false;
      alexSeqRef.current = {
        x: 7.5 * TILE_SIZE,
        y: 5.5 * TILE_SIZE,
        facing: 3,
        isMoving: false,
        walkFrame: 0,
        isHandingPass: false,
        ticketProgress: 0,
        speechBubble: "Let's verify your pass...",
      };
      playerSeqRef.current = {
        isReceivingPass: false,
        speechBubble: null,
      };
    }
  }, [isBoardingSequenceActive]);

  // Sync external percentage pos ONLY when explicitly changed externally by cutscenes or teleports
  const lastTeleportPosRef = useRef<{ x: number; y: number }>(playerPos);
  useEffect(() => {
    if (
      playerPos.x !== lastTeleportPosRef.current.x ||
      playerPos.y !== lastTeleportPosRef.current.y
    ) {
      lastTeleportPosRef.current = playerPos;
      playerWorldRef.current.x = (playerPos.x / 100) * WORLD_WIDTH;
      playerWorldRef.current.y = (playerPos.y / 100) * WORLD_HEIGHT;
      playerWorldRef.current.targetX = null;
      playerWorldRef.current.targetY = null;
      playerWorldRef.current.isMoving = false;
      playerWorldRef.current.vx = 0;
      playerWorldRef.current.vy = 0;
    }
  }, [playerPos.x, playerPos.y]);

  // Clean up residual keys and navigation targets whenever dialogue opens or closes
  useEffect(() => {
    keysRef.current = {};
    joystickVectorRef.current = { dx: 0, dy: 0 };
    setJoystickThumb({ x: 0, y: 0 });
    setIsJoystickActive(false);
    playerWorldRef.current.targetX = null;
    playerWorldRef.current.targetY = null;
    playerWorldRef.current.isMoving = false;
    playerWorldRef.current.vx = 0;
    playerWorldRef.current.vy = 0;

    if (!isDialogueActive) {
      // Focus canvas & window so WASD keys and mouse movement immediately work without extra clicks
      if (typeof window !== 'undefined') {
        window.focus();
      }
      canvasRef.current?.focus();
    }
  }, [isDialogueActive]);

  // Handle intro walking setup when intro begins
  useEffect(() => {
    if (isIntroWalking) {
      playerWorldRef.current.x = 19.5 * TILE_SIZE;
      playerWorldRef.current.y = 23.8 * TILE_SIZE;
      playerWorldRef.current.facing = 1;
      playerWorldRef.current.isMoving = true;
      playerWorldRef.current.walkFrame = 0;
      playerWorldRef.current.targetX = null;
      playerWorldRef.current.targetY = null;
    }
  }, [isIntroWalking]);

  // Handle Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if dialogue is active, intro walking, or boarding sequence is animating
      if (isDialogueActive || isIntroWalking || isBoardingSequenceActive || isBoardingEnteringDoor) return;

      const code = e.code;
      if (
        [
          'KeyW',
          'KeyA',
          'KeyS',
          'KeyD',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'KeyE',
          'Space',
        ].includes(code)
      ) {
        keysRef.current[code] = true;
        // Reset mouse click destination on keyboard input
        playerWorldRef.current.targetX = null;
        playerWorldRef.current.targetY = null;
      }

      // Interaction key [ E ] or [ Space ]
      if ((code === 'KeyE' || code === 'Space') && nearestHotspot) {
        e.preventDefault();
        const matched = hotspots.find((h) => h.id === nearestHotspot.id);
        if (matched) {
          sound.playClick();
          onSelectHotspot(matched);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (keysRef.current[code]) {
        keysRef.current[code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDialogueActive, nearestHotspot, hotspots, onSelectHotspot]);

  // Collision check for a circular/box area
  const checkCollision = useCallback((px: number, py: number) => {
    const collisionGrid = mapDataRef.current.collision;
    const radius = 9; // player foot radius

    // Check corners around player feet
    const points = [
      { x: px - radius, y: py - 4 },
      { x: px + radius, y: py - 4 },
      { x: px - radius, y: py + 4 },
      { x: px + radius, y: py + 4 },
    ];

    for (const pt of points) {
      const c = Math.floor(pt.x / TILE_SIZE);
      const r = Math.floor(pt.y / TILE_SIZE);

      if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) {
        return true; // Out of bounds
      }
      if (collisionGrid[r][c]) {
        return true; // Blocked tile
      }
    }
    return false;
  }, []);

  // Click on floor to navigate
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDialogueActive || isIntroWalking || isBoardingSequenceActive || isBoardingEnteringDoor) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickViewportX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickViewportY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const worldClickX = clickViewportX + cameraRef.current.x;
    const worldClickY = clickViewportY + cameraRef.current.y;

    // Check if player clicked near an NPC/Hotspot directly
    for (const spot of WORLD_HOTSPOTS) {
      const dist = Math.hypot(worldClickX - spot.worldX, worldClickY - spot.worldY);
      if (dist <= spot.interactRadius + 24) {
        // Stand in front of the hotspot in walkable space:
        let targetWalkX = spot.worldX;
        let targetWalkY = spot.worldY;
        if (spot.id === 'sarah_desk') {
          targetWalkY = spot.worldY + 48; // Walkable area in front of customer service counter
        } else if (spot.id === 'gate_18') {
          targetWalkX = 9.8 * TILE_SIZE;
          targetWalkY = 5.2 * TILE_SIZE;
        } else if (spot.id === 'gate_b22' || spot.id === 'gate_b31') {
          targetWalkX = spot.worldX - 16; // In front of turnstiles
          targetWalkY = spot.worldY;
        } else if (spot.id === 'cafe') {
          targetWalkX = spot.worldX + 24;
          targetWalkY = spot.worldY + 36;
        } else if (spot.id === 'board') {
          targetWalkY = spot.worldY + 40;
        } else {
          targetWalkY = spot.worldY + 24;
        }

        playerWorldRef.current.targetX = targetWalkX;
        playerWorldRef.current.targetY = targetWalkY;
        const matched = hotspots.find((h) => h.id === spot.id);
        if (matched) {
          sound.playStep();
          // If already close, trigger immediately
          const playerDist = Math.hypot(
            playerWorldRef.current.x - spot.worldX,
            playerWorldRef.current.y - spot.worldY
          );
          if (playerDist <= spot.interactRadius + 35) {
            onSelectHotspot(matched);
            return;
          }
        }
        return;
      }
    }

    // Otherwise, move to destination
    if (!checkCollision(worldClickX, worldClickY)) {
      playerWorldRef.current.targetX = worldClickX;
      playerWorldRef.current.targetY = worldClickY;
      sound.playStep();
    }
  };

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let stepSoundTimer = 0;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000); // delta in seconds
      lastTime = currentTime;

      const p = playerWorldRef.current;
      const speed = 145; // pixels per second

      // 1. Calculate Movement (Scripted entrance walk OR Boarding Sequences OR Interactive Controls)
      if (isIntroWalking) {
        // Scripted entrance sequence: player walks forward pulling rolling suitcase
        p.facing = 1; // Facing Up
        const walkSpeed = 95;
        p.x = 19.5 * TILE_SIZE;
        p.y -= walkSpeed * dt;
        p.isMoving = true;
        p.walkFrame += dt * 10;
        stepSoundTimer += dt;
        if (stepSoundTimer >= 0.34) {
          sound.playStep();
          stepSoundTimer = 0;
        }

        const targetY = 20.8 * TILE_SIZE;
        if (p.y <= targetY) {
          p.y = targetY;
          p.isMoving = false;
          p.walkFrame = 0;
          onIntroWalkReachTarget?.();
        }

        onMovePlayer(
          Math.round((p.x / WORLD_WIDTH) * 100),
          Math.round((p.y / WORLD_HEIGHT) * 100)
        );
      } else if (isBoardingEnteringDoor) {
        // Final walk through Gate 18 turnstile doors into the jet bridge
        p.facing = 1; // Facing Up
        const walkSpeed = 55;
        p.x = 9.8 * TILE_SIZE;
        p.y -= walkSpeed * dt;
        p.isMoving = true;
        p.walkFrame += dt * 10;
        stepSoundTimer += dt;
        if (stepSoundTimer >= 0.36) {
          sound.playStep();
          stepSoundTimer = 0;
        }

        const targetY = 2.4 * TILE_SIZE;
        if (p.y <= targetY) {
          p.y = targetY;
          p.isMoving = false;
          onBoardingEnteringDoorComplete?.();
        }

        onMovePlayer(
          Math.round((p.x / WORLD_WIDTH) * 100),
          Math.round((p.y / WORLD_HEIGHT) * 100)
        );
      } else if (isBoardingSequenceActive) {
        boardingSeqTimerRef.current += dt;
        const t = boardingSeqTimerRef.current;
        stepSoundTimer += dt;

        if (t < 1.2) {
          // Phase 1: Player steps up to Alex's counter
          p.facing = 2; // Facing Left towards Alex
          const targetX = 8.5 * TILE_SIZE;
          const targetY = 5.9 * TILE_SIZE;
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 3) {
            p.x += (dx / dist) * 75 * dt;
            p.y += (dy / dist) * 75 * dt;
            p.isMoving = true;
            p.walkFrame += dt * 10;
            if (stepSoundTimer >= 0.34) {
              sound.playStep();
              stepSoundTimer = 0;
            }
          } else {
            p.isMoving = false;
          }

          alexSeqRef.current = {
            x: 7.5 * TILE_SIZE,
            y: 5.5 * TILE_SIZE,
            facing: 3,
            isMoving: false,
            walkFrame: 0,
            isHandingPass: false,
            ticketProgress: 0,
            hasBoardingPassVerified: true,
            speechBubble: 'Checking your pass...',
          };
          playerSeqRef.current = {
            isReceivingPass: false,
            speechBubble: null,
          };
        } else if (t < 2.5) {
          // Phase 2: Handoff across the counter!
          p.isMoving = false;
          p.facing = 2; // Left
          const ticketProg = Math.min(1, (t - 1.2) / 1.1);

          alexSeqRef.current = {
            x: 7.8 * TILE_SIZE,
            y: 5.5 * TILE_SIZE,
            facing: 3,
            isMoving: false,
            walkFrame: 0,
            isHandingPass: true,
            ticketProgress: ticketProg,
            hasBoardingPassVerified: true,
            speechBubble: "All set! Here's your pass.",
          };
          playerSeqRef.current = {
            isReceivingPass: true,
            speechBubble: ticketProg > 0.8 ? 'Thank you Alex!' : null,
          };

          if (ticketProg >= 0.9 && !hasPlayedHandoffChimeRef.current) {
            hasPlayedHandoffChimeRef.current = true;
            sound.playItemGet();
          }
        } else if (t < 3.5) {
          // Phase 3: Celebration Hop & Holding pass high
          p.isMoving = false;
          p.facing = 3; // Right

          alexSeqRef.current = {
            x: 7.8 * TILE_SIZE,
            y: 5.5 * TILE_SIZE,
            facing: 3,
            isMoving: false,
            walkFrame: 0,
            isHandingPass: false,
            hasBoardingPassVerified: true,
            isBoardingCelebrating: true,
            speechBubble: 'Gate 18 is open! Follow me.',
          };
          playerSeqRef.current = {
            isReceivingPass: false,
            speechBubble: 'Gate 18, here we come!',
          };
        } else if (t < 5.4) {
          // Phase 4: Walk together to Gate 18!
          const walkProg = Math.min(1, (t - 3.5) / 1.9);

          // Alex walks to Gate 18 scanner podium (8.9 * TILE_SIZE, 4.6 * TILE_SIZE)
          alexSeqRef.current = {
            x: 7.8 * TILE_SIZE + walkProg * (1.1 * TILE_SIZE),
            y: 5.5 * TILE_SIZE - walkProg * (0.9 * TILE_SIZE),
            facing: 3,
            isMoving: true,
            walkFrame: (alexSeqRef.current.walkFrame || 0) + dt * 10,
            isHandingPass: false,
            hasBoardingPassVerified: true,
            isBoardingCelebrating: true,
            speechBubble: 'Right this way!',
          };

          // Player walks alongside Alex to Gate 18 turnstile entry (9.8 * TILE_SIZE, 4.8 * TILE_SIZE)
          p.x = 8.5 * TILE_SIZE + walkProg * (1.3 * TILE_SIZE);
          p.y = 5.9 * TILE_SIZE - walkProg * (1.1 * TILE_SIZE);
          p.facing = 3;
          p.isMoving = true;
          p.walkFrame += dt * 10;
          if (stepSoundTimer >= 0.32) {
            sound.playStep();
            stepSoundTimer = 0;
          }

          playerSeqRef.current = {
            isReceivingPass: false,
            speechBubble: 'Awesome!',
          };
        } else {
          // Phase 5: Complete & ready at Gate 18
          p.isMoving = false;
          alexSeqRef.current = {
            x: 8.9 * TILE_SIZE,
            y: 4.6 * TILE_SIZE,
            facing: 0,
            isMoving: false,
            walkFrame: 0,
            isHandingPass: false,
            hasBoardingPassVerified: true,
            isBoardingCelebrating: true,
            speechBubble: 'Safe travels to SF!',
          };
          playerSeqRef.current = {
            isReceivingPass: false,
            speechBubble: null,
          };
          onBoardingSequenceComplete?.();
        }

        onMovePlayer(
          Math.round((p.x / WORLD_WIDTH) * 100),
          Math.round((p.y / WORLD_HEIGHT) * 100)
        );
      } else {
        // Interactive Controls
        let dx = 0;
        let dy = 0;

        if (!isDialogueActive) {
          // 1. Virtual Joystick input on mobile touch
          if (joystickVectorRef.current.dx !== 0 || joystickVectorRef.current.dy !== 0) {
            dx = joystickVectorRef.current.dx;
            dy = joystickVectorRef.current.dy;
          } else {
            // 2. Keyboard keys on desktop
            const keys = keysRef.current;
            if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
            if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
            if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
            if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

            // 3. Mouse destination active
            if (dx === 0 && dy === 0 && p.targetX !== null && p.targetY !== null) {
              const distX = p.targetX - p.x;
              const distY = p.targetY - p.y;
              const dist = Math.hypot(distX, distY);

              if (dist > 5) {
                dx = distX / dist;
                dy = distY / dist;
              } else {
                p.targetX = null;
                p.targetY = null;
              }
            }
          }
        }

        // Normalize diagonal vector
        if (dx !== 0 && dy !== 0) {
          const len = Math.hypot(dx, dy);
          dx /= len;
          dy /= len;
        }

        // Update Facing direction
        if (Math.abs(dx) > Math.abs(dy)) {
          p.facing = dx > 0 ? 3 : 2; // Right : Left
        } else if (Math.abs(dy) > 0) {
          p.facing = dy > 0 ? 0 : 1; // Down : Up
        }

        // 2. Physics & Sliding Collision Detection
        const nextX = p.x + dx * speed * dt;
        const nextY = p.y + dy * speed * dt;
        let moved = false;

        // Try full move
        if (!checkCollision(nextX, nextY)) {
          p.x = nextX;
          p.y = nextY;
          moved = dx !== 0 || dy !== 0;
        } else {
          // Try slide X
          if (!checkCollision(nextX, p.y)) {
            p.x = nextX;
            moved = dx !== 0;
          }
          // Try slide Y
          if (!checkCollision(p.x, nextY)) {
            p.y = nextY;
            moved = dy !== 0;
          }
        }

        // If player clicked on destination but is blocked by obstacle, clear target destination
        if (!moved && (p.targetX !== null || p.targetY !== null)) {
          p.targetX = null;
          p.targetY = null;
        }

        p.isMoving = moved;
        if (p.isMoving) {
          p.walkFrame += dt * 10;
          stepSoundTimer += dt;
          if (stepSoundTimer >= 0.32) {
            sound.playStep();
            stepSoundTimer = 0;
          }
          // Sync position to parent percentage state throttled
          onMovePlayer(
            Math.round((p.x / WORLD_WIDTH) * 100),
            Math.round((p.y / WORLD_HEIGHT) * 100)
          );
        } else {
          p.walkFrame = 0;
        }
      }

      // 3. Smooth Camera Follow
      const viewportW = canvas.width;
      const viewportH = canvas.height;
      const targetCamX = Math.max(
        0,
        Math.min(WORLD_WIDTH - viewportW, p.x - viewportW / 2)
      );
      const targetCamY = Math.max(
        0,
        Math.min(WORLD_HEIGHT - viewportH, p.y - viewportH / 2)
      );

      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.12;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.12;

      const camX = Math.round(cameraRef.current.x);
      const camY = Math.round(cameraRef.current.y);

      // 4. Proximity Check for Nearest Hotspot
      let foundSpot: WorldHotspot | null = null;
      let minDistance = 9999;
      for (const spot of WORLD_HOTSPOTS) {
        const d = Math.hypot(p.x - spot.worldX, p.y - spot.worldY);
        if (d <= spot.interactRadius && d < minDistance) {
          minDistance = d;
          foundSpot = spot;
        }
      }
      setNearestHotspot(foundSpot);

      // 5. RENDER PASSES (Razor Sharp Pixel Art)
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply Camera View Matrix
      ctx.translate(-camX, -camY);

      // A. Layer 1: Static Airport Floor, Walls, Exterior Tarmac (with time tint)
      renderTiles(
        ctx,
        mapDataRef.current.tiles,
        camX,
        camY,
        viewportW,
        viewportH,
        currentTime,
        inGameMinutes
      );

      // B. Layer 2: Main Departure Board on North Wall (synced clock)
      renderDepartureBoard(
        ctx,
        11 * TILE_SIZE,
        2 * TILE_SIZE + 2,
        currentTime,
        formatMinutes(inGameMinutes)
      );

      // C. Layer 3: Architectural Structures, Furniture, Desks, Plants, Conveyor (with Gate 22 / Gate 18 quest stars)
      const isGate22Active =
        !isGateChanged &&
        (activeObjectiveId === 'obj_get_to_gate22' || activeObjectiveId === 'obj_reach_gate');
      const isGate18Active =
        isGateChanged &&
        (activeObjectiveId === 'obj_get_to_gate18' || activeObjectiveId === 'obj_board_flight');
      renderStructures(
        ctx,
        currentTime,
        hasBoardingPass,
        isGate22Active,
        isGateChanged,
        hasBoardingPassVerified,
        isGate18Active
      );

      // D. Layer 4: Interactive NPCs (Sarah, Mike, David, Elena, Alex)
      const sarahHasQuest = !hasBoardingPass && activeObjectiveId === 'obj_find_help';
      renderSarah(
        ctx,
        19.5 * TILE_SIZE,
        8.8 * TILE_SIZE,
        currentTime,
        interactingNpcId === 'sarah',
        sarahHasQuest ? '!' : null
      );
      renderMike(
        ctx,
        4.5 * TILE_SIZE,
        6.8 * TILE_SIZE,
        currentTime,
        interactingNpcId === 'barista'
      );

      // David (Airport Staff)
      const davidHasQuest =
        isGateChanged &&
        (activeObjectiveId === 'obj_find_new_gate' || activeObjectiveId === 'obj_get_to_gate18');
      renderStaffDavid(
        ctx,
        20 * TILE_SIZE,
        12.5 * TILE_SIZE,
        currentTime,
        interactingNpcId === 'staff_david',
        davidHasQuest ? '!' : null
      );

      // Elena (Passenger)
      const elenaHasQuest = isGateChanged && activeObjectiveId === 'obj_find_new_gate';
      renderPassengerElena(
        ctx,
        25 * TILE_SIZE,
        14 * TILE_SIZE,
        currentTime,
        interactingNpcId === 'passenger_elena',
        elenaHasQuest ? '!' : null
      );

      // Alex (Gate 18 Agent) & Podium
      const alexHasQuest =
        activeObjectiveId === 'obj_boarding_pass' ||
        (isGateChanged && !hasBoardingPassVerified && activeObjectiveId === 'obj_get_to_gate18');

      // Fixed Podium Counter at Gate 18
      renderGatePodium(ctx, 7.5 * TILE_SIZE, 5.5 * TILE_SIZE, hasBoardingPassVerified);

      if (isBoardingSequenceActive) {
        renderGateAgentAlex(ctx, {
          x: alexSeqRef.current.x,
          y: alexSeqRef.current.y,
          facing: alexSeqRef.current.facing,
          isMoving: alexSeqRef.current.isMoving,
          walkFrame: alexSeqRef.current.walkFrame,
          hasBoardingPassVerified: true,
          isBoardingCelebrating: alexSeqRef.current.isBoardingCelebrating,
          isHandingPass: alexSeqRef.current.isHandingPass,
          ticketProgress: alexSeqRef.current.ticketProgress,
          speechBubble: alexSeqRef.current.speechBubble,
        });
      } else {
        renderGateAgentAlex(
          ctx,
          7.5 * TILE_SIZE,
          5.5 * TILE_SIZE,
          currentTime,
          interactingNpcId === 'agent_alex',
          alexHasQuest ? '!' : null,
          hasBoardingPassVerified,
          isBoardingCelebrating
        );
      }

      // E. Layer 5: Background Moving & Sitting Passengers
      renderBackgroundNPCs(ctx, currentTime);

      // F. Layer 6: Player Character (With rolling suitcase, boarding animations & idle state)
      const playerState: PlayerSpriteState = {
        x: p.x,
        y: p.y,
        facing: p.facing,
        isMoving: p.isMoving || isIntroWalking || isBoardingEnteringDoor,
        walkFrame: p.walkFrame,
        alertBubble: playerAlert,
        hasBoardingPassVerified,
        isBoardingCelebrating: isBoardingCelebrating || isBoardingSequenceActive,
        isReceivingPass: playerSeqRef.current.isReceivingPass,
        speechBubble: playerSeqRef.current.speechBubble,
      };
      renderPlayer(ctx, playerState, currentTime);

      // Jetbridge Boarding Effects & Runway Beacons (when walking through Gate 18 door)
      if (isBoardingEnteringDoor) {
        const doorwayY = 4.8 * TILE_SIZE;
        const enterProg = Math.min(1, Math.max(0, (doorwayY - p.y) / (2.4 * TILE_SIZE)));
        renderJetbridgeBoardingEffects(
          ctx,
          p.x,
          p.y,
          9.8 * TILE_SIZE,
          4.8 * TILE_SIZE,
          enterProg,
          currentTime
        );
      }

      // Celebratory Confetti Shower when boarding pass is verified or celebrating
      if (isBoardingCelebrating || isBoardingSequenceActive) {
        renderBoardingConfetti(ctx, 9.8 * TILE_SIZE, 4.4 * TILE_SIZE, currentTime);
      }

      // G. Layer 7: In-World Interactive Prompt Badge above nearest hotspot
      if (foundSpot && !isDialogueActive && !isBoardingSequenceActive && !isBoardingEnteringDoor) {
        renderInteractionPrompt(
          ctx,
          foundSpot.worldX,
          foundSpot.worldY,
          foundSpot.interactLabel,
          currentTime,
          isMobile
        );
      }

      ctx.restore();

      // Dialogue Focus Scrim
      if (isDialogueActive) {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    activeObjectiveId,
    checkCollision,
    hasBoardingPass,
    inGameMinutes,
    interactingNpcId,
    isDialogueActive,
    isIntroWalking,
    onMovePlayer,
    playerAlert,
    isGateChanged,
    hasBoardingPassVerified,
    isBoardingCelebrating,
    isBoardingSequenceActive,
    onBoardingSequenceComplete,
    isBoardingEnteringDoor,
    onBoardingEnteringDoorComplete,
    isMobile,
  ]);

  // Resize canvas to match container size
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Context-sensitive action helper
  const getActionInfo = (spot: WorldHotspot): { action: string; icon: string } => {
    if (
      spot.id === 'sarah_desk' ||
      spot.id === 'staff_david' ||
      spot.id === 'passenger_elena' ||
      spot.id === 'agent_alex' ||
      spot.id === 'cafe'
    ) {
      return { action: 'TALK', icon: '💬' };
    }
    if (spot.id === 'board') {
      return { action: 'CHECK', icon: '📺' };
    }
    if (spot.id === 'gate_b22' || spot.id === 'gate_b31' || spot.id === 'gate_18') {
      return { action: 'BOARD', icon: '🚪' };
    }
    if (spot.id === 'luggage') {
      return { action: 'CHECK', icon: '🧳' };
    }
    if (spot.id === 'escalator') {
      return { action: 'USE', icon: '🛗' };
    }
    return { action: 'INSPECT', icon: '🔍' };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-slate-950 flex items-center justify-center cursor-crosshair"
    >
      {/* 1. HTML5 Pixel Art Game Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block"
        style={{
          imageRendering: 'pixelated',
        }}
      />

      {/* 2. Floating Reward Toast in World (+25 XP, +$15) */}
      {floatingReward && (
        <div
          key={floatingReward.id}
          className="absolute z-40 left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-bounce"
        >
          <div className="px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-sm font-mono shadow-[0_0_20px_rgba(245,158,11,0.6)] border-2 border-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{floatingReward.text}</span>
          </div>
        </div>
      )}

      {/* 3. Subtle In-Game Movement Controls Legend (Desktop Only) */}
      {!isDialogueActive && !isMobile && (
        <div className="absolute bottom-3 left-4 z-20 pointer-events-none hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
          <span className="text-amber-400 font-bold">MOVE:</span>
          <span>WASD / Arrow Keys</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-bold">TALK:</span>
          <span>[ E ] or Click NPC</span>
        </div>
      )}

      {/* 4. Mobile Context-Sensitive Interaction Button (Bottom-Right) */}
      {nearestHotspot && !isDialogueActive && isMobile && (
        <div className="absolute bottom-5 right-5 pb-[env(safe-area-inset-bottom,0.5rem)] z-30 pointer-events-auto animate-in zoom-in-95 duration-150">
          {(() => {
            const actionInfo = getActionInfo(nearestHotspot);
            return (
              <button
                onClick={() => {
                  const matched = hotspots.find((h) => h.id === nearestHotspot.id);
                  if (matched) {
                    sound.playClick();
                    onSelectHotspot(matched);
                  }
                }}
                className="w-16 h-16 min-w-[64px] min-h-[64px] rounded-2xl bg-amber-500 active:bg-amber-400 text-slate-950 shadow-[0_12px_30px_rgba(245,158,11,0.55)] border-2 border-white/60 flex flex-col items-center justify-center gap-0.5 font-mono cursor-pointer active:scale-95 transition-all select-none touch-manipulation"
                aria-label={`${actionInfo.action} ${nearestHotspot.name}`}
              >
                <span className="text-xl leading-none">{actionInfo.icon}</span>
                <span className="text-[10px] font-black tracking-wider uppercase font-mono">
                  {actionInfo.action}
                </span>
              </button>
            );
          })()}
        </div>
      )}

      {/* 5. Mobile Semi-Transparent Virtual Joystick (Bottom-Left) */}
      {!isDialogueActive && isMobile && (
        <div className="absolute bottom-5 left-5 pb-[env(safe-area-inset-bottom,0.5rem)] z-25 pointer-events-auto select-none touch-none">
          <div
            ref={joystickBaseRef}
            onTouchStart={handleJoystickTouchStart}
            onTouchMove={handleJoystickTouchMove}
            onTouchEnd={handleJoystickTouchEnd}
            onTouchCancel={handleJoystickTouchEnd}
            onMouseDown={handleJoystickMouseDown}
            className="w-24 h-24 rounded-full bg-slate-950/30 border-2 border-white/20 backdrop-blur-[1px] relative flex items-center justify-center shadow-lg active:border-amber-400/50 transition-colors"
          >
            {/* Subtle center crosshair guide */}
            <div className="w-1.5 h-1.5 rounded-full bg-white/30 pointer-events-none" />

            {/* Moving Thumb Stick */}
            <div
              className={`w-11 h-11 rounded-full border-2 border-white pointer-events-none transition-shadow shadow-md flex items-center justify-center ${
                isJoystickActive
                  ? 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                  : 'bg-amber-400/60'
              }`}
              style={{
                transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`,
                transition: isJoystickActive ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              <div className="w-3 h-3 rounded-full bg-slate-950/40" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
