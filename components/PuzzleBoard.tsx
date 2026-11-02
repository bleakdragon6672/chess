"use client";

import { Check, Eye, Lightbulb, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { Chess } from "chess.js";
import { Puzzle } from "@/lib/types";
import { Chessboard } from "./Chessboard";

export function PuzzleBoard({ puzzle, onSolved }: { puzzle: Puzzle; onSolved?: () => void }) {
  const [fen, setFen] = useState(puzzle.fen);
  const [status, setStatus] = useState<"idle" | "success" | "wrong">("idle");
  const [showHint, setShowHint] = useState(false);
  const [explanation, setExplanation] = useState(false);

  const reset = () => { setFen(puzzle.fen); setStatus("idle"); setShowHint(false); setExplanation(false); };
  const move = (from: string, to: string) => {
    const game = new Chess(fen);
    try {
      const result = game.move({ from, to, promotion: "q" });
      const target = puzzle.solution.replace(/[+#]/g, "");
      if (result.san.replace(/[+#]/g, "") === target) { setFen(game.fen()); setStatus("success"); onSolved?.(); }
      else { setStatus("wrong"); setTimeout(() => setStatus("idle"), 900); }
    } catch { setStatus("wrong"); setTimeout(() => setStatus("idle"), 900); }
  };
  return <div className="grid gap-5 md:grid-cols-[minmax(280px,500px)_minmax(240px,1fr)] md:items-start"><Chessboard fen={fen} onMove={move} compact /><div className="panel p-5"><div className="flex items-start justify-between"><div><span className="eyebrow">{puzzle.theme} · {puzzle.rating}</span><h2 className="mt-2 text-xl font-black">{puzzle.title}</h2></div><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-400">{puzzle.difficulty}</span></div>{status === "success" && <div className="mt-5 flex items-center gap-2 rounded-lg border border-mint/20 bg-mint/10 p-3 text-sm font-bold text-mint"><Check size={17} /> Correct. Beautiful idea.</div>}{status === "wrong" && <div className="mt-5 flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm font-bold text-red-300"><X size={17} /> Not quite. Keep calculating forcing moves.</div>}<div className="mt-5 rounded-lg bg-black/20 p-3"><p className="text-xs font-bold">Your mission</p><p className="mt-1 text-xs leading-5 text-slate-400">Find the best move for White. Checks, captures, and threats first.</p></div><div className="mt-4 flex flex-wrap gap-2"><button className="btn-ghost" onClick={() => setShowHint(!showHint)}><Lightbulb size={14} /> {showHint ? "Hide hint" : "Hint"}</button><button className="btn-ghost" onClick={reset}><RotateCcw size={14} /> Reset</button><button className="btn-ghost" onClick={() => setExplanation(!explanation)}><Eye size={14} /> Explain solution</button></div>{showHint && <p className="mt-3 rounded-lg bg-amber-400/10 p-3 text-xs leading-5 text-amber-200">{puzzle.hint}</p>}{explanation && <p className="mt-3 rounded-lg bg-sky-400/10 p-3 text-xs leading-5 text-sky-200">The move creates a forcing problem while improving your piece coordination. After the opponent responds, keep looking for checks before material grabs.</p>}</div></div>;
}
