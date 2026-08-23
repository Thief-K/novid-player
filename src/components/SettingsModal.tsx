import React, { useState } from "react";
import { usePlayerStore } from "../stores/playerStore";
import { useTranslation, LanguageCode } from "../i18n";
import { X, Cpu, Keyboard, Info, Globe, CheckCircle2, Sparkles, Maximize2 } from "lucide-react";
import { NovidLogo } from "./NovidLogo";

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
    autoFitWindow,
    setAutoFitWindow,
  } = usePlayerStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"general" | "decoder" | "shortcuts" | "about">(
    "general"
  );

  if (!isSettingsOpen) return null;

  const handleHwdecChange = async (mode: string) => {
    await setHwdec(mode);
  };

  const languages: { id: LanguageCode; label: string }[] = [
    { id: "auto", label: t("settings.langAuto") },
    { id: "zh-CN", label: t("settings.langZh") },
    { id: "en-US", label: t("settings.langEn") },
  ];

  const hwdecOptions = [
    { id: "auto-safe", label: t("settings.hwdecAuto") },
    { id: "d3d11va", label: t("settings.hwdecD3d11va") },
    { id: "nvdec", label: t("settings.hwdecNvdec") },
    { id: "no", label: t("settings.hwdecNo") },
  ];

  const shortcutGroups = [
    {
      title: t("settings.hotkeyGroupPlayback"),
      items: [
        { key: "Space", desc: t("settings.hotkeySpace") },
        { key: "← / →", desc: t("settings.hotkeyArrows") },
        { key: "Shift + ← / →", desc: t("settings.hotkeyShiftArrows") },
        { key: ". / ,", desc: t("settings.hotkeyFrameStep") },
      ],
    },
    {
      title: t("settings.hotkeyGroupAudio"),
      items: [
        { key: "↑ / ↓", desc: t("settings.hotkeyVolume") },
        { key: "M", desc: t("settings.hotkeyMute") },
        { key: "[ / ]", desc: t("settings.hotkeySpeed") },
        { key: "Backspace", desc: t("settings.hotkeyResetSpeed") },
      ],
    },
    {
      title: t("settings.hotkeyGroupVideo"),
      items: [
        { key: "C / V", desc: t("settings.hotkeySubTrack") },
        { key: "S", desc: t("settings.hotkeyScreenshot") },
      ],
    },
    {
      title: t("settings.hotkeyGroupWindow"),
      items: [
        { key: `F / ${t("settings.hotkeyDoubleClick")}`, desc: t("settings.hotkeyFullscreen") },
        { key: "L", desc: t("settings.hotkeyPlaylist") },
        { key: "Ctrl + O", desc: t("settings.hotkeyOpenFile") },
        { key: "Esc", desc: t("settings.hotkeyEscape") },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-100"
      onClick={() => toggleSettings(false)}
    >
      <div
        className="relative max-w-lg w-full bg-[#0f141c]/95 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200 tracking-wide">
              {t("settings.title")}
            </span>
          </div>
          <button
            onClick={() => toggleSettings(false)}
            title={t("common.close")}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="px-5 pt-3 pb-1">
          <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "general"
                  ? "bg-sky-500 text-white shadow-sm shadow-sky-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t("settings.tabGeneral")}</span>
            </button>

            <button
              onClick={() => setActiveTab("decoder")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "decoder"
                  ? "bg-sky-500 text-white shadow-sm shadow-sky-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{t("settings.tabDecoder")}</span>
            </button>

            <button
              onClick={() => setActiveTab("shortcuts")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "shortcuts"
                  ? "bg-sky-500 text-white shadow-sm shadow-sky-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>{t("settings.tabShortcuts")}</span>
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "about"
                  ? "bg-sky-500 text-white shadow-sm shadow-sky-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>{t("settings.tabAbout")}</span>
            </button>
          </div>
        </div>

        {/* Modal Tab Content Area */}
        <div className="p-5 overflow-y-auto max-h-[62vh] min-h-[290px] flex flex-col justify-between">
          {/* TAB 1: General & Language */}
          {activeTab === "general" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span>{t("settings.languageSection")}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{t("settings.languageDesc")}</p>
                </div>

                {/* Segmented Pill Selector */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {languages.map((item) => {
                    const isSelected = language === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setLanguage(item.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                          isSelected
                            ? "bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-sm"
                            : "bg-slate-800/50 border-slate-700/40 text-slate-300 hover:bg-slate-700/60"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto-fit Window Resolution Toggle Card */}
              <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>{t("settings.autoFitWindow")}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{t("settings.autoFitWindowDesc")}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setAutoFitWindow(!autoFitWindow)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoFitWindow ? "bg-sky-500 shadow-sm shadow-sky-500/30" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoFitWindow ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Decoder & Hardware Acceleration */}
          {activeTab === "decoder" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-sky-400" />
                      <span>{t("settings.decoderSection")}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t("settings.decoderDesc")}</p>
                  </div>

                  {/* Runtime Status Pill */}
                  {currentPath && hwdecCurrent && (
                    <div
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono border flex items-center gap-1.5 ${
                        hwdecCurrent === "no"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          hwdecCurrent === "no" ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                      />
                      <span>{hwdecCurrent === "no" ? t("settings.inactive") : hwdecCurrent}</span>
                    </div>
                  )}
                </div>

                {/* Decoder Mode Pills */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {hwdecOptions.map((item) => {
                    const isSelected =
                      hwdec === item.id || (hwdec === "auto" && item.id === "auto-safe");
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleHwdecChange(item.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                          isSelected
                            ? "bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-sm"
                            : "bg-slate-800/50 border-slate-700/40 text-slate-300 hover:bg-slate-700/60"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* Decoder Tip */}
                <div className="flex items-start gap-1.5 pt-1 text-[11px] text-slate-400 leading-relaxed">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>{t("settings.decoderTip")}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Categorized Shortcuts */}
          {activeTab === "shortcuts" && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-150">
              {shortcutGroups.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 flex flex-col justify-between"
                >
                  <div className="text-[11px] font-semibold text-sky-400 mb-2">{group.title}</div>
                  <div className="space-y-1.5">
                    {group.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="flex items-center justify-between text-[11px] gap-2"
                      >
                        <span className="text-slate-300 truncate">{item.desc}</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700/70 rounded text-[10px] font-mono text-sky-300 shrink-0 shadow-xs">
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: About NovidPlayer */}
          {activeTab === "about" && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-2 animate-in fade-in duration-150">
              <NovidLogo size={52} glow />
              <div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base font-bold text-slate-100 tracking-wide">
                    {t("settings.aboutTitle")}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    v1.0.0
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">{t("settings.aboutDesc")}</p>
              </div>

              <div className="w-full max-w-md p-3 rounded-xl bg-slate-850/60 border border-slate-800 text-left space-y-1.5">
                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t("settings.aboutArch")}</span>
                </div>
                <div className="text-xs text-slate-300 font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                  {t("settings.techStack")}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
