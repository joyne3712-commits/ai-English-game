import { DialogNode, Character, Hotspot, InventoryItem, QuestGoal, ChapterState, SelectedFlight, DiscoveredInfo } from '../types';

export const INITIAL_QUEST_GOALS: QuestGoal[] = [
  {
    id: 'obj_figure_out',
    order: 1,
    text: 'Figure out what to do',
    textCn: '查明航班取消情况与应对方案',
    status: 'ACTIVE',
    rewardXp: 30,
    completedBadge: 'Discovered situation & options',
  },
  {
    id: 'obj_find_replacement',
    order: 2,
    text: 'Find another way to get to San Francisco',
    textCn: '与地勤专员协商备选航班 (UA921 / UA937)',
    status: 'LOCKED',
    rewardXp: 40,
    completedBadge: 'Rebooked on replacement flight',
  },
  {
    id: 'obj_get_to_gate',
    order: 3,
    text: 'Get to your departure gate',
    textCn: '前往出发登机口准备登机',
    status: 'LOCKED',
    rewardXp: 40,
    completedBadge: 'Reached departure gate',
  },
  {
    id: 'obj_resolve_boarding_issue',
    order: 4,
    text: 'Figure out how to board the flight',
    textCn: '向登机口地勤解决登机牌故障',
    status: 'LOCKED',
    rewardXp: 40,
    completedBadge: 'Boarding pass verified & printed',
  },
  {
    id: 'obj_board_flight',
    order: 5,
    text: 'Board the flight to San Francisco',
    textCn: '通过登机口闸机登上飞往旧金山的航班',
    status: 'LOCKED',
    rewardXp: 50,
    completedBadge: 'Welcomed aboard to San Francisco',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'passport',
    name: 'Passport & Ticket Slip',
    nameCn: '中国护照与原机票 (UA889)',
    description: '宁波 ➔ 东京 ➔ 旧金山。原定 20:40 飞往旧金山 (SFO)，状态：CANCELLED。',
    icon: '🛂',
  },
  {
    id: 'hotel_reservation',
    name: 'Sunset Hotel Confirmation',
    nameCn: '旧金山落日酒店确认单',
    description: '落日酒店 (Sunset Hotel) · 842 Geary St, SF · 最晚入住时间: 23:00 前。',
    icon: '🏨',
  },
  {
    id: 'travel_phone',
    name: 'Travel Smartphone',
    nameCn: '旅行智能手机',
    description: '内含航司 App、酒店行程单与应急通讯录。按 [ P ] 或 [ J ] 查看。',
    icon: '📱',
  },
];

