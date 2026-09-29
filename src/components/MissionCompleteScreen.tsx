import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { sound } from '../services/soundService';
import { Trophy, Sparkles, Coins, Volume2, RotateCcw, ArrowRight, Plane, CheckCircle2, Bookmark, Lock, Coffee, Hotel, ShieldCheck, MapPin } from 'lucide-react';

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
  const [showChapter2Preview, setShowChapter2Preview] = useState<boolean>(false);

  // Identify player's choices from inventory
  const isWindowSeat = inventory.some((item) => item.name.includes('14A') || item.name.includes('Window'));
  const isAisleSeat = inventory.some((item) => item.name.includes('14C') || item.name.includes('Aisle'));
  const selectedFlightName = inventory.some((item) => item.id === 'flight_rebook_slip_31')
    ? 'UA937 (23:10 Departure · Gate 31)'
    : 'UA921 (21:30 Express · Gate 22)';
  const hasCoffee = inventory.some((item) => item.id.includes('coffee') || item.id.includes('latte'));
  const hasSouvenir = inventory.some((item) => item.id.includes('banana') || item.id.includes('eyemask'));

  const expressionsMastered = [
    {
      en: "My connecting flight was cancelled. Could you help me rebook?",
      cn: "我的转机航班被取消了，能帮我安排改签吗？",
    },
    {
      en: "What are my options for reaching San Francisco tonight?",
      cn: "请问今晚还有哪些飞往旧金山的备选航班？",
    },
    {
      en: "Will my checked baggage be transferred automatically?",
      cn: "我的托运行李会自动转运直挂到目的地吗？",
    },
    {
      en: "Could I request an aisle or window seat on this flight?",
      cn: "这班航班能帮我安排靠走道或靠窗的座位吗？",
    },
    {
      en: "Excuse me, where is Gate 18? Is boarding already starting?",
      cn: "打扰一下，请问18号登机口怎么走？已经开始登机了吗？",
    },
    {
      en: "My digital boarding pass isn't scanning. Could you print a paper copy?",
      cn: "我的手机电子登机牌扫不出来，能帮我打印一张纸质登机牌吗？",
    },
    {
      en: "Are meal vouchers provided for this airline delay?",
      cn: "由于航班延误，航司会提供机场餐饮抵用券吗？",
    },
    {
      en: "What time does the boarding gate close?",
      cn: "请问登机口最晚几点停止登机？",
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
    <div className="w-full max-w-4xl mx-auto bg-[#0b101b] border-2 border-amber-500/80 rounded-3xl shadow-[0_25px_80px_rgba(245,158,11,0.25)] p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-300 font-mono text-slate-100 select-none">
      {/* 1. Header Fanfare & Chapter Victory Banner */}
      <div className="text-center space-y-3 pb-6 border-b border-slate-800 relative">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-bounce-short">
          <Trophy className="w-10 h-10" />
        </div>
        <div className="text-xs font-mono text-amber-400 uppercase tracking-widest">
          NINGBO ➔ TOKYO ➔ SAN FRANCISCO · MISSION COMPLETE
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wider">
          CHAPTER 01 · THE CONNECTION
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-sans font-medium">
          🎉 恭喜！你独自一人在东京成功应对了国际航班突发取消、备选航班抉择、行李直挂确认与登机牌故障，顺利登上了飞往旧金山的客机！
        </p>

        {/* Stats Grid */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">旅行经验:</span>
            <span className="text-base font-bold text-amber-300">+{xp} XP</span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">剩余资金:</span>
            <span className="text-base font-bold text-emerald-300">${money}</span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs">
            <span className="text-slate-400">精力值:</span>
            <span className="text-base font-bold text-rose-400">{hp}%</span>
          </div>
        </div>
      </div>

      {/* 2. Your Travel Decision Log (Sims-style choices summary) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/50 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-sky-800/40 pb-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-600 text-white font-bold tracking-wider">
            YOUR TRIP SUMMARY · 行程抉择回顾
          </span>
          <span className="text-sky-300">UNITED AIRLINES ➔ SFO</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Selected Flight</div>
            <div className="text-sm font-bold text-amber-300">{selectedFlightName}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Assigned Seat</div>
            <div className="text-sm font-bold text-emerald-400">
              {isWindowSeat ? 'Seat 14A (Window · Pacific View)' : isAisleSeat ? 'Seat 14C (Aisle · Easy Legroom)' : 'Seat 14A (Confirmed)'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Baggage & Hotel</div>
            <div className="text-sm font-bold text-sky-300">Auto-Transfer / Sunset Hotel</div>
          </div>
        </div>
      </div>

      {/* 3. Expressions Unlocked in Phrasebook */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Bookmark className="w-4 h-4" />
            <span>✈️ 本章旅行生存短语录 (Travel Expressions Archive) ({expressionsMastered.length})</span>
          </div>
          <span className="text-xs text-slate-400">点击 🔊 听地道发音</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
          {expressionsMastered.map((exp, idx) => {
            const isPlaying = playingPhrase === exp.en;
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="text-xs sm:text-sm font-bold text-white leading-snug">
                    "{exp.en}"
                  </div>
                  <div className="text-xs text-sky-300 font-sans font-medium">{exp.cn}</div>
                </div>

                <button
                  onClick={() => handleSpeak(exp.en)}
                  className={`p-2 rounded-xl border shrink-0 transition-colors cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                  aria-label={`Listen to "${exp.en}"`}
                  title="Play Authentic Audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Action Buttons (Replay, Sneak Peek Chapter 2, Next Chapter) */}
      <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => {
            sound.playClick();
            onRestart();
          }}
          className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-2 border border-slate-700 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>PLAY CHAPTER 01 AGAIN</span>
        </button>

        <button
          onClick={() => {
            sound.playItemGet();
            setShowChapter2Preview(true);
          }}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center gap-2 shadow-[0_10px_25px_rgba(245,158,11,0.35)] cursor-pointer"
        >
          <span>PREVIEW CHAPTER 02: THE WRONG HOTEL</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Chapter 02 Sneak Peek Modal */}
      {showChapter2Preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0b101b] border-2 border-amber-400 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl relative text-slate-100">
            <div className="text-center space-y-2 pb-3 border-b border-slate-800">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                NEXT ADVENTURE
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wider">
                CHAPTER 02 · THE WRONG HOTEL
              </h3>
              <p className="text-xs text-sky-300 font-sans">
                San Francisco, 23:45 PM · Downtown Geary Street
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm space-y-2.5 font-sans leading-relaxed text-slate-300">
              <p>
                You step out of the San Francisco airport taxi into the cool Pacific night fog.
              </p>
              <p>
                You walk into the lobby of <strong className="text-amber-300">Sunset Hotel</strong>, hand over your passport, but the front desk clerk frowns at the computer:
              </p>
              <p className="text-rose-400 font-semibold italic">
                "I'm sorry, we have no record of your reservation under this name tonight..."
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowChapter2Preview(false);
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              CLOSE PREVIEW
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
