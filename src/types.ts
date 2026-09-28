export interface InventoryItem {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  icon: string;
  acquiredAt?: string;
}

export type ObjectiveStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

export interface QuestGoal {
  id: string;
  order: number;
  text: string;
  textCn?: string;
  status: ObjectiveStatus;
  rewardXp: number;
  completedBadge?: string; // e.g. "Sarah agreed to help"
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
    level1Cn: string; // e.g. "Sarah is asking what happened. Try explaining that your flight was cancelled."
    level2Starter?: string; // "My flight..."
    level3Full?: string;
  };
  options: DialogueOption[];
  // If this node automatically updates an NPC's state when reached
  onEnterNpcState?: {
    npcId: string;
    state: string;
  };
  // If reaching this node directly completes an objective
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
