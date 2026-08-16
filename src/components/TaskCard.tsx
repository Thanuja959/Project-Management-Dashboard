import type { Task, User, Project } from '@/types';
import { priorityDot, priorityColors, formatDateShort, isOverdue } from '@/utils/helpers';
import { Avatar } from './ui/Avatar';
import { Calendar, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  assignee?: User;
  project?: Project;
  onClick?: () => void;
  draggable?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export function TaskCard({ task, assignee, project, onClick, draggable, dragHandleProps }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate, task.status);
  const progress = task.estimatedHours > 0 ? Math.min(100, (task.completedHours / task.estimatedHours) * 100) : 0;

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      {...dragHandleProps}
      className={`group cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800 ${
        overdue ? 'ring-1 ring-rose-200 dark:ring-rose-500/30' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${priorityDot[task.priority]}`} />
          <h4 className="text-sm font-medium text-slate-800 dark:text-slate-100">{task.title}</h4>
        </div>
      </div>

      {project && (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{project.name}</p>
      )}

      {task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {task.estimatedHours > 0 && (
        <div className="mt-2.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-slate-400 dark:bg-slate-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
            <Clock className="h-3 w-3" />
            {task.completedHours}/{task.estimatedHours}h
          </div>
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
          <Calendar className="h-3 w-3" />
          {formatDateShort(task.dueDate)}
        </div>
        {assignee && <Avatar name={assignee.name} color={assignee.avatarColor} size="sm" />}
      </div>
    </div>
  );
}
