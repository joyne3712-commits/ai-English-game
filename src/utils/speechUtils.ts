/**
 * Speech & TTS Utility Functions for FLUENT TRIP
 * Implements workplace semantic thought grouping, connected speech prosody,
 * and SSML/phonetic normalization for authentic airport personnel dialogue.
 */

export interface SpeechPreprocessingOptions {
  customBreakMultiplier?: number;
  preservePunctuation?: boolean;
}

/**
 * Normalizes travel terminology, flight numbers, and gate numbers
 * for natural acoustic pronunciation.
 */
export function normalizeAviationTerminology(text: string): string {
  if (!text) return '';

  return text
    .replace(/[*_#`~]/g, '') // strip markdown
    // Airline codes (e.g. UA921 -> U A 9 2 1)
    .replace(/\bUA\s*(\d{3,4})\b/gi, (_, num) => `U A ${num.split('').join(' ')}`)
    .replace(/\bAA\s*(\d{3,4})\b/gi, (_, num) => `A A ${num.split('').join(' ')}`)
    .replace(/\bDL\s*(\d{3,4})\b/gi, (_, num) => `D L ${num.split('').join(' ')}`)
    // Airport codes
    .replace(/\bSFO\b/g, 'S F O')
    .replace(/\bLAX\b/g, 'L A X')
    .replace(/\bJFK\b/g, 'J F K')
    // Gate identifiers
    .replace(/\bGate\s*([A-Za-z]?)(\d+)\b/gi, 'Gate $1 $2')
    // Currencies
    .replace(/\$(\d+)\b/g, '$1 dollars')
    // Times
    .replace(/\b21:30\b/g, '9 30 PM')
    .replace(/\b23:10\b/g, '11 10 PM')
    .replace(/\b20:40\b/g, '8 40 PM')
    .replace(/\b(\d{1,2}):(\d{2})\b/g, '$1 $2')
    // Em-dashes and long hyphens converted to clean clause pauses
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s*--\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Preprocesses dialogue strings into clean, workplace-authentic spoken units.
 * Organizes sentences by semantic thought groups with SSML-compliant micro-breaks
 * at informational boundaries without inserting artificial slang or filler words.
 *
 * @param text - The dialogue text to process.
 * @param options - Optional timing multipliers.
 * @returns The normalized dialogue string with natural syntactic pauses.
 */
export function preprocessDialogue(
  text: string,
  options?: SpeechPreprocessingOptions
): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let normalized = normalizeAviationTerminology(text);
  if (!normalized) return '';

  const multiplier = options?.customBreakMultiplier || 1.0;

  // 1. Add short informational breath pauses between coordinate and subordinate clauses
  normalized = normalized.replace(
    /,\s+(but|however|although|otherwise|so|which|because)\s+/gi,
    `, <break time="${Math.round(110 * multiplier)}ms"/> $1 `
  );

  // 2. Add brief professional pauses after introductory procedural phrases
  normalized = normalized.replace(
    /\b(Good news|Unfortunately|Please note|As a reminder|At this time|For your flight|In this case|Regarding your luggage),\s*/gi,
    `$1, <break time="${Math.round(120 * multiplier)}ms"/> `
  );

  // 3. Add clean thought-group pauses between sentences
  normalized = normalized.replace(
    /([.?!])\s+(?!<break)([A-Z])/g,
    `$1 <break time="${Math.round(150 * multiplier)}ms"/> $2`
  );

  // Clean up duplicate breaks or spaces
  normalized = normalized
    .replace(/(<break[^>]+>)\s*(<break[^>]+>)/gi, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

/**
 * Strips SSML tags for plain-text UI rendering or non-SSML speech engines.
 */
export function stripSsmlTags(ssmlText: string): string {
  if (!ssmlText) return '';
  return ssmlText
    .replace(/<break\s+[^>]*\/?>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
