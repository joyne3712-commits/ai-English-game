import React, { useState, useEffect, useRef } from 'react';
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
  ChapterState,
  SelectedFlight,
  DiscoveredInfo,
} from './types';
import { GameHUD } from './components/GameHUD';
import { AirportScene } from './components/AirportScene';
import { RpgDialogueBox } from './components/RpgDialogueBox';
import { InventoryModal } from './components/InventoryModal';
import { QuestLogModal } from './components/QuestLogModal';
import { MissionCompleteScreen } from './components/MissionCompleteScreen';
import { BoardingCutscene } from './components/BoardingCutscene';
import { OpeningCutscene } from './components/OpeningCutscene';
import { StoryIntroModal } from './components/StoryIntroModal';
import { ControlsTutorialBanner } from './components/ControlsTutorialBanner';
import { PersistentQuestTracker } from './components/PersistentQuestTracker';
import { PhoneJournalModal } from './components/PhoneJournalModal';
import { MobileJournalModal } from './components/MobileJournalModal';
import { QuestNotificationToast, QuestNotificationData } from './components/QuestNotificationToast';
import { sound } from './services/soundService';
import { formatMinutes } from './components/airport/timeCycle';

export default function App() {
  // Chapter State Machine
  const [chapterState, setChapterState] = useState<ChapterState>('INTRO');

  // Discovered Information State
  const [discoveredInfo, setDiscoveredInfo] = useState<DiscoveredInfo>({
    boardInspectedCount: 0,
    flightCancelledKnown: false,
    alternativeFlightsKnown: false,
    selectedFlight: null,
    luggageTransferKnown: false,
    hotelCheckInKnown: true,
    hotelContacted: false,
    gateChangedKnown: false,
    boardingPassErrorDiscovered: false,
    boardingPassVerified: false,
    completedNpcDialogues: {},
  });

  // Opening Cutscene & Arrival Flow States
  const [isCutsceneActive, setIsCutsceneActive] = useState<boolean>(true);
  const [isIntroWalking, setIsIntroWalking] = useState<boolean>(false);
  const [showFlightCancelAlert, setShowFlightCancelAlert] = useState<boolean>(false);
  const [playerAlert, setPlayerAlert] = useState<string | null>(null);

  // New Player Onboarding Flow: Story Introduction Modal & First-Time Controls
  const [showStoryIntro, setShowStoryIntro] = useState<boolean>(false);
  const [showControlsTutorial, setShowControlsTutorial] = useState<boolean>(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // In-Game Narrative Time State (Starts at 20:15 JST in Tokyo)
  const [inGameMinutes, setInGameMinutes] = useState<number>(20 * 60 + 15);

  // Game HUD & Player Stats
  const [hp, setHp] = useState<number>(100);
  const maxHp = 100;
  const [xp, setXp] = useState<number>(0);
  const [money, setMoney] = useState<number>(120);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Persistent Quest State & Inventory
  const [goals, setGoals] = useState<QuestGoal[]>(INITIAL_QUEST_GOALS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);

  // NPC Dialogue States System
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
  const [isBoardingCutsceneActive, setIsBoardingCutsceneActive] = useState<boolean>(false);

  // Gate change turning point state (Gate 22 / Gate 31 -> Gate 18)
  const [isGateChanged, setIsGateChanged] = useState<boolean>(false);

  // Check if player has rebooked flight slip
  const hasRebookSlip = inventory.some(
    (item) =>
      item.id === 'flight_rebook_slip' ||
      item.id === 'flight_rebook_slip_31' ||
      item.id === 'boarding_pass_new'
  );
  // Check if player has the verified boarding pass
  const hasBoardingPassVerified = inventory.some((item) => item.id === 'boarding_pass_verified');

  // Dynamic Current Situation description for Journal
  const currentSituation = isGateChanged
    ? 'All flights to San Francisco are consolidated at Gate 18 (West Concourse). Boarding has commenced.'
    : discoveredInfo.selectedFlight === 'UA921'
    ? 'You are confirmed on UA921 (21:30) at Gate 22. Boarding starts shortly.'
    : discoveredInfo.selectedFlight === 'UA937'
    ? 'You are confirmed on UA937 (23:10) at Gate 31. Arriving late in SF tonight.'
    : 'Flight UA889 to San Francisco has been cancelled. Figure out what to do.';

  // Subtle In-Game Hint System
  const lastProgressTimeRef = useRef<number>(Date.now());
  const [subtleHint, setSubtleHint] = useState<string | null>(null);

  useEffect(() => {
    lastProgressTimeRef.current = Date.now();
    setSubtleHint(null);
  }, [goals]);

  useEffect(() => {
    if (isCutsceneActive || showStoryIntro || isMissionComplete) return;

    const timer = setInterval(() => {
      const elapsed = Date.now() - lastProgressTimeRef.current;
      const activeGoal = goals.find((g) => g.status === 'ACTIVE');
      if (!activeGoal) return;

      if (elapsed >= 65000 && !subtleHint) {
        if (activeGoal.id === 'obj_figure_out') {
          setSubtleHint("I should check the departure board or ask around.");
        } else if (activeGoal.id === 'obj_find_replacement') {
          setSubtleHint("Sarah at Passenger Service Counter B can help rebook flights.");
        } else if (activeGoal.id === 'obj_get_to_gate') {
          setSubtleHint(
            discoveredInfo.selectedFlight === 'UA937'
              ? 'I should head toward Gate 31 in the North Concourse.'
              : 'I should head toward Gate 22 down the concourse.'
          );
        } else if (activeGoal.id === 'obj_resolve_boarding_issue') {
          setSubtleHint("The boarding scanner had an error. Gate Agent Alex at the podium can verify my ticket.");
        }
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isCutsceneActive, showStoryIntro, isMissionComplete, goals, subtleHint, discoveredInfo.selectedFlight]);

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

  // Narrative clock advancement helper
  const advanceTime = (minutes: number) => {
    setInGameMinutes((prev) => (prev + minutes) % 1440);
  };

  // Keyboard shortcut listener for in-game Phone/Journal (Keys [P] or [J])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        title: 'Figure out what to do',
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

  // Cycle through iconic times of day
  const handleCycleTime = () => {
    sound.playClick();
    const presets = [
      20 * 60 + 15, // 20:15 Evening
      21 * 60 + 0,  // 21:00 Boarding Rush
      22 * 60 + 30, // 22:30 Late Night
      23 * 60 + 15, // 23:15 Midnight
    ];
    const currentIdx = presets.findIndex((p) => Math.abs(p - inGameMinutes) < 30);
    const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % presets.length;
    setInGameMinutes(presets[nextIdx]);
  };

  // Mark an objective complete and activate the next one
  const completeObjective = (objectiveId: string) => {
    setGoals((prevGoals) => {
      const targetIndex = prevGoals.findIndex((g) => g.id === objectiveId);
      if (targetIndex === -1) return prevGoals;
      const target = prevGoals[targetIndex];
      if (target.status === 'COMPLETED') return prevGoals;

      sound.playItemGet();

      setQuestNotification({
        id: Date.now(),
        type: 'complete',
        title: target.text,
        badge: target.completedBadge,
        xpGain: target.rewardXp,
      });

      const newGoals = prevGoals.map((g, idx) => {
        if (idx === targetIndex) {
          return { ...g, status: 'COMPLETED' as const };
        }
        return g;
      });

      const nextLockedIndex = newGoals.findIndex((g) => g.status === 'LOCKED');
      if (nextLockedIndex !== -1) {
        newGoals[nextLockedIndex] = {
          ...newGoals[nextLockedIndex],
          status: 'ACTIVE' as const,
        };

        setTimeout(() => {
          setQuestNotification({
            id: Date.now() + 1,
            type: 'new_objective',
            title: newGoals[nextLockedIndex].text,
          });
        }, 2400);
      }

      return newGoals;
    });
  };

  // Track player position reference without triggering 60 FPS full React re-renders on every game frame
  const playerPosRef = useRef<{ x: number; y: number }>(playerPos);
  const handleMovePlayer = (x: number, y: number) => {
    playerPosRef.current = { x, y };
  };

  // Open NPC dialogue dynamically based on current game state and history
  const openNpcDialogue = (npcId: string) => {
    advanceTime(5); // +5 minutes on talking to an NPC
    sound.playAirportChime();

    const nodeId = getNpcDialogueNode(npcId, chapterState, discoveredInfo);
    const node = DIALOGUE_NODES[nodeId] || DIALOGUE_NODES['sarah_intro'];
    setActiveDialogNode(node);
  };

  // Handle Hotspot Interactions
  const handleSelectHotspot = (hotspot: Hotspot) => {
    setActiveHotspot(hotspot);

    switch (hotspot.id) {
      case 'board': {
        advanceTime(2); // +2 min on inspecting board
        sound.playAirportChime();

        setDiscoveredInfo((prev) => ({
          ...prev,
          boardInspectedCount: prev.boardInspectedCount + 1,
          flightCancelledKnown: true,
          alternativeFlightsKnown: true,
        }));

        if (goals.find((g) => g.id === 'obj_figure_out')?.status === 'ACTIVE') {
          completeObjective('obj_figure_out');
        }
        if (isGateChanged) {
          completeObjective('obj_get_to_gate');
        }

        const hasSlip22 = inventory.some((i) => i.id === 'flight_rebook_slip') || discoveredInfo.selectedFlight === 'UA921';
        const hasSlip31 = inventory.some((i) => i.id === 'flight_rebook_slip_31') || discoveredInfo.selectedFlight === 'UA937';

        let boardText = '';
        if (isGateChanged) {
          boardText = `[URGENT GATE CONSOLIDATION ANNOUNCEMENT]\nALL SAN FRANCISCO DEPARTURES ➜ GATE 18 (WEST CONCOURSE)\nBoarding has commenced. All passengers please proceed to Gate 18 immediately.`;
        } else if (hasSlip22) {
          boardText = `[FLIGHT STATUS · CONFIRMED]\nUA 921 (21:30 to San Francisco SFO): ON TIME\nGate: Gate 22 · Boarding: 21:05\nPlease proceed down the concourse to Gate 22.`;
        } else if (hasSlip31) {
          boardText = `[FLIGHT STATUS · CONFIRMED]\nUA 937 (23:10 to San Francisco SFO): ON TIME\nGate: Gate 31 (North Concourse) · Boarding: 22:45\nPlease proceed to Gate 31 past security.`;
        } else {
          boardText = `[FLIGHT CANCELLATION NOTICE]\nUA 889 (20:40 to San Francisco SFO): CANCELLED\nReason: Equipment maintenance delay.\n\nAVAILABLE REPLACEMENT FLIGHTS:\n• UA 921 · 21:30 · Gate 22 (Earlier arrival in SF)\n• UA 937 · 23:10 · Gate 31 (Later flight · check hotel deadline)\n\nAffected passengers please proceed to Passenger Service Counter B across the hall. Agent Sarah is providing rebooking options.`;
        }

        setInspectModal({
          title: 'Flight Information Display',
          subtitle: `TOKYO INTERNATIONAL AIRPORT · ${formatMinutes(inGameMinutes)} JST`,
          content: boardText,
          actionText: '关闭 (Close)',
          onAction: () => setInspectModal(null),
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
        const hasSlip22 = inventory.some((i) => i.id === 'flight_rebook_slip') || discoveredInfo.selectedFlight === 'UA921';
        const hasSlip31 = inventory.some((i) => i.id === 'flight_rebook_slip_31') || discoveredInfo.selectedFlight === 'UA937';

        if (hasSlip22 || isGateChanged) {
          sound.playAirportChime();
          setIsGateChanged(true);
          completeObjective('obj_get_to_gate');

          setInspectModal({
            title: 'Gate 22: GATE CHANGE ALERT',
            subtitle: 'OPERATIONAL FLIGHT UPDATE · SFO FLIGHTS',
            content:
              '⚠️ ATTENTION PASSENGERS:\n\nAll San Francisco departures have experienced an operational GATE CHANGE.\n\nNEW DEPARTURE GATE: GATE 18 (West Concourse)\n\nPlease proceed to Gate 18 immediately. Boarding will begin shortly.',
            actionText: '查明 Gate 18 位置',
            onAction: () => {
              setInspectModal(null);
              openNpcDialogue('staff_david');
            },
          });
        } else if (hasSlip31) {
          sound.playMistake();
          setInspectModal({
            title: 'Gate 22: San Francisco (Wrong Gate)',
            subtitle: 'BOARDING GATE CHECK',
            content:
              'This is Gate 22 (21:30 departure).\nYour rebooking confirmation is for the 23:10 flight at Gate 31 in the North Concourse!',
            actionText: '返回 (Back)',
            onAction: () => setInspectModal(null),
          });
        } else {
          sound.playMistake();
          setInspectModal({
            title: 'Gate 22: San Francisco (Locked)',
            subtitle: 'BOARDING PASS REQUIRED',
            content:
              'The turnstile displays a flashing red light:\n"Valid rebooked ticket required to enter Gate 22."\n\nYou need to find out how to get rebooked onto a new flight with Sarah at Counter B before you can board.',
            actionText: '返回 (Back)',
            onAction: () => setInspectModal(null),
          });
        }
        break;
      }

      case 'gate_b31': {
        const hasSlip22 = inventory.some((i) => i.id === 'flight_rebook_slip') || discoveredInfo.selectedFlight === 'UA921';
        const hasSlip31 = inventory.some((i) => i.id === 'flight_rebook_slip_31') || discoveredInfo.selectedFlight === 'UA937';

        if (hasSlip31 || isGateChanged) {
          sound.playAirportChime();
          setIsGateChanged(true);
          completeObjective('obj_get_to_gate');

          setInspectModal({
            title: 'Gate 31: FLIGHT CONSOLIDATION ALERT',
            subtitle: 'OPERATIONAL FLIGHT UPDATE · SFO FLIGHTS',
            content:
              '⚠️ ATTENTION PASSENGERS:\n\nAll evening San Francisco flights have been consolidated into the express service departing now from GATE 18 (West Concourse)!\n\nPlease proceed to Gate 18 immediately to board.',
            actionText: '我知道了 (Understood)',
            onAction: () => setInspectModal(null),
          });
        } else if (hasSlip22) {
          sound.playMistake();
          setInspectModal({
            title: 'Gate 31: San Francisco (Wrong Gate)',
            subtitle: 'BOARDING GATE CHECK',
            content:
              'This is Gate 31 (23:10 departure).\nYour rebooking confirmation is for the 21:30 flight at Gate 22!',
            actionText: '返回 (Back)',
            onAction: () => setInspectModal(null),
          });
        } else {
          sound.playMistake();
          setInspectModal({
            title: 'Gate 31: San Francisco (Locked)',
            subtitle: 'BOARDING PASS REQUIRED',
            content:
              'The turnstile displays a flashing red light:\n"Valid rebooked ticket required to enter Gate 31."\n\nYou need to find an alternative flight before you can enter the departure gate.',
            actionText: '返回 (Back)',
            onAction: () => setInspectModal(null),
          });
        }
        break;
      }

      case 'gate_18': {
        if (hasBoardingPassVerified) {
          if (!hasPlayedBoardingSeq) {
            setIsBoardingSequenceActive(true);
            setHasPlayedBoardingSeq(true);
            sound.playAirportChime();
          } else {
            setIsBoardingEnteringDoor(true);
            setIsBoardingCelebrating(true);
            sound.playAirportChime();
            triggerReward('✓ BOARDING APPROVED · WELCOME ABOARD!');
          }
        } else {
          sound.playMistake();
          setChapterState('BOARDING_PASS_PROBLEM');
          setDiscoveredInfo((prev) => ({
            ...prev,
            boardingPassErrorDiscovered: true,
          }));

          if (goals.find((g) => g.id === 'obj_get_to_gate')?.status === 'ACTIVE') {
            completeObjective('obj_get_to_gate');
          }
          setInspectModal({
            title: 'Gate 18: San Francisco (Scanner Error)',
            subtitle: 'BOARDING SCANNER REQUIRED',
            content:
              'The gate scanner beeps with a red light:\n"Digital barcode sync error: Digital boarding pass unverified on local terminal."\n\nUnable to display boarding barcode on mobile.\nPlease speak with Gate Agent Alex at the podium to verify your reservation and print a paper boarding pass.',
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
        advanceTime(1);
        setInspectModal({
          title: 'Baggage Carousel 03 (Luggage Status)',
          subtitle: 'BAGGAGE LOGISTICS STATUS',
          content: hasRebookSlip
            ? '✅ Baggage System Update:\nYour checked bags have been retagged and routed directly to your flight to San Francisco!\n\nYou do NOT need to claim or re-check them in transit.'
            : '⚠️ Baggage System Status:\nUA 889 luggage from Ningbo is currently held in transit logistics.\nWhen you complete your flight rebooking with Sarah at Counter B, your baggage tags will automatically update to your new flight.',
          actionText: '关闭 (Close)',
          onAction: () => setInspectModal(null),
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

    if (option.coinGain !== 0) {
      setMoney((prev) => Math.max(0, Math.round((prev + option.coinGain) * 100) / 100));
      if (option.coinGain > 0) {
        sound.playCoin();
      } else {
        sound.playClick();
      }
    }

    if (option.hpChange > 0) {
      triggerReward(`+${option.hpChange} Energy 💖`);
    }

    // 2. Add inventory item if rewarded
    if (option.itemReward) {
      setInventory((prev) => {
        if (prev.some((item) => item.id === option.itemReward?.id)) return prev;
        sound.playItemGet();
        return [...prev, option.itemReward!];
      });

      // Story progression: advancing narrative time based on flight choice
      if (option.itemReward.id === 'flight_rebook_slip') {
        setInGameMinutes(21 * 60 + 5);
        triggerReward('🎫 REBOOKED · UA921 (21:30 · GATE 22)');
      } else if (option.itemReward.id === 'flight_rebook_slip_31') {
        setInGameMinutes(22 * 60 + 20);
        triggerReward('🎫 REBOOKED · UA937 (23:10 · GATE 31)');
      }

      if (option.itemReward.id === 'boarding_pass_verified') {
        sound.playItemGet();
        triggerReward('🎫 BOARDING PASS VERIFIED · READY TO BOARD');
      }
    }

    // 3. Update chapter state & flight choice if option advances
    if (option.advancesChapterState) {
      setChapterState(option.advancesChapterState);
    }
    if (option.selectsFlight) {
      setDiscoveredInfo((prev) => ({
        ...prev,
        selectedFlight: option.selectsFlight!,
      }));
    }

    // 4. Update NPC dialogue state and mark completed conversations
    if (option.setNpcState) {
      setNpcStates((prev) => ({
        ...prev,
        [option.setNpcState!.npcId]: option.setNpcState!.state,
      }));

      // Remember dialogue completion for anti-repetition requirement
      setDiscoveredInfo((prev) => ({
        ...prev,
        completedNpcDialogues: {
          ...prev.completedNpcDialogues,
          [`${option.setNpcState!.npcId}_done`]: true,
        },
      }));
    }

    // 5. Complete quest objective if option marks progression
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
      setActiveDialogNode({ ...nextNode });
    } else {
      setActiveDialogNode(null);
      const isBoardingVerified = inventory.some((item) => item.id === 'boarding_pass_verified');
      if (isBoardingVerified && !hasPlayedBoardingSeq) {
        setIsBoardingSequenceActive(true);
        setHasPlayedBoardingSeq(true);
      }
    }
  };

  // When the handoff and celebration walk to Gate 18 finishes
  const handleBoardingSequenceComplete = () => {
    setIsBoardingSequenceActive(false);
    setIsBoardingCelebrating(true);
    setPlayerPos({ x: 25, y: 22 });
    completeObjective('obj_resolve_boarding_issue');
    triggerReward('🎫 BOARDING PASS VERIFIED · GATE 18 READY');
    setQuestNotification({
      id: Date.now(),
      type: 'new_objective',
      title: 'Board the flight to San Francisco',
    });
  };

  // When player finishes walking up through the Gate 18 jet bridge door
  const handleBoardingEnteringDoorComplete = () => {
    setIsBoardingEnteringDoor(false);
    completeObjective('obj_board_flight');
    sound.playAirportChime();
    setIsBoardingCutsceneActive(true);
  };

  // Scene 4 finishes -> Start Scene 5 (Player walks into airport)
  const handleStartArrivalWalk = () => {
    setIsCutsceneActive(false);
    setIsIntroWalking(true);
    setPlayerPos({ x: 50, y: 95 });
  };

  // Scene 5 finishes (Player reached terminal hall) -> Start Scene 6 (Phone notification)
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
      title: 'Figure out what to do',
    });
  };

  // Restart / Reset Journey
  const handleRestart = () => {
    sound.playClick();
    setGoals(INITIAL_QUEST_GOALS);
    setInventory(INITIAL_INVENTORY);
    setChapterState('INTRO');
    setDiscoveredInfo({
      boardInspectedCount: 0,
      flightCancelledKnown: false,
      alternativeFlightsKnown: false,
      selectedFlight: null,
      luggageTransferKnown: false,
      hotelCheckInKnown: true,
      hotelContacted: false,
      gateChangedKnown: false,
      boardingPassErrorDiscovered: false,
      boardingPassVerified: false,
      completedNpcDialogues: {},
    });
    setNpcStates({
      sarah: 'SARAH_INTRO',
      barista: 'MIKE_INTRO',
    });
    setInGameMinutes(20 * 60 + 15);
    setHp(100);
    setXp(0);
    setMoney(120);
    setIsGateChanged(false);
    setIsMissionComplete(false);
    setIsBoardingCelebrating(false);
    setIsBoardingSequenceActive(false);
    setHasPlayedBoardingSeq(false);
    setIsBoardingEnteringDoor(false);
    setActiveDialogNode(null);
    setInspectModal(null);
    setIsCutsceneActive(true);
  };

  // Single current active goal
  const currentActiveGoal = goals.find((g) => g.status === 'ACTIVE');

  return (
    <div className="relative w-full h-screen bg-[#070b14] overflow-hidden select-none flex flex-col font-sans">
      {/* 1. TOP GAME HUD (Compact Mobile Bar / Full Desktop RPG Bar) */}
      <GameHUD
        chapterTitle="CH. 01 · THE CONNECTION"
        missionTitle={currentActiveGoal ? currentActiveGoal.text : 'All Objectives Complete!'}
        hp={hp}
        maxHp={maxHp}
        xp={xp}
        money={money}
        inventoryCount={inventory.length}
        uncompletedQuestsCount={goals.filter((g) => g.status !== 'COMPLETED').length}
        soundEnabled={soundEnabled}
        inGameMinutes={inGameMinutes}
        onCycleTime={handleCycleTime}
        onToggleSound={handleToggleSound}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenQuestLog={() => setIsQuestLogOpen(true)}
        onOpenPhone={() => setIsPhoneOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenControls={() => setShowStoryIntro(true)}
        onRestart={handleRestart}
        isDialogueActive={!!activeDialogNode}
      />

      {/* 2. DYNAMIC QUEST FEEDBACK TOAST */}
      <QuestNotificationToast
        notification={questNotification}
        onDismiss={() => setQuestNotification(null)}
      />

      {/* 3. FIRST-TIME CONTROLS TUTORIAL BANNER */}
      {showControlsTutorial && (
        <ControlsTutorialBanner onDismiss={() => setShowControlsTutorial(false)} />
      )}

      {/* 4. STORY INTRO MODAL (Onboarding Brief & Instructions) */}
      <StoryIntroModal
        isOpen={showStoryIntro}
        onContinue={() => setShowStoryIntro(false)}
      />

      {/* 5. MAIN VIEWPORT: PIXEL ART GAMEPLAY OR VICTORY SCREEN */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
        {isMissionComplete ? (
          <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center z-40 animate-in zoom-in-95 duration-500">
            <MissionCompleteScreen
              score={100}
              xp={xp}
              money={money}
              hp={hp}
              inventory={inventory}
              onRestart={handleRestart}
            />
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Opening Animated Cutscene Overlay */}
            {isCutsceneActive && (
              <div className="absolute inset-0 z-50">
                <OpeningCutscene
                  onStartArrivalWalk={handleStartArrivalWalk}
                  onSkipAll={() => {
                    setIsCutsceneActive(false);
                    setIsIntroWalking(false);
                    setShowStoryIntro(true);
                  }}
                  onStartGameplay={() => {
                    setIsCutsceneActive(false);
                    setIsIntroWalking(false);
                    setShowFlightCancelAlert(true);
                  }}
                />
              </div>
            )}

            {/* Aircraft Boarding Cutscene (Jetbridge, Cabin Doorway & In-Seat Window) */}
            {isBoardingCutsceneActive && (
              <div className="absolute inset-0 z-50">
                <BoardingCutscene
                  inventory={inventory}
                  selectedFlight={discoveredInfo.selectedFlight}
                  onComplete={() => {
                    setIsBoardingCutsceneActive(false);
                    setIsMissionComplete(true);
                  }}
                />
              </div>
            )}

            {/* Desktop Collapsible Quest Tracker (Hidden on mobile) */}
            <PersistentQuestTracker
              chapterTitle="CHAPTER 01"
              questName="THE CONNECTION"
              situation={currentSituation}
              goals={goals}
              discoveredInfo={discoveredInfo}
            />

            {/* 60 FPS Retro Pixel Art Canvas Airport Scene Engine */}
            <AirportScene
              hotspots={hotspots}
              activeHotspotId={activeHotspot?.id}
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

            {/* SMARTPHONE FLIGHT CANCELLED NOTIFICATION */}
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
                        "Your connecting flight has been cancelled."
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

            {/* Subtle internal thought / hint when player is stuck */}
            {subtleHint && !activeDialogNode && (
              <div className="absolute bottom-12 inset-x-4 z-30 pointer-events-auto flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-[#0b1329]/95 backdrop-blur-md border border-amber-400/60 px-3.5 py-1.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs text-amber-200 font-sans max-w-md">
                  <span className="text-base shrink-0">💭</span>
                  <span className="italic flex-1">"{subtleHint}"</span>
                  <button
                    onClick={() => setSubtleHint(null)}
                    className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* OBJECT INSPECT MODAL (Flight board, carousel, gate, etc.) */}
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

      {/* MOBILE COLLAPSIBLE JOURNAL & MENU MODAL */}
      <MobileJournalModal
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        chapterTitle="CH. 01"
        situation={currentSituation}
        goals={goals}
        inventory={inventory}
        discoveredInfo={discoveredInfo}
        onOpenInventory={() => setIsInventoryOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onRestart={handleRestart}
        inGameTimeFormatted={formatMinutes(inGameMinutes)}
      />

      {/* IN-GAME SMARTPHONE / TRAVEL JOURNAL MODAL */}
      <PhoneJournalModal
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        goals={goals}
        inventory={inventory}
        inGameTimeFormatted={formatMinutes(inGameMinutes)}
        isGateChanged={isGateChanged}
      />

      {/* INVENTORY BACKPACK MODAL */}
      <InventoryModal
        isOpen={isInventoryOpen}
        inventory={inventory}
        onClose={() => setIsInventoryOpen(false)}
      />

      {/* QUEST LOG MODAL */}
      <QuestLogModal
        isOpen={isQuestLogOpen}
        goals={goals}
        onClose={() => setIsQuestLogOpen(false)}
      />
    </div>
  );
}
