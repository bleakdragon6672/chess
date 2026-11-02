"use client";

import { BookOpen, ChevronRight, Crosshair, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { OPENINGS } from "@/lib/data";
import { Opening } from "@/lib/types";

export function OpeningTrainer() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Opening>(OPENINGS[0]);
  const [training, setTraining] = useState(false);
  const filtered = useMemo(() => OPENINGS.filter((opening) => `${opening.name} ${opening.eco} ${opening.category} ${opening.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,410px)]">
      <div className="panel overflow-hidden">
        <div className="border-b border-line p-4"><div className="flex items-center gap-2"><BookOpen size={16} className="text-mint" /><h2 className="text-sm font-bold">Opening explorer</h2><span className="ml-auto rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-400">{OPENINGS.length} lines</span></div><div className="relative mt-3"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search openings, ECO codes, ideas..." className="w-full rounded-lg border border-line bg-black/10 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-600 focus:border-mint/50" /></div></div>
        <div className="scrollbar-thin max-h-[560px] overflow-y-auto p-2">
          {filtered.map((opening) => <button key={opening.name} onClick={() => { setSelected(opening); setTraining(false); }} className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${selected.name === opening.name ? "bg-mint/10" : "hover:bg-white/[.04]"}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${selected.name === opening.name ? "bg-mint text-ink" : "bg-white/5 text-slate-400"}`}>{opening.eco}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-100">{opening.name}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{opening.moves}</span></span><span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-300">{opening.score}</span><ChevronRight size={15} className="text-slate-600" /></button>)}
          {!filtered.length && <p className="p-8 text-center text-sm text-slate-500">No opening line found.</p>}
        </div>
      </div>
      <div className="panel overflow-hidden">
        <div className="relative overflow-hidden border-b border-line bg-gradient-to-br from-mint/10 to-transparent p-5"><div className="absolute -right-8 -top-12 text-[150px] leading-none text-mint/[.04]">♞</div><div className="relative"><div className="flex items-center justify-between"><span className="eyebrow">{selected.category} · {selected.eco}</span><span className="text-xs font-bold text-mint">{selected.score}</span></div><h2 className="mt-3 text-2xl font-black tracking-tight">{selected.name}</h2><p className="mt-2 text-xs leading-5 text-slate-400">{selected.concept}</p><div className="mt-4 flex flex-wrap gap-1.5">{selected.tags.map((tag) => <span key={tag} className="rounded-full border border-mint/20 bg-mint/5 px-2 py-1 text-[10px] font-bold text-mint">{tag}</span>)}</div></div></div>
        <div className="p-5"><p className="eyebrow">Main line</p><p className="mt-2 rounded-lg border border-line bg-black/20 p-3 font-mono text-xs leading-6 text-slate-300">{selected.moves}</p><div className="mt-5 space-y-3"><Concept icon="♟" title="Positional idea" body={selected.concept} /><Concept icon="⚡" title="Typical break" body={selected.category === "Indian" ? "...c5 or ...e5, challenging the centre before it becomes permanent." : "Look for a timely central pawn break once your pieces are developed."} /><Concept icon="◉" title="Training prompt" body="Can you name your opponent's most forcing reply before you play the next move?" /></div><button className="btn-primary mt-5 w-full" onClick={() => setTraining(!training)}><Crosshair size={15} />{training ? "Training line active" : "Train this opening"}</button>{training && <div className="mt-3 flex items-center gap-2 rounded-lg bg-mint/10 p-3 text-xs text-mint"><Sparkles size={14} /> Find the book move: develop with purpose and keep the centre in mind.</div>}</div>
      </div>
    </div>
  );
}

function Concept({ icon, title, body }: { icon: string; title: string; body: string }) { return <div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5 text-sm text-mint">{icon}</span><div><p className="text-xs font-bold">{title}</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{body}</p></div></div>; }
