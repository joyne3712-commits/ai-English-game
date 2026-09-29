import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { X, Backpack, Sparkles, Check } from 'lucide-react';
import { sound } from '../services/soundService';

interface InventoryModalProps {
  isOpen: boolean;
  inventory: InventoryItem[];
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  inventory,
  onClose,
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(inventory[0] || null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Backpack className="w-5 h-5" />
            <span className="text-base font-bold tracking-wide">旅行背包 (Inventory)</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Grid & Detail Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left: Items list */}
          <div className="space-y-2 max-h-64 overflow-y-auto overscroll-contain touch-pan-y pr-1">
            {inventory.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedItem(item);
                  }}
                  className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/60 border-amber-500 shadow'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl p-1 bg-slate-900 rounded-xl border border-slate-800">
                    {item.icon}
                  </span>
                  <div className="truncate">
                    <h5 className="text-xs font-bold text-white truncate">{item.nameCn}</h5>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{item.name}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Selected item detail view */}
          {selectedItem && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-4xl text-center py-2">{selectedItem.icon}</div>
                <h4 className="text-sm font-bold text-white text-center">{selectedItem.nameCn}</h4>
                <div className="text-[11px] text-amber-300 font-mono text-center">
                  {selectedItem.name}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
                  {selectedItem.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-900 text-center text-[10px] text-slate-500 font-mono">
                Item ID: {selectedItem.id}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
        >
          返回游戏
        </button>
      </div>
    </div>
  );
};
