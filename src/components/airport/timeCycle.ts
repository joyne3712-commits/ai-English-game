// In-Game Time Cycle & Color-Tinting Engine
// Provides dynamic time-of-day calculations, sky gradients, and subtle floor & wall tinting

export type TimeOfDayPhase = 'day' | 'sunset' | 'twilight' | 'night' | 'sunrise';

export interface TimeState {
  minutes: number; // 0 - 1440 (e.g. 1065 = 17:45)
  formattedTime: string; // "17:45"
  phase: TimeOfDayPhase;
  phaseLabel: string;
  phaseIcon: string;
  ambientLight: number; // 0 (darkest night) to 1 (brightest midday)
  floorWallTint: string; // RGBA color string for floor & wall tinting
  windowGlowColor: string; // Reflection & ambient tint on glass
  sunbeamAlpha: number; // 0 to 1 for sunset diagonal sunbeams
  nightLightAlpha: number; // 0 to 1 for night spotlight downlights
  skyColors: {
    top: string;
    mid: string;
    horizon: string;
    clouds: string;
    tarmacTint: string;
    isNight: boolean;
  };
}

export const TIME_PRESETS = [
  { label: 'Afternoon', labelCn: '午后阳光', minutes: 14 * 60 + 30, icon: '☀️' }, // 14:30
  { label: 'Sunset', labelCn: '落日金辉', minutes: 17 * 60 + 35, icon: '🌅' }, // 17:35
  { label: 'Twilight', labelCn: '暮色降临', minutes: 19 * 60 + 20, icon: '🌆' }, // 19:20
  { label: 'Deep Night', labelCn: '午夜静候', minutes: 21 * 60 + 45, icon: '🌙' }, // 21:45
];

