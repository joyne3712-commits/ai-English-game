import React, { useState, useEffect } from 'react';
import {
  AIRPORT_HOTSPOTS,
  CHAR_SARAH,
  CHAR_BARISTA,
  DIALOGUE_NODES,
  INITIAL_INVENTORY,
  INITIAL_QUEST_GOALS,
  getNpcDialogueNode,
} from './data/airportQuestData';
import {
  DialogNode,
  DialogueOption,
  Hotspot,
  InventoryItem,
  QuestGoal,
} from './types';
import { GameHUD } from './components/GameHUD';
import { AirportScene } from './components/AirportScene';
import { RpgDialogueBox } from './components/RpgDialogueBox';
import { InventoryModal } from './components/InventoryModal';
import { QuestLogModal } from './components/QuestLogModal';
import { MissionCompleteScreen } from './components/MissionCompleteScreen';
import { OpeningCutscene } from './components/OpeningCutscene';
import { StoryIntroModal } from './components/StoryIntroModal';
import { ControlsTutorialBanner } from './components/ControlsTutorialBanner';
import { PersistentQuestTracker } from './components/PersistentQuestTracker';
import { PhoneJournalModal } from './components/PhoneJournalModal';
import { QuestNotificationToast, QuestNotificationData } from './components/QuestNotificationToast';
import { sound } from './services/soundService';
import { formatMinutes } from './components/airport/timeCycle';

