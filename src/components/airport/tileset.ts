// Pixel Art Airport Map Tileset and Map Definition
// 32x32 px tile system for 3/4 top-down indie adventure RPG

export const TILE_SIZE = 32;
export const MAP_COLS = 38;
export const MAP_ROWS = 24;
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE; // 1216 px
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE; // 768 px

export const enum TileType {
  TARMAC_EXTERIOR = 0,
  WINDOW_PANE = 1,
  WALL_NORTH = 2,
  WALL_SOLID = 3,
  FLOOR_TERRAZZO = 4,
  FLOOR_TERRAZZO_DARK = 5,
  FLOOR_GUIDE_LINE = 6, // Refined, realistic subtle brass/beige wayfinding inlay
  FLOOR_CAFE_WOOD = 7,
  FLOOR_CARPET_NAVY = 8,
  FLOOR_ENTRANCE_MAT = 9,
}

// Tile color palettes (rich 16-bit warm airport lighting, not flat black)
export const PALETTE = {
  // Exterior Sky & Tarmac (outside large windows)
  skyDuskTop: '#2e2b6d',
  skyDuskMid: '#6366f1',
  skySunsetHorizon: '#f97316',
  skyCloudWarm: 'rgba(254, 243, 199, 0.45)',
  tarmacAsphalt: '#334155',
  tarmacMarking: '#e2e8f0',
  tarmacRunwayGrass: '#1e293b',
  runwayLightAmber: '#fbbf24',
  runwayLightGreen: '#34d399',

  // Walls & Windows
  wallNorthBase: '#e2e8f0',
  wallNorthShade: '#cbd5e1',
  wallNorthBorder: '#94a3b8',
  windowMullion: '#1e293b',
  windowGlassTint: 'rgba(99, 102, 241, 0.12)',
  windowReflection: 'rgba(255, 255, 255, 0.22)',
  trussSteel: '#475569',

  // Interior Flooring
  terrazzoLight: '#f1f5f9',
  terrazzoBorder: '#e2e8f0',
  terrazzoSpeck1: '#cbd5e1',
  terrazzoSpeck2: '#e2e8f0',
  terrazzoDark: '#e8edf3',
  // Subtle & refined brass/champagne wayfinding line (realistic airport aesthetic)
  guideLineInlay: '#d4a373',
  guideLineDotted: '#b08968',
  guideLineEdge: '#e5e7eb',
  woodPlankLight: '#b45309',
  woodPlankMid: '#92400e',
  woodPlankDark: '#78350f',
  carpetNavy: '#1e293b',
  carpetNavyBorder: '#334155',
  carpetNavyPattern: '#273549',
  entranceMat: '#1e293b',
  entranceMatRib: '#0f172a',

  // Furniture & Counters
  counterDeskTop: '#ffffff',
  counterDeskFront: '#0284c7',
  counterDeskShade: '#0369a1',
  counterWoodTop: '#d97706',
  counterWoodFront: '#92400e',
  chairBlue: '#0284c7',
  chairSteel: '#64748b',
  conveyorBelt: '#1e293b',
  conveyorSteel: '#94a3b8',

  // Departure Board
  boardBezel: '#020617',
  boardScreen: '#0f172a',
  boardAmberHeader: '#fbbf24',
  boardRedCancel: '#ef4444',
  boardGreenTime: '#10b981',
  boardWhiteText: '#f8fafc',
};

