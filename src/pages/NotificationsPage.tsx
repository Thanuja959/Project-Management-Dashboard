import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Bell,
  CheckCheck,
  FolderKanban,
  ListTodo,
  CheckCircle2,
  RefreshCw,
  CalendarClock,
  TrendingUp,
} from 'lucide-react';
import { relativeTime } from '@/utils/helpers';
import type { NotificationType } from '@/types';

const typeIcons: Record<NotificationType, typeof Bell> = {
  PROJECT_ASSIGNED: FolderKanban,
  TASK_ASSIGNED: ListTodo,
  TASK_COMPLETED: CheckCircle2,
  TASK_STATUS_CHANGED: RefreshCw,
  DEADLINE_APPROACHING: CalendarClock,
  PROJECT_PROGRESS: TrendingUp,
};

const typeColors: Record<NotificationType, string> = {
  PROJECT_ASSIGNED: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
  TASK_ASSIGNED: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  TASK_COMPLETED: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  TASK_STATUS_CHANGED: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  DEADLINE_APPROACHING: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
  PROJECT_PROGRESS: 'bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
};

export function NotificationsPage() {
  const { user } = useAuthStore();
  const { notifications, markNotificationRead, markAllRead } = useDataStore();
  const toast = useToast();
  const navigate = useNavigate();

  const userNotifs = useMemo(() => {
    return notifications
      .filter((n) => n.userId === user?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, user]);

  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const handleMarkAll = () => {
    markAllRead(user!.id);
    toast.success('All notifications marked as read');
  };

  const handleClick = (id: string, link?: string) => {
    markNotificationRead(id);
    if (link) navigate(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Notifications</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAll}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {userNotifs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Bell className="h-6 w-6" />}
            title="No notifications"
            description="You'll see updates about your tasks and projects here."
          />
        </div>
      ) : (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {userNotifs.map((n) => {
            const Icon = typeIcons[n.type];
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n.id, n.link)}
                className={`flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                  !n.read ? 'bg-sky-50/50 dark:bg-sky-500/5' : ''
                }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${typeColors[n.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500" />}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{relativeTime(n.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
