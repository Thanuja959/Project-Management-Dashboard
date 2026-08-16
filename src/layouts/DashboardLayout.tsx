import { useEffect, type ReactNode } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full lg:hidden"
            >
              <div className="relative h-full">
                <Sidebar />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute -right-10 top-3 rounded-lg bg-white p-1.5 text-slate-500 shadow-md dark:bg-slate-800 dark:text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
