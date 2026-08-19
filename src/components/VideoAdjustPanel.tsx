import React from "react";
import { usePlayerStore } from "../stores/playerStore";
import { Sliders, RotateCcw, Monitor, Sun, Contrast, Palette } from "lucide-react";

export const VideoAdjustPanel: React.FC = () => {
  const { videoAdjust, setVideoAdjust, resetVideoAdjust, setAspectRatio } = usePlayerStore();

  const aspectRatios = [
    { label: "原始", value: "original" },
    { label: "16:9", value: "16:9" },
    { label: "4:3", value: "4:3" },
    { label: "21:9", value: "21:9" },
    { label: "1:1", value: "1:1" },
  ];

  return (
    <div className="absolute bottom-16 right-16 w-72 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md z-40 text-slate-200 select-none animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
          <Sliders className="w-3.5 h-3.5" />
          <span>画面与色彩调节</span>
        </div>
        <button
          onClick={resetVideoAdjust}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-sky-300 transition-colors"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>重置默认</span>
        </button>
      </div>

      {/* Aspect Ratio */}
      <div className="mb-3.5">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1.5">
          <Monitor className="w-3 h-3 text-sky-400" />
          <span>画面比例强制</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {aspectRatios.map((ratio) => {
            const isActive = videoAdjust.aspectRatio === ratio.value;
            return (
              <button
                key={ratio.value}
                onClick={() => setAspectRatio(ratio.value)}
                className={`py-1 rounded-lg text-xs transition-all ${
                  isActive
                    ? "bg-sky-500 text-white font-medium shadow-sm shadow-sky-500/30"
                    : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300"
                }`}
              >
                {ratio.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Sliders */}
      <div className="space-y-2.5">
        {/* Brightness */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>亮度</span>
            </span>
            <span className="font-mono text-slate-400">{videoAdjust.brightness}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={videoAdjust.brightness}
            onChange={(e) => setVideoAdjust({ brightness: parseInt(e.target.value, 10) })}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <Contrast className="w-3 h-3 text-indigo-400" />
              <span>对比度</span>
            </span>
            <span className="font-mono text-slate-400">{videoAdjust.contrast}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={videoAdjust.contrast}
            onChange={(e) => setVideoAdjust({ contrast: parseInt(e.target.value, 10) })}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <Palette className="w-3 h-3 text-rose-400" />
              <span>饱和度</span>
            </span>
            <span className="font-mono text-slate-400">{videoAdjust.saturation}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={videoAdjust.saturation}
            onChange={(e) => setVideoAdjust({ saturation: parseInt(e.target.value, 10) })}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>

        {/* Gamma */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-300 mb-1">
            <span>伽马值 (Gamma)</span>
            <span className="font-mono text-slate-400">{videoAdjust.gamma}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={videoAdjust.gamma}
            onChange={(e) => setVideoAdjust({ gamma: parseInt(e.target.value, 10) })}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>
      </div>
    </div>
  );
};
