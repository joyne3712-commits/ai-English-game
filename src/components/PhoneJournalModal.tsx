import React from 'react';
import { Smartphone, X, MapPin, Plane, Clock, Ticket, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { QuestGoal, InventoryItem } from '../types';
import { sound } from '../services/soundService';

interface PhoneJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: QuestGoal[];
  inventory: InventoryItem[];
  inGameTimeFormatted: string;
  isGateChanged?: boolean;
}

export const PhoneJournalModal: React.FC<PhoneJournalModalProps> = ({
  isOpen,
  onClose,
  goals,
  inventory,
  inGameTimeFormatted,
  isGateChanged = false,
}) => {
  if (!isOpen) return null;

  const activeGoal = goals.find((g) => g.status === 'ACTIVE');
  const hasRebookSlip = inventory.some((i) => i.id === 'flight_rebook_slip' || i.id === 'boarding_pass_new');
  const hasBoardingPassVerified = inventory.some((i) => i.id === 'boarding_pass_verified');
  const hasMealVoucher = inventory.some((i) => i.id === 'meal_voucher');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      {/* Smartphone Frame */}
      <div className="w-full max-w-sm bg-[#090d16] border-4 border-slate-700 rounded-[38px] shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-4 relative font-sans text-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Phone Speaker Notch & Camera */}
        <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          <div className="w-8 h-1 rounded-full bg-slate-900" />
        </div>

        {/* Top Status Bar */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-3 pb-2 border-b border-slate-800">
          <span className="font-bold text-slate-200">PACIFIC AIRPORT 5G</span>
          <span className="font-bold text-amber-300">{inGameTimeFormatted}</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Phone Screen Content */}
        <div className="flex-1 overflow-y-auto py-3 px-1 space-y-3.5 font-sans">
          {/* Trip App Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-950/70 to-slate-900 border border-sky-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                TRIP COMPANION
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                CH. 01 ACTIVE
              </span>
            </div>
            <h3 className="text-base font-bold text-white">San Francisco Flight Status</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Original flight <span className="font-mono text-rose-300 font-bold">UA 889</span> cancelled due to mechanical issue.
            </p>
          </div>

          {/* Current Objective Card */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>CURRENT OBJECTIVE</span>
            </div>
            <div className="text-sm font-bold text-white">
              {activeGoal ? activeGoal.text : 'All Objectives Completed!'}
            </div>
            <p className="text-[11px] text-amber-200/80 font-mono">
              {hasBoardingPassVerified
                ? 'Proceed to Gate 18 and scan barcode to board flight.'
                : isGateChanged
                ? 'Find Gate 18 in west concourse and verify boarding pass.'
                : hasRebookSlip
                ? 'Head to Gate 22 to prepare for your 6:40 PM flight.'
                : 'Locate Agent Sarah at Service Counter B to request rebooking.'}
            </p>
          </div>

          {/* Important Information Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>IMPORTANT TRAVEL DETAILS</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Original Flight:</span>
                <span className="text-rose-400 font-bold">UA 889 (CANCELLED)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Rebooked Flight:</span>
                <span className={hasRebookSlip ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {hasBoardingPassVerified
                    ? 'UA 889 (6:40 PM · Verified)'
                    : hasRebookSlip
                    ? 'UA 889 (6:40 PM SFO)'
                    : 'Pending Rebooking with Sarah'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Departure Gate:</span>
                <span className={hasRebookSlip ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                  {isGateChanged
                    ? 'Gate 18 (West Concourse)'
                    : hasRebookSlip
                    ? 'Gate 22'
                    : 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Checked Baggage:</span>
                <span className={hasRebookSlip ? 'text-sky-300 font-bold' : 'text-slate-500'}>
                  {hasRebookSlip ? 'Direct to SFO (Auto Tagged)' : 'Staged in Cargo Holding'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Dining Voucher:</span>
                <span className={hasMealVoucher ? 'text-emerald-300 font-bold' : 'text-slate-500'}>
                  {hasMealVoucher ? '$30 Airport Voucher Acquired' : 'Not yet claimed'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Guide / Help */}
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
            <span className="font-bold text-slate-300 block">Navigation Guide:</span>
            <div>• Move: <strong className="text-slate-200">WASD</strong> or Arrow Keys (or click floor)</div>
            <div>• Talk: <strong className="text-amber-300">[E]</strong> or click person when close</div>
          </div>
        </div>

        {/* Bottom Phone Home Indicator */}
        <div className="pt-2">
          <div
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-28 h-1 bg-slate-600 rounded-full mx-auto cursor-pointer hover:bg-slate-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
