"use client";

type EvaluationBarProps = { value: number; mate?: string | null; vertical?: boolean };

export function EvaluationBar({ value, mate, vertical = true }: EvaluationBarProps) {
  const clamped = Math.max(-10, Math.min(10, value));
  const whitePercent = 50 + clamped * 4.7;
  return (
    <div className={`flex items-center gap-2 ${vertical ? "h-full flex-col" : "w-full flex-row"}`}>
      {vertical && <span className="text-[10px] font-bold text-slate-500">{mate ?? (value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1))}</span>}
      <div className={`relative overflow-hidden rounded-full border border-line bg-[#202832] ${vertical ? "h-full w-2.5" : "h-2.5 w-full"}`}>
        <div className={vertical ? "absolute bottom-0 left-0 right-0 bg-[#f1f2ed] transition-[height] duration-500" : "absolute bottom-0 left-0 top-0 bg-[#f1f2ed] transition-[width] duration-500"} style={vertical ? { height: `${whitePercent}%` } : { width: `${whitePercent}%` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
      </div>
      {vertical && <span className="text-[9px] font-bold text-slate-500">SF</span>}
    </div>
  );
}
