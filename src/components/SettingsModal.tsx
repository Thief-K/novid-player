import React from "react";
import { usePlayerStore } from "../stores/playerStore";
import { mpvService } from "../services/mpvService";
import { X, Cpu, Keyboard, Info } from "lucide-react";

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, toggleSettings, hwdec, addToast } = usePlayerStore();

  if (!isSettingsOpen) return null;

  const handleHwdecChange = async (mode: string) => {
    await mpvService.sendRawCommand(["set_property", "hwdec", mode]);
    addToast("硬件加速模式", `已切换至 ${mode}`, "info");
  };

  const shortcuts = [
    { key: "Space", desc: "播放 / 暂停" },
    { key: "← / →", desc: "快退 5 秒 / 快进 5 秒" },
    { key: "Shift + ← / →", desc: "微调 1 秒" },
    { key: "↑ / ↓", desc: "音量 ±5%" },
    { key: "M", desc: "静音 / 恢复" },
    { key: "F / 双击", desc: "全屏切换" },
    { key: "[ / ]", desc: "倍速 ±0.1x" },
    { key: "Backspace", desc: "重置 1.0x 倍速" },
    { key: "C", desc: "循环切换字幕" },
    { key: "V", desc: "循环切换音轨" },
    { key: "S", desc: "截取高清画面" },
    { key: ". / ,", desc: "逐帧前进 / 后退" },
    { key: "L", desc: "播放列表抽屉" },
    { key: "Ctrl + O", desc: "打开本地视频" },
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
          <span className="text-xs font-semibold text-slate-300">播放器设置</span>
          <button
            onClick={() => toggleSettings(false)}
            title="关闭"
            className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-0.5">
          {/* Hardware Acceleration Settings */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>硬件解码与渲染</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "auto-safe", name: "Auto Safe (推荐)", desc: "自动优选保底" },
                { id: "d3d11va", name: "D3D11VA", desc: "Windows 原生硬解" },
                { id: "nvdec", name: "NVDEC", desc: "NVIDIA 显卡专用" },
                { id: "no", name: "软件解码", desc: "纯 CPU 解码" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHwdecChange(item.id)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    hwdec === item.id || (hwdec === "auto" && item.id === "auto-safe")
                      ? "bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-xs"
                      : "bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  <div className="text-xs font-medium">{item.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
              <Keyboard className="w-3.5 h-3.5 text-sky-400" />
              <span>常用快捷键</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-800/30 p-2.5 rounded-xl border border-slate-800/60">
              {shortcuts.map((s) => (
                <div key={s.key} className="flex items-center justify-between py-0.5 text-[11px]">
                  <span className="text-slate-400 truncate mr-1.5">{s.desc}</span>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700/60 rounded text-[10px] font-mono text-sky-300 shrink-0">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* About NovaPlayer Footer */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-sky-400" />
              <span>NovaPlayer v1.0.0</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">Tauri v2 + MPV Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
