import { ArrowDownRight, ArrowUpRight, CircleCheck, Sparkles, Target } from "lucide-react";
import { PlayedMove } from "@/lib/types";

const tone: Record<string, string> = {
  Brilliant: "bg-mint/15 text-mint", Great: "bg-sky-400/15 text-sky-300", Best: "bg-blue-400/15 text-blue-300", Excellent: "bg-teal-400/15 text-teal-300", Good: "bg-slate-400/15 text-slate-300", Inaccuracy: "bg-amber-400/15 text-amber-300", Mistake: "bg-orange-400/15 text-orange-300", Blunder: "bg-red-400/15 text-red-300", "Missed win": "bg-violet-400/15 text-violet-300",
};

export function GameReviewSummary({ moves, onCoach }: { moves: PlayedMove[]; onCoach: () => void }) {
  const whiteMoves = moves.filter((move) => move.color === "w");
  const blackMoves = moves.filter((move) => move.color === "b");
  const whiteAccuracy = Math.min(99, 76 + whiteMoves.length * 1.8);
  const blackAccuracy = Math.min(99, 81 + blackMoves.length * 1.4);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <AccuracyCard label="White accuracy" value={whiteAccuracy} trend="+4.2" color="mint" />
        <AccuracyCard label="Black accuracy" value={blackAccuracy} trend="+1.8" color="sky" />
      </div>
      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3"><div><p className="eyebrow">Move quality</p><h3 className="mt-1 text-sm font-bold">Your critical moments</h3></div><Sparkles size={17} className="text-mint" /></div>
        <div className="divide-y divide-line/70">
          {(moves.length ? moves.slice(-6).reverse() : demoMoves).map((move, index) => <div key={`${move.san}-${index}`} className="flex items-center gap-3 px-4 py-3"><span className={`flex h-7 min-w-7 items-center justify-center rounded-md text-[10px] font-black ${tone[move.classification ?? "Good"]}`}>{move.classification === "Brilliant" ? "!!" : move.classification === "Blunder" ? "??" : move.classification === "Great" ? "!" : "·"}</span><span className="w-14 text-sm font-bold">{move.san}</span><span className="flex-1 text-xs text-slate-400">{move.classification === "Blunder" ? "A tactical opportunity slipped away." : move.classification === "Brilliant" ? "A precise move that changes the position." : "Keeps the position under control."}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${tone[move.classification ?? "Good"]}`}>{move.classification ?? "Good"}</span></div>)}
        </div>
      </div>
      <div className="panel flex items-center justify-between gap-4 p-4"><div><p className="text-sm font-bold">Want the story behind the moves?</p><p className="mt-1 text-xs text-slate-400">Ask your AI Grandmaster about any turning point.</p></div><button className="btn-primary shrink-0" onClick={onCoach}><Target size={15} /> Ask coach</button></div>
    </div>
  );
}

function AccuracyCard({ label, value, trend, color }: { label: string; value: number; trend: string; color: string }) {
  return <div className="panel p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-400">{label}</span><span className={`flex items-center gap-1 text-[10px] font-bold ${color === "mint" ? "text-mint" : "text-sky-300"}`}><ArrowUpRight size={13} />{trend}</span></div><div className="mt-3 flex items-end gap-3"><span className="text-3xl font-black tracking-tight">{value.toFixed(1)}%</span><div className="mb-1 h-2 flex-1 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${color === "mint" ? "bg-mint" : "bg-sky-300"}`} style={{ width: `${value}%` }} /></div></div></div>;
}

const demoMoves: PlayedMove[] = [
  { san: "Nf3", from: "g1", to: "f3", color: "w", classification: "Best" },
  { san: "...d6", from: "d7", to: "d6", color: "b", classification: "Good" },
  { san: "Bc4", from: "f1", to: "c4", color: "w", classification: "Excellent" },
  { san: "...Qh4", from: "d8", to: "h4", color: "b", classification: "Blunder" },
];
