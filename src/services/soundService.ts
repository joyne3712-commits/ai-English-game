// Web Audio API Synthesizer and Advanced NPC Conversational Voice Engine for FLUENT TRIP

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
    basePitch: 1.04,
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
    basePitch: 0.84,
    baseRate: 0.92,
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
    basePitch: 0.84,
    baseRate: 0.92,
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

/**
 * Naturalizes raw dialogue strings for authentic spoken prosody without altering display text.
 * Prevents mechanical reading of flight codes (e.g. UA921 -> U A 921), airport acronyms (SFO -> S F O),
 * and enhances conversational fillers with natural pauses.
 */
export function naturalizeConversationalProsody(text: string, personaId?: string): string {
  if (!text) return '';

  let spoken = text
    .replace(/[*_#`~]/g, '') // remove markdown symbols
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Naturalize Airline & Flight Codes (so TTS pronounces them as real flight calls)
  spoken = spoken.replace(/\bUA\s*(\d{3,4})\b/gi, (_, num) => {
    const spaced = num.split('').join(' ');
    return `U A ${spaced}`;
  });

  // 2. Naturalize Airport / Gate Codes
  spoken = spoken.replace(/\bSFO\b/g, 'S F O');
  spoken = spoken.replace(/\bGate\s*([A-Za-z]?)(\d+)\b/gi, 'Gate $1 $2');

  // 3. Conversational hesitation & natural phrase boundaries
  // Inject micro-pauses for human conversational cadence
  spoken = spoken
    .replace(/\bUh\.\.\./gi, 'Uh, ')
    .replace(/\bUm\.\.\./gi, 'Um, ')
    .replace(/\bWait\.\.\./gi, 'Wait, ')
    .replace(/\bYeah\.\.\./gi, 'Yeah, ')
    .replace(/\bHonestly\?\b/gi, 'Honestly, ')
    .replace(/\bOkay,\s*I think\b/gi, 'Okay, I think')
    .replace(/\bGive me just a second\b/gi, 'Give me just a second');

  // Character specific rhythm tweaks
  if (personaId === 'barista' || personaId === 'mike') {
    // Mike has a breezy, slightly connected phrasing
    spoken = spoken.replace(/!+/g, '! ');
  } else if (personaId === 'staff_david' || personaId === 'david') {
    // David has grounded, measured pauses between sentences
    spoken = spoken.replace(/\.\s+/g, '. ');
  } else if (personaId === 'agent_alex' || personaId === 'alex') {
    // Alex has crisp, concise cadence
    spoken = spoken.replace(/;\s*/g, '. ');
  }

  return spoken;
}

class SoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private voiceMap: Map<string, SpeechSynthesisVoice> = new Map();
  private isVoicesInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
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
   * natural conversational pace, prosody enhancement, and distinct voice allocation.
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

    // Cancel any ongoing speech to avoid overlapping
    window.speechSynthesis.cancel();

    const personaKey = (speakerPersona || 'sarah').toLowerCase();
    const profile = NPC_VOICE_PROFILES[personaKey] || NPC_VOICE_PROFILES.sarah;

    // 1. Naturalize conversational text for authentic spoken cadence & proper pauses
    const naturalSpokenText = naturalizeConversationalProsody(text, personaKey);
    if (!naturalSpokenText) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(naturalSpokenText);
    utterance.lang = 'en-US';

    // 2. Character-specific Acoustic Modulation
    // Applies distinct pitch, speed, and volume tailored to role, age, energy level, and rhythm:
    // Sarah: warm, professional, medium speed (1.01x), warm pitch (1.04)
    // Mike: casual, relaxed, fast conversational tempo (1.10x), youthful resonance (1.02)
    // Alex: gate supervisor, crisp, composed, efficient (1.06x), articulate pitch (0.97)
    // David: grounded airport veteran, mature, unrushed (0.92x), deep calm baritone (0.84)
    utterance.pitch = profile.basePitch;
    utterance.rate = profile.baseRate;
    utterance.volume = 1.0;

    // 3. Assign Distinct Voice
    if (!this.isVoicesInitialized || this.voiceMap.size === 0) {
      this.initVoices();
    }

    const matchedVoice = this.voiceMap.get(personaKey);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    } else {
      // Dynamic fallback based on gender preferences
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const isFemale = profile.gender === 'female';
        const candidate =
          voices.find((v) => v.lang.startsWith('en-US') && (isFemale ? v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Jenny') : v.name.includes('Male') || v.name.includes('Guy') || v.name.includes('Alex') || v.name.includes('David'))) ||
          voices.find((v) => v.lang.startsWith('en-US')) ||
          voices.find((v) => v.lang.startsWith('en'));
        if (candidate) {
          utterance.voice = candidate;
        }
      }
    }

    // 4. Lifecycle event callbacks
    let hasEnded = false;
    const safeEnd = () => {
      if (!hasEnded) {
        hasEnded = true;
        onEnd?.();
      }
    };

    utterance.onend = safeEnd;
    utterance.onerror = safeEnd;

    // Fallback timeout in case browser TTS event hangs (e.g. mobile background tab)
    const estimatedDurationMs = (naturalSpokenText.split(' ').length / (profile.baseRate * 2.5)) * 1000 + 1500;
    setTimeout(() => {
      if (!hasEnded && !window.speechSynthesis.speaking) {
        safeEnd();
      }
    }, estimatedDurationMs);

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
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
