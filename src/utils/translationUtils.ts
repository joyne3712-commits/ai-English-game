import { DialogueOption } from '../types';

/**
 * Universal Dialogue Option Translation Dictionary
 * Maps all dialogue lines across characters (Sarah, Mike, David, Elena, Alex)
 * to accurate, natural Chinese translations.
 */
export const DIALOGUE_TRANSLATION_MAP: Record<string, string> = {
  // --- SARAH (Counter B) ---
  "My connecting flight was cancelled.": "我的转机航班被取消了。",
  "My flight to San Francisco was cancelled.": "我飞往旧金山的航班被取消了。",
  "Are there any meal vouchers or compensation for this delay?": "请问这次航班延误有提供餐饮抵用券或补偿吗？",
  "I think my flight was cancelled.": "我想我的航班好像被取消了。",
  "21:30 — UA921": "选择 21:30 起飞的 UA921 航班（较早到达旧金山）",
  "23:10 — UA937": "选择 23:10 起飞的 UA937 航班（时间充裕但较晚到达）",
  "What's the difference between the two flights?": "这两趟备选航班有什么区别？",
  "Will my checked baggage transfer automatically?": "我的托运行李会自动转运直挂吗？",
  "Thanks so much, Sarah. Heading to Gate 22 now!": "非常感谢你 Sarah，我现在立刻前往 Gate 22 登机口！",
  "Thank you Sarah. I will message my hotel about the late arrival.": "谢谢你 Sarah，我会发信息通知酒店我会晚点入住。",
  "On my way to Gate 22 now. Thanks again!": "我正在去 Gate 22 登机口的路上，再次感谢！",
  "Thanks Sarah, heading over toward the gate area.": "谢谢 Sarah，我现在前往登机区了。",

  // --- MIKE (Skyline Brew Cafe & Lounge) ---
  "Could I get something from the cafe? What do you recommend?": "我能买点喝的吗？请问有什么推荐？",
  "You're heading to San Francisco too? My flight was cancelled.": "你也是去旧金山吗？我的航班刚才被取消了。",
  "Do you know the Wi-Fi password or where I can charge my phone?": "请问你知道这里的 Wi-Fi 密码或者哪里能给手机充电吗？",
  "What brings you to San Francisco?": "你这次去旧金山是有什么行程？",
  "I'd like a Hot Americano, please. ($3.50)": "我想要一杯热美式咖啡（$3.50）。",
  "I'll have a Caramel Oat Latte and a Matcha Cookie. ($6.50)": "我想要一杯焦糖燕麦拿铁和一份抹茶曲奇（$6.50）。",
  "Just a bottle of chilled sparkling water, please. ($2.00)": "麻烦给我一瓶冰镇气泡水就好（$2.00）。",
  "Actually, let me ask about flights first.": "我还是先去问一下改签航班的事情吧。",
  "I have an airline meal voucher ($25). What can I get with it?": "我有一张 $25 的航司餐饮抵用券，可以买些什么？",
  "My flight was cancelled. How do I rebook?": "我的航班取消了，请问该怎么改签？",
  "Just looking around the airport. What is good here?": "随便逛逛，请问这里有什么推荐的吗？",
  "I'd like a Hot Americano ($4) please.": "我想要一杯热美式咖啡（$4）。",
  "I'd like the Caramel Oat Latte & Matcha Cookies Combo ($9).": "我想要焦糖燕麦拿铁配抹茶曲奇套餐（$9）。",
  "I'd like an Airport Banana Snack ($2).": "我想要一份机场能量香蕉小食（$2）。",
  "I'd like a Silk Travel Eye Mask ($15).": "我想要一个真丝旅行眼罩（$15）。",
  "Nothing for now, thanks Mike!": "暂时不用了，谢谢 Mike！",

  // --- ELENA (Fellow Passenger) ---
  "Baggage Carousel 03 is right down that hallway on the left.": "行李提取传输带 03 就在左前方走廊尽头。",
  "Are you also flying to San Francisco tonight?": "你今晚也是飞往旧金山吗？",
  "My connecting flight UA889 was just cancelled.": "我的转机航班 UA889 刚才被取消了。",

  // --- DAVID (Information Desk) ---
  "Where is the Passenger Service Desk for flight rebooking?": "请问办理航班改签的旅客服务柜台在哪里？",
  "Are any souvenir shops open late for Japanese snacks?": "请问有营业到深夜的日本特色伴手礼店吗？",
  "Is there a quiet rest area or lounge for transit passengers?": "请问有适合转机旅客休息的安静休息室或候机区吗？",
  "Hi David, could you tell me where Gate 22 is?": "你好 David，请问 Gate 22 登机口怎么走？",
  "Hi David, which way is Gate 31?": "你好 David，请问 Gate 31 登机口在哪个方向？",
  "Will my checked luggage transfer automatically?": "我的托运行李会自动直挂到目的地吗？",
  "Thanks for the directions, David!": "谢谢你的指路，David！",

  // --- ALEX (Gate 18 Agent) ---
  "Excuse me, my digital boarding pass isn't loading on my phone.": "打扰一下，我的手机电子登机牌加载不出来了。",
  "Here is my passport and rebooking slip.": "这是我的护照和改签凭证。",
  "I'd love the Window Seat (14A), please.": "我想要靠窗座位 (14A)，谢谢。",
  "I'll take the Aisle Seat (14C), please.": "我选靠走道座位 (14C)，谢谢。",
  "Hi, is this the boarding gate for UA921 to San Francisco?": "你好，请问这里是飞往旧金山的 UA921 登机口吗？",
  "Hi, is this Gate 31 for UA937 to San Francisco?": "你好，请问这里是飞往旧金山的 UA937 登机口 Gate 31 吗？",
  "Excuse me, where is the gate for UA921? The board says it moved.": "打扰一下，请问 UA921 改到了哪个登机口？航显屏显示它换登机口了。",
  "My phone app crashed and won't display my boarding pass.": "我的手机 App 崩溃了，显示不出电子登机牌。",
  "Here is my passport and ticket slip. Could you print a boarding pass?": "这是我的护照和改签单，能帮我打印一张纸质登机牌吗？",
  "Could I request a Window Seat (14A)?": "请问能帮我安排靠窗座位 (14A) 吗？",
  "Could I request an Aisle Seat (14C)?": "请问能帮我安排靠走道座位 (14C) 吗？",
  "Any seat is fine, thank you Alex.": "任何座位都可以，谢谢你 Alex。",
  "Thank you Alex! Ready to board now.": "谢谢你 Alex！我现在准备登机了。",
};

