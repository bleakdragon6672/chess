"use client";

import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { PlayedMove } from "@/lib/types";

export function MoveHistory({ moves, currentIndex, onNavigate }: { moves: PlayedMove[]; currentIndex: number; onNavigate: (index: number) => void }) {
  return (
    <div className="flex min-h-[168px] flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2"><List size={14} className="text-mint" /><span className="text-xs font-bold">Move history</span></div>
        <div className="flex gap-1">
          <button aria-label="Previous position" className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-white" onClick={() => onNavigate(Math.max(0, currentIndex - 1))}><ChevronLeft size={16} /></button>
          <button aria-label="Next position" className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-white" onClick={() => onNavigate(Math.min(moves.length, currentIndex + 1))}><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto p-2">
        {moves.length === 0 ? <p className="px-2 py-6 text-center text-xs text-slate-600">Your moves will appear here.</p> : (
          <div className="grid grid-cols-2 gap-1 text-sm">
            {moves.map((move, index) => (
              <button key={`${move.san}-${index}`} onClick={() => onNavigate(index + 1)} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition ${currentIndex === index + 1 ? "bg-mint/15 text-mint" : "text-slate-300 hover:bg-white/5"}`}>
                <span className="w-5 text-[10px] text-slate-600">{index % 2 === 0 ? `${Math.floor(index / 2) + 1}.` : ""}</span><span className="font-semibold">{move.san}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
