import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { sound } from '../services/soundService';
import { Trophy, Sparkles, Coins, Volume2, RotateCcw, ArrowRight, Plane, CheckCircle2, Bookmark } from 'lucide-react';

interface MissionCompleteScreenProps {
  score: number;
  xp: number;
  money: number;
  hp: number;
  inventory: InventoryItem[];
  onRestart: () => void;
}

export const MissionCompleteScreen: React.FC<MissionCompleteScreenProps> = ({
  score,
  xp,
  money,
  hp,
  inventory,
  onRestart,
}) => {
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);

  const expressionsMastered = [
    {
      en: "Excuse me, could you help me with this?",
      cn: "打扰一下，你能帮我处理一下这个情况吗？",
      note: "万能高情商破冰求助句块",
    },
    {
      en: "Was it due to weather or a mechanical issue?",
      cn: "这是由于天气原因还是机械故障？",
      note: "切入航司责任归属的核心句",
    },
    {
      en: "What are my options for rebooking?",
      cn: "请问改签有哪些方案可供选择？",
      note: "差旅必备，迅速索取所有备选航班",
    },
    {
      en: "Will my checked bags transfer automatically?",
      cn: "我的托运行李会自动转运直挂吗？",
      note: "转机必备，核实中途是否需要提取行李",
    },
    {
      en: "Since this was due to maintenance, does the airline provide meal vouchers?",
      cn: "鉴于延误是由于机械维护，请问航司是否提供餐饮代金券？",
      note: "有理有据争取权益与补偿的高阶模板",
    },
    {
      en: "Could you just confirm the gate number and boarding time?",
      cn: "能否帮我确认一下登机口编号和登机时间？",
      note: "离台收官核实，杜绝走错航站楼",
    },
  ];

  const handleSpeak = (text: string) => {
    sound.playClick();
    setPlayingPhrase(text);
    sound.speak(text, () => {
      setPlayingPhrase(null);
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-300">
      {/* Header Fanfare */}
      <div className="text-center space-y-3 pb-6 border-b border-slate-800">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
          <Trophy className="w-10 h-10" />
        </div>
        <div className="text-xs font-mono text-amber-400 uppercase tracking-widest">
          MISSION 01 · VICTORY
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          ✈️ 登机口 B22 开启 · 任务圆满达成！
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          你凭借纯正得体的英语，从容化解了航班突发取消的重大危机，拿到了今晚经西雅图直奔旧金山的新登机牌与餐饮补偿！
        </p>

        {/* Stats Grid */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">总经验：</span>
            <span className="text-base font-bold text-amber-300">{xp} XP</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">结余资金：</span>
            <span className="text-base font-bold text-emerald-300">${money}</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">社交精力：</span>
            <span className="text-base font-bold text-rose-400">{hp}%</span>
          </div>
        </div>
      </div>

      {/* Boarding Pass Hero Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/50 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-sky-800/40 pb-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-sky-600 text-white font-mono font-bold">
            CONFIRMED BOARDING PASS
          </span>
          <span className="font-mono text-sky-300">UNITED AIRLINES · SEATTLE CONNECTION</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 py-2">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">From</div>
            <div className="text-lg font-black text-white">PACIFIC RIM (TERMINAL 2)</div>
            <span className="text-xs text-amber-400 font-mono">Gate B22 · Boarding 20:50</span>
          </div>
          <div className="text-2xl text-sky-400 font-bold">✈️</div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">To Final Destination</div>
            <div className="text-lg font-black text-white">SAN FRANCISCO (SFO)</div>
            <span className="text-xs text-emerald-400 font-mono">Arriving Tonight 23:45 PST</span>
          </div>
        </div>
      </div>

      {/* Expressions Unlocked in Phrasebook */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Bookmark className="w-4 h-4" />
            <span>本章冒险收录的地道口语技能 ({expressionsMastered.length})</span>
          </div>
          <span className="text-xs text-slate-500">点击喇叭可随身磨耳朵</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
          {expressionsMastered.map((exp, idx) => {
            const isPlaying = playingPhrase === exp.en;
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3 group hover:border-slate-700 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white font-mono leading-tight">
                    "{exp.en}"
                  </div>
                  <div className="text-[11px] text-sky-300">{exp.cn}</div>
                  <div className="text-[10px] text-slate-400 italic">{exp.note}</div>
                </div>

                <button
                  onClick={() => handleSpeak(exp.en)}
                  className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 shrink-0 cursor-pointer"
                  title="朗读发音"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'text-sky-400 animate-pulse' : ''}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-slate-400">
          🎮 第一章【机场突围】通关！后续章节（海关问询、酒店入住、餐厅突发）即将启程。
        </span>

        <button
          onClick={() => {
            sound.playClick();
            onRestart();
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重新探索机场关卡 (Replay)</span>
        </button>
      </div>
    </div>
  );
};
