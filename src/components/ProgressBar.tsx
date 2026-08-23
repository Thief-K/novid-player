import React, { useRef, useState, useCallback, useEffect } from "react";
import { usePlayerStore } from "../stores/playerStore";
import { mpvService } from "../services/mpvService";

export const ProgressBar: React.FC = () => {
  const { currentTime, duration, bufferPercent, seek, currentPath } = usePlayerStore();
  const barRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isCardActive, setIsCardActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [cardPosition, setCardPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number>(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const thumbDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const calculateRatio = useCallback((clientX: number): number => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return rect.width > 0 ? x / rect.width : 0;
  }, []);

  const fetchThumbnail = useCallback(
    (targetTime: number) => {
      if (!currentPath || targetTime < 0) return;
      if (thumbDebounceRef.current) {
        clearTimeout(thumbDebounceRef.current);
      }

      thumbDebounceRef.current = setTimeout(async () => {
        setIsLoadingThumbnail(true);
        const dataUrl = await mpvService.getThumbnail(currentPath, targetTime);
        if (dataUrl) {
          setThumbnailUrl(dataUrl);
        }
        setIsLoadingThumbnail(false);
      }, 60);
    },
    [currentPath]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || duration <= 0) return;
      const ratio = calculateRatio(e.clientX);
      const rect = barRef.current.getBoundingClientRect();
      const pos = e.clientX - rect.left;
      const t = ratio * duration;

      // Exact clamped cursor position for the time bubble
      const clampedBubble = Math.max(20, Math.min(pos, rect.width - 20));
      setHoverPosition(clampedBubble);
      setHoverTime(t);

      // Clamped position for the 180px thumbnail card (12px safe margin)
      const CARD_WIDTH = 180;
      const CARD_HALF = CARD_WIDTH / 2;
      const SAFE_MARGIN = 12;
      const clampedCard = Math.max(
        CARD_HALF + SAFE_MARGIN,
        Math.min(pos, rect.width - CARD_HALF - SAFE_MARGIN)
      );
      setCardPosition(clampedCard);

      if (isCardActive) {
        // Card is already active: continuously fetch/update thumbnail as user moves
        fetchThumbnail(t);
      } else {
        // Card not yet active: start/reset 300ms dwell timer
        if (dwellTimerRef.current) {
          clearTimeout(dwellTimerRef.current);
        }
        dwellTimerRef.current = setTimeout(() => {
          setIsCardActive(true);
          fetchThumbnail(t);
        }, 300);
      }

      if (isDragging) {
        seek(t);
      }
    },
    [calculateRatio, duration, fetchThumbnail, isCardActive, isDragging, seek]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (duration <= 0) return;
      setIsDragging(true);
      const ratio = calculateRatio(e.clientX);
      seek(ratio * duration);
    },
    [calculateRatio, duration, seek]
  );

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && barRef.current && duration > 0) {
        const ratio = calculateRatio(e.clientX);
        seek(ratio * duration);
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
      }
    };
  }, [calculateRatio, duration, isDragging, seek]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      className="relative w-full py-2 cursor-pointer group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsCardActive(false);
        setHoverPosition(null);
        setCardPosition(null);
        setThumbnailUrl(null);
        if (dwellTimerRef.current) {
          clearTimeout(dwellTimerRef.current);
        }
        if (thumbDebounceRef.current) {
          clearTimeout(thumbDebounceRef.current);
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
    >
      {/* Lightweight Floating Hover Time Bubble (displayed before card unlocks) */}
      {isHovered && !isCardActive && hoverPosition !== null && duration > 0 && (
        <div
          className="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900/90 text-[11px] font-mono text-slate-100 border border-slate-700/80 shadow-xl pointer-events-none z-30 backdrop-blur-xs transition-transform"
          style={{ left: `${hoverPosition}px` }}
        >
          {formatTime(hoverTime)}
        </div>
      )}

      {/* Modern Floating Hover Thumbnail Card (activated once dwelled for > 300ms) */}
      {isHovered &&
        isCardActive &&
        (cardPosition !== null || hoverPosition !== null) &&
        duration > 0 && (
          <div
            className="absolute -top-[118px] transform -translate-x-1/2 w-[180px] h-[101px] rounded-xl overflow-hidden bg-slate-900/95 border border-slate-700/80 shadow-2xl pointer-events-none z-30 backdrop-blur-md transition-all duration-100 flex flex-col items-center justify-center"
            style={{ left: `${cardPosition ?? hoverPosition}px` }}
          >
            {/* Shimmer skeleton loading placeholder */}
            {(!thumbnailUrl || isLoadingThumbnail) && (
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800/90 via-slate-700/40 to-slate-800/90 animate-pulse flex items-center justify-center" />
            )}

            {/* Extracted Thumbnail Frame */}
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-xl transition-opacity duration-200"
              />
            )}

            {/* Embedded Monospace Time Badge */}
            <div className="absolute bottom-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-mono font-medium text-slate-100 backdrop-blur-xs border border-white/10 shadow-md z-10">
              {formatTime(hoverTime)}
            </div>
          </div>
        )}

      {/* Progress Track Container */}
      <div
        ref={barRef}
        className={`relative w-full rounded-full bg-slate-800/80 overflow-hidden transition-all duration-200 ${
          isHovered || isDragging ? "h-2" : "h-1"
        }`}
      >
        {/* Buffer Track */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-slate-600/40 rounded-full transition-all duration-300 pointer-events-none"
          style={{ width: `${bufferPercent}%` }}
        />

        {/* Played Progress Bar */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-400 rounded-full pointer-events-none"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Scrubber Thumb Knob */}
      {(isHovered || isDragging) && duration > 0 && (
        <div
          className="absolute top-1/2 -mt-2 -ml-2 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(56,189,248,0.8)] border-2 border-sky-400 pointer-events-none transform transition-transform scale-100"
          style={{ left: `${progressPercent}%` }}
        />
      )}
    </div>
  );
};
