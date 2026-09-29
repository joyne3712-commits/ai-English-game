// Web Audio API Synthesizer and Advanced NPC Conversational Voice Engine for FLUENT TRIP

import { preprocessDialogueForTts } from './ttsPreprocessor';
import { preprocessDialogue, stripSsmlTags } from '../utils/speechUtils';

export { preprocessDialogueForTts, preprocessDialogue, stripSsmlTags };

export interface VoiceProfile {
  characterId: string;
  name: string;
  gender: 'female' | 'male';
  ageRange: string;
  personality: string;
  basePitch: number;
  baseRate: number;
  preferredVoices: string[];
  prosodyPunctuation: boolean;
}

// Character Voice Profiles matching the FLUENT TRIP NPC Voice Design Specification
export const NPC_VOICE_PROFILES: Record<string, VoiceProfile> = {
  // CHARACTER 1 — SARAH: Passenger Service Staff (Female, 25–30, Warm, Approachable, Professional, Slightly busy)
  sarah: {
    characterId: 'sarah',
    name: 'Sarah',
    gender: 'female',
    ageRange: '25-30',
    personality: 'warm, professional, patient, calm under pressure',
    basePitch: 1.02,
    baseRate: 1.01,
    preferredVoices: [
      'Microsoft Jenny Online (Natural)',
      'Microsoft Jenny',
      'Samantha',
      'Victoria',
      'Google US English',
      'Karen',
      'Zoe',
      'Moira',
      'en-US-Standard-C',
      'en-US-Wavenet-C',
      'en-US',
    ],
    prosodyPunctuation: true,
  },

  // CHARACTER 2 — MIKE: Airport Café Barista (Male, 23–28, Casual, Relaxed, Social, Playful)
  barista: {
    characterId: 'barista',
    name: 'Mike',
    gender: 'male',
    ageRange: '23-28',
    personality: 'casual, relaxed, friendly, youthful, playful',
    basePitch: 1.02,
    baseRate: 1.10,
    preferredVoices: [
      'Microsoft Guy Online (Natural)',
      'Microsoft Guy',
      'Alex',
      'Google UK English Male',
      'Google US English Male',
      'Fred',
      'Daniel',
      'Aaron',
      'Tom',
      'en-US-Standard-B',
      'en-US-Wavenet-B',
      'en-US',
    ],
    prosodyPunctuation: true,
  },
  mike: {
    characterId: 'mike',
    name: 'Mike',
    gender: 'male',
    ageRange: '23-28',
    personality: 'casual, relaxed, friendly, youthful, playful',
    basePitch: 1.02,
    baseRate: 1.10,
    preferredVoices: [
      'Microsoft Guy Online (Natural)',
      'Microsoft Guy',
      'Alex',
      'Google UK English Male',
      'Google US English Male',
      'Fred',
      'Daniel',
      'Aaron',
      'Tom',
      'en-US',
    ],
    prosodyPunctuation: true,
  },

  // CHARACTER 3 — ALEX: Gate Staff / Boarding Staff (Female, 28–35, Clear, Efficient, Composed, Professional)
  agent_alex: {
    characterId: 'agent_alex',
    name: 'Alex',
    gender: 'female',
    ageRange: '28-35',
    personality: 'clear, efficient, composed, professional, controlled intonation',
    basePitch: 0.97,
    baseRate: 1.06,
    preferredVoices: [
      'Microsoft Aria Online (Natural)',
      'Microsoft Aria',
      'Microsoft Zira',
      'Victoria',
      'Karen',
      'Samantha',
      'Google US English',
      'Tessa',
      'en-US-Standard-E',
      'en-US-Wavenet-E',
      'en-US',
    ],
    prosodyPunctuation: true,
  },
  alex: {
    characterId: 'alex',
    name: 'Alex',
    gender: 'female',
    ageRange: '28-35',
    personality: 'clear, efficient, composed, professional, controlled intonation',
    basePitch: 0.97,
    baseRate: 1.06,
    preferredVoices: [
      'Microsoft Aria Online (Natural)',
      'Microsoft Aria',
      'Microsoft Zira',
      'Victoria',
      'Karen',
      'Samantha',
      'Google US English',
      'en-US',
    ],
    prosodyPunctuation: true,
  },

  // CHARACTER 4 — DAVID: Airport Ground Staff / Info Desk (Male, 30–40, Calm, Grounded, Mature, Practical)
  staff_david: {
    characterId: 'staff_david',
    name: 'David',
    gender: 'male',
    ageRange: '30-40',
    personality: 'calm, grounded, mature, practical, matter-of-fact, lower energy',
    basePitch: 0.83,
    baseRate: 0.91,
    preferredVoices: [
      'Microsoft David Online (Natural)',
      'Microsoft David',
      'Daniel',
      'Microsoft Mark',
      'Google UK English Male',
      'Alex',
      'George',
      'en-GB',
      'en-US',
    ],
    prosodyPunctuation: true,
  },
  david: {
    characterId: 'david',
    name: 'David',
    gender: 'male',
    ageRange: '30-40',
    personality: 'calm, grounded, mature, practical, matter-of-fact, lower energy',
    basePitch: 0.83,
    baseRate: 0.91,
    preferredVoices: [
      'Microsoft David Online (Natural)',
      'Microsoft David',
      'Daniel',
      'Microsoft Mark',
      'Google UK English Male',
      'Alex',
      'George',
      'en-US',
    ],
    prosodyPunctuation: true,
  },

  // PASSENGER ELENA (Female, passenger)
  passenger_elena: {
    characterId: 'passenger_elena',
    name: 'Elena',
    gender: 'female',
    ageRange: '24-30',
    personality: 'conversational, slightly anxious passenger',
    basePitch: 1.08,
    baseRate: 1.02,
    preferredVoices: ['Samantha', 'Victoria', 'Microsoft Jenny', 'Google US English', 'en-US'],
    prosodyPunctuation: true,
  },
};