// Helper to format minutes (e.g. 1065 -> "17:45")
export function formatMinutes(mins: number): string {
  const normalized = Math.floor(((mins % 1440) + 1440) % 1440);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Linear color interpolation helper
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// Compute comprehensive time state and floor/wall tinting properties
export function calculateTimeState(minutes: number): TimeState {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const hours = norm / 60;

  let phase: TimeOfDayPhase;
  let phaseLabel: string;
  let phaseIcon: string;
  let ambientLight: number;
  let floorWallTint: string;
  let windowGlowColor: string;
  let sunbeamAlpha = 0;
  let nightLightAlpha = 0;
  let skyColors = {
    top: '#1e3a8a',
    mid: '#3b82f6',
    horizon: '#93c5fd',
    clouds: 'rgba(255, 255, 255, 0.4)',
    tarmacTint: '#334155',
    isNight: false,
  };

  // Phase categorization & smooth tint computation:
  if (hours >= 9 && hours < 16) {
    // 1. Clear Daytime (09:00 - 16:00)
    phase = 'day';
    phaseLabel = 'Afternoon · Terminal Daylight';
    phaseIcon = '☀️';
    ambientLight = 1.0;
    // Crisp, natural airport terminal light: ultra-subtle warm tint
    floorWallTint = 'rgba(254, 240, 138, 0.03)';
    windowGlowColor = 'rgba(255, 255, 255, 0.18)';
    sunbeamAlpha = 0.05;
    nightLightAlpha = 0.0;
    skyColors = {
      top: '#1d4ed8',
      mid: '#38bdf8',
      horizon: '#bae6fd',
      clouds: 'rgba(255, 255, 255, 0.55)',
      tarmacTint: '#334155',
      isNight: false,
    };
  } else if (hours >= 16 && hours < 18.75) {
    // 2. Sunset / Golden Hour (16:00 - 18:45)
    // Warm golden hue for sunset
    phase = 'sunset';
    phaseLabel = 'Sunset · Golden Hour';
    phaseIcon = '🌅';
    const sunsetProgress = (hours - 16) / 2.75; // 0 to 1
    ambientLight = lerp(0.95, 0.72, sunsetProgress);

    // Warm golden hue: transitions from rich amber to deep golden coral
    const r = Math.round(lerp(245, 234, sunsetProgress));
    const g = Math.round(lerp(158, 88, sunsetProgress));
    const b = Math.round(lerp(11, 12, sunsetProgress));
    const alpha = lerp(0.12, 0.19, Math.sin(sunsetProgress * Math.PI)); // peaks around 17:20
    floorWallTint = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;

    windowGlowColor = `rgba(251, 191, 36, ${(0.25 + sunsetProgress * 0.15).toFixed(2)})`;
    sunbeamAlpha = Math.sin(sunsetProgress * Math.PI) * 0.28; // warm golden light shafts through windows
    nightLightAlpha = lerp(0.0, 0.35, sunsetProgress);

    skyColors = {
      top: '#312e81',
      mid: '#c2410c',
      horizon: '#fbbf24',
      clouds: 'rgba(254, 215, 170, 0.65)',
      tarmacTint: '#3b2f2f',
      isNight: false,
    };
  } else if (hours >= 18.75 && hours < 20.5) {
    // 3. Twilight / Dusk (18:45 - 20:30)
    phase = 'twilight';
    phaseLabel = 'Twilight · Dusk Concourse';
    phaseIcon = '🌆';
    const duskProgress = (hours - 18.75) / 1.75;
    ambientLight = lerp(0.7, 0.45, duskProgress);

    // Soft violet-rose to cool indigo transition
    const r = Math.round(lerp(168, 67, duskProgress));
    const g = Math.round(lerp(85, 56, duskProgress));
    const b = Math.round(lerp(247, 202, duskProgress));
    const alpha = lerp(0.14, 0.18, duskProgress);
    floorWallTint = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;

    windowGlowColor = 'rgba(167, 139, 250, 0.18)';
    sunbeamAlpha = 0;
    nightLightAlpha = lerp(0.4, 0.85, duskProgress);

    skyColors = {
      top: '#1e1b4b',
      mid: '#4338ca',
      horizon: '#c084fc',
      clouds: 'rgba(216, 180, 254, 0.35)',
      tarmacTint: '#1e293b',
      isNight: false,
    };
  } else if (hours >= 20.5 || hours < 5.5) {
    // 4. Deep Night (20:30 - 05:30)
    // Cooler blue for deep night
    phase = 'night';
    phaseLabel = 'Deep Night · Terminal Serenity';
    phaseIcon = '🌙';
    ambientLight = 0.38;

    // Rich, atmospheric cooler blue tint on the floor and walls
    floorWallTint = 'rgba(29, 78, 216, 0.16)';
    windowGlowColor = 'rgba(56, 189, 248, 0.08)';
    sunbeamAlpha = 0;
    nightLightAlpha = 1.0; // Interior spotlights at full cozy glory

    skyColors = {
      top: '#020617',
      mid: '#0f172a',
      horizon: '#1e293b',
      clouds: 'rgba(148, 163, 184, 0.15)',
      tarmacTint: '#0f172a',
      isNight: true,
    };
  } else {
    // 5. Early Morning / Dawn (05:30 - 09:00)
    phase = 'sunrise';
    phaseLabel = 'Dawn · First Flights';
    phaseIcon = '🌄';
    const dawnProgress = (hours - 5.5) / 3.5;
    ambientLight = lerp(0.42, 0.95, dawnProgress);
    floorWallTint = 'rgba(253, 224, 71, 0.08)';
    windowGlowColor = 'rgba(254, 240, 138, 0.2)';
    sunbeamAlpha = dawnProgress * 0.15;
    nightLightAlpha = Math.max(0, 1.0 - dawnProgress * 2);

    skyColors = {
      top: '#1e3a8a',
      mid: '#60a5fa',
      horizon: '#fed7aa',
      clouds: 'rgba(254, 243, 199, 0.5)',
      tarmacTint: '#334155',
      isNight: false,
    };
  }

  return {
    minutes: norm,
    formattedTime: formatMinutes(norm),
    phase,
    phaseLabel,
    phaseIcon,
    ambientLight,
    floorWallTint,
    windowGlowColor,
    sunbeamAlpha,
    nightLightAlpha,
    skyColors,
  };
}