// Generates the static map layout
export function generateAirportMap(): {
  tiles: TileType[][];
  collision: boolean[][];
} {
  const tiles: TileType[][] = [];
  const collision: boolean[][] = [];

  for (let r = 0; r < MAP_ROWS; r++) {
    tiles[r] = [];
    collision[r] = [];
    for (let c = 0; c < MAP_COLS; c++) {
      // Default: Terrazzo floor
      tiles[r][c] = TileType.FLOOR_TERRAZZO;
      collision[r][c] = false;

      // 1. Exterior & Windows (Rows 0-3)
      if (r <= 1) {
        tiles[r][c] = TileType.TARMAC_EXTERIOR;
        collision[r][c] = true;
      } else if (r === 2 || r === 3) {
        tiles[r][c] = TileType.WINDOW_PANE;
        collision[r][c] = true;
      }

      // 2. North Wall Baseboard (Row 4)
      if (r === 4) {
        tiles[r][c] = TileType.WALL_NORTH;
        collision[r][c] = true;
      }

      // 3. Boundary Walls
      if (c === 0 || c === MAP_COLS - 1) {
        tiles[r][c] = TileType.WALL_SOLID;
        collision[r][c] = true;
      }

      // 4. South Wall & Entrance (Row 23)
      if (r === MAP_ROWS - 1) {
        if (c >= 17 && c <= 21) {
          // Entrance glass doors & mat
          tiles[r][c] = TileType.FLOOR_ENTRANCE_MAT;
          collision[r][c] = false;
        } else {
          tiles[r][c] = TileType.WALL_SOLID;
          collision[r][c] = true;
        }
      }

      // Entrance Mat on Rows 21-22 (Cols 17-21)
      if ((r === 21 || r === 22) && c >= 17 && c <= 21) {
        tiles[r][c] = TileType.FLOOR_ENTRANCE_MAT;
      }

      // 5. West Side: Skyline Cafe (Cols 1 to 9, Rows 5 to 14)
      if (c >= 1 && c <= 9 && r >= 5 && r <= 14) {
        tiles[r][c] = TileType.FLOOR_CAFE_WOOD;
      }

      // 6. East Side: Waiting Lounges (Navy carpet)
      if (c >= 25 && c <= 32 && r >= 10 && r <= 17) {
        tiles[r][c] = TileType.FLOOR_CARPET_NAVY;
      }

      // 7. Subtle Airport Wayfinding Inlay Lines (NOT loud orange!)
      // Vertical main path from entrance to center hub
      if (c === 19 && r >= 12 && r <= 20) {
        tiles[r][c] = TileType.FLOOR_GUIDE_LINE;
      }
      // Horizontal concourse connector
      if (r === 12 && c >= 10 && c <= 28) {
        tiles[r][c] = TileType.FLOOR_GUIDE_LINE;
      }

      // Alternating subtle checker pattern for realistic terrazzo texture
      if (
        tiles[r][c] === TileType.FLOOR_TERRAZZO &&
        (r + c) % 4 === 0
      ) {
        tiles[r][c] = TileType.FLOOR_TERRAZZO_DARK;
      }
    }
  }

  // =========================================================================
  // SET FURNITURE & STRUCTURAL COLLISIONS
  // =========================================================================

  // 1. Cafe Counter: Cols 2-7, Rows 7-8
  for (let c = 2; c <= 7; c++) {
    collision[7][c] = true;
    collision[8][c] = true;
  }

  // 2. Cafe Tables & Chairs (Cols 3 & 6, Row 11)
  collision[11][3] = true;
  collision[11][6] = true;

  // 3. Vending Machines (Col 1, Rows 5-6)
  collision[5][1] = true;
  collision[6][1] = true;

  // 4. Self Check-In Kiosks (Cols 11-13, Row 6)
  for (let c = 11; c <= 13; c++) {
    collision[6][c] = true;
  }

  // 5. Information Desk (Cols 17-22, Rows 9-10)
  for (let c = 17; c <= 22; c++) {
    collision[9][c] = true;
    collision[10][c] = true;
  }

  // 6. Seating rows:
  // Row 1: Cols 26-30, Row 11
  for (let c = 26; c <= 30; c++) {
    collision[11][c] = true;
  }
  // Row 2: Cols 26-30, Row 14
  for (let c = 26; c <= 30; c++) {
    collision[14][c] = true;
  }
  // Row 3: Concourse Seating (Cols 24-27, Row 18)
  for (let c = 24; c <= 27; c++) {
    collision[18][c] = true;
  }

  // 7. Baggage Carousel 03: Cols 3-9, Rows 18-20
  for (let r = 18; r <= 20; r++) {
    for (let c = 3; c <= 9; c++) {
      collision[r][c] = true;
    }
  }

  // 8. Luggage Trolley Bay near Entrance (Cols 13-15, Row 21)
  for (let c = 13; c <= 15; c++) {
    collision[21][c] = true;
  }

  // 9. Security Gate / Checkpoint: Cols 33-35, Rows 7-8
  for (let c = 33; c <= 35; c++) {
    collision[7][c] = true;
    collision[8][c] = true;
  }

  // 10. Gate B22 Turnstiles / Desk: Cols 34-36, Rows 13-14
  for (let c = 34; c <= 36; c++) {
    collision[13][c] = true;
    collision[14][c] = true;
  }

  // 11. Gate 18 Turnstiles / Desk: Cols 7-9, Row 5
  for (let c = 7; c <= 9; c++) {
    collision[5][c] = true;
  }

  // 12. Structural Pillars (4 massive architectural pillars with posters)
  const pillars = [
    { r: 8, c: 13 },
    { r: 8, c: 26 },
    { r: 16, c: 13 },
    { r: 16, c: 26 },
  ];
  pillars.forEach(({ r, c }) => {
    collision[r][c] = true;
  });

  return { tiles, collision };
}

