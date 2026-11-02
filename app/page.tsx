"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import {
  Activity, ArrowLeftRight, Award, BarChart3, Bell, BookOpen, Brain, Bot, ChevronDown, Clock3, Crown, Crosshair, Flame, Gamepad2, Gauge, GraduationCap, History, Lightbulb, Menu, MessageCircle, MoreHorizontal, Play, Puzzle, RotateCcw, Search, Settings2, ShieldCheck, Sparkles, Swords, Target, Trophy, UserRound, X,
} from "lucide-react";
import { AICoachChat } from "@/components/AICoachChat";
import { Chessboard } from "@/components/Chessboard";
import { EvaluationBar } from "@/components/EvaluationBar";
import { GameReviewSummary } from "@/components/GameReviewSummary";
import { MoveHistory } from "@/components/MoveHistory";
import { OpeningTrainer } from "@/components/OpeningTrainer";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { BOT_PROFILES, MIDDLEGAME_LESSONS, PUZZLES } from "@/lib/data";
import { AppTab, BotProfile, FloatingBadge, PlayedMove } from "@/lib/types";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const TAB_ITEMS: { id: AppTab; label: string; icon: typeof Play }[] = [
  { id: "play", label: "Play", icon: Play },
  { id: "puzzles", label: "Puzzles", icon: Puzzle },
  { id: "learn", label: "Learn", icon: GraduationCap },
  { id: "review", label: "Game review", icon: BarChart3 },
  { id: "coach", label: "AI coach", icon: Brain },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>("play");
  const [fen, setFen] = useState(START_FEN);
  const [moves, setMoves] = useState<PlayedMove[]>([]);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [floatingBadge, setFloatingBadge] = useState<FloatingBadge | null>(null);
  const [selectedBot, setSelectedBot] = useState<BotProfile>(BOT_PROFILES[3]);
  const [vsBot, setVsBot] = useState(true);
  const [botThinking, setBotThinking] = useState(false);
  const [clockMode, setClockMode] = useState("10 + 0");
  const [whiteClock, setWhiteClock] = useState(600);
  const [blackClock, setBlackClock] = useState(600);
  const [clockRunning, setClockRunning] = useState(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState(PUZZLES[0]);
  const [lessonTab, setLessonTab] = useState<"openings" | "middlegame" | "tips">("openings");
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [tacticalRating, setTacticalRating] = useState(1240);
  const [engineEvaluation, setEngineEvaluation] = useState(0);
  const [engineMate, setEngineMate] = useState<string | null>(null);
  const [pendingEngineMove, setPendingEngineMove] = useState<{ from: string; to: string } | null>(null);
  const gameStageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Worker | null>(null);
  const engineReadyRef = useRef(false);
  const engineRequestRef = useRef<"bot" | "analysis" | null>(null);
  const engineSideRef = useRef<"w" | "b">("w");

  const game = useMemo(() => new Chess(fen), [fen]);
  const checkSquare = useMemo(() => {
    if (!game.isCheck()) return null;
    for (const file of "abcdefgh") for (let rank = 1; rank <= 8; rank += 1) {
      const square = `${file}${rank}` as any;
      const piece = game.get(square) as any;
      if (piece?.type === "k" && piece.color === game.turn()) return square;
    }
    return null;
  }, [game]);
  const captured = useMemo(() => {
    const counts: Record<string, number> = {};
    moves.forEach((move) => { if (move.captured) counts[move.captured] = (counts[move.captured] ?? 0) + 1; });
    return counts;
  }, [moves]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("masterchess-progress") ?? "{}");
      if (Array.isArray(saved.completedLessons)) setCompletedLessons(saved.completedLessons);
      if (typeof saved.tacticalRating === "number") setTacticalRating(saved.tacticalRating);
    } catch { /* local storage is optional */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("masterchess-progress", JSON.stringify({ completedLessons, tacticalRating, lastGame: moves }));
  }, [completedLessons, tacticalRating, moves]);

  useEffect(() => {
    try {
      // Stockfish's lite single-threaded WASM build is served locally so it
      // works offline and never blocks React's rendering thread.
      const worker = new Worker("/engine/stockfish-19-lite-single.js");
      engineRef.current = worker;
      worker.onmessage = (event) => {
        const line = String(event.data ?? "");
        if (line === "uciok") {
          engineReadyRef.current = true;
          worker.postMessage("isready");
        }
        const cp = line.match(/score cp (-?\d+)/);
        const mate = line.match(/score mate (-?\d+)/);
        if (cp) {
          const value = Number(cp[1]) / 100;
          setEngineEvaluation(engineSideRef.current === "w" ? value : -value);
          setEngineMate(null);
        } else if (mate) {
          const value = Number(mate[1]);
          setEngineMate(`M${Math.abs(value)}`);
          setEngineEvaluation(value > 0 ? 10 : -10);
        }
        if (line.startsWith("bestmove ") && engineRequestRef.current === "bot") {
          const uci = line.split(/\s+/)[1];
          if (uci && uci !== "(none)") setPendingEngineMove({ from: uci.slice(0, 2), to: uci.slice(2, 4) });
          setBotThinking(false);
          engineRequestRef.current = null;
        }
      };
      worker.postMessage("uci");
      return () => { worker.terminate(); engineRef.current = null; engineReadyRef.current = false; };
    } catch { return undefined; }
    // The engine worker is deliberately created once for the whole session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pendingEngineMove) return;
    handleMove(pendingEngineMove.from, pendingEngineMove.to, true);
    setPendingEngineMove(null);
    // The move arrives asynchronously from Stockfish; this effect captures
    // the current FEN and move list when it is delivered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEngineMove]);

  useEffect(() => {
    if (!engineReadyRef.current || !engineRef.current || game.isGameOver() || (vsBot && activeTab === "play" && game.turn() === "b")) return;
    engineRequestRef.current = "analysis";
    engineSideRef.current = game.turn();
    engineRef.current.postMessage("stop");
    engineRef.current.postMessage(`position fen ${fen}`);
    engineRef.current.postMessage("go depth 10");
  }, [fen, game, vsBot, activeTab]);

  useEffect(() => {
    if (!clockRunning || game.isGameOver()) return;
    const timer = window.setInterval(() => {
      if (game.turn() === "w") setWhiteClock((value) => Math.max(0, value - 1));
      else setBlackClock((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [clockRunning, game]);

  useEffect(() => {
    if (!moves.length) return;
    requestAnimationFrame(() => gameStageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }, [moves.length]);

  useEffect(() => {
    if (!vsBot || activeTab !== "play" || game.turn() !== "b" || botThinking || game.isGameOver() || currentIndex !== moves.length) return;
    setBotThinking(true);
    const timer = window.setTimeout(() => {
      const openingMove = chooseOpeningMove(game, moves, selectedBot);
      if (openingMove && Math.random() < (selectedBot.id >= 2000 ? .9 : selectedBot.id >= 1600 ? .78 : .58)) {
        setBotThinking(false);
        handleMove(openingMove.from, openingMove.to, true);
      } else if (engineRef.current && engineReadyRef.current) {
        engineRequestRef.current = "bot";
        engineSideRef.current = "b";
        engineRef.current.postMessage(`setoption name Skill Level value ${selectedBot.skill}`);
        engineRef.current.postMessage("setoption name UCI_LimitStrength value false");
        engineRef.current.postMessage("stop");
        engineRef.current.postMessage(`position fen ${fen}`);
        engineRef.current.postMessage(`go depth ${selectedBot.id >= 2000 ? 14 : selectedBot.id >= 1200 ? 11 : 8}`);
      }
      else {
        const legal = game.moves({ verbose: true }) as any[];
        const candidate = legal[Math.floor(Math.random() * legal.length)];
        setBotThinking(false);
        if (candidate) handleMove(candidate.from, candidate.to, true);
      }
    }, 420);
    return () => window.clearTimeout(timer);
    // handleMove is stable enough for this event-driven effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, activeTab, vsBot, selectedBot.id, botThinking, currentIndex, moves.length]);

  const handleMove = (from: string, to: string, isBot = false) => {
    if (vsBot && !isBot && game.turn() !== "w") return;
    const next = new Chess(fen);
    try {
      const move = next.move({ from, to, promotion: "q" });
      const classification: string = classifyMove(move.san, move.captured, move.color === "w" ? next.isCheck() : next.isCheck());
      const played: PlayedMove = { san: move.san, from: move.from, to: move.to, color: move.color, captured: move.captured, isCheck: next.isCheck(), classification };
      const branchedMoves = currentIndex < moves.length ? moves.slice(0, currentIndex) : moves;
      const branchedSnapshots = currentIndex < snapshots.length ? snapshots.slice(0, currentIndex) : snapshots;
      setMoves([...branchedMoves, played]);
      setSnapshots([...branchedSnapshots, next.fen()]);
      setCurrentIndex(branchedMoves.length + 1);
      setFen(next.fen());
      setLastMove({ from: move.from, to: move.to });
      setFloatingBadge({ id: Date.now(), square: move.to, label: move.san.includes("#") ? "M#" : move.san.includes("+") ? "+" : classification === "Brilliant" ? "!!" : classification === "Blunder" ? "??" : classification === "Great" ? "!" : "·", tone: classification === "Blunder" ? "red" : classification === "Brilliant" ? "mint" : move.san.includes("+") ? "amber" : "blue" });
      playMoveSound(Boolean(move.captured), next.isCheck());
      setClockRunning(true);
    } catch { /* Chessboard only emits legal moves, but keep the boundary defensive. */ }
  };

  const navigate = (index: number) => {
    const safe = Math.max(0, Math.min(index, moves.length));
    setCurrentIndex(safe);
    setFen(safe === 0 ? START_FEN : snapshots[safe - 1] ?? START_FEN);
    const previous = safe > 0 ? moves[safe - 1] : null;
    setLastMove(previous ? { from: previous.from, to: previous.to } : null);
  };

  const newGame = (bot: BotProfile = selectedBot) => {
    setSelectedBot(bot); setFen(START_FEN); setMoves([]); setSnapshots([]); setCurrentIndex(0); setLastMove(null); setFloatingBadge(null); setEngineEvaluation(0); setEngineMate(null); setWhiteClock(clockMode === "1 + 0" ? 60 : clockMode === "3 + 2" ? 180 : clockMode === "10 + 0" ? 600 : 1800); setBlackClock(clockMode === "1 + 0" ? 60 : clockMode === "3 + 2" ? 180 : clockMode === "10 + 0" ? 600 : 1800); setBotThinking(false); setClockRunning(false);
  };

  const setClock = (mode: string) => { setClockMode(mode); if (mode === "1 + 0") { setWhiteClock(60); setBlackClock(60); } else if (mode === "3 + 2") { setWhiteClock(180); setBlackClock(180); } else if (mode === "10 + 0") { setWhiteClock(600); setBlackClock(600); } else { setWhiteClock(1800); setBlackClock(1800); } };

  const renderContent = () => {
    if (activeTab === "play") return <PlayView />;
    if (activeTab === "puzzles") return <PuzzlesView />;
    if (activeTab === "learn") return <LearnView />;
    if (activeTab === "review") return <ReviewView />;
    return <CoachView />;
  };

  const PlayView = () => <div className="space-y-5">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">Play arena</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Choose your opponent</h1><p className="mt-1 text-sm text-slate-500">Every bot has a different repertoire, personality, and way of finding trouble.</p></div><div className="flex items-center gap-2"><span className="rounded-full border border-mint/20 bg-mint/10 px-2.5 py-1 text-[10px] font-bold text-mint"><ShieldCheck size={12} className="mr-1 inline" />Free forever</span><button className="btn-ghost" onClick={() => setVsBot(!vsBot)}><ArrowLeftRight size={14} /> {vsBot ? "vs bot" : "2 players"}</button></div></div>
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{BOT_PROFILES.map((bot) => <BotCard key={bot.id} bot={bot} selected={selectedBot.id === bot.id} onSelect={() => { setSelectedBot(bot); if (moves.length) newGame(bot); }} />)}</div>
    <div ref={gameStageRef} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
      <div className="panel min-w-0 p-3 sm:p-5"><div className="mb-3 flex items-center justify-between"><PlayerRow bot={selectedBot} black clock={blackClock} thinking={botThinking} captured={captured} /><div className="flex items-center gap-1.5 rounded-full bg-white/[.04] px-2.5 py-1 text-[10px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-mint" />{game.isGameOver() ? "Game over" : "Live analysis"}</div></div><div className="flex items-stretch gap-2 sm:gap-3"><div className="hidden h-auto w-5 shrink-0 sm:block"><EvaluationBar value={engineEvaluation || estimateEvaluation(moves)} mate={game.isCheckmate() ? "M#" : engineMate} /></div><Chessboard fen={fen} lastMove={lastMove} floatingBadge={floatingBadge} checkSquare={checkSquare} onMove={handleMove} /></div><div className="mt-3 flex items-center justify-between gap-3"><PlayerRow bot={{ ...selectedBot, name: "You", avatar: "♘", color: "#e9e7de", style: "White pieces" }} clock={whiteClock} captured={captured} /><div className="flex gap-1.5"><button aria-label="Reset game" className="btn-ghost px-2.5" onClick={() => newGame()}><RotateCcw size={14} /></button><button className="btn-ghost px-2.5"><MoreHorizontal size={16} /></button></div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3"><div className="flex items-center gap-1.5">{["1 + 0", "3 + 2", "10 + 0", "30 + 0"].map((mode) => <button key={mode} onClick={() => setClock(mode)} className={`rounded-md px-2 py-1 text-[10px] font-bold ${clockMode === mode ? "bg-mint text-ink" : "bg-white/5 text-slate-500 hover:text-white"}`}>{mode}</button>)}</div><span className="text-[10px] text-slate-600">{vsBot ? `${selectedBot.repertoire[0]} repertoire · Skill ${selectedBot.skill}/20` : "Local 2-player mode"}</span></div></div>
      <div className="space-y-4"><div className="panel overflow-hidden"><MoveHistory moves={moves} currentIndex={currentIndex} onNavigate={navigate} /></div><div className="hidden lg:block"><AICoachChat context="your live game" /></div></div>
    </div>
  </div>;

  const PuzzlesView = () => <div className="space-y-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">Tactics trainer</p><h1 className="mt-1 text-2xl font-black tracking-tight">Sharpen your pattern radar</h1><p className="mt-1 text-sm text-slate-500">Solve one position a day. Build the habit of looking for forcing moves first.</p></div><div className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2"><Target size={16} className="text-mint" /><div><p className="text-[10px] text-slate-500">Tactical rating</p><p className="text-sm font-black">{tacticalRating}</p></div></div></div><div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">{["All themes", "Forks", "Pins", "Skewers", "Discovered attacks", "Deflections", "Back-rank mates"].map((theme, i) => <button key={theme} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-bold ${i === 0 ? "border-mint/30 bg-mint/10 text-mint" : "border-line text-slate-500 hover:text-white"}`}>{theme}</button>)}</div><PuzzleBoard puzzle={selectedPuzzle} onSolved={() => setTacticalRating((rating) => rating + 8)} /><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{PUZZLES.map((puzzle) => <button key={puzzle.id} onClick={() => setSelectedPuzzle(puzzle)} className={`rounded-xl border p-3 text-left transition ${selectedPuzzle.id === puzzle.id ? "border-mint/40 bg-mint/10" : "border-line bg-panel hover:border-slate-500"}`}><div className="flex items-center justify-between"><span className="text-xl">{puzzle.theme === "Forks" ? "♘" : puzzle.theme === "Pins" ? "⚔" : puzzle.theme === "Back-rank mates" ? "♜" : "◈"}</span><span className="text-[10px] font-bold text-slate-500">{puzzle.rating}</span></div><p className="mt-4 text-xs font-bold">{puzzle.title}</p><p className="mt-1 text-[10px] text-slate-500">{puzzle.theme}</p></button>)}</div></div>;

  const LearnView = () => <div className="space-y-5"><div><p className="eyebrow">Training library</p><h1 className="mt-1 text-2xl font-black tracking-tight">Build a complete chess brain</h1><p className="mt-1 text-sm text-slate-500">Opening memory is useful. Understanding why the moves work is better.</p></div><div className="flex gap-1 rounded-xl border border-line bg-panel p-1 sm:w-fit">{(["openings", "middlegame", "tips"] as const).map((tab) => <button key={tab} onClick={() => setLessonTab(tab)} className={`rounded-lg px-4 py-2 text-xs font-bold capitalize ${lessonTab === tab ? "bg-mint text-ink" : "text-slate-500 hover:text-white"}`}>{tab === "middlegame" ? "Middlegame" : tab}</button>)}</div>{lessonTab === "openings" ? <OpeningTrainer /> : lessonTab === "middlegame" ? <MiddlegameView /> : <TipsView />}</div>;

  const MiddlegameView = () => <div className="grid gap-4 md:grid-cols-2">{MIDDLEGAME_LESSONS.map((lesson, index) => <div key={lesson.title} className="panel p-5"><div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/10 text-2xl text-mint">{lesson.icon}</span><button onClick={() => setCompletedLessons((list) => list.includes(index) ? list.filter((item) => item !== index) : [...list, index])} className={`rounded-full px-2 py-1 text-[10px] font-bold ${completedLessons.includes(index) ? "bg-mint text-ink" : "bg-white/5 text-slate-500"}`}>{completedLessons.includes(index) ? "Completed" : `${lesson.progress}% complete`}</button></div><h2 className="mt-5 text-lg font-black">{lesson.title}</h2><p className="mt-1 text-xs text-mint">{lesson.subtitle}</p><p className="mt-4 text-xs leading-5 text-slate-400">{lesson.detail}</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-mint" style={{ width: `${completedLessons.includes(index) ? 100 : lesson.progress}%` }} /></div><button onClick={() => setCompletedLessons((list) => list.includes(index) ? list : [...list, index])} className="btn-ghost mt-4 w-full">Open interactive lesson <ChevronDown size={14} className="-rotate-90" /></button></div>)}</div>;

  const TipsView = () => <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[{ icon: "◎", title: "The opening checklist", body: "Develop knights and bishops, fight for the centre, castle, then connect your rooks." }, { icon: "♔", title: "King & pawn opposition", body: "The king in front wins the opposition. Count the squares before pushing a pawn." }, { icon: "♖", title: "Lucena position", body: "Build the bridge with your king, then use the rook to shield the promotion square." }, { icon: "♜", title: "Philidor position", body: "Keep the defending rook on the sixth rank until the pawn advances, then check from behind." }, { icon: "◈", title: "Candidate moves", body: "Make a forcing-move scan before comparing quieter improving moves." }, { icon: "◉", title: "Trade with purpose", body: "Exchange your opponent's active piece, not your own worst piece, unless the endgame says otherwise." }].map((tip) => <div key={tip.title} className="panel p-5"><span className="text-2xl text-mint">{tip.icon}</span><h2 className="mt-5 text-sm font-black">{tip.title}</h2><p className="mt-2 text-xs leading-5 text-slate-400">{tip.body}</p><button className="mt-4 text-[11px] font-bold text-mint hover:underline">Read masterclass →</button></div>)}</div>;

  const ReviewView = () => <div className="space-y-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">Game review</p><h1 className="mt-1 text-2xl font-black tracking-tight">Turn moves into lessons</h1><p className="mt-1 text-sm text-slate-500">A fast engine pass, then a human explanation of the moments that mattered.</p></div><button className="btn-primary"><Sparkles size={15} /> Analyze PGN</button></div><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]"><GameReviewSummary moves={moves} onCoach={() => setActiveTab("coach")} /><div className="panel p-5"><p className="eyebrow">Import a game</p><h2 className="mt-2 text-lg font-black">Paste PGN</h2><textarea className="mt-4 h-40 w-full resize-none rounded-xl border border-line bg-black/20 p-3 font-mono text-xs text-slate-300 outline-none placeholder:text-slate-600 focus:border-mint/50" placeholder={'[Event "Casual Game"]\n1. e4 e5 2. Nf3 Nc6 ...'} /><button className="btn-ghost mt-3 w-full"><Search size={14} /> Review this PGN</button><div className="mt-6 border-t border-line pt-4"><p className="eyebrow">How it works</p><ol className="mt-3 space-y-3 text-xs text-slate-400"><li><span className="mr-2 text-mint">01</span>Stockfish evaluates every ply</li><li><span className="mr-2 text-mint">02</span>Moves get a quality badge</li><li><span className="mr-2 text-mint">03</span>Coach explains the turning points</li></ol></div></div></div></div>;

  const CoachView = () => <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"><div><p className="eyebrow">Your personal second</p><h1 className="mt-1 text-2xl font-black tracking-tight">Ask better questions</h1><p className="mt-1 text-sm text-slate-500">The fastest way to improve is to understand the idea you missed.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{["Why was my last move inaccurate?", "What was my opponent threatening?", "Show me the winning continuation", "What plan fits this pawn structure?"] .map((prompt) => <button key={prompt} className="panel flex items-center gap-3 p-4 text-left text-xs font-semibold text-slate-300 transition hover:border-mint/40 hover:text-white"><MessageCircle size={16} className="text-mint" />{prompt}</button>)}</div><div className="mt-5 panel p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-ink"><Brain size={20} /></div><div><p className="text-sm font-bold">The coach's method</p><p className="mt-1 text-xs text-slate-500">Engine precision + human explanations.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{[{ icon: "◎", title: "Spot", body: "Find the critical moment" }, { icon: "↗", title: "Explain", body: "Understand the threat" }, { icon: "♞", title: "Practice", body: "Try the better idea" }].map((item) => <div key={item.title} className="rounded-xl bg-white/[.04] p-3"><p className="text-xl text-mint">{item.icon}</p><p className="mt-3 text-xs font-bold">{item.title}</p><p className="mt-1 text-[10px] text-slate-500">{item.body}</p></div>)}</div></div></div><AICoachChat context="your recent chess game" /></div>;

  return <main className="min-h-screen bg-[radial-gradient(circle_at_80%_-10%,rgba(182,243,107,.09),transparent_32%),#080b10]"><header className="sticky top-0 z-50 border-b border-line/80 bg-[#080b10]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 lg:px-7"><div className="flex shrink-0 items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint text-ink shadow-[0_0_24px_rgba(182,243,107,.2)]"><Crown size={18} strokeWidth={2.5} /></div><span className="text-sm font-black tracking-tight sm:text-base">MasterChess <span className="text-mint">AI</span></span></div><nav className="scrollbar-thin ml-auto flex max-w-full gap-1 overflow-x-auto">{TAB_ITEMS.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${activeTab === id ? "tab-active" : "text-slate-500 hover:bg-white/5 hover:text-slate-200"}`}><Icon size={14} className={activeTab === id ? "text-mint" : ""} />{label}</button>)}</nav><div className="hidden items-center gap-2 sm:flex"><button className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"><Bell size={16} /></button><div className="flex items-center gap-2 border-l border-line pl-3"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-mint to-sky-300 text-xs font-black text-ink">S</div><ChevronDown size={13} className="text-slate-500" /></div></div><button className="rounded-lg p-2 text-slate-500 sm:hidden"><Menu size={17} /></button></div></header><div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-7 lg:py-8">{renderContent()}</div></main>;
}

function BotCard({ bot, selected, onSelect }: { bot: BotProfile; selected: boolean; onSelect: () => void }) { return <button onClick={onSelect} className={`group relative overflow-hidden rounded-xl border p-3 text-left transition ${selected ? "border-mint/50 bg-mint/[.08] shadow-[0_0_24px_rgba(182,243,107,.06)]" : "border-line bg-panel hover:border-slate-500"}`}><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: `${bot.color}18`, color: bot.color }}>{bot.avatar}</div><div className="min-w-0"><div className="flex items-center gap-2"><span className="text-sm font-black">{bot.name}</span><span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">{bot.title}</span></div><p className="mt-0.5 text-[10px] font-bold capitalize text-mint/80">{bot.style}</p></div>{selected && <span className="ml-auto h-2 w-2 rounded-full bg-mint shadow-[0_0_10px_#b6f36b]" />}</div><p className="mt-3 line-clamp-2 text-[11px] leading-4 text-slate-500">{bot.bio}</p><div className="mt-3 flex gap-1 overflow-hidden">{bot.traits.map((trait) => <span key={trait} className="whitespace-nowrap rounded bg-white/[.04] px-1.5 py-1 text-[9px] font-semibold text-slate-500">{trait}</span>)}</div></button>; }

function PlayerRow({ bot, black = false, clock, thinking = false, captured }: { bot: BotProfile; black?: boolean; clock: number; thinking?: boolean; captured: Record<string, number> }) { return <div className="flex min-w-0 items-center gap-2.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xl" style={{ background: `${bot.color}18`, color: bot.color }}>{bot.avatar}</div><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-xs font-bold">{bot.name}</p>{thinking && <span className="flex items-center gap-1 text-[9px] font-bold text-mint"><Activity size={11} className="animate-pulse" /> thinking</span>}</div><div className="mt-1 flex items-center gap-1.5"><span className={`font-mono text-xs font-bold ${clock < 20 ? "text-red-300" : "text-slate-400"}`}><Clock3 size={10} className="mr-1 inline" />{formatTime(clock)}</span>{black && <CapturedPieces captured={captured} color="w" />}</div></div></div>; }

function CapturedPieces({ captured, color }: { captured: Record<string, number>; color: string }) { const pieces = Object.entries(captured).filter(([piece]) => (color === "w" ? ["p", "n", "b", "r", "q"].includes(piece) : false)).map(([piece, count]) => `${piece}${count > 1 ? `×${count}` : ""}`).join(" "); return <span className="truncate text-[9px] text-slate-600">{pieces}</span>; }

function formatTime(value: number) { return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`; }
function estimateEvaluation(moves: PlayedMove[]) { let score = 0; moves.forEach((move) => { if (move.color === "w") score += move.captured ? .18 : move.isCheck ? .12 : .03; else score -= move.captured ? .18 : move.isCheck ? .12 : .03; }); return Math.max(-4, Math.min(4, score)); }
function classifyMove(san: string, captured?: string, check?: boolean) { if (san.includes("#")) return "Brilliant"; if (check) return "Great"; if (captured === "q") return "Best"; if (captured) return "Excellent"; if (san.includes("?!")) return "Inaccuracy"; return "Good"; }
function chooseOpeningMove(game: Chess, moves: PlayedMove[], bot: BotProfile) {
  if (moves.length !== 1 || game.turn() !== "b") return null;
  const whiteFirstMove = moves[0].san.replace(/[+#]/g, "");
  const replies: Record<number, Record<string, string[]>> = {
    400: { e4: ["f6", "a6"], d4: ["h6", "f5"] },
    800: { e4: ["Nc6", "d6"], d4: ["d5", "Nf6"] },
    1200: { e4: ["d6", "Nc6"], d4: ["Nf6", "d5"] },
    1600: { e4: ["c5", "e5"], d4: ["Nf6", "f5"] },
    2000: { e4: ["c6", "d5"], d4: ["d5", "Nf6"] },
    2400: { e4: ["c5", "e5"], d4: ["Nf6", "d5"] },
  };
  const preferred = replies[bot.id]?.[whiteFirstMove] ?? [];
  const legal = game.moves({ verbose: true }) as any[];
  return preferred.map((san) => legal.find((move) => move.san.replace(/[+#]/g, "") === san)).find(Boolean) ?? null;
}
function playMoveSound(capture: boolean, check: boolean) { if (typeof window === "undefined") return; try { const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext; const context = new AudioContextClass(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.type = "sine"; oscillator.frequency.value = check ? 540 : capture ? 210 : 320; gain.gain.setValueAtTime(.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(.04, context.currentTime + .008); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .11); oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .12); } catch { /* Audio is a progressive enhancement. */ } }
