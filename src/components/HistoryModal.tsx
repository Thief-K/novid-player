import React from "react";
import { usePlayerStore } from "../stores/playerStore";
import { Trash2, X, Play } from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const { history, clearHistory, loadAndPlay } = usePlayerStore();

  if (!isOpen) return null;

  const formatDuration = (sec: number) => {
    if (!sec || isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full bg-[#0f141c]/95 border border-slate-700/60 rounded-2xl shadow-2xl p-3.5 flex flex-col text-slate-200 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-1 pb-2 mb-1.5 border-b border-slate-800/80">
          <span className="text-xs font-semibold text-slate-300">播放历史</span>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                title="清空历史"
                className="p-1 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              title="关闭"
              className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="max-h-64 overflow-y-auto space-y-0.5 pr-0.5">
          {history.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">暂无历史记录</div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  loadAndPlay(item.path, item.title);
                  onClose();
                }}
                className="group flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-sky-500/10 border border-transparent hover:border-sky-500/20 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                  <Play className="w-3 h-3 text-slate-400 group-hover:text-sky-400 fill-current shrink-0 transition-colors" />
                  <div className="text-xs text-slate-200 truncate group-hover:text-sky-300 transition-colors">
                    {item.title}
                  </div>
                </div>

                {/* Duration */}
                <div className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400 shrink-0">
                  {formatDuration(item.lastPosition)} / {formatDuration(item.duration)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
