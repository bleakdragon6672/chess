"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { FloatingBadge } from "@/lib/types";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const PIECES: Record<string, string> = {
  wp: "♙", wr: "♖", wn: "♘", wb: "♗", wq: "♕", wk: "♔",
  bp: "♟", br: "♜", bn: "♞", bb: "♝", bq: "♛", bk: "♚",
};

type ChessboardProps = {
  fen: string;
  lastMove?: { from: string; to: string } | null;
  floatingBadge?: FloatingBadge | null;
  checkSquare?: string | null;
  onMove: (from: string, to: string) => void;
  compact?: boolean;
};

type DragState = { from: string; x: number; y: number; target: string | null; returning?: boolean } | null;
type BoardAnimation = { id: number; from: string; to: string; piece: string; captured?: string; active: boolean } | null;

function squareAtPoint(rect: DOMRect, clientX: number, clientY: number) {
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null;
  const file = Math.floor((x / rect.width) * 8);
  const row = Math.floor((y / rect.height) * 8);
  return `${FILES[file]}${8 - row}`;
}

export function Chessboard({ fen, lastMove, floatingBadge, checkSquare, onMove, compact = false }: ChessboardProps) {
  const game = useMemo(() => new Chess(fen), [fen]);
  const boardRef = useRef<HTMLDivElement>(null);
  const previousFenRef = useRef(fen);
  const pointerMoved = useRef(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState>(null);
  const [boardAnimation, setBoardAnimation] = useState<BoardAnimation>(null);

  const legalMoves = useMemo(() => {
    if (!selected) return [] as any[];
    try { return game.moves({ square: selected as any, verbose: true }) as any[]; } catch { return []; }
  }, [game, selected]);
  const legalTargets = useMemo(() => new Set(legalMoves.map((move) => move.to)), [legalMoves]);
  const selectedPiece = selected ? (game.get(selected as any) as any) : null;
  const dragPiece = drag ? (game.get(drag.from as any) as any) : null;

  useEffect(() => {
    if (previousFenRef.current === fen || !lastMove) return;
    const previousGame = new Chess(previousFenRef.current);
    const piece = game.get(lastMove.to as any) as any;
    const captured = previousGame.get(lastMove.to as any) as any;
    previousFenRef.current = fen;
    if (!piece) return;
    const id = Date.now();
    setBoardAnimation({ id, from: lastMove.from, to: lastMove.to, piece: `${piece.color}${piece.type}`, captured: captured ? `${captured.color}${captured.type}` : undefined, active: false });
    const frame = requestAnimationFrame(() => setBoardAnimation((current) => current?.id === id ? { ...current, active: true } : current));
    const timeout = window.setTimeout(() => setBoardAnimation((current) => current?.id === id ? null : current), 230);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(timeout); };
  }, [fen, game, lastMove]);

  const chooseSquare = (square: string) => {
    const piece = game.get(square as any) as any;
    if (selected && legalTargets.has(square)) {
      onMove(selected, square);
      setSelected(null);
      return;
    }
    if (piece && piece.color === game.turn()) {
      setSelected(square);
    } else {
      setSelected(null);
    }
  };

  const beginDrag = (event: React.PointerEvent, square: string) => {
    const piece = game.get(square as any) as any;
    if (!piece || piece.color !== game.turn()) return;
    pointerMoved.current = false;
    setSelected(square);
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setDrag({ from: square, x, y, target: square });
    boardRef.current?.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent) => {
    if (!drag || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (Math.abs(x - drag.x) + Math.abs(y - drag.y) > 8) pointerMoved.current = true;
    setDrag({ ...drag, x, y, target: squareAtPoint(rect, event.clientX, event.clientY) });
  };

  const endDrag = (event: React.PointerEvent) => {
    if (!drag) return;
    const target = boardRef.current ? squareAtPoint(boardRef.current.getBoundingClientRect(), event.clientX, event.clientY) : null;
    if (target && legalTargets.has(target)) {
      onMove(drag.from, target);
      setDrag(null);
      setSelected(null);
      return;
    }
    const rect = boardRef.current?.getBoundingClientRect();
    if (rect) {
      const file = FILES.indexOf(drag.from[0]);
      const row = 8 - Number(drag.from[1]);
      setDrag({ ...drag, x: (file + .5) * rect.width / 8, y: (row + .5) * rect.height / 8, target: drag.from, returning: true });
      window.setTimeout(() => { setDrag(null); setSelected(null); }, 180);
    } else {
      setDrag(null);
      setSelected(null);
    }
  };

  const files = FILES;
  return (
    <div className={`board-shell relative w-full ${compact ? "max-w-[480px]" : "max-w-[640px]"}`}>
      <div
        ref={boardRef}
        className="relative grid aspect-square w-full touch-none select-none overflow-hidden rounded-[10px] border border-black/60 shadow-[0_22px_60px_rgba(0,0,0,.35)]"
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={() => { setDrag(null); setSelected(null); }}
      >
        {Array.from({ length: 64 }, (_, index) => {
          const fileIndex = index % 8;
          const row = Math.floor(index / 8);
          const square = `${files[fileIndex]}${8 - row}`;
          const piece = game.get(square as any) as any;
          const isDark = (fileIndex + row) % 2 === 1;
          const isSelected = selected === square || drag?.from === square;
          const isLast = lastMove?.from === square || lastMove?.to === square;
          const isTarget = drag?.target === square;
          const isLegal = legalTargets.has(square);
          const isCapture = isLegal && Boolean(piece);
          const isCheck = checkSquare === square;
          const showPiece = !(drag?.from === square && drag && pointerMoved.current) && !(boardAnimation?.to === square);
          return (
            <div
              key={square}
              className={`relative flex items-center justify-center ${isDark ? "bg-[#769656]" : "bg-[#eeeed2]"} ${isLast ? "before:absolute before:inset-0 before:bg-[#c9d75a]/75" : ""} ${isSelected ? "after:absolute after:inset-0 after:bg-[#f5e96d]/70" : ""} ${isTarget ? "ring-inset ring-4 ring-[#b6f36b]/70" : ""} ${isCheck ? "animate-checkPulse z-10" : ""}`}
              onPointerDown={(event) => beginDrag(event, square)}
              onClick={() => { if (!pointerMoved.current) chooseSquare(square); pointerMoved.current = false; }}
              role="gridcell"
              aria-label={`${square}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ""}`}
            >
              {fileIndex === 0 && <span className={`absolute left-1 top-0.5 z-20 text-[9px] font-bold ${isDark ? "text-[#eeeed2]" : "text-[#769656]"}`}>{8 - row}</span>}
              {row === 7 && <span className={`absolute bottom-0 right-1 z-20 text-[9px] font-bold ${isDark ? "text-[#eeeed2]" : "text-[#769656]"}`}>{square[0]}</span>}
              {showPiece && piece && <span className={`piece relative z-10 leading-none text-[clamp(28px,7vw,58px)] transition-transform duration-150 ease-out ${piece.color === "w" ? "text-[#fffdf5] [text-shadow:0_2px_1px_rgba(0,0,0,.65)]" : "text-[#18202a] [text-shadow:0_1px_1px_rgba(255,255,255,.15)]"}`}>{PIECES[`${piece.color}${piece.type}`]}</span>}
              {isLegal && <span className={`pointer-events-none absolute z-20 ${isCapture ? "h-[74%] w-[74%] rounded-full border-[5px] border-[#213044]/55" : "h-[22%] w-[22%] rounded-full bg-[#213044]/45"}`} />}
            </div>
          );
        })}
        {drag && dragPiece && boardRef.current && (
          <span
            className={`pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2 leading-none text-[clamp(34px,8vw,64px)] transition-[left,top] duration-75 ease-out ${dragPiece.color === "w" ? "text-[#fffdf5] [text-shadow:0_3px_2px_rgba(0,0,0,.65)]" : "text-[#18202a] [text-shadow:0_2px_2px_rgba(255,255,255,.14)]"}`}
            style={{ left: drag.x, top: drag.y, transitionDuration: drag.returning ? "180ms" : "75ms" }}
          >{PIECES[`${dragPiece.color}${dragPiece.type}`]}</span>
        )}
        {boardAnimation && (
          <>
            {boardAnimation.captured && <span className="pointer-events-none absolute z-30 animate-captureFade leading-none text-[clamp(28px,7vw,58px)] opacity-80" style={{ left: `${(files.indexOf(boardAnimation.to[0]) + .5) * 12.5}%`, top: `${(8 - Number(boardAnimation.to[1]) + .5) * 12.5}%` }}>{PIECES[boardAnimation.captured]}</span>}
            <span
              className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2 leading-none text-[clamp(28px,7vw,58px)] transition-[left,top] duration-[180ms] ease-[cubic-bezier(.2,.8,.2,1)]"
              style={{ left: `${(files.indexOf((boardAnimation.active ? boardAnimation.to : boardAnimation.from)[0]) + .5) * 12.5}%`, top: `${(8 - Number((boardAnimation.active ? boardAnimation.to : boardAnimation.from)[1]) + .5) * 12.5}%`, color: boardAnimation.piece[0] === "w" ? "#fffdf5" : "#18202a", textShadow: boardAnimation.piece[0] === "w" ? "0 3px 2px rgba(0,0,0,.65)" : "0 2px 2px rgba(255,255,255,.14)" }}
            >{PIECES[boardAnimation.piece]}</span>
          </>
        )}
        {floatingBadge && (
          <div
            key={floatingBadge.id}
            className={`pointer-events-none absolute z-50 animate-badgeFloat rounded-full px-2 py-1 text-[11px] font-black shadow-lg ${floatingBadge.tone === "mint" ? "bg-mint text-ink" : floatingBadge.tone === "red" ? "bg-[#ff6b6b] text-white" : floatingBadge.tone === "amber" ? "bg-[#f8c45b] text-ink" : "bg-[#74b9ff] text-ink"}`}
            style={{ left: `${(files.indexOf(floatingBadge.square[0]) + .52) * 12.5}%`, top: `${(8 - Number(floatingBadge.square[1]) + .08) * 12.5}%` }}
          >{floatingBadge.label}</div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-slate-600">
        <span>Drag or tap a piece</span><span>Legal moves highlighted</span>
      </div>
    </div>
  );
}