// Hotspot definition in world coordinates
export interface WorldHotspot {
  id: string;
  name: string;
  nameCn: string;
  worldX: number; // in pixels
  worldY: number; // in pixels
  interactRadius: number; // in pixels
  interactLabel: string;
  subLabel: string;
}

export const WORLD_HOTSPOTS: WorldHotspot[] = [
  {
    id: 'sarah_desk',
    name: 'Customer Service Counter B',
    nameCn: '地勤服务 B 柜台 · Sarah',
    worldX: 19.5 * TILE_SIZE,
    worldY: 9 * TILE_SIZE,
    interactRadius: 75,
    interactLabel: 'Talk to Sarah',
    subLabel: 'Passenger Rebooking Agent',
  },
  {
    id: 'cafe',
    name: 'Skyline Brew Cafe',
    nameCn: '天际咖啡驿站 · Mike',
    worldX: 5 * TILE_SIZE,
    worldY: 8 * TILE_SIZE,
    interactRadius: 75,
    interactLabel: 'Talk to Mike',
    subLabel: 'Fresh Coffee & Lounge',
  },
  {
    id: 'board',
    name: 'Main Departure Flight Board',
    nameCn: '电子航显大屏幕',
    worldX: 14 * TILE_SIZE,
    worldY: 3.5 * TILE_SIZE,
    interactRadius: 85,
    interactLabel: 'Inspect Flight Board',
    subLabel: 'Flight Status Display',
  },
  {
    id: 'gate_b22',
    name: 'Gate 22: San Francisco',
    nameCn: 'Gate 22 登机口',
    worldX: 34.5 * TILE_SIZE,
    worldY: 14 * TILE_SIZE,
    interactRadius: 80,
    interactLabel: 'Gate 22 Entrance',
    subLabel: 'Flight UA 889 Gate',
  },
  {
    id: 'staff_david',
    name: 'Airport Staff · David',
    nameCn: '机场地勤问讯 · David',
    worldX: 20 * TILE_SIZE,
    worldY: 12.5 * TILE_SIZE,
    interactRadius: 70,
    interactLabel: 'Ask Staff for Help',
    subLabel: 'Airport Directions & Info',
  },
  {
    id: 'passenger_elena',
    name: 'Passenger · Elena',
    nameCn: '候机旅客 · Elena',
    worldX: 25 * TILE_SIZE,
    worldY: 14 * TILE_SIZE,
    interactRadius: 70,
    interactLabel: 'Talk to Passenger',
    subLabel: 'Traveler Waiting Nearby',
  },
  {
    id: 'escalator',
    name: 'Concourse Escalator & Lift',
    nameCn: '航站楼自动扶梯',
    worldX: 14 * TILE_SIZE,
    worldY: 6 * TILE_SIZE,
    interactRadius: 65,
    interactLabel: 'Take Escalator',
    subLabel: 'Mezzanine & Gates 15–20',
  },
  {
    id: 'agent_alex',
    name: 'Gate 18 Agent · Alex',
    nameCn: 'Gate 18 登机口地勤 · Alex',
    worldX: 7.5 * TILE_SIZE,
    worldY: 5.5 * TILE_SIZE,
    interactRadius: 75,
    interactLabel: 'Talk to Gate Agent',
    subLabel: 'Boarding Pass Verification',
  },
  {
    id: 'gate_18',
    name: 'Gate 18 Boarding Door',
    nameCn: 'Gate 18 登机通道',
    worldX: 9.5 * TILE_SIZE,
    worldY: 5.5 * TILE_SIZE,
    interactRadius: 75,
    interactLabel: 'Board Flight UA 889',
    subLabel: 'San Francisco (SFO)',
  },
  {
    id: 'luggage',
    name: 'Baggage Conveyor 03',
    nameCn: '03 号行李转盘',
    worldX: 6.5 * TILE_SIZE,
    worldY: 19 * TILE_SIZE,
    interactRadius: 80,
    interactLabel: 'Check Luggage',
    subLabel: 'UA 889 Baggage Status',
  },
];