export interface SpokenChunk {
  text: string;
  pitchOffset: number; // relative delta to base pitch (e.g. +0.05 for question, -0.03 for declarative cadence)
  rateMultiplier: number; // tempo modifier (e.g. 0.94 for thought/filler, 1.08 for breezy reaction)
  postPauseMs: number; // breath pause duration before following unit
}

/**
 * Normalizes conversational text for speech synthesis without changing display strings.
 * Pronounces flight numbers, times, and airport codes naturally as native aviation staff do.
 */
export function naturalizeConversationalProsody(text: string, personaId?: string): string {
  if (!text) return '';
  return preprocessDialogueForTts(text, personaId);
}

type ThoughtGroupIntent = 'PROCEDURAL_QUESTION' | 'BAD_NEWS' | 'HELPFUL_ACTION' | 'CONFIRMATION' | 'ROUTINE_INFO';

function classifyThoughtGroupIntent(text: string): ThoughtGroupIntent {
  const lower = text.toLowerCase().trim();
  if (
    lower.endsWith('?') ||
    lower.startsWith('may i') ||
    lower.startsWith('could you') ||
    lower.startsWith('which flight') ||
    lower.startsWith('are you')
  ) {
    return 'PROCEDURAL_QUESTION';
  }
  if (
    lower.includes('cancelled') ||
    lower.includes('delay') ||
    lower.includes('unfortunately') ||
    lower.includes('equipment issue') ||
    lower.includes('wrong gate') ||
    lower.includes('late arrival')
  ) {
    return 'BAD_NEWS';
  }
  if (
    lower.includes('let me') ||
    lower.includes('i can find') ||
    lower.includes('i can put you') ||
    lower.includes('pull up your booking') ||
    lower.includes('help you') ||
    lower.includes('look at available')
  ) {
    return 'HELPFUL_ACTION';
  }
  if (
    lower.includes('thank you') ||
    lower.includes("you're all set") ||
    lower.includes("you're confirmed") ||
    lower.includes('got it') ||
    lower.includes('have a safe flight') ||
    lower.includes("you're welcome")
  ) {
    return 'CONFIRMATION';
  }
  return 'ROUTINE_INFO';
}

/**
 * Splits dialogue into workplace-authentic semantic thought groups with context-aware
 * prosody, controlled pitch contours, and professional information-boundary pauses.
 */
