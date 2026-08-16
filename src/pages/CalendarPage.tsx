import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { TaskModal } from '@/components/TaskModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import { priorityDot, taskStatusColors } from '@/utils/helpers';
import { isAdmin } from '@/utils/permissions';
import type { Task } from '@/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarPage() {
  const { user } = useAuthStore();
  const { tasks, projects, users } = useDataStore();
  const admin = isAdmin(user);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const visibleTasks = useMemo(() => {
    if (admin) return tasks;
    return tasks.filter((t) => t.assignedTo === user?.id);
  }, [tasks, admin, user]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  const tasksByDay = useMemo(() => {
    const map = new Map<number, Task[]>();
    visibleTasks.forEach((t) => {
      const dueDate = new Date(t.dueDate);
      if (dueDate.getFullYear() === year && dueDate.getMonth() === month) {
        const day = dueDate.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(t);
      }
    });
    return map;
  }, [visibleTasks, year, month]);

  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Calendar</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {admin ? 'View all task deadlines.' : 'View your task deadlines.'}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={goToToday}>
          <CalendarDays className="h-4 w-4" /> Today
        </Button>
      </div>

      <div className="card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {MONTHS[month]} {year}
          </h3>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Previous month">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={nextMonth} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Next month">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="pb-2 text-center text-xs font-semibold uppercase text-slate-400">
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d[0]}</span>
            </div>
          ))}
          {days.map((day, i) => {
            if (day === null) return <div key={i} className="min-h-[80px] rounded-lg sm:min-h-[110px]" />;
            const dayTasks = tasksByDay.get(day) || [];
            return (
              <div
                key={i}
                className={`min-h-[80px] rounded-lg border p-1.5 sm:min-h-[110px] sm:p-2 ${
                  isToday(day)
                    ? 'border-slate-800 bg-slate-50 dark:border-slate-400 dark:bg-slate-800/50'
                    : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                <span className={`text-xs font-medium ${isToday(day) ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                  {day}
                </span>
                <div className="mt-1 space-y-1">
                  {dayTasks.slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTask(t); setTaskModalOpen(true); }}
                      className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[10px] hover:bg-slate-100 dark:hover:bg-slate-700 sm:text-xs"
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${priorityDot[t.priority]}`} />
                      <span className="truncate text-slate-600 dark:text-slate-300">{t.title}</span>
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="px-1 text-[10px] text-slate-400">+{dayTasks.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming tasks list */}
      <div className="card p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Tasks This Month</h3>
        {(() => {
          const monthTasks = visibleTasks
            .filter((t) => {
              const d = new Date(t.dueDate);
              return d.getFullYear() === year && d.getMonth() === month;
            })
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
          if (monthTasks.length === 0) {
            return <p className="py-8 text-center text-sm text-slate-400">No tasks scheduled this month.</p>;
          }
          return (
            <div className="space-y-2">
              {monthTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTask(t); setTaskModalOpen(true); }}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${priorityDot[t.priority]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{t.title}</p>
                    <p className="text-xs text-slate-400">{projectMap.get(t.projectId)?.name}</p>
                  </div>
                  <Badge className={taskStatusColors[t.status]}>{t.status.replace('_', ' ')}</Badge>
                  <span className="text-xs text-slate-400">{new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </button>
              ))}
            </div>
          );
        })()}
      </div>

      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} task={selectedTask} />
    </div>
  );
}
