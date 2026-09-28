import { DialogNode, Character, Hotspot, InventoryItem, QuestGoal } from '../types';

export const INITIAL_QUEST_GOALS: QuestGoal[] = [
  {
    id: 'obj_find_help',
    order: 1,
    text: 'Find someone who can help you',
    textCn: '寻找能够提供协助的地勤专员',
    status: 'ACTIVE',
    rewardXp: 30,
    completedBadge: 'Sarah agreed to help you',
  },
  {
    id: 'obj_get_to_gate22',
    order: 2,
    text: 'Get to Gate 22',
    textCn: '前往 Gate 22 登机口',
    status: 'LOCKED',
    rewardXp: 40,
    completedBadge: 'Discovered gate change',
  },
  {
    id: 'obj_find_new_gate',
    order: 3,
    text: 'Find out where your flight is now boarding',
    textCn: '查明航班最新改签登机口',
    status: 'LOCKED',
    rewardXp: 40,
    completedBadge: 'Discovered Gate 18',
  },
  {
    id: 'obj_get_to_gate18',
    order: 4,
    text: 'Get to Gate 18',
    textCn: '前往 Gate 18 登机口',
    status: 'LOCKED',
    rewardXp: 40,
    completedBadge: 'Arrived at Gate 18',
  },
  {
    id: 'obj_boarding_pass',
    order: 5,
    text: 'Get your boarding pass',
    textCn: '向登机口地勤解决登机牌问题',
    status: 'LOCKED',
    rewardXp: 50,
    completedBadge: 'Boarding pass verified',
  },
  {
    id: 'obj_board_flight',
    order: 6,
    text: 'Board the flight',
    textCn: '通过 Gate 18 闸机登机',
    status: 'LOCKED',
    rewardXp: 50,
    completedBadge: 'Boarded flight to San Francisco',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'passport',
    name: 'Passport & Old Ticket',
    nameCn: '中国护照与原机票 (UA 889)',
    description: '原定 14:30 飞往旧金山 (SFO)，因机械维护故障已显示 CANCELLED。',
    icon: '🛂',
  },
  {
    id: 'wallet',
    name: 'Travel Wallet',
    nameCn: '旅行钱包',
    description: '内含应急美元现金与信用卡。',
    icon: '👛',
  },
];

export const AIRPORT_HOTSPOTS: Hotspot[] = [
  {
    id: 'board',
    name: 'Flight Info Screen',
    nameCn: '航班航显大屏',
    icon: '📺',
    xPercent: 36,
    yPercent: 15,
    type: 'board',
    statusLabel: 'UA 889 · CANCELLED',
  },
  {
    id: 'sarah_desk',
    name: 'Passenger Service Counter B · Sarah',
    nameCn: '旅客服务 B 柜台 · Sarah',
    icon: '👩‍💼',
    xPercent: 51,
    yPercent: 37,
    type: 'npc',
    statusLabel: 'Passenger Assistance',
  },
  {
    id: 'cafe',
    name: 'Skyline Brew Cafe · Mike',
    nameCn: '天际咖啡 · Mike',
    icon: '☕',
    xPercent: 13,
    yPercent: 33,
    type: 'cafe',
    statusLabel: 'Open · Fresh Coffee',
  },
  {
    id: 'gate_b22',
    name: 'Gate 22: San Francisco',
    nameCn: 'Gate 22 登机口',
    icon: '🚪',
    xPercent: 91,
    yPercent: 58,
    type: 'gate',
    statusLabel: 'Flight UA 889',
    isUnlocked: false,
  },
  {
    id: 'staff_david',
    name: 'Airport Staff · David',
    nameCn: '机场地勤问讯 · David',
    icon: '🧑‍💼',
    xPercent: 53,
    yPercent: 52,
    type: 'npc',
    statusLabel: 'Airport Staff',
  },
  {
    id: 'passenger_elena',
    name: 'Passenger · Elena',
    nameCn: '候机旅客 · Elena',
    icon: '🧳',
    xPercent: 66,
    yPercent: 58,
    type: 'npc',
    statusLabel: 'Waiting Passenger',
  },
  {
    id: 'escalator',
    name: 'Concourse Escalator',
    nameCn: '航站楼自动扶梯',
    icon: '🛗',
    xPercent: 37,
    yPercent: 25,
    type: 'npc',
    statusLabel: 'To Gates 15–20',
  },
  {
    id: 'gate_18',
    name: 'Gate 18 Boarding Door',
    nameCn: 'Gate 18 登机通道',
    icon: '✈️',
    xPercent: 25,
    yPercent: 23,
    type: 'gate',
    statusLabel: 'UA 889 · San Francisco',
    isUnlocked: false,
  },
  {
    id: 'agent_alex',
    name: 'Gate 18 Agent · Alex',
    nameCn: 'Gate 18 地勤专员 · Alex',
    icon: '👨‍💼',
    xPercent: 20,
    yPercent: 23,
    type: 'npc',
    statusLabel: 'Gate Agent',
  },
  {
    id: 'luggage',
    name: 'Baggage Claim 03',
    nameCn: '行李传输带',
    icon: '🧳',
    xPercent: 17,
    yPercent: 79,
    type: 'luggage',
    statusLabel: 'Checked Bags En Route',
  },
];

