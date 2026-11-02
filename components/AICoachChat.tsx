"use client";

import { Bot, MessageCircle, Send, Sparkles, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";

type Message = { role: "coach" | "user"; text: string };

export function AICoachChat({ context = "the current position" }: { context?: string }) {
  const [messages, setMessages] = useState<Message[]>([{ role: "coach", text: `I'm your Grandmaster Coach. Ask me about ${context}, a blunder, or a plan for the position.` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (event: FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    setInput(""); setMessages((old) => [...old, { role: "user", text: question }]); setLoading(true);
    try {
      const response = await fetch("/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, context }) });
      const data = await response.json();
      setMessages((old) => [...old, { role: "coach", text: data.answer || fallback(question) }]);
    } catch { setMessages((old) => [...old, { role: "coach", text: fallback(question) }]); }
    setLoading(false);
  };
  return <div className="panel flex min-h-[400px] flex-col overflow-hidden"><div className="flex items-center gap-3 border-b border-line p-4"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint text-ink"><Bot size={19} /></div><div><p className="text-sm font-bold">AI Grandmaster Coach</p><p className="mt-0.5 flex items-center gap-1 text-[10px] text-mint"><span className="h-1.5 w-1.5 rounded-full bg-mint" /> Online · Inception AI</p></div><Sparkles size={15} className="ml-auto text-mint" /></div><div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">{messages.map((message, index) => <div key={index} className={`flex gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}><div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${message.role === "coach" ? "bg-mint/15 text-mint" : "bg-white/10 text-slate-300"}`}>{message.role === "coach" ? <Bot size={14} /> : <UserRound size={14} />}</div><div className={`max-w-[82%] rounded-2xl px-3 py-2.5 text-xs leading-5 ${message.role === "coach" ? "rounded-tl-sm bg-white/[.05] text-slate-300" : "rounded-tr-sm bg-mint/15 text-slate-100"}`}>{message.text}</div></div>)}{loading && <div className="flex items-center gap-2 text-xs text-slate-500"><MessageCircle size={14} className="animate-pulse text-mint" /> Thinking through the position...</div>}</div><form onSubmit={ask} className="border-t border-line p-3"><div className="flex items-center gap-2 rounded-xl border border-line bg-black/20 p-1.5 focus-within:border-mint/50"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about this position..." className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none placeholder:text-slate-600" /><button aria-label="Ask coach" className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint text-ink transition hover:bg-[#c8ff88]"><Send size={14} /></button></div></form></div>;
}

function fallback(question: string) { return question.toLowerCase().includes("blunder") ? "The key is to identify the threat your opponent created. Before moving, scan checks, captures, and attacks; then compare the opponent's most forcing reply. In this position, improving the least active piece keeps the advantage." : "Start with the position's imbalances: king safety, pawn breaks, and your worst-placed piece. A useful plan should improve one of those while limiting your opponent's most forcing idea."; }
