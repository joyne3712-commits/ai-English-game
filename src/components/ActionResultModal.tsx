import React, { useState } from 'react';
import { DialogueOption, InventoryItem } from '../types';
import { sound } from '../services/soundService';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Coins, Heart, Volume2, ArrowRight, Gift } from 'lucide-react';

interface ActionResultModalProps {
  option: DialogueOption;
  speakerPersona?: string;
  onContinue: () => void;
}

export const ActionResultModal: React.FC<ActionResultModalProps> = ({ option, speakerPersona, onContinue }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleSpeakNpcReply = () => {
    if (isPlayingAudio) {
      sound.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    sound.speak(
      option.npcReply,
      () => {
        setIsPlayingAudio(false);
      },
      speakerPersona
    );
  };

  const getToneBadge = () => {
    switch (option.toneQuality) {
      case 'natural':
        return {
          label: '🟢 地道得体 · Natural',
          border: 'border-emerald-500/60',
          bg: 'bg-emerald-950/40',
          textColor: 'text-emerald-300',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        };
      case 'acceptable':
        return {
          label: '🟡 基本达意 · Understandable',
          border: 'border-amber-500/60',
          bg: 'bg-amber-950/40',
          textColor: 'text-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        };
      case 'inappropriate':
        return {
          label: '🔴 沟通受挫 · Inappropriate',
          border: 'border-rose-500/60',
          bg: 'bg-rose-950/40',
          textColor: 'text-rose-300',
          icon: <XCircle className="w-5 h-5 text-rose-400" />,
        };
    }
  };

  const badge = getToneBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className={`w-full max-w-lg bg-slate-900 border-2 ${badge.border} rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {badge.icon}
            <span className={`text-sm font-bold ${badge.textColor}`}>{badge.label}</span>
          </div>

          {/* Reward Badges */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {option.xpGain > 0 && (
              <span className="flex items-center gap-1 text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-800/80 font-bold">
                <Sparkles className="w-3.5 h-3.5" />+{option.xpGain} XP
              </span>
            )}
            {option.coinGain > 0 && (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-800/80 font-bold">
                <Coins className="w-3.5 h-3.5" />+${option.coinGain}
              </span>
            )}
          </div>
        </div>

        {/* NPC's immediate spoken reaction */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>NPC 现场回应：</span>
            <button
              onClick={handleSpeakNpcReply}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono cursor-pointer"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
              <span>{isPlayingAudio ? '播放中...' : '朗读'}</span>
            </button>
          </div>
          <p className="text-sm sm:text-base font-medium text-slate-100 italic leading-relaxed">
            "{option.npcReply}"
          </p>
        </div>

        {/* Item reward if acquired */}
        {option.itemReward && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/50 flex items-center gap-3">
            <div className="text-3xl shrink-0 p-2 bg-amber-900/40 rounded-xl border border-amber-700/50">
              {option.itemReward.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5" />
                <span>获得新道具凭证！</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{option.itemReward.nameCn}</h4>
              <p className="text-xs text-slate-300">{option.itemReward.description}</p>
            </div>
          </div>
        )}

        {/* Concise Chinese Debrief */}
        <div className="space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            交际效果分析：
          </span>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            {option.chineseBrief}
          </p>
        </div>

        {/* Better native alternative if provided */}
        {option.betterAlternative && option.toneQuality !== 'natural' && (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono">
            <span className="text-emerald-400 font-bold">母语级更优表达： </span>
            "{option.betterAlternative}"
          </div>
        )}

        {/* Continue Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onContinue();
            }}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer active:scale-98"
          >
            <span>推进剧情 · 继续冒险</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
