import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            id={`toast-item-${toast.id}`}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-50 border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-amber-50 border-amber-700 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800'
                : toast.type === 'error'
                ? 'bg-rose-900 text-rose-50 border-rose-700 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-800'
                : 'bg-slate-900 text-slate-50 border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-300 shrink-0" />}
              <span id={`toast-text-${toast.id}`}>{toast.message}</span>
            </div>
            <button
              id={`toast-close-btn-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="ml-3 p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
