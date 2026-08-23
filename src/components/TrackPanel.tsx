import React, { useState } from "react";
import { usePlayerStore } from "../stores/playerStore";
import { open } from "@tauri-apps/plugin-dialog";
import { Subtitles, Mic, Plus, Check, Clock, RotateCcw } from "lucide-react";
import { isTauri } from "../services/mpvService";
import { useTranslation } from "../i18n";

export const TrackPanel: React.FC = () => {
  const {
    tracks,
    selectedAudioTrack,
    selectedSubTrack,
    subDelay,
    audioDelay,
    setTrack,
    loadSubtitleFile,
    loadAudioFile,
    adjustSubDelay,
    adjustAudioDelay,
  } = usePlayerStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"sub" | "audio">("sub");

  const audioTracks = tracks.filter((t) => t.type === "audio");
  const subTracks = tracks.filter((t) => t.type === "sub");

  const handleImportSub = async () => {
    try {
      if (isTauri()) {
        const selected = await open({
          multiple: false,
          filters: [
            {
              name: t("tracks.loadExternalSub"),
              extensions: ["srt", "ass", "ssa", "vtt", "sub"],
            },
          ],
        });
        if (selected && typeof selected === "string") {
          await loadSubtitleFile(selected);
        }
      }
    } catch (err) {
      console.error("Import subtitle error:", err);
    }
  };

  const handleImportAudio = async () => {
    try {
      if (isTauri()) {
        const selected = await open({
          multiple: false,
          filters: [
            {
              name: t("tracks.loadExternalAudio"),
              extensions: ["mp3", "flac", "wav", "aac", "m4a", "ac3", "dts", "ogg"],
            },
          ],
        });
        if (selected && typeof selected === "string") {
          await loadAudioFile(selected);
        }
      }
    } catch (err) {
      console.error("Import audio error:", err);
    }
  };

  return (
    <div className="absolute bottom-16 right-20 w-80 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md z-40 text-slate-200 select-none animate-in fade-in zoom-in-95 duration-150">
      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-800/80 p-1 mb-3.5 border border-slate-700/50">
        <button
          onClick={() => setActiveTab("sub")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "sub"
              ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Subtitles className="w-3.5 h-3.5" />
          <span>
            {t("tracks.subTitle")} ({subTracks.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("audio")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "audio"
              ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>
            {t("tracks.audioTitle")} ({audioTracks.length})
          </span>
        </button>
      </div>

      {/* Subtitles Tab Content */}
      {activeTab === "sub" && (
        <div className="space-y-3">
          {/* Subtitle List */}
          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            <button
              onClick={() => setTrack("sid", "no")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-all ${
                selectedSubTrack === "no" || selectedSubTrack === null
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "bg-slate-800/40 hover:bg-slate-800/80 text-slate-300"
              }`}
            >
              <span>{t("tracks.offTrack")}</span>
              {(selectedSubTrack === "no" || selectedSubTrack === null) && (
                <Check className="w-3.5 h-3.5 text-sky-400" />
              )}
            </button>

            {subTracks.map((sub) => {
              const isSelected = selectedSubTrack === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setTrack("sid", sub.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-all ${
                    isSelected
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-medium"
                      : "bg-slate-800/40 hover:bg-slate-800/80 text-slate-300"
                  }`}
                >
                  <div className="overflow-hidden pr-2">
                    <div className="truncate font-medium">
                      {sub.title ||
                        sub["external-filename"]?.split(/[/\\]/).pop() ||
                        `Track #${sub.id}`}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {sub.lang ? `[${sub.lang.toUpperCase()}] ` : ""}
                      {sub.codec || ""}{" "}
                      {sub.external
                        ? `(${t("tracks.trackExternal")})`
                        : `(${t("tracks.trackDefault")})`}
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Import External Subtitle */}
          <button
            onClick={handleImportSub}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-sky-300 hover:text-sky-200 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("tracks.loadExternalSub")}</span>
          </button>

          {/* Subtitle Delay Calibration */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-400" />
                <span>{t("tracks.subDelay")}</span>
              </span>
              <span className="font-mono text-sky-400 font-semibold">
                {subDelay > 0 ? `+${subDelay.toFixed(1)}s` : `${subDelay.toFixed(1)}s`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              <button
                onClick={() => adjustSubDelay(-0.5)}
                className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
              >
                -0.5s
              </button>
              <button
                onClick={() => adjustSubDelay(-0.1)}
                className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
              >
                -0.1s
              </button>
              <button
                onClick={() => adjustSubDelay(-subDelay)}
                className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] flex items-center justify-center text-slate-400 hover:text-white"
                title={t("common.reset")}
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => adjustSubDelay(0.1)}
                className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
              >
                +0.1s
              </button>
              <button
                onClick={() => adjustSubDelay(0.5)}
                className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
              >
                +0.5s
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Tracks Tab Content */}
      {activeTab === "audio" && (
        <div className="space-y-3">
          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            {audioTracks.map((audio) => {
              const isSelected = selectedAudioTrack === audio.id;
              return (
                <button
                  key={audio.id}
                  onClick={() => setTrack("aid", audio.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-all ${
                    isSelected
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-medium"
                      : "bg-slate-800/40 hover:bg-slate-800/80 text-slate-300"
                  }`}
                >
                  <div className="overflow-hidden pr-2">
                    <div className="truncate font-medium">
                      {audio.title || `Track #${audio.id}`}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {audio.lang ? `[${audio.lang.toUpperCase()}] ` : ""}
                      {audio.codec || ""}
                      {audio["audio-channels"] ? ` • ${audio["audio-channels"]}ch` : ""}
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleImportAudio}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-sky-300 hover:text-sky-200 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("tracks.loadExternalAudio")}</span>
          </button>

          {/* Audio Delay */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-400" />
                <span>{t("tracks.audioDelay")}</span>
              </span>
              <span className="font-mono text-sky-400 font-semibold">
                {audioDelay > 0 ? `+${audioDelay.toFixed(1)}s` : `${audioDelay.toFixed(1)}s`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              <button
                onClick={() => adjustAudioDelay(-0.5)}
                className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
              >
                -0.5s
              </button>
              <button
                onClick={() => adjustAudioDelay(-0.1)}
                className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
              >
                -0.1s
              </button>
              <button
                onClick={() => adjustAudioDelay(-audioDelay)}
                className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] flex items-center justify-center text-slate-400 hover:text-white"
                title={t("common.reset")}
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => adjustAudioDelay(0.1)}
                className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
              >
                +0.1s
              </button>
              <button
                onClick={() => adjustAudioDelay(0.5)}
                className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
              >
                +0.5s
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
