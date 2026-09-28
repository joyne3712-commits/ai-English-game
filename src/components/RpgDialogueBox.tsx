import React, { useState, useEffect, useRef } from 'react';
import { DialogNode, DialogueOption, Character } from '../types';
import { sound } from '../services/soundService';
import { evaluatePlayerFreeResponse, AiEvaluationResult } from '../services/aiDialogueService';
import { Volume2, X, ChevronRight, CornerDownLeft, Globe, Lightbulb, Sparkles, Send } from 'lucide-react';

interface RpgDialogueBoxProps {
  dialogNode: DialogNode;
  onSelectOption: (option: DialogueOption) => void;
  onAdvanceNode: (nextNodeId: string | null) => void;
  onClose: () => void;
  hp: number;
}

type DialoguePhase = 'npc_speaking' | 'player_turn' | 'free_input' | 'evaluating_ai' | 'npc_reacting';

export const RpgDialogueBox: React.FC<RpgDialogueBoxProps> = ({
  dialogNode,
  onSelectOption,
  onAdvanceNode,
  onClose,
  hp,
}) => {
  const [phase, setPhase] = useState<DialoguePhase>('npc_speaking');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTypewriterDone, setIsTypewriterDone] = useState<boolean>(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Keyboard choice selection index (0 to options.length - 1)
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number>(0);

  // Reaction State
  const [activeOption, setActiveOption] = useState<DialogueOption | null>(null);
  const [reactionText, setReactionText] = useState<string>('');
  const [isReactionDone, setIsReactionDone] = useState<boolean>(false);
  const [aiAlternative, setAiAlternative] = useState<string | null>(null);
  const [displayedXp, setDisplayedXp] = useState<number>(0);

  // Free Input State
  const [freeText, setFreeText] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const speaker = dialogNode.speaker;

  // Initialize or reset when dialogue node changes
  useEffect(() => {
    setPhase('npc_speaking');
    setDisplayedText('');
    setIsTypewriterDone(false);
    setShowTranslation(false);
    setShowHint(false);
    setActiveOption(null);
    setReactionText('');
    setIsReactionDone(false);
    setAiAlternative(null);
    setDisplayedXp(0);
    setFreeText('');
    setSelectedChoiceIdx(0);

    // Play character voice line with conversational rhythm
    sound.speak(dialogNode.npcDialogue, undefined, speaker.id);
  }, [dialogNode.id]);

  // Typewriter effect for NPC Dialogue
  useEffect(() => {
    if (phase !== 'npc_speaking') return;

    let idx = 0;
    const fullText = dialogNode.npcDialogue;
    const interval = setInterval(() => {
      idx += 2;
      if (idx >= fullText.length) {
        setDisplayedText(fullText);
        setIsTypewriterDone(true);
        clearInterval(interval);
        setTimeout(() => {
          setPhase('player_turn');
        }, 180);
      } else {
        setDisplayedText(fullText.slice(0, idx));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [phase, dialogNode.npcDialogue]);

  // Typewriter effect for NPC Reaction
  useEffect(() => {
    if (phase !== 'npc_reacting' || !reactionText) return;

    let idx = 0;
    const fullText = reactionText;
    const interval = setInterval(() => {
      idx += 2;
      if (idx >= fullText.length) {
        clearInterval(interval);
        setIsReactionDone(true);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [phase, reactionText]);

  // Fast forward typewriter on click
  const handleSkipTypewriter = () => {
    if (phase === 'npc_speaking' && !isTypewriterDone) {
      setDisplayedText(dialogNode.npcDialogue);
      setIsTypewriterDone(true);
      setPhase('player_turn');
    } else if (phase === 'npc_reacting' && !isReactionDone) {
      setIsReactionDone(true);
    }
  };

  // Keyboard navigation & selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === 'free_input' || phase === 'evaluating_ai') return;

      if (phase === 'npc_speaking') {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
          e.preventDefault();
          handleSkipTypewriter();
        }
        return;
      }

      if (phase === 'player_turn') {
        // Arrow navigation or W/S
        if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          e.preventDefault();
          sound.playClick();
          setSelectedChoiceIdx((prev) => (prev + 1) % dialogNode.options.length);
        } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          sound.playClick();
          setSelectedChoiceIdx((prev) => (prev - 1 + dialogNode.options.length) % dialogNode.options.length);
        } else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') {
          e.preventDefault();
          if (dialogNode.options[selectedChoiceIdx]) {
            handleSelectOption(dialogNode.options[selectedChoiceIdx]);
          }
        }

        // Direct number keys (1, 2, 3)
        if (!e.metaKey && !e.ctrlKey) {
          const num = parseInt(e.key, 10);
          if (num >= 1 && num <= dialogNode.options.length) {
            e.preventDefault();
            handleSelectOption(dialogNode.options[num - 1]);
          }
        }
      } else if (phase === 'npc_reacting') {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
          e.preventDefault();
          if (isReactionDone) {
            handleAdvanceAfterReaction();
          } else {
            setIsReactionDone(true);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isTypewriterDone, isReactionDone, selectedChoiceIdx, dialogNode.options]);

  // Read spoken dialogue aloud using Web Speech API
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      sound.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    const textToSpeak =
      phase === 'npc_reacting' && reactionText
        ? reactionText
        : dialogNode.npcDialogue;
    sound.speak(textToSpeak, () => setIsPlayingAudio(false), speaker.id);
  };

  // Player selects a choice
  const handleSelectOption = (option: DialogueOption) => {
    sound.playClick();
    onSelectOption(option);

    setActiveOption(option);
    setReactionText(option.npcReply);
    setAiAlternative(null);
    setDisplayedXp(option.xpGain);
    setPhase('npc_reacting');
    setIsReactionDone(false);

    sound.speak(option.npcReply, undefined, speaker.id);
  };

  // Handle Free Response submission via AI Evaluator
  const handleFreeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!freeText.trim() || phase === 'evaluating_ai') return;

    sound.playClick();
    setPhase('evaluating_ai');

    const result: AiEvaluationResult = await evaluatePlayerFreeResponse(
      freeText,
      dialogNode,
      speaker
    );

    const customOption: DialogueOption = {
      ...result.matchedOption,
      id: `ai_${Date.now()}`,
      englishText: freeText.trim(),
      npcReply: result.npcReply,
      xpGain: result.xpGain,
      completesGoalId: result.completesGoalId || result.matchedOption.completesGoalId,
      nextDialogNodeId: result.nextDialogNodeId || result.matchedOption.nextDialogNodeId,
    };

    onSelectOption(customOption);
    setActiveOption(customOption);
    setReactionText(result.npcReply);
    setAiAlternative(result.naturalAlternative || null);
    setDisplayedXp(result.xpGain);
    setPhase('npc_reacting');
    setIsReactionDone(false);

    sound.speak(result.npcReply, undefined, speaker.id);
  };

  // Advance conversation after viewing NPC's reaction
  const handleAdvanceAfterReaction = () => {
    if (!activeOption) return;
    sound.playClick();
    const nextId = activeOption.nextDialogNodeId || null;
    onAdvanceNode(nextId);
  };

  const getNpcAvatar = (avatarType: Character['avatarType']) => {
    switch (avatarType) {
      case 'sarah':
        return '👩‍💼';
      case 'barista':
        return '☕';
      case 'staff':
        return '🧑‍💼';
      case 'passenger':
        return '🧳';
      case 'agent':
        return '👨‍💼';
      default:
        return '👤';
    }
  };

  return (
    <div
      onClick={handleSkipTypewriter}
      className="w-full bg-[#080d1a]/95 border-2 border-slate-600/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.92)] p-4 sm:p-5 backdrop-blur-xl relative overflow-hidden transition-all duration-300 text-slate-100 selection:bg-amber-500 selection:text-slate-950"
      style={{
        boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(245, 158, 11, 0.25)',
      }}
    >
      {/* Pixel decorative corner brackets */}
      <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400" />
      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400" />
      <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400" />
      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400" />

      {/* 1. TOP HEADER: NPC IDENTITY & HIGH-CONTRAST CONTROLS */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        {/* Left: NPC Identity Tag */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base border-2 bg-slate-900 border-amber-400/60 text-amber-300 shadow-sm">
            {getNpcAvatar(speaker.avatarType)}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-black text-amber-400 text-sm sm:text-base tracking-wider uppercase font-mono">
              {speaker.name}
            </span>
            <span className="text-xs text-slate-400 font-sans hidden sm:inline font-medium">
              · {speaker.title}
            </span>
          </div>
        </div>

        {/* Right: Clean, Game-Like Support Buttons */}
        <div className="flex items-center gap-2 text-xs">
          {/* Read Aloud Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleAudio();
            }}
            className={`px-2.5 py-1 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Listen to pronunciation"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isPlayingAudio ? 'Speaking...' : 'Listen'}
            </span>
          </button>

          {/* Optional [ Translate ] Toggle */}
          {dialogNode.npcDialogueCnHint && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTranslation((prev) => !prev);
              }}
              className={`px-2.5 py-1 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                showTranslation
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Toggle Chinese translation"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {showTranslation ? 'Hide' : 'Translate'}
              </span>
            </button>
          )}

          {/* Optional [ Hint ] Toggle */}
          {dialogNode.hintScaffolding && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHint((prev) => !prev);
              }}
              className={`px-2.5 py-1 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                showHint
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Get in-story hint"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hint</span>
            </button>
          )}

          {/* Walk Away / Close Dialogue */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close dialogue"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. ON-DEMAND HINT BUBBLE (Subtle contextual prompt) */}
      {showHint && dialogNode.hintScaffolding && (
        <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200 font-sans">
          <span className="text-emerald-400 font-bold shrink-0 font-mono">💡 HINT:</span>
          <div className="flex-1 leading-relaxed">
            <span>{dialogNode.hintScaffolding.level1Cn}</span>
            {dialogNode.hintScaffolding.level2Starter && (
              <div className="text-xs text-emerald-400/90 mt-1 font-mono">
                Try: "{dialogNode.hintScaffolding.level2Starter}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN DIALOGUE CONTENT AREA */}
      <div className="space-y-3">
        {/* A. If in Speaking or Choice Phase: Show NPC's line with LARGE READABLE TYPOGRAPHY */}
        {(phase === 'npc_speaking' || phase === 'player_turn' || phase === 'free_input') && (
          <div className="space-y-1.5">
            <p className="text-base sm:text-lg text-white font-sans font-medium leading-relaxed tracking-wide">
              "{displayedText}"
              {!isTypewriterDone ? (
                <span className="inline-block w-2 h-4 bg-amber-400 ml-1.5 animate-pulse align-middle" />
              ) : (
                <span className="inline-block text-amber-400 text-sm ml-2 animate-bounce align-middle font-mono">
                  ▼
                </span>
              )}
            </p>

            {/* Optional On-Demand Chinese Translation */}
            {showTranslation && dialogNode.npcDialogueCnHint && (
              <p className="text-xs sm:text-sm text-slate-400 italic font-sans leading-relaxed pt-0.5 animate-in fade-in duration-200">
                "{dialogNode.npcDialogueCnHint}"
              </p>
            )}
          </div>
        )}

        {/* B. Evaluating AI Free Response: Game-like thinking state */}
        {phase === 'evaluating_ai' && (
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center gap-3 text-xs sm:text-sm text-slate-200 animate-pulse font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span>{speaker.name} is listening to what you said...</span>
          </div>
        )}

        {/* C. Reaction Phase: Show Player's speech & NPC's immediate spoken reply */}
        {phase === 'npc_reacting' && activeOption && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Player's speech echo */}
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-200 bg-amber-950/30 border-l-4 border-amber-400 px-3.5 py-2 rounded-r-xl font-sans leading-relaxed">
              <span className="text-amber-400 font-mono font-black shrink-0">YOU:</span>
              <span>"{activeOption.englishText}"</span>
            </div>

            {/* NPC's immediate spoken reply */}
            <div className="space-y-2">
              <p className="text-base sm:text-lg text-white font-sans font-medium leading-relaxed tracking-wide">
                "{reactionText}"
                {!isReactionDone && (
                  <span className="inline-block w-2 h-4 bg-amber-400 ml-1.5 animate-pulse align-middle" />
                )}
              </p>

              {/* Optional Subtle AI Polish Alternative */}
              {aiAlternative && (
                <div className="text-xs sm:text-sm font-sans text-sky-200 bg-sky-950/40 border border-sky-400/30 px-3 py-2 rounded-xl flex items-center gap-2">
                  <span className="font-bold text-sky-400 shrink-0 font-mono">💡 More natural:</span>
                  <span className="italic">"{aiAlternative}"</span>
                </div>
              )}

              {/* Brief Reward Micro-Feedback */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                {displayedXp > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold font-mono">
                    <Sparkles className="w-3.5 h-3.5" /> +{displayedXp} XP
                  </span>
                )}
                {activeOption.itemReward && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-300 font-bold font-sans">
                    🎫 {activeOption.itemReward.name}
                  </span>
                )}
              </div>
            </div>

            {/* Advance button */}
            {isReactionDone && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdvanceAfterReaction();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. PLAYER RESPONSES (Clean RPG Choices with dominant selected choice) */}
        {phase === 'player_turn' && (
          <div className="pt-2.5 border-t border-slate-800 space-y-2 animate-in fade-in duration-200">
            <div className="space-y-2">
              {dialogNode.options.map((option, idx) => {
                const isSelected = selectedChoiceIdx === idx;
                return (
                  <button
                    key={option.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOption(option);
                    }}
                    onMouseEnter={() => setSelectedChoiceIdx(idx)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/50 border-2 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span
                      className={`font-mono font-black text-sm shrink-0 mt-0.5 ${
                        isSelected ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      {isSelected ? '▶' : ' '}
                    </span>
                    <span className="text-sm sm:text-[15px] font-sans font-medium leading-relaxed flex-1">
                      "{option.englishText}"
                    </span>
                  </button>
                );
              })}

              {/* [ Say it yourself ] Option Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPhase('free_input');
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-amber-400/60 text-xs sm:text-sm text-slate-400 hover:text-amber-300 transition-all cursor-pointer font-mono"
              >
                <span>[ Say it yourself ]</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Keyboard Hint */}
            <div className="flex justify-end pt-1 text-[11px] font-mono text-slate-500">
              <span>Use ↑ / ↓ to choose · [ E ] or Enter to Select</span>
            </div>
          </div>
        )}

        {/* 5. FREE SPEECH / CUSTOM INPUT MODE */}
        {phase === 'free_input' && (
          <form
            onSubmit={handleFreeSubmit}
            onClick={(e) => e.stopPropagation()}
            className="pt-2.5 border-t border-slate-800 space-y-2.5 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-mono font-bold">
              <span>WHAT DO YOU WANT TO SAY?</span>
              <button
                type="button"
                onClick={() => setPhase('player_turn')}
                className="text-amber-400 hover:text-amber-300 cursor-pointer font-bold"
              >
                ← Back to choices
              </button>
            </div>

            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={`Speak to ${speaker.name} in English...`}
                className="flex-1 bg-slate-900 border-2 border-slate-700 rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-sans text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!freeText.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-md font-mono"
              >
                <span>SEND</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