export const AIRPORT_HOTSPOTS: Hotspot[] = [
  {
    id: 'board',
    name: 'Flight Departure Board',
    nameCn: '电子航显大屏幕',
    icon: '📺',
    xPercent: 36,
    yPercent: 15,
    type: 'board',
    statusLabel: 'UA889 · TOKYO ➔ SFO',
  },
  {
    id: 'sarah_desk',
    name: 'Passenger Service Counter B · Sarah',
    nameCn: '旅客服务 B 柜台 · Sarah',
    icon: '👩‍💼',
    xPercent: 51,
    yPercent: 37,
    type: 'npc',
    statusLabel: 'Passenger Rebooking Agent',
  },
  {
    id: 'cafe',
    name: 'Skyline Brew Cafe · Mike',
    nameCn: '天际咖啡 · Mike',
    icon: '☕',
    xPercent: 13,
    yPercent: 33,
    type: 'cafe',
    statusLabel: 'Fellow Passenger & Cafe',
  },
  {
    id: 'staff_david',
    name: 'Information Desk · David',
    nameCn: '航站楼问讯处 · David',
    icon: '🧑‍💼',
    xPercent: 53,
    yPercent: 52,
    type: 'npc',
    statusLabel: 'Airport Information',
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
    id: 'gate_b22',
    name: 'Gate 22: UA921 (21:30)',
    nameCn: 'Gate 22 登机口',
    icon: '🚪',
    xPercent: 91,
    yPercent: 58,
    type: 'gate',
    statusLabel: 'Flight UA921 · San Francisco',
    isUnlocked: false,
  },
  {
    id: 'gate_b31',
    name: 'Gate 31: UA937 (23:10)',
    nameCn: 'Gate 31 登机口',
    icon: '🚪',
    xPercent: 91,
    yPercent: 30,
    type: 'gate',
    statusLabel: 'Flight UA937 · San Francisco',
    isUnlocked: false,
  },
  {
    id: 'escalator',
    name: 'Concourse Escalator & Lift',
    nameCn: '航站楼自动扶梯',
    icon: '🛗',
    xPercent: 37,
    yPercent: 25,
    type: 'npc',
    statusLabel: 'To Gates 15–20 / Upper Mezzanine',
  },
  {
    id: 'agent_alex',
    name: 'Gate Agent · Alex',
    nameCn: '登机口地勤专员 · Alex',
    icon: '👨‍💼',
    xPercent: 20,
    yPercent: 23,
    type: 'npc',
    statusLabel: 'Gate Agent',
  },
  {
    id: 'gate_18',
    name: 'Gate 18 Boarding Door',
    nameCn: 'Gate 18 登机通道',
    icon: '✈️',
    xPercent: 25,
    yPercent: 23,
    type: 'gate',
    statusLabel: 'San Francisco Express Boarding',
    isUnlocked: false,
  },
  {
    id: 'luggage',
    name: 'Baggage Carousel 03',
    nameCn: '行李传输带 03',
    icon: '🧳',
    xPercent: 17,
    yPercent: 79,
    type: 'luggage',
    statusLabel: 'Transfer Baggage En Route',
  },
];

export const CHAR_SARAH: Character = {
  id: 'sarah',
  name: 'Sarah',
  title: 'Passenger Service Agent',
  role: '航司地勤服务专员',
  avatarType: 'sarah',
  mood: 'helpful',
};

export const CHAR_BARISTA: Character = {
  id: 'barista',
  name: 'Mike',
  title: 'Fellow Traveler & Coffee Enthusiast',
  role: '天际咖啡候机旅客 · Mike',
  avatarType: 'barista',
  mood: 'friendly',
};

export const CHAR_STAFF_DAVID: Character = {
  id: 'staff_david',
  name: 'David',
  title: 'Information Desk Staff',
  role: '航站楼问讯处专员',
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
  role: '登机口地勤专员',
  avatarType: 'agent',
  mood: 'helpful',
};