export function buildProsodyChunks(text: string, personaId?: string): SpokenChunk[] {
  const naturalText = preprocessDialogueForTts(text, personaId);
  if (!naturalText) return [];

  const persona = (personaId || 'sarah').toLowerCase();
  const chunks: SpokenChunk[] = [];

  // Split by sentence boundaries while preserving conversational continuity
  const sentences = naturalText.split(/(?<=[.?!])\s+/).filter(Boolean);

  for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
    const rawSentence = sentences[sIdx].trim();
    if (!rawSentence) continue;

    const isLastSentence = sIdx === sentences.length - 1;

    // Subdivide compound clauses by informational conjunctions if longer than 8 words
    const words = rawSentence.split(/\s+/);
    let subClauses: string[] = [rawSentence];

    if (words.length > 8 && /,\s+(?:but|however|so|which|because|although)\s+/i.test(rawSentence)) {
      subClauses = rawSentence.split(/,\s+(?=(?:but|however|so|which|because|although)\s+)/i);
    }

    for (let cIdx = 0; cIdx < subClauses.length; cIdx++) {
      const clause = subClauses[cIdx].trim();
      if (!clause) continue;

      const isLastClause = cIdx === subClauses.length - 1;
      const intent = classifyThoughtGroupIntent(clause);

      let pitchOffset = 0.0;
      let rateMultiplier = 1.0;
      let postPauseMs = 110;

      switch (intent) {
        case 'PROCEDURAL_QUESTION':
          pitchOffset = 0.035; // clean, professional rising inquiry contour
          rateMultiplier = 1.03; // fluent workplace pace
          postPauseMs = 120;
          break;

        case 'BAD_NEWS':
          pitchOffset = -0.02; // composed, calm professional delivery
          rateMultiplier = 0.98; // measured delivery for critical information
          postPauseMs = 130;
          break;

        case 'HELPFUL_ACTION':
          pitchOffset = 0.01; // subtle supportive clarity
          rateMultiplier = 1.02; // fluid, competent action tempo
          postPauseMs = 100;
          break;

        case 'CONFIRMATION':
          pitchOffset = -0.02; // crisp settled completion
          rateMultiplier = 1.06; // efficient workplace acknowledgment
          postPauseMs = 80;
          break;

        case 'ROUTINE_INFO':
        default:
          pitchOffset = isLastClause && isLastSentence ? -0.015 : 0.005;
          rateMultiplier = 1.01;
          postPauseMs = isLastClause ? 120 : 90;
          break;
      }

      // Persona nuance (subtle professional differentiation)
      if (persona === 'agent_alex' || persona === 'alex') {
        rateMultiplier *= 1.03; // Alex is crisp and focused on boarding flow
        postPauseMs = Math.max(60, postPauseMs - 20);
      } else if (persona === 'staff_david' || persona === 'david') {
        rateMultiplier *= 0.96; // David is grounded, unhurried, experienced
        postPauseMs += 25;
      } else if (persona === 'barista' || persona === 'mike') {
        rateMultiplier *= 1.02; // Mike is a slightly more relaxed workplace barista
        postPauseMs = Math.max(70, postPauseMs - 15);
      }

      chunks.push({
        text: clause,
        pitchOffset,
        rateMultiplier,
        postPauseMs,
      });
    }
  }

  return chunks;
}

class SoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private voiceMap: Map<string, SpeechSynthesisVoice> = new Map();
  private isVoicesInitialized: boolean = false;
  private activeSpeechSessionId: number = 0;
  private speechTimeoutHandles: number[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  private clearSpeechTimers() {
    this.speechTimeoutHandles.forEach((handle) => clearTimeout(handle));
    this.speechTimeoutHandles = [];
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      this.cachedVoices = voices;
      this.allocateDistinctNpcVoices();
      this.isVoicesInitialized = true;
    }
  }

  /**
   * Distributes distinct voices to the four NPCs ensuring maximum auditory differentiation.
   */
  private allocateDistinctNpcVoices() {
    const allVoices = this.cachedVoices;
    const enVoices = allVoices.filter((v) => v.lang.startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : allVoices;

    const findBestVoice = (profile: VoiceProfile, excludeVoiceNames: Set<string>): SpeechSynthesisVoice | null => {
      // 1. Try preferred voices list
      for (const pref of profile.preferredVoices) {
        const found = pool.find((v) => !excludeVoiceNames.has(v.name) && v.name.toLowerCase().includes(pref.toLowerCase()));
        if (found) return found;
      }
      // 2. Try gender matching
      const isFemaleTarget = profile.gender === 'female';
      const genderMatch = pool.find((v) => {
        if (excludeVoiceNames.has(v.name)) return false;
        const name = v.name.toLowerCase();
        const seemsFemale =
          name.includes('female') ||
          name.includes('samantha') ||
          name.includes('jenny') ||
          name.includes('aria') ||
          name.includes('victoria') ||
          name.includes('karen') ||
          name.includes('zira') ||
          name.includes('zoe') ||
          name.includes('moira');
        const seemsMale =
          name.includes('male') ||
          name.includes('david') ||
          name.includes('guy') ||
          name.includes('alex') ||
          name.includes('daniel') ||
          name.includes('fred') ||
          name.includes('george') ||
          name.includes('mark');

        return isFemaleTarget ? seemsFemale : seemsMale;
      });

      if (genderMatch) return genderMatch;

      // 3. Fallback to any unused en-US voice
      const unusedEnUs = pool.find((v) => !excludeVoiceNames.has(v.name) && v.lang.startsWith('en-US'));
      if (unusedEnUs) return unusedEnUs;

      // 4. Fallback to any en voice
      return pool.find((v) => !excludeVoiceNames.has(v.name)) || pool[0] || null;
    };

    const assignedNames = new Set<string>();

    // 1. Sarah (Warm female service staff)
    const sarahVoice = findBestVoice(NPC_VOICE_PROFILES.sarah, assignedNames);
    if (sarahVoice) {
      this.voiceMap.set('sarah', sarahVoice);
      assignedNames.add(sarahVoice.name);
    }

    // 2. Mike (Youthful casual male barista)
    const mikeVoice = findBestVoice(NPC_VOICE_PROFILES.barista, assignedNames);
    if (mikeVoice) {
      this.voiceMap.set('barista', mikeVoice);
      this.voiceMap.set('mike', mikeVoice);
      assignedNames.add(mikeVoice.name);
    }

    // 3. Alex (Clear efficient female gate agent - tries to pick a distinct female voice from Sarah)
    const alexVoice = findBestVoice(NPC_VOICE_PROFILES.agent_alex, assignedNames);
    if (alexVoice) {
      this.voiceMap.set('agent_alex', alexVoice);
      this.voiceMap.set('alex', alexVoice);
      assignedNames.add(alexVoice.name);
    } else if (sarahVoice) {
      this.voiceMap.set('agent_alex', sarahVoice);
      this.voiceMap.set('alex', sarahVoice);
    }

    // 4. David (Mature grounded male ground staff - tries to pick a distinct male voice from Mike)
    const davidVoice = findBestVoice(NPC_VOICE_PROFILES.staff_david, assignedNames);
    if (davidVoice) {
      this.voiceMap.set('staff_david', davidVoice);
      this.voiceMap.set('david', davidVoice);
      assignedNames.add(davidVoice.name);
    } else if (mikeVoice) {
      this.voiceMap.set('staff_david', mikeVoice);
      this.voiceMap.set('david', mikeVoice);
    }

    // 5. Elena
    const elenaVoice = findBestVoice(NPC_VOICE_PROFILES.passenger_elena, assignedNames) || sarahVoice;
    if (elenaVoice) {
      this.voiceMap.set('passenger_elena', elenaVoice);
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // ============================================================================
  // AUDIO SYNTHESIS SOUND EFFECTS
  // ============================================================================

  // Airport Terminal Announcement Chime: Ding-Dong-Ding
  public playAirportChime() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      // Traditional airport chime: F#4 -> A#4 -> C#5
      osc.frequency.setValueAtTime(369.99, now);
      osc.frequency.setValueAtTime(466.16, now + 0.28);
      osc.frequency.setValueAtTime(554.37, now + 0.56);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch {
      // Ignore
    }
  }

  // Classic RPG Coin / Reward sound
  public playCoin() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  }

  // Item unlocked / Quest step completed fanfare
  public playItemGet() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {
      // Ignore
    }
  }

  // Crisp UI Click
  public playClick() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  // Footstep
  public playStep() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore
    }
  }

  // Smartphone vibration buzz (tactile dual bzz-bzz)
  public playPhoneVibrate() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [0, 0.16].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(75, now + offset);
        osc.frequency.linearRampToValueAtTime(85, now + offset + 0.08);

        gain.gain.setValueAtTime(0.18, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.12);
      });
    } catch {
      // Ignore
    }
  }

  // Smartphone notification ping / chime
  public playPhoneNotification() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, now + 0.08);
      gain2.gain.setValueAtTime(0.16, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.45);
    } catch {
      // Ignore
    }
  }

  // Cozy pixel art title / transition chord
  public playTitleChime() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const chord = [392.0, 493.88, 587.33, 739.99]; // G4, B4, D5, F#5
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.09, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.8);
      });
    } catch {
      // Ignore
    }
  }

  public playMistake() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  }

  // ============================================================================
  // ADVANCED NPC VOICE REDESIGN (FLUENT TRIP SPECIFICATION)
  // ============================================================================

  /**
   * Speaks dialogue in-character with tailored persona acoustic modeling,
   * natural conversational pace, prosody enhancement, breath units, and distinct voice allocation.
   */
  public speak(
    text: string,
    onEnd?: () => void,
    speakerPersona?: 'sarah' | 'barista' | 'mike' | 'staff_david' | 'david' | 'agent_alex' | 'alex' | 'passenger_elena' | string
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    if (!this.soundEnabled) {
      onEnd?.();
      return;
    }

    // Cancel any ongoing speech & clear previous queue timers
    this.stopSpeaking();

    const personaKey = (speakerPersona || 'sarah').toLowerCase();
    const profile = NPC_VOICE_PROFILES[personaKey] || NPC_VOICE_PROFILES.sarah;

    // Generate authentic conversational breath units with dynamic prosody
    const chunks = buildProsodyChunks(text, personaKey);
    if (!chunks || chunks.length === 0) {
      onEnd?.();
      return;
    }

    // Initialize voice allocation if not done
    if (!this.isVoicesInitialized || this.voiceMap.size === 0) {
      this.initVoices();
    }

    const assignedVoice = this.voiceMap.get(personaKey) || null;
    let fallbackVoice: SpeechSynthesisVoice | null = null;
    if (!assignedVoice) {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const isFemale = profile.gender === 'female';
        fallbackVoice =
          voices.find((v) => v.lang.startsWith('en-US') && (isFemale ? v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Jenny') : v.name.includes('Male') || v.name.includes('Guy') || v.name.includes('Alex') || v.name.includes('David'))) ||
          voices.find((v) => v.lang.startsWith('en-US')) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0] ||
          null;
      }
    }
    const targetVoice = assignedVoice || fallbackVoice;

    // Track active session ID to prevent race conditions or cross-dialogue leakage
    const sessionId = Date.now();
    this.activeSpeechSessionId = sessionId;

    let chunkIndex = 0;
    let hasCompleted = false;

    const finishSession = () => {
      if (!hasCompleted && this.activeSpeechSessionId === sessionId) {
        hasCompleted = true;
        this.clearSpeechTimers();
        onEnd?.();
      }
    };

    const speakNextChunk = () => {
      if (this.activeSpeechSessionId !== sessionId || !this.soundEnabled) {
        return;
      }

      if (chunkIndex >= chunks.length) {
        finishSession();
        return;
      }

      const chunk = chunks[chunkIndex];
      chunkIndex++;

      const utterance = new SpeechSynthesisUtterance(chunk.text);
      utterance.lang = 'en-US';

      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      // Dynamic modulated acoustic parameters
      const modulatedPitch = Math.max(0.65, Math.min(1.4, profile.basePitch + chunk.pitchOffset));
      const modulatedRate = Math.max(0.75, Math.min(1.4, profile.baseRate * chunk.rateMultiplier));

      utterance.pitch = modulatedPitch;
      utterance.rate = modulatedRate;
      utterance.volume = 1.0;

      let chunkHandled = false;
      const onChunkDone = () => {
        if (chunkHandled) return;
        chunkHandled = true;

        if (this.activeSpeechSessionId !== sessionId) return;

        if (chunkIndex >= chunks.length) {
          finishSession();
        } else {
          // Natural conversational inter-phrase pause
          const delayMs = Math.max(40, chunk.postPauseMs || 100);
          const timer = window.setTimeout(() => {
            speakNextChunk();
          }, delayMs);
          this.speechTimeoutHandles.push(timer);
        }
      };

      utterance.onend = onChunkDone;
      utterance.onerror = onChunkDone;

      // Watchdog timeout in case browser TTS event hangs
      const estimatedMs = (chunk.text.split(' ').length / (modulatedRate * 2.5)) * 1000 + 1200;
      const watchdogTimer = window.setTimeout(() => {
        if (!chunkHandled && this.activeSpeechSessionId === sessionId) {
          onChunkDone();
        }
      }, estimatedMs);
      this.speechTimeoutHandles.push(watchdogTimer);

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        onChunkDone();
      }
    };

    speakNextChunk();
  }

  public stopSpeaking() {
    this.activeSpeechSessionId = 0;
    this.clearSpeechTimers();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Exposes active voice diagnostic metadata for verification
   */
  public getCharacterVoiceInfo(personaId: string) {
    const profile = NPC_VOICE_PROFILES[personaId] || NPC_VOICE_PROFILES.sarah;
    const voice = this.voiceMap.get(personaId);
    return {
      persona: profile.name,
      role: profile.personality,
      gender: profile.gender,
      rate: profile.baseRate,
      pitch: profile.basePitch,
      voiceName: voice?.name || 'System Default Natural',
    };
  }
}

export const sound = new SoundService();
