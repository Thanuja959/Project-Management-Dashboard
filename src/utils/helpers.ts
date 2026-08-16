import type { TaskPriority, TaskStatus, ProjectStatus } from '@/types';

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  return `${mo}mo ago`;
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'COMPLETED') return false;
  return new Date(dueDate).getTime() < Date.now();
}

export function daysUntil(dueDate: string): number {
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const priorityRank: Record<TaskPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export const statusOrder: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];

export const projectStatusColors: Record<ProjectStatus, string> = {
  PLANNING: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
  ACTIVE: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  ON_HOLD: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
};

export const taskStatusColors: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  REVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
};

export const priorityColors: Record<TaskPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300',
  MEDIUM: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  URGENT: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
};

export const priorityDot: Record<TaskPriority, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-sky-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-rose-500',
};

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
