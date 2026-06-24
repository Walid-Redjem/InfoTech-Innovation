"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface Toast { id: number; message: string; type: ToastType }

interface ToastCtx { showToast: (message: string, type?: ToastType) => void }
const ToastContext = createContext<ToastCtx>({ showToast: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const icons = { success: CheckCircle2, error: XCircle, info: Info };
  const colors = {
    success: { border: "border-l-turquoise", icon: "text-turquoise", bg: "bg-white" },
    error:   { border: "border-l-red-500",   icon: "text-red-500",   bg: "bg-white" },
    info:    { border: "border-l-mauve",      icon: "text-mauve",     bg: "bg-white" },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 end-4 z-[500] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => {
            const Icon = icons[type];
            const c = colors[type];
            return (
              <motion.div key={id}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className={`pointer-events-auto flex items-center gap-3 ${c.bg} border border-gray-100 border-l-4 ${c.border} rounded-xl px-4 py-3 shadow-xl shadow-black/10 min-w-[260px] max-w-[340px]`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${c.icon}`} />
                <p className="text-sm font-medium text-gray-700 flex-1">{message}</p>
                <button onClick={() => dismiss(id)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
