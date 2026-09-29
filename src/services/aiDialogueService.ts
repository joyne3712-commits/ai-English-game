import { GoogleGenAI } from '@google/genai';
import { DialogueOption, Character, DialogNode } from '../types';

export interface AiEvaluationResult {
  understood: boolean;
  npcReply: string;
  naturalAlternative?: string;
  toneFeedback?: string;
  xpGain: number;
  matchedOption: DialogueOption;
  nextDialogNodeId?: string | null;
  completesGoalId?: string;
}

// Retrieve Gemini API key from Vite environment
function getGeminiApiKey(): string | null {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
      if (import.meta.env.GEMINI_API_KEY) return import.meta.env.GEMINI_API_KEY;
    }
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
      if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
    }
  } catch {
    // Ignore environment lookup errors
  }
  return null;
}

/**
 * Intelligent contextual evaluation engine.
 * Understands traveler intent, handles colloquial phrasing and grammatical slips,
 * generates authentic in-character NPC replies FIRST, and provides a gentle natural phrasing tip.
 * Prioritizes: 1. Meaning & Communication, 2. Story Progression, 3. Naturalness.
 */
function localContextualEvaluation(
  playerInput: string,
  dialogNode: DialogNode,
  speaker: Character
): AiEvaluationResult {
  const input = playerInput.trim();
  const lower = input.toLowerCase();

  // Find best semantic option from current dialogue choices
  const naturalOpt = dialogNode.options.find((o) => o.toneQuality === 'natural') || dialogNode.options[0];
  const acceptableOpt = dialogNode.options.find((o) => o.toneQuality === 'acceptable') || naturalOpt;

  // 1. SARAH (Passenger Service)
  if (speaker.id === 'sarah') {
    // Choosing 21:30 / UA921 / Gate 22 / Earlier
    if (lower.includes('21:30') || lower.includes('2130') || lower.includes('921') || lower.includes('gate 22') || lower.includes('early') || lower.includes('first')) {
      const g22Opt = dialogNode.options.find((o) => o.id.includes('921') || o.id.includes('22')) || naturalOpt;
      return {
        understood: true,
        npcReply: "Got it! Let's get you confirmed on UA921 at 21:30 from Gate 22.",
        naturalAlternative: "I'll take the 21:30 flight (UA921).",
        xpGain: 30,
        matchedOption: g22Opt,
        nextDialogNodeId: 'sarah_confirm_gate22',
        completesGoalId: 'obj_find_replacement',
      };
    }

    // Choosing 23:10 / UA937 / Gate 31 / Later
    if (lower.includes('23:10') || lower.includes('2310') || lower.includes('937') || lower.includes('gate 31') || lower.includes('later') || lower.includes('relax') || lower.includes('rush')) {
      const g31Opt = dialogNode.options.find((o) => o.id.includes('937') || o.id.includes('31')) || naturalOpt;
      return {
        understood: true,
        npcReply: "Sounds good! The 23:10 flight (UA937) from Gate 31 gives you plenty of buffer time.",
        naturalAlternative: "I'd prefer the 23:10 flight (UA937).",
        xpGain: 30,
        matchedOption: g31Opt,
        nextDialogNodeId: 'sarah_confirm_gate31',
        completesGoalId: 'obj_find_replacement',
      };
    }

    // Asking about difference between flights
    if (lower.includes('diff') || lower.includes('which') || lower.includes('better') || lower.includes('compare')) {
      return {
        understood: true,
        npcReply: "Sure thing, let me compare both options for you.",
        naturalAlternative: "What's the difference between the two flights?",
        xpGain: 20,
        matchedOption: naturalOpt,
        nextDialogNodeId: 'sarah_compare',
      };
    }

    // Asking about luggage
    if (lower.includes('bag') || lower.includes('luggage') || lower.includes('suitcase')) {
      return {
        understood: true,
        npcReply: "If your bag was checked through from Ningbo, it will transfer automatically to your replacement flight to San Francisco.",
        naturalAlternative: "Will my checked baggage transfer automatically?",
        xpGain: 25,
        matchedOption: naturalOpt,
        nextDialogNodeId: 'sarah_options',
      };
    }

    // Explaining flight cancellation / asking for help
    if (lower.includes('cancel') || lower.includes('flight') || lower.includes('help') || lower.includes('problem') || lower.includes('sfo') || lower.includes('san francisco') || lower.includes('connecting')) {
      let alt: string | undefined;
      if (lower.includes('my flight cancel') || lower.includes('flight is bad')) {
        alt = "My connecting flight was cancelled. Could you help me find another one?";
      }

      return {
        understood: true,
        npcReply: "Yeah, I've seen a few cancellations tonight. Let me see what alternative flights are available.",
        naturalAlternative: alt,
        xpGain: 25,
        matchedOption: naturalOpt,
        nextDialogNodeId: 'sarah_options',
        completesGoalId: 'obj_figure_out',
      };
    }
  }

  // 2. MIKE (Cafe Barista)
  if (speaker.id === 'barista') {
    if (lower.includes('flight') || lower.includes('cancel') || lower.includes('lost') || lower.includes('help') || lower.includes('desk') || lower.includes('sarah')) {
      return {
        understood: true,
        npcReply: "Bummer about your flight. Head over to Counter B right across the hall—Sarah will sort you out.",
        naturalAlternative: "My flight just got cancelled. Do you know where I can get help?",
        xpGain: 20,
        matchedOption: naturalOpt,
        nextDialogNodeId: naturalOpt.nextDialogNodeId,
        completesGoalId: 'obj_figure_out',
      };
    }

    if (lower.includes('coffee') || lower.includes('drink') || lower.includes('americano') || lower.includes('latte')) {
      return {
        understood: true,
        npcReply: "You got it! Fresh iced Americano on the house. Hang in there!",
        naturalAlternative: "Could I get a quick iced Americano while I sort this out?",
        xpGain: 15,
        matchedOption: naturalOpt,
        nextDialogNodeId: naturalOpt.nextDialogNodeId,
      };
    }
  }

  // 3. STAFF DAVID
  if (speaker.id === 'staff_david') {
    if (lower.includes('gate 18') || lower.includes('where is') || lower.includes('which way')) {
      return {
        understood: true,
        npcReply: "Yeah, Gate 18 is down the hall on your left past the lounge. Look for the signs for Gates 15–20.",
        naturalAlternative: "Excuse me, which way is Gate 18?",
        xpGain: 25,
        matchedOption: naturalOpt,
        nextDialogNodeId: naturalOpt.nextDialogNodeId,
      };
    }

    if (lower.includes('cancel') || lower.includes('where') || lower.includes('help')) {
      return {
        understood: true,
        npcReply: "Passenger service is right past the information desk at Counter B.",
        naturalAlternative: "Excuse me, my flight was cancelled. Where should I go?",
        xpGain: 20,
        matchedOption: naturalOpt,
        completesGoalId: 'obj_figure_out',
        nextDialogNodeId: naturalOpt.nextDialogNodeId,
      };
    }
  }

  // 4. PASSENGER ELENA
  if (speaker.id === 'passenger_elena') {
    if (lower.includes('gate 18') || lower.includes('move') || lower.includes('change')) {
      return {
        understood: true,
        npcReply: "Yeah, Gate 18! It's in the west wing. We'd better hurry, boarding has started!",
        naturalAlternative: "Did they just say our flight changed to Gate 18?",
        xpGain: 20,
        matchedOption: naturalOpt,
        nextDialogNodeId: naturalOpt.nextDialogNodeId,
      };
    }

    if (lower.includes('error') || lower.includes('pass') || lower.includes('ticket') || lower.includes('alex')) {
      return {
        understood: true,
        npcReply: "Just ask Alex at the podium! He printed a paper pass for me in thirty seconds.",
        naturalAlternative: "Is your boarding pass giving you an error too?",
        xpGain: 20,
        matchedOption: naturalOpt,
        nextDialogNodeId: naturalOpt.nextDialogNodeId,
      };
    }

    if (lower.includes('flight') || lower.includes('cancel') || lower.includes('help') || lower.includes('where')) {
      return {
        understood: true,
        npcReply: "I just spoke with Sarah at Counter B. She's rebooking everyone onto later flights right now!",
        naturalAlternative: "Were you on that flight too? Do you know what we should do?",
        xpGain: 20,
        matchedOption: naturalOpt,
        completesGoalId: 'obj_figure_out',
        nextDialogNodeId: naturalOpt.nextDialogNodeId,
      };
    }
  }

  // 5. GATE AGENT ALEX
  if (speaker.id === 'agent_alex') {
    if (lower.includes('phone') || lower.includes('pass') || lower.includes('ticket') || lower.includes('error') || lower.includes('scan') || lower.includes('board')) {
      return {
        understood: true,
        npcReply: "No worries at all. Let me look up your reservation... Found you! Here is your verified boarding pass. You're all set to board.",
        naturalAlternative: "The scanner won't recognize my digital boarding pass.",
        xpGain: 35,
        matchedOption: naturalOpt,
        completesGoalId: 'obj_resolve_boarding_issue',
        nextDialogNodeId: 'agent_alex_finished',
      };
    }
  }

  // Fallback for general inputs: always understand meaning without punishing grammar
  return {
    understood: true,
    npcReply: `Got it. Let me take care of that for you.`,
    xpGain: 15,
    matchedOption: acceptableOpt,
    nextDialogNodeId: acceptableOpt.nextDialogNodeId,
    completesGoalId: acceptableOpt.completesGoalId,
  };
}