// ============================================================================
// DIALOGUE NODES — REAL TRAVEL CONVERSATIONAL SPOKEN ENGLISH (SIMS-STYLE FREEDOM)
// ============================================================================
export const DIALOGUE_NODES: Record<string, DialogNode> = {
  // --------------------------------------------------------------------------
  // SARAH (PASSENGER SERVICE DESK B) — PRIMARY REBOOKING HUB
  // --------------------------------------------------------------------------
  'sarah_intro': {
    id: 'sarah_intro',
    speaker: CHAR_SARAH,
    npcDialogue: "Hey. What's going on?",
    npcDialogueCnHint: "嗨。发生什么事了？",
    hintScaffolding: {
      level1Cn: '告诉 Sarah 你的转机航班被取消了，询问有哪些备选航班。',
      level2Starter: "My connecting flight was...",
      level3Full: "My connecting flight was cancelled. Could you help me find another one?",
    },
    options: [
      {
        id: 'sarah_opt_1',
        englishText: "My connecting flight was cancelled.",
        toneQuality: 'natural',
        npcReply: "Yeah, I've seen a few cancellations tonight. Let me see what I can find in the system.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 25,
        coinGain: 0,
        completesGoalId: 'obj_figure_out',
        advancesChapterState: 'INVESTIGATING',
        nextDialogNodeId: 'sarah_options',
      },
      {
        id: 'sarah_opt_2',
        englishText: "My flight to San Francisco was cancelled.",
        toneQuality: 'natural',
        npcReply: "Yeah, UA889 had an equipment issue. Let me pull up your booking and look at available seats.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 25,
        coinGain: 0,
        completesGoalId: 'obj_figure_out',
        advancesChapterState: 'INVESTIGATING',
        nextDialogNodeId: 'sarah_options',
      },
      {
        id: 'sarah_opt_3',
        englishText: "Are there any meal vouchers or compensation for this delay?",
        toneQuality: 'natural',
        npcReply: "Yes, absolutely! Since UA889 was an airline cancellation, here is a $25 Airport Dining Voucher you can use at any cafe or restaurant tonight. Now let's get you on a replacement flight!",
        npcMoodAfter: 'helpful',
        hpChange: 10,
        xpGain: 30,
        coinGain: 25,
        itemReward: {
          id: 'item_meal_voucher',
          name: 'Airline Meal Voucher ($25)',
          nameCn: '航司延误餐饮抵用券 ($25)',
          description: '航司延误补偿券，可用于 Skyline Brew 或机场餐厅消费。',
          icon: '🎟️',
        },
        completesGoalId: 'obj_figure_out',
        advancesChapterState: 'INVESTIGATING',
        nextDialogNodeId: 'sarah_options',
      },
      {
        id: 'sarah_opt_4',
        englishText: "I think my flight was cancelled.",
        toneQuality: 'acceptable',
        npcReply: "Let me check your ticket right now. Give me a second... Okay, I found two replacement flights to San Francisco tonight.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 20,
        coinGain: 0,
        completesGoalId: 'obj_figure_out',
        advancesChapterState: 'INVESTIGATING',
        nextDialogNodeId: 'sarah_options',
      },
    ],
  },

  'sarah_options': {
    id: 'sarah_options',
    speaker: CHAR_SARAH,
    npcDialogue: "I've got two flights available tonight. Option A is UA921 at 21:30 from Gate 22. Option B is UA937 at 23:10 from Gate 31. Which flight do you want?",
    npcDialogueCnHint: "今晚有两班备选：A 是 21:30 的 UA921 (Gate 22)；B 是 23:10 的 UA937 (Gate 31)。你想选哪一班？",
    hintScaffolding: {
      level1Cn: '你可以选择 21:30 航班 (UA921)、23:10 航班 (UA937)，或者先询问两者的区别。',
      level2Starter: "What's the difference between...",
      level3Full: "What's the difference between the two flights?",
    },
    options: [
      {
        id: 'sarah_choose_ua921',
        englishText: "21:30 — UA921",
        toneQuality: 'natural',
        npcReply: "Got it! UA921 arrives earlier in San Francisco, so you won't have to worry about your hotel check-in. Boarding is soon at Gate 22, so head down the concourse right away.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 35,
        coinGain: 0,
        selectsFlight: 'UA921',
        advancesChapterState: 'FLIGHT_SELECTED',
        nextDialogNodeId: 'sarah_confirm_gate22',
      },
      {
        id: 'sarah_choose_ua937',
        englishText: "23:10 — UA937",
        toneQuality: 'natural',
        npcReply: "Sure thing! UA937 gives you plenty of time to relax at the airport. Just keep in mind that you'll land pretty late in San Francisco, so make sure to notify your hotel.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 35,
        coinGain: 0,
        selectsFlight: 'UA937',
        advancesChapterState: 'FLIGHT_SELECTED',
        nextDialogNodeId: 'sarah_confirm_gate31',
      },
      {
        id: 'sarah_ask_diff',
        englishText: "What's the difference between the two flights?",
        toneQuality: 'natural',
        npcReply: "UA921 leaves in about 45 minutes—earlier arrival in SF, but less time before boarding. UA937 leaves at 23:10, plenty of transit time, but you might arrive after your hotel's check-in deadline.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 20,
        coinGain: 0,
        nextDialogNodeId: 'sarah_options',
      },
      {
        id: 'sarah_ask_luggage',
        englishText: "Will my checked baggage transfer automatically?",
        toneQuality: 'natural',
        npcReply: "Yes! Since you checked your bags all the way from Ningbo, our ground handlers will transfer them automatically to your new flight. You don't need to re-check them.",
        npcMoodAfter: 'friendly',
        hpChange: 5,
        xpGain: 20,
        coinGain: 0,
        nextDialogNodeId: 'sarah_options',
      },
    ],
  },

  'sarah_confirm_gate22': {
    id: 'sarah_confirm_gate22',
    speaker: CHAR_SARAH,
    npcDialogue: "Here is your rebooking confirmation slip for UA921 (21:30 departure at Gate 22). Boarding starts shortly—head over to the gate right away!",
    npcDialogueCnHint: "这是您 UA921 (21:30 · Gate 22) 的改签确认凭证。请立刻前往 Gate 22 登机口！",
    options: [
      {
        id: 'sarah_c22_opt1',
        englishText: "Thanks so much, Sarah. Heading to Gate 22 now!",
        toneQuality: 'natural',
        npcReply: "You're welcome! Follow the signs on the right for Gate 22.",
        npcMoodAfter: 'friendly',
        hpChange: 10,
        xpGain: 30,
        coinGain: 0,
        itemReward: {
          id: 'flight_rebook_slip',
          name: 'Rebooked Flight Slip (UA921 · 21:30 · Gate 22)',
          nameCn: '改签确认凭据 (UA921 · 21:30)',
          description: '飞往旧金山 SFO · 出发时间 21:30 · 登机口 Gate 22',
          icon: '🎫',
        },
        completesGoalId: 'obj_find_replacement',
        setNpcState: {
          npcId: 'sarah',
          state: 'SARAH_REBOOKED_22',
        },
      },
    ],
  },

  'sarah_confirm_gate31': {
    id: 'sarah_confirm_gate31',
    speaker: CHAR_SARAH,
    npcDialogue: "You're confirmed for UA937 at 23:10! Here is your rebooking confirmation for Gate 31. You've got plenty of time.",
    npcDialogueCnHint: "您已确认 23:10 的 UA937！这是 North Concourse Gate 31 的改签凭证，时间很充裕。",
    options: [
      {
        id: 'sarah_c31_opt1',
        englishText: "Thank you Sarah. I will message my hotel about the late arrival.",
        toneQuality: 'natural',
        npcReply: "Good thinking! Your checked luggage will transfer to UA937 automatically. Gate 31 is upstairs past the escalator.",
        npcMoodAfter: 'friendly',
        hpChange: 10,
        xpGain: 30,
        coinGain: 0,
        itemReward: {
          id: 'flight_rebook_slip_31',
          name: 'Rebooked Flight Slip (UA937 · 23:10 · Gate 31)',
          nameCn: '改签确认凭据 (UA937 · 23:10)',
          description: '飞往旧金山 SFO · 出发时间 23:10 · 登机口 Gate 31',
          icon: '🎫',
        },
        completesGoalId: 'obj_find_replacement',
        setNpcState: {
          npcId: 'sarah',
          state: 'SARAH_REBOOKED_31',
        },
      },
    ],
  },

  'sarah_post_rebook_22': {
    id: 'sarah_post_rebook_22',
    speaker: CHAR_SARAH,
    npcDialogue: "You're all set on UA921 at Gate 22. Boarding is starting soon—head over there right away!",
    npcDialogueCnHint: "您已改签至 Gate 22 的 UA921 航班，马上开始登机了，快顺着右侧走廊前往登机口！",
    options: [
      {
        id: 'sarah_pr22_1',
        englishText: "On my way to Gate 22 now. Thanks again!",
        toneQuality: 'natural',
        npcReply: "Have a safe flight to San Francisco!",
        npcMoodAfter: 'friendly',
        hpChange: 0,
        xpGain: 5,
        coinGain: 0,
      },
    ],
  },

  'sarah_post_rebook_31': {
    id: 'sarah_post_rebook_31',
    speaker: CHAR_SARAH,
    npcDialogue: "You're confirmed for UA937 at 23:10 (Gate 31). Relax and keep an eye on your boarding time!",
    npcDialogueCnHint: "您已确认 Gate 31 的 UA937 航班 (23:10)，请稍事休息并留意登机时间！",
    options: [
      {
        id: 'sarah_pr31_1',
        englishText: "Thanks Sarah, heading over toward the gate area.",
        toneQuality: 'natural',
        npcReply: "Have a pleasant trip to SF!",
        npcMoodAfter: 'friendly',
        hpChange: 0,
        xpGain: 5,
        coinGain: 0,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // MIKE (FELLOW PASSENGER & COFFEE ENTHUSIAST AT SKYLINE BREW)
  // --------------------------------------------------------------------------
  'mike_intro': {
    id: 'mike_intro',
    speaker: CHAR_BARISTA,
    npcDialogue: "Hey there! Grabbing a coffee or waiting for a flight too?",
    npcDialogueCnHint: "嗨！是来买杯咖啡，还是也在等航班？",
    hintScaffolding: {
      level1Cn: '你可以向 Mike 购买咖啡提神、询问航班建议、或者闲聊交流旅行经验。',
      level2Starter: "Could I get a coffee...",
      level3Full: "Could I get a coffee? Also, my connecting flight to SF was cancelled.",
    },
    options: [
      {
        id: 'mike_opt_coffee',
        englishText: "Could I get something from the cafe? What do you recommend?",
        toneQuality: 'natural',
        npcReply: "Sure! I help out here at Skyline Brew while waiting. Our Hot Americano gives a great caffeine kick, and the Caramel Oat Latte with Matcha Cookies is our best seller!",
        npcMoodAfter: 'friendly',
        hpChange: 5,
        xpGain: 15,
        coinGain: 0,
        nextDialogNodeId: 'mike_cafe_menu',
      },
      {
        id: 'mike_opt_flight_advice',
        englishText: "You're heading to San Francisco too? My flight was cancelled.",
        toneQuality: 'natural',
        npcReply: "Man, that sucks. UA889 right? If you take the 21:30 flight (UA921), you'll make it to your hotel comfortably before 23:00. But if you're tired, the 23:10 flight gives you more time to chill. Go talk to Sarah at Counter B!",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 25,
        coinGain: 0,
        completesGoalId: 'obj_figure_out',
        setNpcState: {
          npcId: 'barista',
          state: 'MIKE_TALKED',
        },
      },
      {
        id: 'mike_opt_wifi',
        englishText: "Do you know the Wi-Fi password or where I can charge my phone?",
        toneQuality: 'natural',
        npcReply: "Yeah! Network is 'SkylineBrew_Guest', no password needed. There are also USB-C fast charging stations right next to Gate 18 by the windows!",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 15,
        coinGain: 0,
        itemReward: {
          id: 'item_wifi_card',
          name: 'Airport Fast Wi-Fi Pass',
          nameCn: '机场极速 Wi-Fi 访问卡',
          description: '高速网络接入码，可用于随时刷新航班动态与地图。',
          icon: '📶',
        },
      },
      {
        id: 'mike_opt_chitchat',
        englishText: "What brings you to San Francisco?",
        toneQuality: 'natural',
        npcReply: "I'm heading to a tech conference in Silicon Valley. If it's your first time in SF, definitely ride the cable car from Powell St to Fisherman's Wharf—the view is unreal!",
        npcMoodAfter: 'friendly',
        hpChange: 10,
        xpGain: 20,
        coinGain: 0,
      },
    ],
  },

  'mike_cafe_menu': {
    id: 'mike_cafe_menu',
    speaker: CHAR_BARISTA,
    npcDialogue: "What can I get started for you today?",
    npcDialogueCnHint: "今天想喝点什么？",
    options: [
      {
        id: 'mike_buy_americano',
        englishText: "I'd like a Hot Americano, please. ($3.50)",
        toneQuality: 'natural',
        npcReply: "One fresh dark roast Americano coming right up! That should keep you sharp for the long flight.",
        npcMoodAfter: 'friendly',
        hpChange: 20,
        xpGain: 15,
        coinGain: -3.5,
        itemReward: {
          id: 'item_coffee_americano',
          name: 'Fresh Hot Americano',
          nameCn: '现磨美式咖啡',
          description: '浓郁深烘咖啡，恢复 20 点精力量，保持清醒警觉。',
          icon: '☕',
        },
      },
      {
        id: 'mike_buy_latte_combo',
        englishText: "I'll have a Caramel Oat Latte and a Matcha Cookie. ($6.50)",
        toneQuality: 'natural',
        npcReply: "Great choice! Fresh steamed oat milk with rich espresso and a warm Japanese matcha cookie. Enjoy!",
        npcMoodAfter: 'friendly',
        hpChange: 35,
        xpGain: 25,
        coinGain: -6.5,
        itemReward: {
          id: 'item_latte_cookie',
          name: 'Caramel Latte & Matcha Cookie',
          nameCn: '焦糖燕麦拿铁与抹茶曲奇',
          description: '香甜浓郁的拿铁与点心，全面恢复 35 点体力与好心情。',
          icon: '🍪',
        },
      },
      {
        id: 'mike_buy_sparkling',
        englishText: "Just a bottle of chilled sparkling water, please. ($2.00)",
        toneQuality: 'natural',
        npcReply: "Here you go! Cold and refreshing.",
        npcMoodAfter: 'friendly',
        hpChange: 15,
        xpGain: 10,
        coinGain: -2.0,
        itemReward: {
          id: 'item_sparkling_water',
          name: 'Chilled Sparkling Water',
          nameCn: '冰镇气泡水',
          description: '清爽解渴气泡水，恢复 15 点精力。',
          icon: '🫧',
        },
      },
      {
        id: 'mike_buy_back',
        englishText: "Actually, let me ask about flights first.",
        toneQuality: 'natural',
        npcReply: "No problem at all! What's on your mind?",
        npcMoodAfter: 'helpful',
        hpChange: 0,
        xpGain: 5,
        coinGain: 0,
        nextDialogNodeId: 'mike_intro',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // ELENA (PASSENGER IN SEATING AREA — INTERACTIVE STRANGER DYNAMICS)
  // --------------------------------------------------------------------------
  'elena_intro': {
    id: 'elena_intro',
    speaker: CHAR_PASSENGER_ELENA,
    npcDialogue: "Oh, excuse me! Do you know which way Baggage Carousel 03 is?",
    npcDialogueCnHint: "哎，打扰一下！请问你知道行李提取传输带 03 在哪个方向吗？",
    hintScaffolding: {
      level1Cn: 'Elena 正在向你问路。你可以给她指路，或者交流旧金山旅行信息。',
      level2Starter: "Baggage Carousel 03 is...",
      level3Full: "Baggage Carousel 03 is right down that hallway on the left.",
    },
    options: [
      {
        id: 'elena_give_directions',
        englishText: "Baggage Carousel 03 is right down that hallway on the left.",
        toneQuality: 'natural',
        npcReply: "Oh wonderful, thank you so much! My flight landed from Osaka and I was so disoriented. Here, take this spare travel eye mask—it's super comfortable for red-eye flights!",
        npcMoodAfter: 'friendly',
        hpChange: 10,
        xpGain: 30,
        coinGain: 0,
        itemReward: {
          id: 'item_travel_eyemask',
          name: 'Silk Travel Eye Mask',
          nameCn: '真丝旅行遮光眼罩',
          description: 'Elena 送的舒适旅行眼罩，长途跨洋飞行必备好物！',
          icon: '😴',
        },
        setNpcState: {
          npcId: 'passenger_elena',
          state: 'ELENA_HELPED',
        },
      },
      {
        id: 'elena_ask_sf',
        englishText: "Are you also flying to San Francisco tonight?",
        toneQuality: 'natural',
        npcReply: "Yes! I visit San Francisco often. A little insider tip: even in summer, pack a light jacket because the evening fog rolling off the bay gets surprisingly chilly!",
        npcMoodAfter: 'friendly',
        hpChange: 5,
        xpGain: 20,
        coinGain: 0,
      },
      {
        id: 'elena_flight_cancelled',
        englishText: "My connecting flight UA889 was just cancelled.",
        toneQuality: 'natural',
        npcReply: "Oh no, that's stressful! Don't worry, Passenger Service Counter B is right in the center concourse. Sarah there is super efficient at rebooking.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 15,
        coinGain: 0,
        completesGoalId: 'obj_figure_out',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // DAVID (INFORMATION DESK STAFF)
  // --------------------------------------------------------------------------
  'david_intro': {
    id: 'david_intro',
    speaker: CHAR_STAFF_DAVID,
    npcDialogue: "Welcome to Tokyo International Airport Information. How can I assist you tonight?",
    npcDialogueCnHint: "欢迎来到东京国际机场问讯处。今晚有什么可以帮您？",
    hintScaffolding: {
      level1Cn: '你可以向 David 询问航站楼方向、日本特色伴手礼商店、或者休息室位置。',
      level2Starter: "Could you tell me where...",
      level3Full: "Could you tell me how to get to Passenger Service Counter B?",
    },
    options: [
      {
        id: 'david_ask_service_desk',
        englishText: "Where is the Passenger Service Desk for flight rebooking?",
        toneQuality: 'natural',
        npcReply: "Passenger Service Counter B is directly opposite the central flight display board. Agent Sarah is on duty there right now.",
        npcMoodAfter: 'helpful',
        hpChange: 5,
        xpGain: 20,
        coinGain: 0,
        completesGoalId: 'obj_figure_out',
      },
      {
        id: 'david_ask_souvenirs',
        englishText: "Are any souvenir shops open late for Japanese snacks?",
        toneQuality: 'natural',
        npcReply: "Yes! The Duty-Free boutique near Gate 20 is open 24 hours. Here, take a sample box of Tokyo Banana to enjoy while you wait!",
        npcMoodAfter: 'friendly',
        hpChange: 15,
        xpGain: 25,
        coinGain: 0,
        itemReward: {
          id: 'item_tokyo_banana',
          name: 'Tokyo Banana Snack Box',
          nameCn: '东京香蕉特产蛋糕礼盒',
          description: '经典日本机场伴手礼，甜美可口，恢复 15 点精力。',
          icon: '🍌',
        },
      },
      {
        id: 'david_ask_lounges',
        englishText: "Is there a quiet rest area or lounge for transit passengers?",
        toneQuality: 'natural',
        npcReply: "Yes, the SkyLounge on the upper mezzanine offers free reclining massage chairs, hot green tea, and high-speed Wi-Fi for all international transit guests.",
        npcMoodAfter: 'helpful',
        hpChange: 10,
        xpGain: 15,
        coinGain: 0,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // ALEX (GATE 18 AGENT) — BOARDING & SEAT SELECTION
  // --------------------------------------------------------------------------
  'alex_intro': {
    id: 'alex_intro',
    speaker: CHAR_AGENT_ALEX,
    npcDialogue: "Good evening! Gate 18 is now boarding the express service to San Francisco. Please have your boarding pass ready.",
    npcDialogueCnHint: "晚上好！Gate 18 正在登机前往旧金山的特快航班。请出示您的登机牌。",
    hintScaffolding: {
      level1Cn: '向 Alex 说明你的电子登机牌加载故障，请他核对改签信息并打印纸质登机牌。',
      level2Starter: "Excuse me, my digital boarding pass...",
      level3Full: "Excuse me, my digital boarding pass isn't loading. Could you help me print a paper one?",
    },
    options: [
      {
        id: 'alex_opt_error',
        englishText: "Excuse me, my digital boarding pass isn't loading on my phone.",
        toneQuality: 'natural',
        npcReply: "No problem at all! Let me scan your passport. Ah yes, I see your confirmed reservation to San Francisco! Which seat preference do you have: Window or Aisle?",
        npcMoodAfter: 'helpful',
        hpChange: 10,
        xpGain: 35,
        coinGain: 0,
        nextDialogNodeId: 'alex_seat_selection',
      },
      {
        id: 'alex_opt_verified',
        englishText: "Here is my passport and rebooking slip.",
        toneQuality: 'natural',
        npcReply: "Perfect! Everything checks out in our manifest. Would you prefer a Window Seat (14A) or an Aisle Seat (14C)?",
        npcMoodAfter: 'helpful',
        hpChange: 10,
        xpGain: 35,
        coinGain: 0,
        nextDialogNodeId: 'alex_seat_selection',
      },
    ],
  },

  'alex_seat_selection': {
    id: 'alex_seat_selection',
    speaker: CHAR_AGENT_ALEX,
    npcDialogue: "I have Seat 14A (Window Seat — great sunset view over the Pacific) or Seat 14C (Aisle Seat — easy legroom access). Which do you prefer?",
    npcDialogueCnHint: "有 14A 靠窗位（可俯瞰太平洋落日美景）和 14C 靠走道位（伸腿方便），您想选哪个？",
    options: [
      {
        id: 'alex_seat_window',
        englishText: "I'd love the Window Seat (14A), please.",
        toneQuality: 'natural',
        npcReply: "Done! Seat 14A assigned. You'll get an incredible view flying into the Golden Gate Bridge tomorrow morning! Here is your verified boarding pass. Walk through the gate to board!",
        npcMoodAfter: 'friendly',
        hpChange: 15,
        xpGain: 40,
        coinGain: 0,
        itemReward: {
          id: 'boarding_pass_verified',
          name: 'Verified Boarding Pass (Seat 14A · Window)',
          nameCn: '已核验纸质登机牌 (14A 靠窗)',
          description: 'SFO 航班已打印登机牌 · 座位 14A (靠窗位) · 登机口 Gate 18',
          icon: '🎫',
        },
        completesGoalId: 'obj_resolve_boarding_issue',
      },
      {
        id: 'alex_seat_aisle',
        englishText: "I'll take the Aisle Seat (14C), please.",
        toneQuality: 'natural',
        npcReply: "All set! Seat 14C assigned with extra ease of movement. Here is your verified boarding pass. Proceed right through the doorway to the aircraft!",
        npcMoodAfter: 'friendly',
        hpChange: 15,
        xpGain: 40,
        coinGain: 0,
        itemReward: {
          id: 'boarding_pass_verified',
          name: 'Verified Boarding Pass (Seat 14C · Aisle)',
          nameCn: '已核验纸质登机牌 (14C 靠走道)',
          description: 'SFO 航班已打印登机牌 · 座位 14C (靠走道) · 登机口 Gate 18',
          icon: '🎫',
        },
        completesGoalId: 'obj_resolve_boarding_issue',
      },
    ],
  },
};

export function getNpcDialogueNode(npcId: string, chapterState: ChapterState, discoveredInfo: DiscoveredInfo): string {
  switch (npcId) {
    case 'sarah':
      if (discoveredInfo.completedNpcDialogues['sarah_done'] || chapterState === 'FLIGHT_SELECTED' || chapterState === 'GOING_TO_NEW_GATE' || chapterState === 'BOARDING_PASS_PROBLEM') {
        if (discoveredInfo.selectedFlight === 'UA921') return 'sarah_post_rebook_22';
        if (discoveredInfo.selectedFlight === 'UA937') return 'sarah_post_rebook_31';
        return 'sarah_post_rebook_22';
      }
      return 'sarah_intro';

    case 'barista':
      return 'mike_intro';

    case 'passenger_elena':
      return 'elena_intro';

    case 'staff_david':
      return 'david_intro';

    case 'agent_alex':
      return 'alex_intro';

    default:
      return 'sarah_intro';
  }
}