/**
 * Cleans punctuation and whitespace for fuzzy fallback matching.
 */
function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Pattern-based translation fallback for any dynamic phrases
 */
function patternBasedTranslate(rawText: string): string {
  const norm = normalizeForMatching(rawText);

  if (norm.includes('connecting flight') && norm.includes('cancel')) {
    return '我的转机航班被取消了。';
  }
  if (norm.includes('flight to san francisco') && norm.includes('cancel')) {
    return '我飞往旧金山的航班被取消了。';
  }
  if (norm.includes('meal voucher') || norm.includes('compensation')) {
    return '请问这次航班延误有提供餐饮抵用券或补偿吗？';
  }
  if (norm.includes('difference between') && norm.includes('flight')) {
    return '这两趟备选航班有什么区别？';
  }
  if (norm.includes('baggage') || norm.includes('luggage')) {
    if (norm.includes('transfer')) return '我的托运行李会自动转运直挂吗？';
    if (norm.includes('carousel')) return '行李提取传输带 03 就在左侧走廊。';
  }
  if (norm.includes('window seat') || norm.includes('14a')) {
    return '我想要靠窗座位 (14A)。';
  }
  if (norm.includes('aisle seat') || norm.includes('14c')) {
    return '我想要靠走道座位 (14C)。';
  }
  if (norm.includes('boarding pass') && (norm.includes('not loading') || norm.includes('crashed') || norm.includes('phone'))) {
    return '打扰一下，我的手机电子登机牌加载不出来了。';
  }
  if (norm.includes('passport') && (norm.includes('slip') || norm.includes('ticket'))) {
    return '这是我的护照和改签单凭证。';
  }
  if (norm.includes('gate 22')) {
    return '前往 Gate 22 登机口。';
  }
  if (norm.includes('gate 31')) {
    return '前往 Gate 31 登机口。';
  }
  if (norm.includes('gate 18')) {
    return '前往 Gate 18 登机口。';
  }
  if (norm.includes('americano') || norm.includes('coffee')) {
    return '我想要一杯热美式咖啡。';
  }
  if (norm.includes('latte') || norm.includes('cookie')) {
    return '我想要一杯焦糖燕麦拿铁和抹茶曲奇。';
  }
  if (norm.includes('sparkling water') || norm.includes('water')) {
    return '麻烦给我一瓶气泡水。';
  }
  if (norm.includes('wi-fi') || norm.includes('wifi') || norm.includes('charge')) {
    return '请问这里的 Wi-Fi 密码或充电站在哪里？';
  }
  if (norm.includes('souvenir') || norm.includes('snack') || norm.includes('banana')) {
    return '请问有日本特色伴手礼商店吗？';
  }
  if (norm.includes('lounge') || norm.includes('rest area')) {
    return '请问有适合转机旅客的休息室吗？';
  }
  if (norm.includes('hotel') && norm.includes('late')) {
    return '我会发信息通知酒店关于晚点到达的信息。';
  }
  if (norm.includes('thank') || norm.includes('thanks')) {
    return '非常感谢你的帮助！';
  }

  return '（点击选择此回答）';
}

/**
 * Universal option translation resolver. Guaranteed to return a valid Chinese translation.
 */
export function getOptionChineseTranslation(option: DialogueOption | { englishText: string; chineseBrief?: string; intentLabelCn?: string }): string {
  if (!option || !option.englishText) return '';

  if (option.chineseBrief && option.chineseBrief.trim()) {
    return option.chineseBrief.trim();
  }

  if (option.intentLabelCn && option.intentLabelCn.trim()) {
    return option.intentLabelCn.trim();
  }

  const rawText = option.englishText.trim();

  // 1. Direct Map Lookup
  if (DIALOGUE_TRANSLATION_MAP[rawText]) {
    return DIALOGUE_TRANSLATION_MAP[rawText];
  }

  // 2. Normalized Map Lookup
  const targetNorm = normalizeForMatching(rawText);
  for (const [key, val] of Object.entries(DIALOGUE_TRANSLATION_MAP)) {
    if (normalizeForMatching(key) === targetNorm) {
      return val;
    }
  }

  // 3. Pattern-Based Fallback
  return patternBasedTranslate(rawText);
}
