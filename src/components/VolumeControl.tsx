import React, { useState } from "react";
import { Volume2, Volume1, VolumeX, Volume } from "lucide-react";
import { usePlayerStore } from "../stores/playerStore";
import { useTranslation } from "../i18n";

export const VolumeControl: React.FC = () => {
  const { volume, muted, setVolume, toggleMute } = usePlayerStore();
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const getVolumeIcon = () => {
    if (muted || volume === 0) return <VolumeX className="w-4 h-4 text-red-400" />;
    if (volume < 35) return <Volume className="w-4 h-4 text-slate-200" />;
    if (volume < 75) return <Volume1 className="w-4 h-4 text-slate-200" />;
    return <Volume2 className="w-4 h-4 text-slate-200" />;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
  };

  const isAmplified = volume > 100;

  return (
    <div
      className="relative flex items-center group py-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={toggleMute}
        title={muted ? t("controls.unmute") : t("controls.mute")}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
      >
        {getVolumeIcon()}
      </button>

      {/* Expandable Slider on Hover */}
      <div
        className={`flex items-center transition-all duration-300 overflow-hidden ${
          isHovered ? "w-28 opacity-100 ml-1.5" : "w-0 opacity-0"
        }`}
      >
        <div className="relative w-20 flex items-center">
          <input
            type="range"
            min="0"
            max="150"
            step="1"
            value={muted ? 0 : volume}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
          />
        </div>
        <span
          className={`ml-2 text-[10px] font-mono select-none w-7 text-right ${
            isAmplified ? "text-amber-400 font-semibold" : "text-slate-300"
          }`}
        >
          {muted ? "0%" : `${volume}%`}
        </span>
      </div>
    </div>
  );
};
