import type { Project, Task, User } from '@/types';
import { projectStatusColors, formatDateShort } from '@/utils/helpers';
import { Avatar } from './ui/Avatar';
import { Users, Calendar, CheckCircle2, ListTodo } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  members: User[];
  onClick?: () => void;
}

export function ProjectCard({ project, tasks, members, onClick }: ProjectCardProps) {
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="card group cursor-pointer p-5 transition-all hover:shadow-md dark:hover:border-slate-700"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 dark:text-slate-100 dark:group-hover:text-white">
            {project.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
        </div>
        <span className={`badge shrink-0 ${projectStatusColors[project.status]}`}>{project.status.replace('_', ' ')}</span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Progress</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-slate-800 transition-all dark:bg-slate-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <ListTodo className="h-3.5 w-3.5" />
            {tasks.length}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {completed}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateShort(project.deadline)}
          </span>
        </div>
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((m) => (
            <Avatar key={m.id} name={m.name} color={m.avatarColor} size="sm" className="ring-2 ring-white dark:ring-slate-900" />
          ))}
          {members.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600 ring-2 ring-white dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-900">
              +{members.length - 4}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
