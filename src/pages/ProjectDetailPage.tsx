import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { useToast } from '@/components/ui/Toast';
import { TaskCard } from '@/components/TaskCard';
import { TaskModal } from '@/components/TaskModal';
import { ProjectModal } from '@/components/ProjectModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ArrowLeft,
  Calendar,
  Users,
  Plus,
  Pencil,
  Trash2,
  ListTodo,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { projectStatusColors, formatDate, isOverdue } from '@/utils/helpers';
import { isAdmin } from '@/utils/permissions';
import type { Task } from '@/types';

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, tasks, users, deleteProject } = useDataStore();
  const toast = useToast();
  const admin = isAdmin(user);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const project = projects.find((p) => p.id === projectId);

  const projectTasks = useMemo(() => {
    if (!project) return [];
    if (admin) return tasks.filter((t) => t.projectId === project.id);
    return tasks.filter((t) => t.projectId === project.id && t.assignedTo === user?.id);
  }, [project, tasks, admin, user]);

  const members = useMemo(() => {
    if (!project) return [];
    return users.filter((u) => project.memberIds.includes(u.id));
  }, [project, users]);

  if (!project) {
    return (
      <div className="card">
        <EmptyState
          title="Project not found"
          description="This project may have been deleted."
          action={<Button onClick={() => navigate('/projects')}>Back to Projects</Button>}
        />
      </div>
    );
  }

  const completed = projectTasks.filter((t) => t.status === 'COMPLETED').length;
  const progress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0;
  const overdueCount = projectTasks.filter((t) => isOverdue(t.dueDate, t.status)).length;

  const handleDelete = () => {
    deleteProject(project.id);
    toast.success(`Project ${project.name} deleted`);
    navigate('/projects');
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </button>

      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h2>
              <Badge className={projectStatusColors[project.status]}>{project.status.replace('_', ' ')}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
          </div>
          {admin && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ListTodo className="h-3.5 w-3.5" /> Total Tasks
            </div>
            <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-200">{projectTasks.length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </div>
            <p className="mt-1 text-xl font-bold text-emerald-500">{completed}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" /> Overdue
            </div>
            <p className="mt-1 text-xl font-bold text-rose-500">{overdueCount}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5" /> Deadline
            </div>
            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{formatDate(project.deadline)}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Progress</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{progress}%</span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-slate-800 transition-all dark:bg-slate-200" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="h-3.5 w-3.5" /> Team Members
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 dark:border-slate-700">
                <Avatar name={m.name} color={m.avatarColor} size="sm" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{m.name}</span>
              </div>
            ))}
            {members.length === 0 && <span className="text-xs text-slate-400">No members assigned</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {admin ? 'Project Tasks' : 'My Tasks'}
        </h3>
        {admin && (
          <Button size="sm" onClick={() => { setEditTask(null); setTaskModalOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        )}
      </div>

      {projectTasks.length === 0 ? (
        <div className="card">
          <EmptyState icon={<ListTodo className="h-6 w-6" />} title="No tasks found" description={admin ? "Create the first task for this project." : "You have no tasks in this project."} />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projectTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              assignee={users.find((u) => u.id === t.assignedTo)}
              onClick={() => { setEditTask(t); setTaskModalOpen(true); }}
            />
          ))}
        </div>
      )}

      <ProjectModal open={editOpen} onClose={() => setEditOpen(false)} project={project} />
      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} task={editTask} defaultProjectId={project.id} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Delete ${project.name}? All tasks in this project will also be removed.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
