import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, AlertOctagon, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning" | "danger";
  title?: string;
  message: string;
  details?: string;
  badge?: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => {
        const isWarning = toast.type === "warning";
        const isDanger = toast.type === "danger";
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            role="alert"
            aria-live="assertive"
            className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl shadow-lg border transition-all duration-300 animate-fade-in ${
              isDanger
                ? "bg-rose-50 text-rose-950 border-rose-300 shadow-rose-900/10"
                : isWarning
                ? "bg-amber-50 text-amber-950 border-amber-300 shadow-amber-900/10"
                : isSuccess
                ? "bg-emerald-50 text-emerald-950 border-emerald-300 shadow-emerald-900/10"
                : isError
                ? "bg-rose-50 text-rose-950 border-rose-300 shadow-rose-900/10"
                : "bg-white text-slate-900 border-slate-300 shadow-slate-900/10"
            }`}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="mt-0.5 shrink-0">
                {isDanger && <AlertOctagon className="w-5 h-5 text-rose-600" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {toast.type === "info" && <Info className="w-5 h-5 text-sky-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  {toast.title && (
                    <span className="text-xs font-bold tracking-tight">
                      {toast.title}
                    </span>
                  )}
                  {toast.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        isDanger
                          ? "bg-rose-200 text-rose-900"
                          : isWarning
                          ? "bg-amber-200 text-amber-900"
                          : isSuccess
                          ? "bg-emerald-200 text-emerald-900"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {toast.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
                {toast.details && (
                  <p className="text-[11px] opacity-80 mt-1 leading-normal">{toast.details}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-2 cursor-pointer text-slate-500 hover:text-slate-800 shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