export const CHAR_SARAH: Character = {
  id: 'sarah',
  name: 'Sarah',
  title: 'Passenger Service Agent',
  role: '航司地勤服务专员',
  avatarType: 'sarah',
  mood: 'neutral',
};

export const CHAR_BARISTA: Character = {
  id: 'barista',
  name: 'Mike',
  title: 'Barista',
  role: '天际咖啡师',
  avatarType: 'barista',
  mood: 'friendly',
};

export const CHAR_STAFF_DAVID: Character = {
  id: 'staff_david',
  name: 'David',
  title: 'Airport Staff',
  role: '航站楼地勤引导员',
  avatarType: 'staff',
  mood: 'helpful',
};

export const CHAR_PASSENGER_ELENA: Character = {
  id: 'passenger_elena',
  name: 'Elena',
  title: 'Passenger',
  role: '前往旧金山的旅客',
  avatarType: 'passenger',
  mood: 'neutral',
};

export const CHAR_AGENT_ALEX: Character = {
  id: 'agent_alex',
  name: 'Alex',
  title: 'Gate Agent',
  role: 'Gate 18 登机口专员',
  avatarType: 'agent',
  mood: 'helpful',
};

// ============================================================================
// DIALOGUE NODES WITH REUSABLE STATES AND NATURAL SPOKEN ENGLISH
// ============================================================================
export const DIALOGUE_NODES: Record<string, DialogNode> = {
  // --------------------------------------------------------------------------
  // MIKE (CAFÉ) — OPTIONAL NPC BEFORE SARAH
  // --------------------------------------------------------------------------
  'mike_intro': {
    id: 'mike_intro',
    speaker: CHAR_BARISTA,
    npcDialogue: "Hey. You look lost.",
    npcDialogueCnHint: "嘿，你看上去有点迷茫。",
    hintScaffolding: {
      level1Cn: 'Mike 看到你有些困惑。你可以告诉他你的航班取消了，询问乘客服务台在哪里。',
      level2Starter: "My flight just got cancelled...",
      level3Full: "My flight just got cancelled. Do you know where I can get help?",
    },
    options: [
      {
        id: 'mike_opt_1',
        englishText: "My flight just got cancelled. Do you know where I can get help?",
        toneQuality: 'natural',
        npcReply: "Yeah. Try the passenger service desk over there. Sarah at Counter B will sort you out.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 15,
        coinGain: 0,
        setNpcState: {
          npcId: 'barista',
          state: 'MIKE_AFTER_HELP',
        },
      },
      {
        id: 'mike_opt_2',
        englishText: "I'm trying to find the passenger service desk.",
        toneQuality: 'natural',
        npcReply: "It's right across the hall at Counter B. Look for the blue sign.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 15,
        coinGain: 0,
        setNpcState: {
          npcId: 'barista',
          state: 'MIKE_AFTER_HELP',
        },
      },
      {
        id: 'mike_opt_3',
        englishText: "I'm not really sure what to do.",
        toneQuality: 'acceptable',
        npcReply: "Don't worry. Head to Counter B right over there and talk to Sarah.",
        npcMoodAfter: 'friendly',
        hpChange: 0,
        xpGain: 10,
        coinGain: 0,
        setNpcState: {
          npcId: 'barista',
          state: 'MIKE_AFTER_HELP',
        },
      },
    ],
  },

  'mike_after_help': {
    id: 'mike_after_help',
    speaker: CHAR_BARISTA,
    npcDialogue: "Hey again! Need a coffee or did you manage to talk to Sarah?",
    npcDialogueCnHint: "又见面啦！需要杯咖啡，还是已经找到 Sarah 沟通了？",
    options: [
      {
        id: 'mike_after_opt1',
        englishText: "I'm heading over to talk to her right now. Thanks Mike!",
        toneQuality: 'natural',
        npcReply: "Anytime! Counter B is right across the main hall.",
        npcMoodAfter: 'friendly',
        hpChange: 0,
        xpGain: 5,
        coinGain: 0,
      },
      {
        id: 'mike_after_opt2',
        englishText: "Could I get a quick iced Americano while I sort this out?",
        toneQuality: 'natural',
        npcReply: "You got it! Fresh iced Americano on the house. Hang in there!",
        npcMoodAfter: 'friendly',
        hpChange: 15,
        xpGain: 10,
        coinGain: 0,
        itemReward: {
          id: 'iced_coffee',
          name: 'Iced Americano',
          nameCn: '冰美式咖啡 (恢复精力)',
          description: '香气浓郁的冰咖啡，精力 HP +15！',
          icon: '🥤',
        },
      },
    ],
  },

  'mike_after_gate_change': {
    id: 'mike_after_gate_change',
    speaker: CHAR_BARISTA,
    npcDialogue: "Heard that announcement on the PA! Did your gate get moved to Gate 18?",
    npcDialogueCnHint: "刚才广播通知了！你的登机口是不是改到 Gate 18 了？",
    options: [
      {
        id: 'mike_gate_opt1',
        englishText: "Yeah, Gate 18. Which way is it from here?",
        toneQuality: 'natural',
        npcReply: "Head left down the main concourse past the lounge. It's in the west wing!",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 10,
        coinGain: 0,
      },
      {
        id: 'mike_gate_opt2',
        englishText: "Yeah, I'm heading there now. Thanks Mike!",
        toneQuality: 'natural',
        npcReply: "Run! Don't miss boarding!",
        npcMoodAfter: 'friendly',
        hpChange: 0,
        xpGain: 5,
        coinGain: 0,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // ACT 5: SARAH (PASSENGER SERVICE DESK)
  // --------------------------------------------------------------------------
  'sarah_intro': {
    id: 'sarah_intro',
    speaker: CHAR_SARAH,
    npcDialogue: "Hey. What's going on?",
    npcDialogueCnHint: "嗨，怎么了？",
    hintScaffolding: {
      level1Cn: 'Sarah 正在询问你发生了什么。这三个选项都能推动剧情，选你想说的那句即可。',
      level2Starter: "My flight just got...",
      level3Full: "My flight just got cancelled. Could you help me?",
    },
    options: [
      {
        id: 'sarah_act5_opt1',
        englishText: "My flight just got cancelled. Could you help me?",
        toneQuality: 'natural',
        npcReply: "Yeah, I'm sorry about that. Let me see what I can find.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 25,
        coinGain: 10,
        nextDialogNodeId: 'sarah_check_computer',
      },
      {
        id: 'sarah_act5_opt2',
        englishText: "Excuse me, I think there's a problem with my flight.",
        toneQuality: 'natural',
        npcReply: "Yeah, I'm sorry about that. Let me see what I can find.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 25,
        coinGain: 10,
        nextDialogNodeId: 'sarah_check_computer',
      },
      {
        id: 'sarah_act5_opt3',
        englishText: "I don't really know what to do.",
        toneQuality: 'acceptable',
        npcReply: "Yeah, I'm sorry about that. Let me see what I can find.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 20,
        coinGain: 5,
        nextDialogNodeId: 'sarah_check_computer',
      },
    ],
  },

  'sarah_check_computer': {
    id: 'sarah_check_computer',
    speaker: CHAR_SARAH,
    npcDialogue: "Okay, I found another flight for you. It leaves at 6:40. Gate 22.",
    npcDialogueCnHint: "好了，我为你查到另一趟航班：下午 6:40 出发，在 Gate 22 登机口。",
    hintScaffolding: {
      level1Cn: '致谢并前往 Gate 22 登机口。',
      level2Starter: "Okay. Great...",
      level3Full: "Okay. Great. Thank you.",
    },
    options: [
      {
        id: 'sarah_check_opt1',
        englishText: "Okay. Great. Thank you.",
        toneQuality: 'natural',
        npcReply: "No problem. Good luck!",
        npcMoodAfter: 'friendly',
        hpChange: 10,
        xpGain: 25,
        coinGain: 10,
        itemReward: {
          id: 'flight_rebook_slip',
          name: 'Rebooked Flight Slip',
          nameCn: '改签确认凭据 (Gate 22 · 6:40 PM)',
          description: '前往旧金山 SFO 航班 · 登机口 Gate 22',
          icon: '🎫',
        },
        completesGoalId: 'obj_find_help',
        setNpcState: {
          npcId: 'sarah',
          state: 'SARAH_NEW_FLIGHT',
        },
      },
      {
        id: 'sarah_check_opt2',
        englishText: "Thanks so much, Sarah. I'll head over right now.",
        toneQuality: 'natural',
        npcReply: "No problem. Good luck! Gate 22 is down the hall on the right.",
        npcMoodAfter: 'impressed',
        hpChange: 10,
        xpGain: 30,
        coinGain: 15,
        itemReward: {
          id: 'flight_rebook_slip',
          name: 'Rebooked Flight Slip',
          nameCn: '改签确认凭据 (Gate 22 · 6:40 PM)',
          description: '前往旧金山 SFO 航班 · 登机口 Gate 22',
          icon: '🎫',
        },
        completesGoalId: 'obj_find_help',
        setNpcState: {
          npcId: 'sarah',
          state: 'SARAH_NEW_FLIGHT',
        },
      },
    ],
  },

  'sarah_new_flight': {
    id: 'sarah_new_flight',
    speaker: CHAR_SARAH,
    npcDialogue: "Okay, I found another flight for you. It leaves from Gate 22 at 6:40. Head down the concourse on your right.",
    npcDialogueCnHint: "我已经为你安排好备选航班了，6点40从 Gate 22 登机口出发。往右侧大厅直走即可。",
    options: [
      {
        id: 'sarah_nf_opt1',
        englishText: "Thanks again, Sarah! Heading over to Gate 22 now.",
        toneQuality: 'natural',
        npcReply: "Have a safe flight to San Francisco!",
        npcMoodAfter: 'friendly',
        hpChange: 0,
        xpGain: 5,
        coinGain: 0,
      },
      {
        id: 'sarah_nf_opt2',
        englishText: "Could you remind me what time it leaves?",
        toneQuality: 'acceptable',
        npcReply: "It leaves at 6:40 PM from Gate 22. Better head there soon!",
        npcMoodAfter: 'friendly',
        hpChange: 0,
        xpGain: 5,
        coinGain: 0,
      },
    ],
  },

  'sarah_gate_change': {
    id: 'sarah_gate_change',
    speaker: CHAR_SARAH,
    npcDialogue: "Did you find Gate 18? Operations just moved the flight to the west concourse!",
    npcDialogueCnHint: "你找到 Gate 18 了吗？运营部刚刚把航班改到了西侧登机区！",
    options: [
      {
        id: 'sarah_gc_opt1',
        englishText: "Which way to Gate 18 again?",
        toneQuality: 'natural',
        npcReply: "Go past the departure board and take a left down the hall. Look for the signs for Gates 15–20!",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 10,
        coinGain: 0,
      },
      {
        id: 'sarah_gc_opt2',
        englishText: "Heading there right now, thanks Sarah!",
        toneQuality: 'natural',
        npcReply: "Hurry, they're boarding soon!",
        npcMoodAfter: 'friendly',
        hpChange: 0,
        xpGain: 5,
        coinGain: 0,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // ACT 7 & 9: AIRPORT STAFF DAVID (CONCOURSE & DIRECTIONS)
  // --------------------------------------------------------------------------
  'staff_david_gate_change': {
    id: 'staff_david_gate_change',
    speaker: CHAR_STAFF_DAVID,
    npcDialogue: "Can I help you with something?",
    npcDialogueCnHint: "有什么我可以帮你的吗？",
    hintScaffolding: {
      level1Cn: '地勤引导员在这里。询问飞往旧金山的 UA 889 是不是改到了其他登机口。',
      level2Starter: "Excuse me, is this flight...",
      level3Full: "Excuse me, is this flight going to San Francisco?",
    },
    options: [
      {
        id: 'staff_opt_1',
        englishText: "Excuse me, is this flight going to San Francisco?",
        toneQuality: 'natural',
        npcReply: "Yeah, but the gate's been changed. It's boarding at Gate 18 now. Go down the hall and turn left past the lounge.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 25,
        coinGain: 5,
        completesGoalId: 'obj_find_new_gate',
        setNpcState: {
          npcId: 'staff_david',
          state: 'STAFF_DIRECTIONS',
        },
      },
      {
        id: 'staff_opt_2',
        englishText: "Excuse me, did they just announce a gate change for UA 889?",
        toneQuality: 'natural',
        npcReply: "That's right. It's been moved to Gate 18. Head down the concourse toward Gates 15–20.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 25,
        coinGain: 5,
        completesGoalId: 'obj_find_new_gate',
        setNpcState: {
          npcId: 'staff_david',
          state: 'STAFF_DIRECTIONS',
        },
      },
      {
        id: 'staff_opt_3',
        englishText: "I'm looking for the San Francisco flight.",
        toneQuality: 'acceptable',
        npcReply: "UA 889? The gate's been changed to Gate 18. Follow the signs down the left wing.",
        npcMoodAfter: 'friendly',
        hpChange: 0,
        xpGain: 15,
        coinGain: 0,
        completesGoalId: 'obj_find_new_gate',
        setNpcState: {
          npcId: 'staff_david',
          state: 'STAFF_DIRECTIONS',
        },
      },
    ],
  },

  'staff_david_directions': {
    id: 'staff_david_directions',
    speaker: CHAR_STAFF_DAVID,
    npcDialogue: "Can I help you?",
    npcDialogueCnHint: "需要帮助吗？",
    hintScaffolding: {
      level1Cn: '向地勤询问前往 Gate 18 的具体路线。',
      level2Starter: "Yeah. I'm trying to get to...",
      level3Full: "Yeah. I'm trying to get to Gate 18.",
    },
    options: [
      {
        id: 'staff_dir_1',
        englishText: "Yeah. I'm trying to get to Gate 18.",
        toneQuality: 'natural',
        npcReply: "Sure. Go down the hall and turn left past the lounge. You'll see the signs for Gates 15–20.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 20,
        coinGain: 0,
      },
      {
        id: 'staff_dir_2',
        englishText: "Which way is Gate 18?",
        toneQuality: 'natural',
        npcReply: "Keep going straight past the escalator, then take a left. Gate 18 will be right in front of you.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 15,
        coinGain: 0,
      },
      {
        id: 'staff_dir_3',
        englishText: "Where is Gate 18 from here?",
        toneQuality: 'acceptable',
        npcReply: "Just follow the blue overhead signs for Gates 15–20. It's about a one-minute walk on your left.",
        npcMoodAfter: 'friendly',
        hpChange: 0,
        xpGain: 10,
        coinGain: 0,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // ACT 7: PASSENGER ELENA (WAITING LOUNGE)
  // --------------------------------------------------------------------------
  'passenger_elena_talk': {
    id: 'passenger_elena_talk',
    speaker: CHAR_PASSENGER_ELENA,
    npcDialogue: "Did you hear that announcement? They just moved our flight to Gate 18!",
    npcDialogueCnHint: "你听到刚才的广播了吗？他们把我们的航班改到 Gate 18 登机口了！",
    hintScaffolding: {
      level1Cn: '乘客告诉你航班改到了 Gate 18。询问她 Gate 18 在哪里。',
      level2Starter: "Seriously? Where is...",
      level3Full: "Seriously? Changed to where?",
    },
    options: [
      {
        id: 'elena_opt_1',
        englishText: "Changed to where? Gate 18?",
        toneQuality: 'natural',
        npcReply: "Yeah, Gate 18! It's over at the west concourse. We'd better hurry, boarding has already started!",
        npcMoodAfter: 'friendly',
        hpChange: 5,
        xpGain: 20,
        coinGain: 0,
        completesGoalId: 'obj_find_new_gate',
      },
      {
        id: 'elena_opt_2',
        englishText: "Seriously? Thanks for telling me!",
        toneQuality: 'natural',
        npcReply: "No problem! Take a left down that hallway toward Gates 15–20.",
        npcMoodAfter: 'friendly',
        hpChange: 5,
        xpGain: 20,
        coinGain: 0,
        completesGoalId: 'obj_find_new_gate',
      },
      {
        id: 'elena_opt_3',
        englishText: "Is that the San Francisco flight?",
        toneQuality: 'acceptable',
        npcReply: "Yep, flight UA 889 to SFO. Head down the concourse on the left!",
        npcMoodAfter: 'neutral',
        hpChange: 0,
        xpGain: 10,
        coinGain: 0,
        completesGoalId: 'obj_find_new_gate',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // ACT 10: CONCOURSE ESCALATOR & LIFT (OPTIONAL LIVING WORLD)
  // --------------------------------------------------------------------------
  'escalator_talk': {
    id: 'escalator_talk',
    speaker: CHAR_STAFF_DAVID,
    npcDialogue: "Going up?",
    npcDialogueCnHint: "上楼吗？",
    options: [
      {
        id: 'esc_opt_1',
        englishText: "Yeah. Second floor?",
        toneQuality: 'natural',
        npcReply: "Yes. Upper concourse for Gates 15–20. Turn left at the top!",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 10,
        coinGain: 0,
      },
      {
        id: 'esc_opt_2',
        englishText: "Yes, I'm trying to catch Gate 18.",
        toneQuality: 'natural',
        npcReply: "You're in the right spot! Just turn left right past the glass divider. Good luck!",
        npcMoodAfter: 'friendly',
        hpChange: 5,
        xpGain: 10,
        coinGain: 0,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // ACT 13: GATE AGENT ALEX (AT GATE 18)
  // --------------------------------------------------------------------------
  'agent_alex_board_pass': {
    id: 'agent_alex_board_pass',
    speaker: CHAR_AGENT_ALEX,
    npcDialogue: "San Francisco?",
    npcDialogueCnHint: "去旧金山吗？",
    hintScaffolding: {
      level1Cn: '登机口地勤 Alex 正在核对登机旅客。告诉他你的手机显示登机牌错误。',
      level2Starter: "Yeah. Can I see your boarding pass? That's the problem...",
      level3Full: "Yeah. That's the problem, my phone has an error and won't display it.",
    },
    options: [
      {
        id: 'alex_opt_1',
        englishText: "Yeah. But that's the problem—I can't open my boarding pass on my phone.",
        toneQuality: 'natural',
        npcReply: "No worries. Let me take a look. Let's see... UA 889 to San Francisco... Okay, you're all set. Here you go!",
        npcMoodAfter: 'helpful',
        hpChange: 15,
        xpGain: 35,
        coinGain: 0,
        itemReward: {
          id: 'boarding_pass_verified',
          name: 'Verified Boarding Pass (Gate 18 · SFO)',
          nameCn: '已核实有效登机牌 (Gate 18)',
          description: '经地勤 Alex 终端核实打印，可通过 Gate 18 登机门直接登机！',
          icon: '🎫',
        },
        completesGoalId: 'obj_boarding_pass',
        setNpcState: {
          npcId: 'agent_alex',
          state: 'AGENT_ALL_SET',
        },
        nextDialogNodeId: 'agent_alex_finished',
      },
      {
        id: 'alex_opt_2',
        englishText: "Yes. My phone keeps showing an error when I try to load my pass.",
        toneQuality: 'natural',
        npcReply: "No worries at all. Give me your name... Got it. I've printed a physical boarding pass for you. You're all set!",
        npcMoodAfter: 'helpful',
        hpChange: 15,
        xpGain: 35,
        coinGain: 0,
        itemReward: {
          id: 'boarding_pass_verified',
          name: 'Verified Boarding Pass (Gate 18 · SFO)',
          nameCn: '已核实有效登机牌 (Gate 18)',
          description: '经地勤 Alex 终端核实打印，可通过 Gate 18 登机门直接登机！',
          icon: '🎫',
        },
        completesGoalId: 'obj_boarding_pass',
        setNpcState: {
          npcId: 'agent_alex',
          state: 'AGENT_ALL_SET',
        },
        nextDialogNodeId: 'agent_alex_finished',
      },
    ],
  },

  'agent_alex_finished': {
    id: 'agent_alex_finished',
    speaker: CHAR_AGENT_ALEX,
    npcDialogue: "You're all set! Have a good flight to San Francisco.",
    npcDialogueCnHint: "一切都办妥了！祝您旧金山旅途愉快。",
    options: [
      {
        id: 'alex_fin_1',
        englishText: "Thank you so much! Really appreciate it.",
        toneQuality: 'natural',
        npcReply: "My pleasure! Just scan the barcode at the door right there.",
        npcMoodAfter: 'friendly',
        hpChange: 10,
        xpGain: 15,
        coinGain: 0,
      },
    ],
  },

  'agent_alex_all_set': {
    id: 'agent_alex_all_set',
    speaker: CHAR_AGENT_ALEX,
    npcDialogue: "You're all set! Just scan your pass at Gate 18 right there to board.",
    npcDialogueCnHint: "全都准备好了！直接在旁边的 Gate 18 闸机扫码登机即可。",
    options: [
      {
        id: 'alex_ready_1',
        englishText: "Thanks Alex! Heading on board now.",
        toneQuality: 'natural',
        npcReply: "Safe travels to San Francisco!",
        npcMoodAfter: 'friendly',
        hpChange: 0,
        xpGain: 5,
        coinGain: 0,
      },
    ],
  },
};

/**
 * Reusable NPC dialogue state resolver for all current and future NPCs.
 * Instead of resetting to intro, it routes to the NPC's actual dialogue state!
 */
export function getNpcDialogueNode(
  npcId: string,
  npcState: string,
  inventory: InventoryItem[],
  questState?: {
    currentObjectiveId: string;
    isGateChanged?: boolean;
    hasBoardingPassVerified?: boolean;
  }
): DialogNode {
  // 1. Sarah
  if (npcId === 'sarah') {
    if (questState?.isGateChanged) {
      return DIALOGUE_NODES['sarah_gate_change'];
    }
    switch (npcState) {
      case 'SARAH_GATE_CHANGE':
        return DIALOGUE_NODES['sarah_gate_change'];
      case 'SARAH_NEW_FLIGHT':
        return DIALOGUE_NODES['sarah_new_flight'];
      case 'SARAH_INTRO':
      default:
        if (inventory.some((i) => i.id === 'flight_rebook_slip' || i.id === 'boarding_pass_verified')) {
          return DIALOGUE_NODES['sarah_new_flight'];
        }
        return DIALOGUE_NODES['sarah_intro'];
    }
  }

  // 2. Barista Mike
  if (npcId === 'barista') {
    if (questState?.isGateChanged) {
      return DIALOGUE_NODES['mike_after_gate_change'];
    }
    switch (npcState) {
      case 'MIKE_AFTER_HELP':
        return DIALOGUE_NODES['mike_after_help'];
      case 'MIKE_INTRO':
      default:
        return DIALOGUE_NODES['mike_intro'];
    }
  }

  // 3. Staff David
  if (npcId === 'staff_david') {
    if (npcState === 'STAFF_DIRECTIONS' || questState?.currentObjectiveId === 'obj_get_to_gate18') {
      return DIALOGUE_NODES['staff_david_directions'];
    }
    return DIALOGUE_NODES['staff_david_gate_change'];
  }

  // 4. Passenger Elena
  if (npcId === 'passenger_elena') {
    return DIALOGUE_NODES['passenger_elena_talk'];
  }

  // 5. Gate Agent Alex
  if (npcId === 'agent_alex') {
    if (npcState === 'AGENT_ALL_SET' || inventory.some((i) => i.id === 'boarding_pass_verified')) {
      return DIALOGUE_NODES['agent_alex_all_set'];
    }
    return DIALOGUE_NODES['agent_alex_board_pass'];
  }

  // 6. Escalator / Lift
  if (npcId === 'escalator') {
    return DIALOGUE_NODES['escalator_talk'];
  }

  // Fallback
  return DIALOGUE_NODES['sarah_intro'];
}
