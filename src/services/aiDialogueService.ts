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
 * Intelligent contextual fallback evaluation engine.
 * Understands traveler intent, handles colloquial phrasing, grammatical slips,
 * generates authentic in-character NPC replies FIRST, and provides a natural phrasing tip.
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
  const isQuestion = input.includes('?');

  // Check specific character scenarios
  if (speaker.id === 'sarah') {
    // Player asking Sarah for help with cancelled flight / rebooking
    if (lower.includes('cancel') || lower.includes('flight') || lower.includes('help') || lower.includes('problem') || lower.includes('sfo')) {
      let alternative: string | undefined;
      if (lower.includes('where') && !lower.includes('where is')) {
        alternative = "My flight was cancelled. Could you help me find another one?";
      } else if (lower.includes('i want to') || lower.includes('give me')) {
        alternative = "Excuse me, my flight just got cancelled. What are my options?";
      }

      return {
        understood: true,
        npcReply: "Yeah, I'm sorry about that. Let me see what I can find for you.",
        naturalAlternative: alternative,
        xpGain: 25,
        matchedOption: naturalOpt,
        nextDialogNodeId: naturalOpt.nextDialogNodeId || 'sarah_check_computer',
        completesGoalId: naturalOpt.completesGoalId,
      };
    }

    if (lower.includes('thank') || lower.includes('ok') || lower.includes('great') || lower.includes('gate 22')) {
      return {
        understood: true,
        npcReply: "No problem at all! Safe travels to San Francisco.",
        xpGain: 20,
        matchedOption: naturalOpt,
        nextDialogNodeId: naturalOpt.nextDialogNodeId,
        completesGoalId: naturalOpt.completesGoalId || 'obj_find_help',
      };
    }
  }

  if (speaker.id === 'barista') {
    // Mike the Cafe Barista
    if (lower.includes('flight') || lower.includes('lost') || lower.includes('help') || lower.includes('desk') || lower.includes('sarah')) {
      let alt: string | undefined;
      if (lower.includes('where is desk') || lower.includes('where desk')) {
        alt = "Do you know where the passenger service desk is?";
      }

      return {
        understood: true,
        npcReply: "Yeah, man. Try Counter B right across the hall. Sarah will take care of you.",
        naturalAlternative: alt,
        xpGain: 15,
        matchedOption: naturalOpt,
        nextDialogNodeId: naturalOpt.nextDialogNodeId,
        completesGoalId: naturalOpt.completesGoalId,
      };
    }

    if (lower.includes('coffee') || lower.includes('latte') || lower.includes('americano') || lower.includes('drink')) {
      return {
        understood: true,
        npcReply: "You got it! Fresh iced Americano on the house. Hang in there with your flight!",
        xpGain: 15,
        matchedOption: naturalOpt,
        nextDialogNodeId: naturalOpt.nextDialogNodeId,
      };
    }
  }

  if (speaker.id === 'staff_david') {
    // Airport Staff David
    if (lower.includes('gate 18') || lower.includes('where') || lower.includes('san francisco') || lower.includes('sfo') || lower.includes('change')) {
      let alt: string | undefined;
      if (lower.includes('where is gate') || lower.includes('i want to know')) {
        alt = "Excuse me, which way is Gate 18?";
      }

      return {
        understood: true,
        npcReply: "Yeah, Gate 18 is down the hall on your left past the lounge. Look for the signs for Gates 15–20.",
        naturalAlternative: alt,
        xpGain: 25,
        matchedOption: naturalOpt,
        completesGoalId: 'obj_find_new_gate',
        nextDialogNodeId: naturalOpt.nextDialogNodeId,
      };
    }
  }

  if (speaker.id === 'passenger_elena') {
    // Passenger Elena
    if (lower.includes('gate') || lower.includes('18') || lower.includes('flight') || lower.includes('announcement')) {
      return {
        understood: true,
        npcReply: "Yeah, Gate 18! It's in the west wing. We'd better hurry, boarding has already started!",
        naturalAlternative: isQuestion ? undefined : "Did they just say Gate 18?",
        xpGain: 20,
        matchedOption: naturalOpt,
        completesGoalId: 'obj_find_new_gate',
        nextDialogNodeId: naturalOpt.nextDialogNodeId,
      };
    }
  }

  if (speaker.id === 'agent_alex') {
    // Gate Agent Alex
    if (lower.includes('phone') || lower.includes('pass') || lower.includes('ticket') || lower.includes('error') || lower.includes('board')) {
      let alt: string | undefined;
      if (lower.includes('my phone cannot') || lower.includes('phone no work')) {
        alt = "My phone's having trouble loading my boarding pass.";
      }

      return {
        understood: true,
        npcReply: "No worries at all. Let me print a physical pass for you... There you go! You're all set to board.",
        naturalAlternative: alt,
        xpGain: 35,
        matchedOption: naturalOpt,
        completesGoalId: 'obj_boarding_pass',
        nextDialogNodeId: naturalOpt.nextDialogNodeId || 'agent_alex_finished',
      };
    }
  }

  // Fallback for general inputs
  return {
    understood: true,
    npcReply: `Got it. Let me help you with that.`,
    xpGain: 15,
    matchedOption: acceptableOpt,
    nextDialogNodeId: acceptableOpt.nextDialogNodeId,
    completesGoalId: acceptableOpt.completesGoalId,
  };
}

/**
 * Evaluates the player's free English response using Gemini if available,
 * or the contextual engine. Always responds as the NPC FIRST!
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

Requirements:
1. Respond AS "${speaker.name}" FIRST in natural, casual spoken English (1-2 short sentences). Keep the character's tone (${speaker.mood || 'helpful and friendly'}).
2. If the English was slightly unnatural, textbook-like, or overly formal, suggest a more native/natural alternative in "naturalAlternative".
3. Evaluate if the player's meaning was understood and appropriate.
4. Output strict JSON with keys:
- "understood": boolean
- "npcReply": string (your in-character response to what they said)
- "naturalAlternative": string or null (a more colloquial, native alternative if applicable)
- "toneQuality": "natural" | "acceptable" | "inappropriate"`;

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
        understood: parsed.understood !== false,
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