export default function App() {
  // Opening Cutscene & Arrival Flow States
  const [isCutsceneActive, setIsCutsceneActive] = useState<boolean>(true);
  const [isIntroWalking, setIsIntroWalking] = useState<boolean>(false);
  const [showFlightCancelAlert, setShowFlightCancelAlert] = useState<boolean>(false);
  const [playerAlert, setPlayerAlert] = useState<string | null>(null);

  // New Player Onboarding Flow: Story Introduction Modal & First-Time Controls
  const [showStoryIntro, setShowStoryIntro] = useState<boolean>(false);
  const [showControlsTutorial, setShowControlsTutorial] = useState<boolean>(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState<boolean>(false);

  // In-Game Time State (minutes from midnight 0 - 1440)
  // Starts around 17:35 (sunset golden hour) to immediately present warm golden floor and wall tinting
  const [inGameMinutes, setInGameMinutes] = useState<number>(17 * 60 + 35);

  // Game HUD & Player Stats
  const [hp, setHp] = useState<number>(100);
  const maxHp = 100;
  const [xp, setXp] = useState<number>(0);
  const [money, setMoney] = useState<number>(120);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Persistent Quest State & Inventory
  const [goals, setGoals] = useState<QuestGoal[]>(INITIAL_QUEST_GOALS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);

  // NPC Dialogue States System (Reusable across Sarah, Mike, and all future NPCs)
  const [npcStates, setNpcStates] = useState<Record<string, string>>({
    sarah: 'SARAH_INTRO',
    barista: 'MIKE_INTRO',
  });

  // Dynamic Quest Feedback Toast Notification
  const [questNotification, setQuestNotification] = useState<QuestNotificationData | null>(null);

  // World & Navigation State
  const [hotspots, setHotspots] = useState<Hotspot[]>(AIRPORT_HOTSPOTS);
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 50, y: 88 });
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  // Modals & Panels
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isQuestLogOpen, setIsQuestLogOpen] = useState(false);
  const [inspectModal, setInspectModal] = useState<{
    title: string;
    subtitle: string;
    content: string;
    actionText?: string;
    onAction?: () => void;
  } | null>(null);

  // Active Dialogue Flow State
  const [activeDialogNode, setActiveDialogNode] = useState<DialogNode | null>(null);

  // Floating RPG Reward Animation
  const [floatingReward, setFloatingReward] = useState<{ text: string; id: number } | null>(null);

  // Victory / Mission Cleared State
  const [isMissionComplete, setIsMissionComplete] = useState<boolean>(false);
  const [isBoardingCelebrating, setIsBoardingCelebrating] = useState<boolean>(false);
  const [isBoardingSequenceActive, setIsBoardingSequenceActive] = useState<boolean>(false);
  const [hasPlayedBoardingSeq, setHasPlayedBoardingSeq] = useState<boolean>(false);
  const [isBoardingEnteringDoor, setIsBoardingEnteringDoor] = useState<boolean>(false);

  // Gate change turning point state (Story: Gate 22 -> Gate 18)
  const [isGateChanged, setIsGateChanged] = useState<boolean>(false);

  // Check if player has the rebooked flight slip
  const hasRebookSlip = inventory.some(
    (item) => item.id === 'flight_rebook_slip' || item.id === 'boarding_pass_new'
  );
  // Check if player has the verified boarding pass
  const hasBoardingPassVerified = inventory.some((item) => item.id === 'boarding_pass_verified');

  // Trigger floating reward text
  const triggerReward = (text: string) => {
    setFloatingReward({ text, id: Date.now() });
    setTimeout(() => {
      setFloatingReward(null);
    }, 1800);
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
  };

  // Natural passage of time in the airport world (1 in-game minute every 3 seconds)
  useEffect(() => {
    if (isCutsceneActive || showStoryIntro) return;
    const interval = setInterval(() => {
      setInGameMinutes((prev) => (prev + 1) % 1440);
    }, 3000);
    return () => clearInterval(interval);
  }, [isCutsceneActive, showStoryIntro]);

  // Keyboard shortcut listener for in-game Phone/Journal (Keys [P] or [J])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in dialogue input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'KeyP' || e.code === 'KeyJ') {
        e.preventDefault();
        sound.playClick();
        setIsPhoneOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-dismiss quest notification toast after 4.5 seconds
  useEffect(() => {
    if (!questNotification) return;
    const timer = setTimeout(() => {
      setQuestNotification(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [questNotification]);

  // Auto-dismiss flight cancellation push notification after 4.2s
  useEffect(() => {
    if (!showFlightCancelAlert) return;
    const timer = setTimeout(() => {
      setShowFlightCancelAlert(false);
      setPlayerAlert(null);
      setShowControlsTutorial(true);
      sound.playItemGet();
      setQuestNotification({
        id: Date.now(),
        type: 'new_objective',
        title: 'Find someone who can help you',
      });
    }, 4200);
    return () => clearTimeout(timer);
  }, [showFlightCancelAlert]);

  // Auto-fade controls hint after 6s
  useEffect(() => {
    if (!showControlsTutorial) return;
    const timer = setTimeout(() => {
      setShowControlsTutorial(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, [showControlsTutorial]);

  // Cycle through iconic times of day (Afternoon -> Sunset -> Twilight -> Deep Night)
  const handleCycleTime = () => {
    sound.playClick();
    const presets = [
      14 * 60 + 30, // 14:30 Afternoon (Natural terminal daylight)
      17 * 60 + 35, // 17:35 Sunset (Warm golden hue & sunbeams)
      19 * 60 + 20, // 19:20 Twilight (Violet dusk)
      21 * 60 + 45, // 21:45 Deep Night (Cooler blue floor & downlights)
    ];
    const currentIdx = presets.findIndex((p) => Math.abs(p - inGameMinutes) < 55);
    const nextIdx = currentIdx === -1 ? 1 : (currentIdx + 1) % presets.length;
    setInGameMinutes(presets[nextIdx]);
  };

  // Robust Quest Progression System: Mark an objective complete and activate the next one
  const completeObjective = (objectiveId: string) => {
    setGoals((prevGoals) => {
      const targetIndex = prevGoals.findIndex((g) => g.id === objectiveId);
      if (targetIndex === -1) return prevGoals;
      const target = prevGoals[targetIndex];
      if (target.status === 'COMPLETED') return prevGoals;

      sound.playItemGet();

      // Trigger achievement feedback toast
      setQuestNotification({
        id: Date.now(),
        type: 'complete',
        title: target.text,
        badge: target.completedBadge,
        xpGain: target.rewardXp,
      });

      // Update target to COMPLETED
      const newGoals = prevGoals.map((g, idx) => {
        if (idx === targetIndex) {
          return { ...g, status: 'COMPLETED' as const };
        }
        return g;
      });

      // Find next LOCKED objective and activate it
      const nextLockedIndex = newGoals.findIndex((g) => g.status === 'LOCKED');
      if (nextLockedIndex !== -1) {
        newGoals[nextLockedIndex] = {
          ...newGoals[nextLockedIndex],
          status: 'ACTIVE' as const,
        };

        // Queue subsequent "NEW OBJECTIVE" notification
        setTimeout(() => {
          setQuestNotification({
            id: Date.now() + 1,
            type: 'new_objective',
            title: newGoals[nextLockedIndex].text,
          });
        }, 2600);
      }

      return newGoals;
    });
  };

  // Move player across the scene
  const handleMovePlayer = (x: number, y: number) => {
    setPlayerPos({ x, y });
  };

  // Open NPC dialogue dynamically based on their current state machine
  const openNpcDialogue = (npcId: string) => {
    sound.playAirportChime();
    const currentState = npcStates[npcId] || (npcId === 'sarah' ? 'SARAH_INTRO' : 'MIKE_INTRO');
    const activeGoal = goals.find((g) => g.status === 'ACTIVE');
    const node = getNpcDialogueNode(npcId, currentState, inventory, {
      currentObjectiveId: activeGoal?.id || '',
      isGateChanged,
      hasBoardingPassVerified,
    });
    setActiveDialogNode(node);
  };

  // Handle Hotspot Interactions
  const handleSelectHotspot = (hotspot: Hotspot) => {
    setActiveHotspot(hotspot);

    switch (hotspot.id) {
      case 'board': {
        sound.playAirportChime();
        if (isGateChanged) {
          completeObjective('obj_find_new_gate');
        }
        setInspectModal({
          title: 'Flight Information Display',
          subtitle: `PACIFIC RIM AIRPORT · TERMINAL 2 · ${formatMinutes(inGameMinutes)} PST`,
          content: isGateChanged
            ? `[URGENT GATE CHANGE ANNOUNCEMENT]\nUA 889 (18:40 to San Francisco SFO)\nSTATUS: GATE CHANGE ➜ GATE 18 (WEST CONCOURSE)\nBoarding has commenced. All passengers please proceed to Gate 18 immediately.`
            : hasRebookSlip
            ? `[STATUS UPDATE]\nUA 889 (14:30 SFO): CANCELLED\n\n✓ REBOOKED CONFIRMED:\nUA 889 (18:40 to San Francisco SFO): ON TIME\nGate: Gate 22 · Boarding: 18:15\nYour rebooking is complete. Please proceed to Gate 22.`
            : `[ALERT FLASHING]\nUA 889 (14:30 to San Francisco SFO): CANCELLED\nReason: Mechanical sensor maintenance.\n\nAll affected passengers please proceed to Passenger Service Counter B to speak with Agent Sarah for rebooking assistance.`,
          actionText: isGateChanged
            ? '前往 Gate 18'
            : hasRebookSlip
            ? '前往 Gate 22 登机口'
            : '前往 B 柜台找 Sarah 沟通',
          onAction: () => {
            setInspectModal(null);
            if (isGateChanged) {
              handleMovePlayer(25, 23);
              handleSelectHotspot(hotspots.find((h) => h.id === 'gate_18')!);
            } else if (hasRebookSlip) {
              handleMovePlayer(88, 72);
              handleSelectHotspot(hotspots.find((h) => h.id === 'gate_b22')!);
            } else {
              handleMovePlayer(50, 48);
              openNpcDialogue('sarah');
            }
          },
        });
        break;
      }

      case 'sarah_desk':
        openNpcDialogue('sarah');
        break;

      case 'cafe':
        openNpcDialogue('barista');
        break;

      case 'staff_david':
        openNpcDialogue('staff_david');
        break;

      case 'passenger_elena':
        openNpcDialogue('passenger_elena');
        break;

      case 'escalator':
        openNpcDialogue('escalator');
        break;

      case 'agent_alex':
        openNpcDialogue('agent_alex');
        break;

      case 'gate_b22': {
        // Turning point of Chapter 01: Discovering the gate change!
        if (
          hasRebookSlip ||
          goals.find((g) => g.id === 'obj_get_to_gate22')?.status === 'ACTIVE' ||
          isGateChanged
        ) {
          sound.playAirportChime();
          setIsGateChanged(true);
          completeObjective('obj_get_to_gate22');

          setInspectModal({
            title: 'Gate 22: GATE CHANGE ALERT',
            subtitle: 'FLIGHT OPERATIONS NOTICE · SFO FLIGHT UA 889',
            content:
              '⚠️ ATTENTION PASSENGERS:\n\nFlight UA 889 to San Francisco has experienced an operational GATE CHANGE.\n\nNEW DEPARTURE GATE: GATE 18 (West Concourse)\n\nPlease proceed to Gate 18 immediately. Boarding will begin shortly.',
            actionText: '查明 Gate 18 位置',
            onAction: () => {
              setInspectModal(null);
              // Prompt player to ask staff David or check signage
              openNpcDialogue('staff_david');
            },
          });
        } else {
          sound.playMistake();
          setInspectModal({
            title: 'Gate 22: San Francisco (Locked)',
            subtitle: 'BOARDING GATE ACCESS REQUIRED',
            content:
              'The turnstile displays a flashing red light:\n"Valid rebooked ticket required to enter Gate 22."\n\nYou need to talk with Sarah at Counter B to get rebooked onto a new flight before you can board!',
            actionText: '前往 B 柜台找 Sarah 沟通',
            onAction: () => {
              setInspectModal(null);
              handleMovePlayer(50, 48);
              openNpcDialogue('sarah');
            },
          });
        }
        break;
      }

      case 'gate_18': {
        // Gate 18 Boarding Door (West Concourse)
        if (hasBoardingPassVerified) {
          if (!hasPlayedBoardingSeq) {
            // Trigger the celebration hand-off & walk to gate sequence!
            setIsBoardingSequenceActive(true);
            setHasPlayedBoardingSeq(true);
            sound.playAirportChime();
          } else {
            // Player walks up into the jet bridge door!
            setIsBoardingEnteringDoor(true);
            setIsBoardingCelebrating(true);
            sound.playAirportChime();
            triggerReward('✓ BOARDING APPROVED · WELCOME ABOARD!');
          }
        } else {
          sound.playMistake();
          completeObjective('obj_get_to_gate18');
          setInspectModal({
            title: 'Gate 18: San Francisco (Boarding Pass Check)',
            subtitle: 'BOARDING SCANNER REQUIRED',
            content:
              'Scanner displays an error message:\n"Digital barcode sync error: Boarding pass not verified."\n\nPlease step over to the podium to speak with Gate Agent Alex to verify and print your boarding pass.',
            actionText: '找登机口地勤 Alex 核实',
            onAction: () => {
              setInspectModal(null);
              openNpcDialogue('agent_alex');
            },
          });
        }
        break;
      }

      case 'luggage': {
        sound.playStep();
        setInspectModal({
          title: 'Baggage Claim 03 (Luggage Conveyor)',
          subtitle: 'BAGGAGE LOGISTICS STATUS',
          content: hasRebookSlip
            ? '✅ Baggage System Update:\nYour checked bags have been retagged and routed directly to the evening flight UA 889 bound for San Francisco!\n\nYou do NOT need to claim or re-check them in transit.'
            : '⚠️ Baggage System Status:\nUA 889 luggage is currently staged in cargo holding.\nPlease complete your flight rebooking with Sarah at Counter B so your baggage tags can be updated for your new flight.',
          actionText: hasRebookSlip ? '返回大厅' : '去 B 柜台找 Sarah 改签',
          onAction: () => {
            setInspectModal(null);
            if (!hasRebookSlip) {
              handleMovePlayer(50, 48);
              openNpcDialogue('sarah');
            }
          },
        });
        break;
      }

      default:
        break;
    }
  };

  // Dialogue Option Chosen Handler
  const handleSelectDialogueOption = (option: DialogueOption) => {
    // 1. Update stats (HP, XP, Money)
    const newHp = Math.max(0, Math.min(maxHp, hp + option.hpChange));
    setHp(newHp);

    if (option.xpGain > 0) {
      setXp((prev) => prev + option.xpGain);
      sound.playCoin();
      triggerReward(`+${option.xpGain} XP`);
    }

    if (option.coinGain > 0) {
      setMoney((prev) => prev + option.coinGain);
    }

    // 2. Add inventory item if rewarded
    if (option.itemReward) {
      setInventory((prev) => {
        if (prev.some((item) => item.id === option.itemReward?.id)) return prev;
        sound.playItemGet();
        return [...prev, option.itemReward!];
      });

      // Story progression: advancing to evening 20:30 when player rebooks for the 21:30 connecting flight
      if (option.itemReward.id === 'boarding_pass_new') {
        setInGameMinutes(20 * 60 + 30);
      }
      if (option.itemReward.id === 'boarding_pass_verified') {
        sound.playItemGet();
        triggerReward('🎫 BOARDING PASS VERIFIED · READY TO BOARD');
        // Automatically close dialogue after a brief moment to transition seamlessly into the in-world hand-off & walking sequence!
        setTimeout(() => {
          setActiveDialogNode(null);
          setIsBoardingSequenceActive(true);
          setHasPlayedBoardingSeq(true);
        }, 1200);
      }
    }

    // 3. Update NPC dialogue state if option transitions NPC
    if (option.setNpcState) {
      setNpcStates((prev) => ({
        ...prev,
        [option.setNpcState!.npcId]: option.setNpcState!.state,
      }));
    }

    // 4. Complete quest objective if option marks progression
    if (option.completesGoalId) {
      completeObjective(option.completesGoalId);
    }
  };

  // Advance to next dialogue node (called from RpgDialogueBox)
  const handleAdvanceDialogue = (nextId: string | null) => {
    if (nextId && DIALOGUE_NODES[nextId]) {
      const nextNode = DIALOGUE_NODES[nextId];
      if (nextNode.onEnterNpcState) {
        setNpcStates((prev) => ({
          ...prev,
          [nextNode.onEnterNpcState!.npcId]: nextNode.onEnterNpcState!.state,
        }));
      }
      if (nextNode.completesObjectiveIdOnEnter) {
        completeObjective(nextNode.completesObjectiveIdOnEnter);
      }
      setActiveDialogNode(nextNode);
    } else {
      setActiveDialogNode(null);
      // If we just verified the boarding pass with Alex and haven't played the sequence yet, trigger it!
      if (hasBoardingPassVerified && !hasPlayedBoardingSeq) {
        setIsBoardingSequenceActive(true);
        setHasPlayedBoardingSeq(true);
      }
    }
  };

  // When the handoff and celebration walk to Gate 18 finishes
  const handleBoardingSequenceComplete = () => {
    setIsBoardingSequenceActive(false);
    setIsBoardingCelebrating(true);
    setPlayerPos({ x: 25, y: 22 }); // Positioned right at Gate 18 entry
    completeObjective('obj_boarding_pass');
    triggerReward('🎫 BOARDING PASS VERIFIED · GATE 18 READY');
    setQuestNotification({
      id: Date.now(),
      type: 'new_objective',
      title: 'Board Flight UA889 at Gate 18',
    });
  };

  // When player finishes walking up through the Gate 18 jet bridge door
  const handleBoardingEnteringDoorComplete = () => {
    setIsBoardingEnteringDoor(false);
    completeObjective('obj_board_flight');
    sound.playAirportChime();
    setIsMissionComplete(true);
  };

  // Scene 4 finishes -> Start Scene 5 (Player walks into airport)
  const handleStartArrivalWalk = () => {
    setIsCutsceneActive(false);
    setIsIntroWalking(true);
    setPlayerPos({ x: 50, y: 95 });
  };

  // Scene 5 finishes (Player reached terminal hall) -> Start Scene 6 (Phone notification & thought bubble)
  const handleIntroWalkReachTarget = () => {
    setIsIntroWalking(false);
    setShowFlightCancelAlert(true);
    setPlayerAlert('Wait... what?');
    sound.playPhoneVibrate();
    sound.playPhoneNotification();
  };

  // Scene 6 dismissed -> Scene 7 (Transition to Gameplay)
  const handleDismissFlightCancel = () => {
    setShowFlightCancelAlert(false);
    setPlayerAlert(null);
    setShowControlsTutorial(true);
    sound.playItemGet();
    setQuestNotification({
      id: Date.now(),
      type: 'new_objective',
      title: 'Find someone who can help you',
    });
  };

  // Skip cutscene completely to gameplay
  const handleSkipAll = () => {
    setIsCutsceneActive(false);
    setIsIntroWalking(false);
    setShowFlightCancelAlert(false);
    setPlayerAlert(null);
    setShowStoryIntro(false);
    setShowControlsTutorial(true);
    setPlayerPos({ x: 50, y: 88 });
    sound.playItemGet();
    setQuestNotification({
      id: Date.now(),
      type: 'new_objective',
      title: 'Find someone who can help you',
    });
  };

  // Player clicks "ENTER AIRPORT" on Story Intro card if opened
  const handleConfirmStoryIntro = () => {
    setShowStoryIntro(false);
    setShowControlsTutorial(true);
    sound.playItemGet();
    setQuestNotification({
      id: Date.now(),
      type: 'new_objective',
      title: 'Find someone who can help you',
    });
  };

  // Reset entire game cleanly
  const handleRestart = () => {
    sound.playClick();
    setHp(100);
    setXp(0);
    setMoney(120);
    setGoals(INITIAL_QUEST_GOALS);
    setInventory(INITIAL_INVENTORY);
    setNpcStates({
      sarah: 'SARAH_INTRO',
      barista: 'MIKE_INTRO',
    });
    setPlayerPos({ x: 50, y: 88 });
    setActiveHotspot(null);
    setActiveDialogNode(null);
    setInspectModal(null);
    setQuestNotification(null);
    setIsPhoneOpen(false);
    setIsMissionComplete(false);
    setIsGateChanged(false);
    setIsCutsceneActive(true);
    setIsIntroWalking(false);
    setShowFlightCancelAlert(false);
    setPlayerAlert(null);
    setShowStoryIntro(false);
    setShowControlsTutorial(false);
    setIsBoardingCelebrating(false);
    setIsBoardingSequenceActive(false);
    setHasPlayedBoardingSeq(false);
    setIsBoardingEnteringDoor(false);
    setInGameMinutes(17 * 60 + 35);
  };

  // Current active objective
  const currentActiveGoal = goals.find((g) => g.status === 'ACTIVE') || null;
  const uncompletedQuestsCount = goals.filter((g) => g.status !== 'COMPLETED').length;

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950 relative">
      {/* 0. OPENING CUTSCENE (Scenes 1-4: Title -> Travel Setup -> Destination -> Airplane) */}
      {isCutsceneActive && (
        <OpeningCutscene
          onStartArrivalWalk={handleStartArrivalWalk}
          onSkipAll={handleSkipAll}
          onStartGameplay={handleSkipAll}
        />
      )}

      {/* 1. STORY PROLOGUE INTRO CARD (Answering: Who am I? What happened? What is my goal?) */}
      <StoryIntroModal
        isOpen={showStoryIntro}
        onContinue={handleConfirmStoryIntro}
      />

      {/* 2. FIRST-TIME BASIC CONTROLS TUTORIAL */}
      {showControlsTutorial && !showStoryIntro && !isCutsceneActive && (
        <ControlsTutorialBanner onDismiss={() => setShowControlsTutorial(false)} />
      )}

      {/* 3. PERSISTENT QUEST TRACKER WIDGET (Always visible at top-left) */}
      {!isCutsceneActive && !showStoryIntro && (
        <PersistentQuestTracker
          chapterTitle="CHAPTER 01"
          questName="THE CANCELLED FLIGHT"
          goals={goals}
        />
      )}

      {/* 4. TOP MINIMAL GAME HUD */}
      <GameHUD
        chapterTitle="Chapter 01 · Airport"
        missionTitle={currentActiveGoal ? currentActiveGoal.text : 'All Objectives Completed!'}
        hp={hp}
        maxHp={maxHp}
        xp={xp}
        money={money}
        inventoryCount={inventory.length}
        uncompletedQuestsCount={uncompletedQuestsCount}
        soundEnabled={soundEnabled}
        inGameMinutes={inGameMinutes}
        onCycleTime={handleCycleTime}
        onToggleSound={handleToggleSound}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenQuestLog={() => setIsQuestLogOpen(true)}
        onOpenPhone={() => setIsPhoneOpen(true)}
        onOpenControls={() => setShowControlsTutorial(true)}
        onRestart={handleRestart}
      />

      {/* CRISP QUEST OBJECTIVE COMPLETION / NEW OBJECTIVE FEEDBACK TOAST */}
      <QuestNotificationToast
        notification={questNotification}
        onDismiss={() => setQuestNotification(null)}
      />

      {/* 5. MAIN ADVENTURE VIEWPORT */}
      <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
        {/* Victory Screen */}
        {isMissionComplete ? (
          <div className="flex-1 overflow-y-auto pt-16 px-4 pb-8 flex items-center justify-center">
            <MissionCompleteScreen
              score={xp * 2 + money}
              xp={xp}
              money={money}
              hp={hp}
              inventory={inventory}
              onRestart={handleRestart}
            />
          </div>
        ) : (
          <div className="relative w-full h-full flex-1 overflow-hidden">
            {/* World Exploration Canvas - Fills the entire screen */}
            <AirportScene
              hotspots={hotspots}
              activeHotspotId={activeHotspot?.id || null}
              onSelectHotspot={handleSelectHotspot}
              hasBoardingPass={hasRebookSlip}
              playerPos={playerPos}
              onMovePlayer={handleMovePlayer}
              floatingReward={floatingReward}
              interactingNpcId={activeDialogNode?.speaker.id || null}
              isDialogueActive={!!activeDialogNode}
              playerAlert={playerAlert}
              isIntroWalking={isIntroWalking}
              onIntroWalkReachTarget={handleIntroWalkReachTarget}
              inGameMinutes={inGameMinutes}
              activeObjectiveId={currentActiveGoal?.id || null}
              isGateChanged={isGateChanged}
              hasBoardingPassVerified={hasBoardingPassVerified}
              isBoardingCelebrating={isBoardingCelebrating}
              isBoardingSequenceActive={isBoardingSequenceActive}
              onBoardingSequenceComplete={handleBoardingSequenceComplete}
              isBoardingEnteringDoor={isBoardingEnteringDoor}
              onBoardingEnteringDoorComplete={handleBoardingEnteringDoorComplete}
            />

            {/* SCENE 6: SMARTPHONE FLIGHT CANCELLED PUSH NOTIFICATION */}
            {showFlightCancelAlert && (
              <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in slide-in-from-top-6 duration-300">
                <div
                  className="bg-[#0b101b]/95 backdrop-blur-xl border border-amber-400/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-4 font-mono text-slate-100"
                  style={{
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 25px rgba(239, 68, 68, 0.25)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center shadow flex-shrink-0 border border-white/20">
                      <span className="text-lg">✈️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
                          UNITED AIRLINES
                        </span>
                        <span className="text-[10px] text-slate-400">NOW</span>
                      </div>
                      <div className="text-xs font-bold text-white">FLIGHT UA889</div>
                      <div className="text-sm font-black text-rose-400 tracking-wider mt-0.5 animate-pulse">
                        CANCELLED
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-sans">
                        "Please contact the passenger service desk."
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Tap or click to continue</span>
                    <button
                      onClick={handleDismissFlightCancel}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase cursor-pointer transition-colors shadow"
                    >
                      CONTINUE
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Dialogue Box - Docked at Bottom inside the game screen */}
            {activeDialogNode && (
              <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-8 z-40 max-w-3xl mx-auto pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
                <RpgDialogueBox
                  dialogNode={activeDialogNode}
                  onSelectOption={handleSelectDialogueOption}
                  onAdvanceNode={handleAdvanceDialogue}
                  onClose={() => setActiveDialogNode(null)}
                  hp={hp}
                />
              </div>
            )}

            {/* Ambient Dynamic Quest Objective Prompt at bottom when no dialog is active */}
            {!activeDialogNode && currentActiveGoal && !showStoryIntro && (
              <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-25 pointer-events-none flex justify-center">
                <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/10 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-2xl flex items-center gap-2.5 sm:gap-3 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-slate-300 font-mono text-[11px] sm:text-xs">
                    OBJECTIVE: {currentActiveGoal.text}
                  </span>
                  <button
                    onClick={() => {
                      sound.playStep();
                      switch (currentActiveGoal.id) {
                        case 'obj_find_help':
                          handleMovePlayer(50, 48);
                          openNpcDialogue('sarah');
                          break;
                        case 'obj_get_to_gate22':
                          handleMovePlayer(88, 72);
                          handleSelectHotspot(hotspots.find((h) => h.id === 'gate_b22')!);
                          break;
                        case 'obj_find_new_gate':
                          handleMovePlayer(53, 52);
                          openNpcDialogue('staff_david');
                          break;
                        case 'obj_get_to_gate18':
                          handleMovePlayer(25, 23);
                          handleSelectHotspot(hotspots.find((h) => h.id === 'gate_18')!);
                          break;
                        case 'obj_boarding_pass':
                          handleMovePlayer(22, 23);
                          openNpcDialogue('agent_alex');
                          break;
                        case 'obj_board_flight':
                          handleMovePlayer(25, 23);
                          handleSelectHotspot(hotspots.find((h) => h.id === 'gate_18')!);
                          break;
                        default:
                          handleMovePlayer(50, 48);
                          openNpcDialogue('sarah');
                          break;
                      }
                    }}
                    className="px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] sm:text-[11px] font-mono transition-all cursor-pointer shadow-md"
                  >
                    {currentActiveGoal.id === 'obj_find_help' && 'Talk to Sarah ➜'}
                    {currentActiveGoal.id === 'obj_get_to_gate22' && 'Go to Gate 22 ➜'}
                    {currentActiveGoal.id === 'obj_find_new_gate' && 'Ask Staff David ➜'}
                    {currentActiveGoal.id === 'obj_get_to_gate18' && 'Go to Gate 18 ➜'}
                    {currentActiveGoal.id === 'obj_boarding_pass' && 'Talk to Agent Alex ➜'}
                    {currentActiveGoal.id === 'obj_board_flight' && 'Board at Gate 18 ➜'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 6. OBJECT INSPECT MODAL (Flight board, carousel, gate, etc.) */}
      {inspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                {inspectModal.subtitle}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {inspectModal.title}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800 whitespace-pre-line font-mono">
              {inspectModal.content}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setInspectModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
              >
                关闭
              </button>

              {inspectModal.onAction && (
                <button
                  onClick={inspectModal.onAction}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium shadow transition-all cursor-pointer"
                >
                  {inspectModal.actionText || '前往查看'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. IN-GAME SMARTPHONE / TRAVEL JOURNAL MODAL */}
      <PhoneJournalModal
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        goals={goals}
        inventory={inventory}
        inGameTimeFormatted={formatMinutes(inGameMinutes)}
        isGateChanged={isGateChanged}
      />

      {/* 8. INVENTORY BACKPACK MODAL */}
      <InventoryModal
        isOpen={isInventoryOpen}
        inventory={inventory}
        onClose={() => setIsInventoryOpen(false)}
      />

      {/* 9. QUEST LOG MODAL */}
      <QuestLogModal
        isOpen={isQuestLogOpen}
        goals={goals}
        onClose={() => setIsQuestLogOpen(false)}
      />
    </div>
  );
}
