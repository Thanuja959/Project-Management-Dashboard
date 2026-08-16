import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { StatCard } from '@/components/StatCard';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Users,
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity as ActivityIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TaskStatus } from '@/types';
import { isOverdue, relativeTime, formatDateShort, priorityDot } from '@/utils/helpers';

const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  REVIEW: '#a855f7',
  COMPLETED: '#10b981',
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const { users, projects, tasks, activities } = useDataStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const visibleTasks = useMemo(() => {
    if (isAdmin) return tasks;
    return tasks.filter((t) => t.assignedTo === user?.id);
  }, [tasks, isAdmin, user]);

  const visibleProjects = useMemo(() => {
    if (isAdmin) return projects;
    return projects.filter((p) => p.memberIds.includes(user?.id || ''));
  }, [projects, isAdmin, user]);

  const stats = useMemo(() => {
    const completed = visibleTasks.filter((t) => t.status === 'COMPLETED').length;
    const pending = visibleTasks.filter((t) => t.status === 'TODO').length;
    const inProgress = visibleTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const overdue = visibleTasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
    const completionRate = visibleTasks.length > 0 ? Math.round((completed / visibleTasks.length) * 100) : 0;
    return { total: visibleTasks.length, completed, pending, inProgress, overdue, completionRate };
  }, [visibleTasks]);

  const completionData = useMemo(() => {
    const weeks: { label: string; completed: number; created: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      const completed = visibleTasks.filter((t) => {
        const d = new Date(t.updatedAt);
        return t.status === 'COMPLETED' && d >= start && d < end;
      }).length;
      const created = visibleTasks.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= start && d < end;
      }).length;
      weeks.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, completed, created });
    }
    return weeks;
  }, [visibleTasks]);

  const statusData = useMemo(() => {
    return (['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'] as TaskStatus[]).map((s) => ({
      name: s.replace('_', ' '),
      value: visibleTasks.filter((t) => t.status === s).length,
      color: STATUS_COLORS[s],
    }));
  }, [visibleTasks]);

  const projectProgressData = useMemo(() => {
    return visibleProjects.map((p) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id);
      const completed = pTasks.filter((t) => t.status === 'COMPLETED').length;
      const progress = pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0;
      return { name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name, progress };
    });
  }, [visibleProjects, tasks]);

  const productivityData = useMemo(() => {
    if (!isAdmin) return [];
    return users
      .filter((u) => u.role === 'USER' && u.active)
      .map((u) => {
        const uTasks = tasks.filter((t) => t.assignedTo === u.id);
        const completed = uTasks.filter((t) => t.status === 'COMPLETED').length;
        return { name: u.name.split(' ')[0], tasks: uTasks.length, completed };
      });
  }, [users, tasks, isAdmin]);

  const upcomingDeadlines = useMemo(() => {
    return visibleTasks
      .filter((t) => t.status !== 'COMPLETED')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [visibleTasks]);

  const recentActivities = useMemo(() => {
    if (isAdmin) return activities.slice(0, 6);
    return activities.filter((a) => a.userId === user?.id).slice(0, 6);
  }, [activities, isAdmin, user]);

  const recentProjects = useMemo(() => {
    return [...visibleProjects]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [visibleProjects]);

  const recentCompleted = useMemo(() => {
    return visibleTasks
      .filter((t) => t.status === 'COMPLETED')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [visibleTasks]);

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome back, {user?.name}. Here's what's happening {isAdmin ? 'across your team' : 'with your work'}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {isAdmin && (
          <StatCard label="Total Users" value={users.filter((u) => u.active).length} icon={<Users className="h-5 w-5" />} />
        )}
        <StatCard label={isAdmin ? 'Projects' : 'My Projects'} value={visibleProjects.length} icon={<FolderKanban className="h-5 w-5" />} />
        <StatCard label={isAdmin ? 'Total Tasks' : 'My Tasks'} value={stats.total} icon={<ListTodo className="h-5 w-5" />} />
        <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5" />} accent="text-emerald-500" />
        <StatCard label="Pending" value={stats.pending + stats.inProgress} icon={<Clock className="h-5 w-5" />} accent="text-sky-500" />
        <StatCard label="Overdue" value={stats.overdue} icon={<AlertTriangle className="h-5 w-5" />} accent="text-rose-500" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Task Completion Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={completionData}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="created" name="Created" stroke="#3b82f6" fill="url(#colorCreated)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fill="url(#colorCompleted)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Project Progress</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={projectProgressData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="progress" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {isAdmin ? (
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Team Productivity</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="tasks" name="Total" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">My Completion Rate</h3>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative h-40 w-40">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 42 * (stats.completionRate / 100)} ${2 * Math.PI * 42}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.completionRate}%</span>
                  <span className="text-xs text-slate-400">completed</span>
                </div>
              </div>
              <div className="mt-6 flex gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{stats.completed}</p>
                  <p className="text-xs text-slate-400">Completed</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{stats.pending + stats.inProgress}</p>
                  <p className="text-xs text-slate-400">Active</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-rose-500">{stats.overdue}</p>
                  <p className="text-xs text-slate-400">Overdue</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lists */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upcoming Deadlines */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upcoming Deadlines</h3>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <EmptyState title="No upcoming deadlines" icon={<Calendar className="h-6 w-6" />} />
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((t) => {
                const overdue = isOverdue(t.dueDate, t.status);
                return (
                  <button
                    key={t.id}
                    onClick={() => navigate('/tasks')}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${priorityDot[t.priority]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{t.title}</p>
                      <p className="text-xs text-slate-400">{projectMap.get(t.projectId)?.name}</p>
                    </div>
                    <span className={`text-xs font-medium ${overdue ? 'text-rose-500' : 'text-slate-400'}`}>
                      {formatDateShort(t.dueDate)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recent Activity</h3>
          </div>
          {recentActivities.length === 0 ? (
            <EmptyState title="No recent activity" icon={<ActivityIcon className="h-6 w-6" />} />
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a) => {
                const actor = userMap.get(a.userId);
                return (
                  <div key={a.id} className="flex items-start gap-3">
                    {actor && <Avatar name={actor.name} color={actor.avatarColor} size="sm" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{actor?.name.split(' ')[0]}</span>{' '}
                        {a.action} <span className="font-medium">{a.target}</span>
                      </p>
                      <p className="text-xs text-slate-400">{relativeTime(a.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Projects / Completed Tasks */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isAdmin ? 'Recent Projects' : 'Recently Completed'}
            </h3>
          </div>
          {isAdmin ? (
            recentProjects.length === 0 ? (
              <EmptyState title="No projects yet" icon={<FolderKanban className="h-6 w-6" />} />
            ) : (
              <div className="space-y-2">
                {recentProjects.map((p) => {
                  const pTasks = tasks.filter((t) => t.projectId === p.id);
                  const completed = pTasks.filter((t) => t.status === 'COMPLETED').length;
                  const progress = pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0;
                  return (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="block w-full rounded-lg p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.name}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-slate-700 dark:bg-slate-300" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{progress}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : recentCompleted.length === 0 ? (
            <EmptyState title="No completed tasks" icon={<CheckCircle2 className="h-6 w-6" />} />
          ) : (
            <div className="space-y-2">
              {recentCompleted.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg p-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{t.title}</p>
                    <p className="text-xs text-slate-400">{projectMap.get(t.projectId)?.name}</p>
                  </div>
                  <span className="text-xs text-slate-400">{relativeTime(t.updatedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team member progress (admin only) */}
      {isAdmin && (
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Team Member Progress</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.filter((u) => u.role === 'USER' && u.active).map((u) => {
              const uTasks = tasks.filter((t) => t.assignedTo === u.id);
              const completed = uTasks.filter((t) => t.status === 'COMPLETED').length;
              const progress = uTasks.length > 0 ? Math.round((completed / uTasks.length) * 100) : 0;
              return (
                <div key={u.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <Avatar name={u.name} color={u.avatarColor} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{u.name}</p>
                    <p className="text-xs text-slate-400">{completed}/{uTasks.length} tasks done</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
