import React, { useState } from 'react';
import { Smartphone, X, MapPin, Plane, Clock, Ticket, CheckCircle2, AlertTriangle, FileText, Send, MessageSquare } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotel' | 'messages'>('itinerary');
  const [hotelMessageSent, setHotelMessageSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeGoal = goals.find((g) => g.status === 'ACTIVE');
  const hasSlip22 = inventory.some((i) => i.id === 'flight_rebook_slip');
  const hasSlip31 = inventory.some((i) => i.id === 'flight_rebook_slip_31');
  const hasRebookSlip = hasSlip22 || hasSlip31 || inventory.some((i) => i.id === 'boarding_pass_new');
  const hasBoardingPassVerified = inventory.some((i) => i.id === 'boarding_pass_verified');

  const handleSendHotelMessage = () => {
    sound.playClick();
    sound.playItemGet();
    setHotelMessageSent(true);
  };

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
          <span className="font-bold text-slate-200">TOKYO AIRPORT 5G</span>
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

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 pt-2 pb-1">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('itinerary');
            }}
            className={`py-1.5 text-[11px] font-bold rounded-xl transition-all ${
              activeTab === 'itinerary'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            ✈️ 行程 (Trip)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('hotel');
            }}
            className={`py-1.5 text-[11px] font-bold rounded-xl transition-all ${
              activeTab === 'hotel'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            🏨 酒店 (Hotel)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('messages');
            }}
            className={`py-1.5 text-[11px] font-bold rounded-xl transition-all relative ${
              activeTab === 'messages'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            💬 消息 (Chat)
            {!hotelMessageSent && hasSlip31 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
        </div>

        {/* Scrollable Phone Screen Content */}
        <div className="flex-1 overflow-y-auto py-2.5 px-1 space-y-3 font-sans">
          {activeTab === 'itinerary' && (
            <>
              {/* Trip Overview Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-950/80 to-slate-900 border border-sky-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                    TRAVEL ITINERARY
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    TRANSIT IN TOKYO
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs font-bold text-white pt-1">
                  <span>NINGBO</span>
                  <span className="text-sky-400">➔</span>
                  <span className="text-amber-300">TOKYO</span>
                  <span className="text-sky-400">➔</span>
                  <span>SAN FRANCISCO</span>
                </div>
                <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800 flex justify-between">
                  <span>Flight 1: NGB ➔ NRT</span>
                  <span className="text-emerald-400 font-bold">COMPLETED</span>
                </div>
                <div className="text-[11px] text-slate-300 flex justify-between">
                  <span>Flight 2: UA 889 (20:40)</span>
                  <span className="text-rose-400 font-bold">CANCELLED</span>
                </div>
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
                    ? 'Find Gate 18 in west concourse and verify boarding pass with Alex.'
                    : hasSlip31
                    ? 'Head to Gate 31 in North Concourse for UA937 (23:10).'
                    : hasSlip22
                    ? 'Head to Gate 22 for UA921 (21:30).'
                    : 'Figure out what to do. Check Departure Board or speak to Sarah at Counter B.'}
                </p>
              </div>

              {/* Alternative Flights Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>REPLACEMENT FLIGHT OPTIONS</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className={`p-2 rounded-xl border ${hasSlip22 ? 'bg-sky-950/40 border-sky-400' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex justify-between font-bold">
                      <span className="text-sky-300">Option A: UA 921</span>
                      <span className="text-amber-300">21:30 · Gate 22</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Earlier arrival in SF. Tighter boarding time at Gate 22.
                    </p>
                  </div>

                  <div className={`p-2 rounded-xl border ${hasSlip31 ? 'bg-sky-950/40 border-sky-400' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex justify-between font-bold">
                      <span className="text-sky-300">Option B: UA 937</span>
                      <span className="text-amber-300">23:10 · Gate 31</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Later departure, plenty of airport buffer. May arrive past hotel check-in deadline (23:00).
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'hotel' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    HOTEL RESERVATION
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    SAN FRANCISCO
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">Sunset Hotel</h4>
                <p className="text-xs text-slate-300">842 Geary St, San Francisco, CA 94109</p>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Guest Name:</span>
                    <span className="text-white font-bold">Traveler (1 Room)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Check-in Deadline:</span>
                    <span className="text-rose-400 font-bold">Until 23:00 PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold">Guaranteed</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  ⚠️ Note: If you choose a late replacement flight (e.g. UA937), you might land in SF after 23:00. You should notify the hotel in advance.
                </p>
              </div>

              {!hotelMessageSent ? (
                <button
                  onClick={handleSendHotelMessage}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Notify Hotel of Late Check-In</span>
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Late check-in notification sent to Sunset Hotel!</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-slate-200">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Sunset Hotel Front Desk</span>
                </div>

                {hotelMessageSent ? (
                  <div className="space-y-2.5 text-xs">
                    {/* Outgoing message */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] p-2.5 rounded-2xl rounded-tr-none bg-sky-600 text-white">
                        "My flight was cancelled. I'll probably arrive late past 23:00."
                      </div>
                    </div>
                    {/* Incoming response */}
                    <div className="flex justify-start">
                      <div className="max-w-[85%] p-2.5 rounded-2xl rounded-tl-none bg-slate-800 text-slate-200 border border-slate-700 space-y-1">
                        <span className="text-[10px] text-amber-400 font-bold block">Sunset Hotel Support</span>
                        <p>"That's completely fine! We have noted your late arrival and will keep your room held until midnight. Safe flight!"</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-xs text-slate-400">No active messages yet.</p>
                    <button
                      onClick={handleSendHotelMessage}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Message Hotel About Late Arrival
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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
