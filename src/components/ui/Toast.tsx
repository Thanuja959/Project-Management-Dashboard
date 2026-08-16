import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-sky-500',
  warning: 'text-amber-500',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              <Icon className={`h-5 w-5 shrink-0 ${colors[toast.type]}`} />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const showToast = useUIStore((s) => s.showToast);
  return {
    success: (message: string) => showToast({ message, type: 'success' }),
    error: (message: string) => showToast({ message, type: 'error' }),
    info: (message: string) => showToast({ message, type: 'info' }),
    warning: (message: string) => showToast({ message, type: 'warning' }),
  };
}
