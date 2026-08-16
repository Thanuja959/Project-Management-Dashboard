import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent?: string;
  sublabel?: string;
}

export function StatCard({ label, value, icon, accent = 'text-slate-500 dark:text-slate-400', sublabel }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sublabel}</p>}
        </div>
        <div className={`rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800 ${accent}`}>{icon}</div>
      </div>
    </motion.div>
  );
}
