import React from "react";
import { usePlayerStore } from "../stores/playerStore";
import { Gauge, RotateCcw } from "lucide-react";
import { useTranslation } from "../i18n";

export const SpeedPanel: React.FC = () => {
  const { speed, setSpeed } = usePlayerStore();
  const { t } = useTranslation();
  const presets = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];

  return (
    <div className="absolute bottom-16 right-36 w-64 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md z-40 text-slate-200 select-none animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
          <Gauge className="w-3.5 h-3.5" />
          <span>{t("speed.title")}</span>
        </div>
        <button
          onClick={() => setSpeed(1.0)}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-sky-300 transition-colors"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>{t("speed.reset")}</span>
        </button>
      </div>

      {/* Preset Pills */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {presets.map((val) => {
          const isActive = Math.abs(speed - val) < 0.01;
          return (
            <button
              key={val}
              onClick={() => {
                setSpeed(val);
              }}
              className={`py-1 rounded-lg text-xs font-mono transition-all ${
                isActive
                  ? "bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/30"
                  : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300"
              }`}
            >
              {val}x
            </button>
          );
        })}
      </div>

      {/* Fine-tuning Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>微调: 0.25x</span>
          <span className="text-sky-400 font-bold">{speed.toFixed(2)}x</span>
          <span>4.0x</span>
        </div>
        <input
          type="range"
          min="0.25"
          max="4.0"
          step="0.05"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
        />
      </div>
    </div>
  );
};
