import React from "react";
import { usePlayerStore } from "../stores/playerStore";
import { useTranslation, LanguageCode } from "../i18n";
import { X, Cpu, Keyboard, Info, Globe } from "lucide-react";

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    toggleSettings,
    hwdec,
    hwdecCurrent,
    setHwdec,
    currentPath,
    language,
    setLanguage,
  } = usePlayerStore();
  const { t } = useTranslation();

  if (!isSettingsOpen) return null;

  const handleHwdecChange = async (mode: string) => {
    await setHwdec(mode);
  };

  const languages: { id: LanguageCode; name: string; desc: string }[] = [
    { id: "auto", name: t("settings.langAuto"), desc: "System" },
    { id: "zh-CN", name: t("settings.langZh"), desc: "Chinese" },
    { id: "en-US", name: t("settings.langEn"), desc: "English" },
  ];

  const shortcuts = [
    { key: "Space", desc: t("settings.hotkeySpace") },
    { key: "← / →", desc: t("settings.hotkeyArrows") },
    { key: "Shift + ← / →", desc: t("settings.hotkeyShiftArrows") },
    { key: "↑ / ↓", desc: t("settings.hotkeyVolume") },
    { key: "M", desc: t("settings.hotkeyMute") },
    { key: "F / 双击", desc: t("settings.hotkeyFullscreen") },
    { key: "[ / ]", desc: t("settings.hotkeySpeed") },
    { key: "Backspace", desc: t("settings.hotkeyResetSpeed") },
    { key: "C / V", desc: t("settings.hotkeySubTrack") },
    { key: "S", desc: t("settings.hotkeyScreenshot") },
    { key: ". / ,", desc: t("settings.hotkeyFrameStep") },
    { key: "L", desc: t("settings.hotkeyPlaylist") },
    { key: "Ctrl + O", desc: t("settings.hotkeyOpenFile") },
    { key: "Esc", desc: t("settings.hotkeyEscape") },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-100"
      onClick={() => toggleSettings(false)}
    >
      <div
        className="relative max-w-md w-full bg-[#0f141c]/95 border border-slate-700/60 rounded-2xl shadow-2xl p-4 overflow-hidden max-h-[85vh] flex flex-col text-slate-200 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800/80">
          <span className="text-xs font-semibold text-slate-300">{t("settings.title")}</span>
          <button
            onClick={() => toggleSettings(false)}
            title={t("common.close")}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-0.5">
          {/* General & Language Settings */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{t("settings.languageSection")}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {languages.map((item) => {
                const isSelected = language === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setLanguage(item.id)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? "bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-xs"
                        : "bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="text-xs font-medium truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hardware Acceleration Settings */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span>{t("settings.decoderSection")}</span>
              </div>
              {currentPath && hwdecCurrent && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {t("settings.hwdecCurrentStatus")}:{" "}
                  <span className={hwdecCurrent === "no" ? "text-amber-400" : "text-emerald-400"}>
                    {hwdecCurrent === "no" ? t("settings.inactive") : hwdecCurrent}
                  </span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "auto-safe", name: "Auto Safe", desc: t("settings.hwdecAuto") },
                { id: "d3d11va", name: "D3D11VA", desc: t("settings.hwdecD3d11va") },
                { id: "nvdec", name: "NVDEC", desc: t("settings.hwdecNvdec") },
                { id: "no", name: "Software", desc: t("settings.hwdecNo") },
              ].map((item) => {
                const isSelected =
                  hwdec === item.id || (hwdec === "auto" && item.id === "auto-safe");
                return (
                  <button
                    key={item.id}
                    onClick={() => handleHwdecChange(item.id)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? "bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-xs"
                        : "bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="text-xs font-medium">{item.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
              <Keyboard className="w-3.5 h-3.5 text-sky-400" />
              <span>{t("settings.hotkeySection")}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-800/30 p-2.5 rounded-xl border border-slate-800/60">
              {shortcuts.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5 text-[11px]">
                  <span className="text-slate-400 truncate mr-1.5">{s.desc}</span>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700/60 rounded text-[10px] font-mono text-sky-300 shrink-0">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* About NovidPlayer Footer */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-sky-400" />
              <span>NovidPlayer v1.0.0</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">Tauri v2 + MPV Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
