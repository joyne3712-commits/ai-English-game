/**
 * Workplace Dialogue Preprocessor for TTS
 * Organizes dialogue into natural professional thought groups, semantic boundaries,
 * and clear aviation terminology without artificial slang or forced casual fillers.
 */

import { normalizeAviationTerminology } from '../utils/speechUtils';

export interface TtsPreprocessorOptions {
  personaId?: string;
  intensity?: 'subtle' | 'moderate';
}

/**
 * Preprocesses dialogue for natural workplace speech delivery:
 * 1. Phonetic normalization of airline codes, gate numbers, and times.
 * 2. Natural semantic thought-group punctuation for clean clause breathing.
 * 3. Connected speech flow without robotic pauses or forced slang.
 */
export function preprocessDialogueForTts(
  dialogueText: string,
  options?: TtsPreprocessorOptions | string
): string {
  if (!dialogueText) return '';

  const personaId = typeof options === 'string' ? options : options?.personaId;
  const persona = (personaId || 'sarah').toLowerCase();

  let text = normalizeAviationTerminology(dialogueText);

  // Naturalize workplace contractions in spoken delivery when present
  // (e.g. "flight has been cancelled" -> "flight's been cancelled" for native speech rhythm)
  text = text
    .replace(/\bflight has been cancelled\b/gi, "flight's been cancelled")
    .replace(/\bthere is another\b/gi, "there's another")
    .replace(/\bwhat is going on\b/gi, "what's going on");

  // Subtle clause pauses based on sentence meaning
  if (persona === 'staff_david' || persona === 'david') {
    // David: measured, matter-of-fact grounded cadence
    text = text.replace(/,\s*/g, ', ');
  } else if (persona === 'agent_alex' || persona === 'alex') {
    // Alex: crisp, concise gate announcements and passenger verification
    text = text.replace(/;\s*/g, '. ');
  }

  return text;
}
