export interface InventoryItem {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  icon: string;
  acquiredAt?: string;
}

export type ObjectiveStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

export type ChapterState =
  | 'INTRO'
  | 'FLIGHT_NORMAL'
  | 'FLIGHT_DELAYED'
  | 'FLIGHT_CANCELLED'
  | 'INVESTIGATING'
  | 'ALTERNATIVE_FLIGHTS_FOUND'
  | 'FLIGHT_SELECTED'
  | 'GOING_TO_NEW_GATE'
  | 'BOARDING_PASS_PROBLEM'
  | 'BOARDING_RESOLVED'
  | 'HOTEL_CHECK_REQUIRED'
  | 'READY_TO_BOARD'
  | 'CHAPTER_COMPLETE';

export type SelectedFlight = 'UA921' | 'UA937' | null;

export interface DiscoveredInfo {
  boardInspectedCount: number;
  flightCancelledKnown: boolean;
  alternativeFlightsKnown: boolean;
  selectedFlight: SelectedFlight;
  luggageTransferKnown: boolean;
  hotelCheckInKnown: boolean;
  hotelContacted: boolean;
  gateChangedKnown: boolean;
  boardingPassErrorDiscovered: boolean;
  boardingPassVerified: boolean;
  completedNpcDialogues: Record<string, boolean>; // e.g., sarah_rebooked, mike_advised, staff_directed, alex_verified
}

export interface QuestGoal {
  id: string;
  order: number;
  text: string;
  textCn?: string;
  status: ObjectiveStatus;
  rewardXp: number;
  completedBadge?: string;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  role: string;
  avatarType: 'sarah' | 'barista' | 'announcer' | 'staff' | 'agent' | 'passenger';
  mood: 'neutral' | 'friendly' | 'helpful' | 'impressed' | 'annoyed' | 'confused';
}

export type DialogueInputMode = 'choice' | 'assemble' | 'free';

export interface DialogueOption {
  id: string;
  intentLabel?: string;
  intentLabelCn?: string;
  englishText: string;
  fragments?: string[];
  toneQuality: 'natural' | 'acceptable' | 'inappropriate';
  npcReply: string;
  npcMoodAfter: Character['mood'];
  hpChange: number;
  xpGain: number;
  coinGain: number;
  itemReward?: InventoryItem;
  chineseBrief?: string;
  betterAlternative?: string;
  nextDialogNodeId?: string;
  completesGoalId?: string;
  advancesChapterState?: ChapterState;
  selectsFlight?: SelectedFlight;
  setNpcState?: {
    npcId: string;
    state: string;
  };
}

export interface DialogNode {
  id: string;
  speaker: Character;
  npcDialogue: string;
  npcDialogueCnHint?: string;
  hintScaffolding?: {
    level1Cn: string;
    level2Starter?: string;
    level3Full?: string;
  };
  options: DialogueOption[];
  onEnterNpcState?: {
    npcId: string;
    state: string;
  };
  completesObjectiveIdOnEnter?: string;
}

export interface Hotspot {
  id: string;
  name: string;
  nameCn: string;
  icon: string;
  xPercent: number; // 0-100% position on airport canvas
  yPercent: number;
  type: 'npc' | 'board' | 'gate' | 'cafe' | 'luggage';
  statusLabel?: string;
  isUnlocked?: boolean;
}
