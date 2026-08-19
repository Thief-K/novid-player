import React from "react";
import { usePlayerStore } from "../stores/playerStore";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePlayerStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none select-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case "success":
              return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            case "error":
              return <AlertCircle className="w-4 h-4 text-rose-400" />;
            case "warning":
              return <AlertTriangle className="w-4 h-4 text-amber-400" />;
            default:
              return <Info className="w-4 h-4 text-sky-400" />;
          }
        };

        return (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md text-slate-100 text-xs animate-in fade-in slide-in-from-top-2 duration-200 cursor-pointer hover:bg-slate-900 transition-all"
          >
            {getIcon()}
            <div>
              <span className="font-semibold text-slate-200">{toast.title}</span>
              {toast.description && (
                <span className="text-slate-400 ml-1.5">{toast.description}</span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="ml-2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
