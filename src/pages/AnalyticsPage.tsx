import { useMemo } from 'react';
import { useDataStore } from '@/store/dataStore';
import { StatCard } from '@/components/StatCard';
import { Avatar } from '@/components/ui/Avatar';
import {
  Users,
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { isOverdue, priorityRank } from '@/utils/helpers';
import type { TaskStatus, TaskPriority } from '@/types';

const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  REVIEW: '#a855f7',
  COMPLETED: '#10b981',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: '#94a3b8',
  MEDIUM: '#0ea5e9',
  HIGH: '#f97316',
  URGENT: '#f43f5e',
};

export function AnalyticsPage() {
  const { users, projects, tasks } = useDataStore();

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
    const activeUsers = users.filter((u) => u.active).length;
    return {
      users: activeUsers,
      projects: projects.length,
      totalTasks: tasks.length,
      completed,
      pending: tasks.length - completed,
      overdue,
    };
  }, [users, projects, tasks]);

  const statusData = useMemo(() => {
    return (['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'] as TaskStatus[]).map((s) => ({
      name: s.replace('_', ' '),
      value: tasks.filter((t) => t.status === s).length,
      fill: STATUS_COLORS[s],
    }));
  }, [tasks]);

  const priorityData = useMemo(() => {
    return (['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map((p) => ({
      name: p,
      value: tasks.filter((t) => t.priority === p).length,
      fill: PRIORITY_COLORS[p],
    }));
  }, [tasks]);

  const projectProgressData = useMemo(() => {
    return projects.map((p) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id);
      const completed = pTasks.filter((t) => t.status === 'COMPLETED').length;
      const progress = pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0;
      return { name: p.name.length > 12 ? p.name.slice(0, 12) + '...' : p.name, progress, total: pTasks.length, completed };
    });
  }, [projects, tasks]);

  const teamProductivityData = useMemo(() => {
    return users
      .filter((u) => u.role === 'USER')
      .map((u) => {
        const uTasks = tasks.filter((t) => t.assignedTo === u.id);
        const completed = uTasks.filter((t) => t.status === 'COMPLETED').length;
        const inProgress = uTasks.filter((t) => t.status === 'IN_PROGRESS').length;
        const completionRate = uTasks.length > 0 ? Math.round((completed / uTasks.length) * 100) : 0;
        return { name: u.name.split(' ')[0], completed, inProgress, total: uTasks.length, completionRate };
      });
  }, [users, tasks]);

  const completionTrend = useMemo(() => {
    const weeks: { week: string; completed: number; created: number }[] = [];
    for (let i = 9; i >= 0; i--) {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      const completed = tasks.filter((t) => {
        const d = new Date(t.updatedAt);
        return t.status === 'COMPLETED' && d >= start && d < end;
      }).length;
      const created = tasks.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= start && d < end;
      }).length;
      weeks.push({ week: `${start.getMonth() + 1}/${start.getDate()}`, completed, created });
    }
    return weeks;
  }, [tasks]);

  const avgCompletion = useMemo(() => {
    if (teamProductivityData.length === 0) return 0;
    return Math.round(teamProductivityData.reduce((sum, d) => sum + d.completionRate, 0) / teamProductivityData.length);
  }, [teamProductivityData]);

  const tooltipStyle = {
    backgroundColor: 'rgba(15,23,42,0.9)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '12px',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Team performance and project insights.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Active Users" value={stats.users} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Projects" value={stats.projects} icon={<FolderKanban className="h-5 w-5" />} />
        <StatCard label="Total Tasks" value={stats.totalTasks} icon={<ListTodo className="h-5 w-5" />} />
        <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5" />} accent="text-emerald-500" />
        <StatCard label="Pending" value={stats.pending} icon={<Clock className="h-5 w-5" />} accent="text-sky-500" />
        <StatCard label="Overdue" value={stats.overdue} icon={<AlertTriangle className="h-5 w-5" />} accent="text-rose-500" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Completion Trend (10 weeks)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={completionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="created" name="Created" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(e) => `${e.name}: ${e.value}`}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Project Progress</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={projectProgressData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" width={90} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="progress" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Avg Completion Rate</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart innerRadius="40%" outerRadius="90%" data={[{ name: 'rate', value: avgCompletion, fill: '#10b981' }]} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#e2e8f0' }} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-800 dark:fill-slate-200" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                {avgCompletion}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Team Productivity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={teamProductivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="total" name="Total" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="inProgress" name="In Progress" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team breakdown */}
      <div className="card p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Team Member Breakdown</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.filter((u) => u.role === 'USER').map((u) => {
            const uTasks = tasks.filter((t) => t.assignedTo === u.id);
            const completed = uTasks.filter((t) => t.status === 'COMPLETED').length;
            const overdue = uTasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
            const progress = uTasks.length > 0 ? Math.round((completed / uTasks.length) * 100) : 0;
            return (
              <div key={u.id} className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} color={u.avatarColor} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.department}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded bg-slate-50 p-2 dark:bg-slate-800/50">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{uTasks.length}</p>
                    <p className="text-[10px] text-slate-400">Total</p>
                  </div>
                  <div className="rounded bg-slate-50 p-2 dark:bg-slate-800/50">
                    <p className="text-sm font-bold text-emerald-500">{completed}</p>
                    <p className="text-[10px] text-slate-400">Done</p>
                  </div>
                  <div className="rounded bg-slate-50 p-2 dark:bg-slate-800/50">
                    <p className="text-sm font-bold text-rose-500">{overdue}</p>
                    <p className="text-[10px] text-slate-400">Overdue</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
