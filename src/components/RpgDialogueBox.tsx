import React, { useState, useEffect, useRef } from 'react';
import { DialogNode, DialogueOption, Character } from '../types';
import { sound } from '../services/soundService';
import { evaluatePlayerFreeResponse, AiEvaluationResult } from '../services/aiDialogueService';
import { Volume2, X, ChevronRight, Globe, Lightbulb, Sparkles, Send, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showLearningTools, setShowLearningTools] = useState<boolean>(false);
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
    setShowLearningTools(false);
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
      } else {
        // fast typing
      }
    }, 16);

    return () => clearInterval(interval);
  }, [phase, reactionText]);

  // Fast forward typewriter or continue to player choices
  const handleNpcSpeakingContinue = () => {
    if (!isTypewriterDone) {
      setDisplayedText(dialogNode.npcDialogue);
      setIsTypewriterDone(true);
    } else {
      sound.playClick();
      setPhase('player_turn');
    }
  };

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      sound.stopSpeaking();
    };
  }, []);

  // Keyboard navigation & selection on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        sound.stopSpeaking();
        onClose();
        return;
      }

      if (phase === 'free_input' || phase === 'evaluating_ai') return;

      if (phase === 'npc_speaking') {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
          e.preventDefault();
          handleNpcSpeakingContinue();
        }
        return;
      }

      if (phase === 'player_turn') {
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
  }, [phase, isTypewriterDone, isReactionDone, selectedChoiceIdx, dialogNode.options, onClose]);

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
    sound.stopSpeaking();
    sound.playClick();
    if (!activeOption) {
      onClose();
      return;
    }
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

  // Restrict to max 3 choices as per Requirement 10
  const displayedOptions = dialogNode.options.slice(0, 3);

  return (
    <div
      className="w-full bg-[#080d1a]/98 border-2 border-slate-600 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-3.5 sm:p-5 backdrop-blur-xl relative overflow-hidden transition-all duration-200 text-slate-100 max-h-[46vh] sm:max-h-[50vh] flex flex-col justify-between"
      style={{
        boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(245, 158, 11, 0.25)',
      }}
    >
      {/* Pixel decorative corner brackets */}
      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

      {/* 1. TOP BAR: SPEAKER IDENTITY & MINIMAL SECONDARY CONTROLS */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        {/* Speaker Name Tag */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm border bg-slate-900 border-amber-400/60 text-amber-300 shadow-sm shrink-0">
            {getNpcAvatar(speaker.avatarType)}
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-amber-400 text-sm sm:text-base tracking-wider uppercase font-mono">
              {speaker.name}
            </span>
            <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
              · {speaker.title}
            </span>
          </div>
        </div>

        {/* Minimal Audio & Learning Support */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* Small Audio Listen Button */}
          <button
            onClick={handleToggleAudio}
            className={`px-2 py-1 rounded-lg border font-mono text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Listen to pronunciation"
            aria-label="Listen to pronunciation"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Listen</span>
          </button>

          {/* Collapsible Learning Help Toggle */}
          {(dialogNode.npcDialogueCnHint || dialogNode.hintScaffolding) && (
            <button
              onClick={() => setShowLearningTools((prev) => !prev)}
              className={`px-2 py-1 rounded-lg border font-mono text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                showLearningTools
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Toggle learning help"
            >
              <span>+ Help</span>
              {showLearningTools ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {/* Close / Walk Away */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Leave conversation"
            aria-label="Close dialogue"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. OPTIONAL COLLAPSIBLE LEARNING SUPPORT PANEL (Progressive Disclosure) */}
      {showLearningTools && (
        <div className="mb-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs space-y-2 animate-in fade-in duration-150 font-sans">
          <div className="flex items-center gap-2">
            {/* On-Demand Translation Toggle */}
            {dialogNode.npcDialogueCnHint && (
              <button
                onClick={() => setShowTranslation((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                  showTranslation
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-950 border-slate-750 text-slate-300'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>{showTranslation ? 'Hide Translation' : 'Translate'}</span>
              </button>
            )}

            {/* In-Game Contextual Hint Toggle */}
            {dialogNode.hintScaffolding && (
              <button
                onClick={() => setShowHint((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                  showHint
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-950 border-slate-750 text-slate-300'
                }`}
              >
                <Lightbulb className="w-3 h-3" />
                <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
              </button>
            )}
          </div>

          {/* Translation content */}
          {showTranslation && dialogNode.npcDialogueCnHint && (
            <div className="text-xs text-slate-300 italic pt-1 border-t border-slate-800 font-sans">
              "{dialogNode.npcDialogueCnHint}"
            </div>
          )}

          {/* Hint content */}
          {showHint && dialogNode.hintScaffolding && (
            <div className="text-xs text-emerald-300 pt-1 border-t border-slate-800 font-sans">
              💡 {dialogNode.hintScaffolding.level1Cn}
              {dialogNode.hintScaffolding.level2Starter && (
                <div className="text-[11px] text-emerald-200 mt-0.5 font-mono">
                  Try starting with: "{dialogNode.hintScaffolding.level2Starter}"
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. MAIN DIALOGUE CONTENT AREA (Scrollable if needed, bottom docked) */}
      <div className="flex-1 overflow-y-auto pr-0.5">
        {/* STEP 1: NPC SPEAKS (Large, highly readable typography) */}
        {phase === 'npc_speaking' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div
              onClick={handleNpcSpeakingContinue}
              className="cursor-pointer space-y-1.5 py-1"
            >
              <p className="text-base sm:text-lg text-white font-sans font-medium leading-relaxed tracking-wide">
                "{displayedText}"
                {!isTypewriterDone ? (
                  <span className="inline-block w-2 h-4 bg-amber-400 ml-1.5 animate-pulse align-middle" />
                ) : (
                  <span className="inline-block text-amber-400 text-xs ml-2 animate-bounce align-middle font-mono">
                    ▼
                  </span>
                )}
              </p>
            </div>

            {/* Prominent Continue Button (Min 48px Touch Target) */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleNpcSpeakingContinue}
                className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-sm font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <span>{isTypewriterDone ? 'Continue' : 'Skip'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PLAYER TURN ("What do you want to say?") */}
        {phase === 'player_turn' && (
          <div className="space-y-2 animate-in fade-in duration-150">
            <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              WHAT DO YOU WANT TO SAY?
            </div>

            <div className="space-y-1.5">
              {displayedOptions.map((option, idx) => {
                const isSelected = selectedChoiceIdx === idx;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option)}
                    onMouseEnter={() => setSelectedChoiceIdx(idx)}
                    className={`w-full min-h-[48px] flex items-center gap-3 p-3 rounded-2xl transition-all text-left cursor-pointer active:scale-[0.99] ${
                      isSelected
                        ? 'bg-amber-950/50 border-2 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/70 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span
                      className={`font-mono font-black text-sm shrink-0 ${
                        isSelected ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      {isSelected ? '▶' : ' '}
                    </span>
                    <span className="text-sm sm:text-base font-sans font-medium leading-snug flex-1">
                      "{option.englishText}"
                    </span>
                  </button>
                );
              })}

              {/* [ Say it yourself ] Option Button */}
              <button
                onClick={() => {
                  setPhase('free_input');
                  setTimeout(() => inputRef.current?.focus(), 60);
                }}
                className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-900/40 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-amber-400/60 text-xs sm:text-sm text-slate-300 hover:text-amber-300 transition-all cursor-pointer font-mono"
              >
                <span>[ ⌨️ Say it yourself ]</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DEDICATED FREE SPEECH / CUSTOM INPUT STATE */}
        {phase === 'free_input' && (
          <form
            onSubmit={handleFreeSubmit}
            className="space-y-2.5 animate-in fade-in duration-150 py-1"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-mono font-bold">
              <span>SPEAK IN NATURAL ENGLISH</span>
              <button
                type="button"
                onClick={() => setPhase('player_turn')}
                className="text-amber-400 hover:text-amber-300 cursor-pointer font-bold"
              >
                ← Back to choices
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={inputRef}
                type="text"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={`Tell ${speaker.name} what you need...`}
                className="w-full min-h-[48px] bg-slate-900 border-2 border-slate-700 rounded-2xl px-3.5 py-2 text-sm sm:text-base font-sans text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!freeText.trim()}
                className="min-h-[48px] px-6 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md active:scale-95"
              >
                <span>SEND</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: EVALUATING AI FREE RESPONSE */}
        {phase === 'evaluating_ai' && (
          <div className="min-h-[60px] p-4 rounded-2xl bg-slate-900/80 border border-slate-700 flex items-center gap-3 text-sm text-slate-200 animate-pulse font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span>{speaker.name} is listening to what you said...</span>
          </div>
        )}

        {/* STEP 5: REACTION PHASE (NPC replies & confirms) */}
        {phase === 'npc_reacting' && activeOption && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Player's speech echo */}
            <div className="flex items-start gap-2 text-xs text-amber-200 bg-amber-950/30 border-l-4 border-amber-400 px-3 py-1.5 rounded-r-xl font-sans leading-relaxed">
              <span className="text-amber-400 font-mono font-black shrink-0">YOU:</span>
              <span className="truncate">"{activeOption.englishText}"</span>
            </div>

            {/* NPC's immediate spoken reply */}
            <div className="space-y-2">
              <p className="text-base sm:text-lg text-white font-sans font-medium leading-relaxed tracking-wide">
                "{reactionText}"
                {!isReactionDone && (
                  <span className="inline-block w-2 h-4 bg-amber-400 ml-1.5 animate-pulse align-middle" />
                )}
              </p>

              {/* Gentle Natural Alternative Tip (no score penalty) */}
              {aiAlternative && (
                <div className="text-xs font-sans text-sky-200 bg-sky-950/40 border border-sky-400/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <span className="font-bold text-sky-400 shrink-0 font-mono">💡 More natural:</span>
                  <span className="italic">"{aiAlternative}"</span>
                </div>
              )}

              {/* Reward Feedback */}
              <div className="flex items-center gap-3 text-xs">
                {displayedXp > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-bold font-mono">
                    <Sparkles className="w-3.5 h-3.5" /> +{displayedXp} XP
                  </span>
                )}
                {activeOption.itemReward && (
                  <span className="inline-flex items-center gap-1 text-emerald-300 font-bold font-sans">
                    🎫 {activeOption.itemReward.name}
                  </span>
                )}
              </div>
            </div>

            {/* Advance / Finish Button (Min 48px Touch Target, always accessible) */}
            <div className="pt-1 flex justify-end">
              <button
                onClick={handleAdvanceAfterReaction}
                className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <span>{activeOption.nextDialogNodeId ? 'Continue' : 'Finish & Close'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
