"use client";

import { BookOpen, Check, ChevronRight, Crosshair, RotateCcw, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "@/components/Chessboard";
import { OPENINGS } from "@/lib/data";
import { Opening } from "@/lib/types";

type OpeningLineMove = { from: string; to: string; san: string; color: "w" | "b" };

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function OpeningTrainer() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Opening>(OPENINGS[0]);
  const [training, setTraining] = useState(false);
  const [trainingFen, setTrainingFen] = useState(START_FEN);
  const [trainingIndex, setTrainingIndex] = useState(0);
  const [trainingLastMove, setTrainingLastMove] = useState<{ from: string; to: string } | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "wrong" | "correct" | "complete">("idle");
  const filtered = useMemo(() => OPENINGS.filter((opening) => `${opening.name} ${opening.eco} ${opening.category} ${opening.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const line = useMemo(() => parseOpeningLine(selected.moves), [selected.moves]);
  const expected = line[trainingIndex];

  useEffect(() => {
    if (!training || !expected || expected.color !== "b") return;
    const timer = window.setTimeout(() => {
      const game = new Chess(trainingFen);
      try {
        const reply = game.move({ from: expected.from, to: expected.to, promotion: "q" });
        setTrainingFen(game.fen());
        setTrainingLastMove({ from: reply.from, to: reply.to });
        setTrainingIndex((index) => index + 1);
        setFeedback(trainingIndex + 1 >= line.length ? "complete" : "idle");
      } catch {
        setFeedback("wrong");
      }
    }, 420);
    return () => window.clearTimeout(timer);
  }, [expected, line.length, training, trainingFen, trainingIndex]);

  const resetTraining = () => {
    setTrainingFen(START_FEN);
    setTrainingIndex(0);
    setTrainingLastMove(null);
    setFeedback("idle");
  };

  const startTraining = () => {
    resetTraining();
    setTraining(true);
  };

  const handleTrainingMove = (from: string, to: string) => {
    if (!training || !expected || expected.color !== "w") return;
    const game = new Chess(trainingFen);
    try {
      const move = game.move({ from, to, promotion: "q" });
      if (normalizeSan(move.san) !== normalizeSan(expected.san)) {
        setFeedback("wrong");
        window.setTimeout(() => setFeedback((value) => value === "wrong" ? "idle" : value), 900);
        return;
      }
      setTrainingFen(game.fen());
      setTrainingLastMove({ from: move.from, to: move.to });
      setTrainingIndex((index) => index + 1);
      setFeedback(trainingIndex + 1 >= line.length ? "complete" : "correct");
    } catch {
      setFeedback("wrong");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,410px)]">
      <div className="panel overflow-hidden">
        <div className="border-b border-line p-4"><div className="flex items-center gap-2"><BookOpen size={16} className="text-mint" /><h2 className="text-sm font-bold">Opening explorer</h2><span className="ml-auto rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-400">{OPENINGS.length} lines</span></div><div className="relative mt-3"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search openings, ECO codes, ideas..." className="w-full rounded-lg border border-line bg-black/10 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-600 focus:border-mint/50" /></div></div>
        <div className="scrollbar-thin max-h-[560px] overflow-y-auto p-2">
          {filtered.map((opening) => <button key={opening.name} onClick={() => { setSelected(opening); setTraining(false); resetTraining(); }} className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${selected.name === opening.name ? "bg-mint/10" : "hover:bg-white/[.04]"}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${selected.name === opening.name ? "bg-mint text-ink" : "bg-white/5 text-slate-400"}`}>{opening.eco}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-100">{opening.name}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{opening.moves}</span></span><span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-300">{opening.score}</span><ChevronRight size={15} className="text-slate-600" /></button>)}
          {!filtered.length && <p className="p-8 text-center text-sm text-slate-500">No opening line found.</p>}
        </div>
      </div>
      <div className="panel overflow-hidden">
        <div className="relative overflow-hidden border-b border-line bg-gradient-to-br from-mint/10 to-transparent p-5"><div className="absolute -right-8 -top-12 text-[150px] leading-none text-mint/[.04]">♞</div><div className="relative"><div className="flex items-center justify-between"><span className="eyebrow">{selected.category} · {selected.eco}</span><span className="text-xs font-bold text-mint">{selected.score}</span></div><h2 className="mt-3 text-2xl font-black tracking-tight">{selected.name}</h2><p className="mt-2 text-xs leading-5 text-slate-400">{selected.concept}</p><div className="mt-4 flex flex-wrap gap-1.5">{selected.tags.map((tag) => <span key={tag} className="rounded-full border border-mint/20 bg-mint/5 px-2 py-1 text-[10px] font-bold text-mint">{tag}</span>)}</div></div></div>
        <div className="p-5"><p className="eyebrow">Main line</p><p className="mt-2 rounded-lg border border-line bg-black/20 p-3 font-mono text-xs leading-6 text-slate-300">{selected.moves}</p><div className="mt-5 space-y-3"><Concept icon="♟" title="Positional idea" body={selected.concept} /><Concept icon="⚡" title="Typical break" body={selected.category === "Indian" ? "...c5 or ...e5, challenging the centre before it becomes permanent." : "Look for a timely central pawn break once your pieces are developed."} /><Concept icon="◉" title="Training prompt" body="Can you name your opponent's most forcing reply before you play the next move?" /></div><button className="btn-primary mt-5 w-full" onClick={training ? () => setTraining(false) : startTraining}><Crosshair size={15} />{training ? "Close training board" : "Train this opening"}</button>{training && <div className="mt-5 rounded-xl border border-line bg-black/20 p-3"><div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-bold">Find the book moves</p><p className="mt-1 text-[10px] text-slate-500">Other legal moves are locked for this line.</p></div><button aria-label="Reset opening training" className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-white" onClick={resetTraining}><RotateCcw size={14} /></button></div><Chessboard fen={trainingFen} lastMove={trainingLastMove} allowedTargets={training && expected?.color === "w" ? [expected.to] : []} onMove={handleTrainingMove} compact /><div className="mt-3 flex items-center gap-2 text-[11px] font-semibold">{feedback === "wrong" ? <><X size={14} className="text-red-300" /><span className="text-red-300">That move is legal, but it is not the book move.</span></> : feedback === "complete" ? <><Check size={14} className="text-mint" /><span className="text-mint">Line complete. Great opening discipline.</span></> : feedback === "correct" ? <><Check size={14} className="text-mint" /><span className="text-mint">Correct. Black is replying from the book.</span></> : <><Sparkles size={14} className="text-mint" /><span className="text-slate-400">{expected ? `Your move: ${expected.san}` : "Line complete."}</span></>}</div><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-mint transition-[width] duration-300" style={{ width: `${line.length ? Math.min(100, trainingIndex / line.length * 100) : 100}%` }} /></div></div>}</div>
      </div>
    </div>
  );
}

function parseOpeningLine(moves: string): OpeningLineMove[] {
  const tokens = moves.replace(/\d+\.(\.\.)?/g, " ").trim().split(/\s+/).filter(Boolean);
  const game = new Chess();
  const line: OpeningLineMove[] = [];
  for (const token of tokens) {
    try {
      const move = game.move(token);
      line.push({ from: move.from, to: move.to, san: move.san, color: move.color });
    } catch {
      break;
    }
  }
  return line;
}

function normalizeSan(san: string) { return san.replace(/[+#]/g, ""); }
function Concept({ icon, title, body }: { icon: string; title: string; body: string }) { return <div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5 text-sm text-mint">{icon}</span><div><p className="text-xs font-bold">{title}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{body}</p></div></div>; }