/**
 * Evaluates player's free English response using Gemini if available,
 * or the contextual engine. Always responds as the NPC in natural spoken English.
 * Does not interrupt gameplay or issue grammar penalties.
 */
export async function evaluatePlayerFreeResponse(
  playerInput: string,
  dialogNode: DialogNode,
  speaker: Character
): Promise<AiEvaluationResult> {
  const localResult = localContextualEvaluation(playerInput, dialogNode, speaker);
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return localResult;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are roleplaying as the NPC "${speaker.name}" (${speaker.title}) in a pixel-art airport adventure game called FLUENT TRIP.
Current Situation: A traveler had their flight UA889 to San Francisco cancelled.
Your current dialogue line to the player: "${dialogNode.npcDialogue}"
Available preset story options:
${dialogNode.options.map((o, i) => `${i + 1}. "${o.englishText}"`).join('\n')}

The player freely typed this response to you: "${playerInput}"

Rules:
1. Respond AS "${speaker.name}" in natural, friendly spoken English (1-2 conversational sentences).
2. Prioritize understanding their meaning. Even if their grammar is imperfect or broken, understand their intent!
3. If they asked or said something slightly awkward or unnatural, provide a gentle "naturalAlternative" showing how a native speaker might say it.
4. Output strict JSON with keys:
- "understood": true
- "npcReply": string (your in-character response)
- "naturalAlternative": string or null
- "toneQuality": "natural" | "acceptable"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (text) {
      const parsed = JSON.parse(text);
      return {
        understood: true,
        npcReply: parsed.npcReply || localResult.npcReply,
        naturalAlternative: parsed.naturalAlternative || localResult.naturalAlternative,
        xpGain: parsed.toneQuality === 'natural' ? 30 : 20,
        matchedOption: localResult.matchedOption,
        nextDialogNodeId: localResult.nextDialogNodeId,
        completesGoalId: localResult.completesGoalId,
      };
    }
  } catch (err) {
    console.warn('Gemini free-response evaluation fallback to local:', err);
  }

  return localResult;
}
