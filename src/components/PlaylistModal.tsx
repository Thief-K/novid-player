import React from "react";
import { usePlayerStore } from "../stores/playerStore";
import { open } from "@tauri-apps/plugin-dialog";
import { Plus, Trash2, X } from "lucide-react";
import { isTauri } from "../services/mpvService";

export const PlaylistModal: React.FC = () => {
  const {
    playlist,
    currentPlayingIndex,
    isPlaylistOpen,
    togglePlaylist,
    playIndex,
    removeFromPlaylist,
    clearPlaylist,
    addToPlaylist,
  } = usePlayerStore();

  if (!isPlaylistOpen) return null;

  const handleAddFiles = async () => {
    try {
      if (isTauri()) {
        const selected = await open({
          multiple: true,
          filters: [
            {
              name: "媒体文件",
              extensions: [
                "mp4",
                "mkv",
                "avi",
                "mov",
                "flv",
                "ts",
                "webm",
                "wmv",
                "m4v",
                "mp3",
                "flac",
                "wav",
                "aac",
                "ogg",
                "m4a",
              ],
            },
          ],
        });
        if (selected && Array.isArray(selected)) {
          addToPlaylist(selected.map((path) => ({ path })));
        } else if (selected && typeof selected === "string") {
          addToPlaylist([{ path: selected }]);
        }
      }
    } catch (err) {
      console.error("Add files error:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-100"
      onClick={() => togglePlaylist(false)}
    >
      <div
        className="relative max-w-md w-full bg-[#0f141c]/95 border border-slate-700/60 rounded-2xl shadow-2xl p-3.5 flex flex-col text-slate-200 backdrop-blur-xl max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-1 pb-2 mb-1.5 border-b border-slate-800/80">
          <span className="text-xs font-semibold text-slate-300">
            播放列表 {playlist.length > 0 && `(${playlist.length})`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleAddFiles}
              title="添加文件"
              className="p-1 text-slate-400 hover:text-sky-300 hover:bg-white/5 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {playlist.length > 0 && (
              <button
                onClick={clearPlaylist}
                title="清空列表"
                className="p-1 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => togglePlaylist(false)}
              title="关闭"
              className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Playlist Items */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5 max-h-64">
          {playlist.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <p className="mb-2.5">暂无播放文件</p>
              <button
                onClick={handleAddFiles}
                className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-xs border border-sky-500/30 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>添加本地文件</span>
              </button>
            </div>
          ) : (
            playlist.map((item, index) => {
              const isPlaying = index === currentPlayingIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => playIndex(index)}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                    isPlaying
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-medium"
                      : "hover:bg-sky-500/10 text-slate-300 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
                    {isPlaying ? (
                      <div className="flex items-center gap-0.5 shrink-0 w-3.5 justify-center">
                        <span className="w-0.5 h-2.5 bg-sky-400 rounded-full animate-pulse" />
                        <span className="w-0.5 h-3.5 bg-sky-400 rounded-full animate-pulse delay-75" />
                        <span className="w-0.5 h-2 bg-sky-400 rounded-full animate-pulse delay-150" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 w-3.5 text-center shrink-0">
                        {index + 1}
                      </span>
                    )}
                    <div className="text-xs truncate group-hover:text-sky-300 transition-colors flex-1">
                      {item.title}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromPlaylist(item.id);
                    }}
                    title="移除"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
