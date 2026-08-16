import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { useToast } from '@/components/ui/Toast';
import { TaskCard } from '@/components/TaskCard';
import { TaskModal } from '@/components/TaskModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
  Pencil,
  Filter,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { isAdmin, canMoveTask } from '@/utils/permissions';
import {
  taskStatusColors,
  priorityColors,
  priorityDot,
  priorityRank,
  formatDateShort,
  isOverdue,
} from '@/utils/helpers';
import type { Task, TaskStatus, TaskPriority } from '@/types';

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'REVIEW', label: 'Review' },
  { id: 'COMPLETED', label: 'Completed' },
];

type SortKey = 'dueDate' | 'priority' | 'status' | 'createdAt' | 'completedHours';
type SortDir = 'asc' | 'desc';

export function TasksPage() {
  const { user } = useAuthStore();
  const { tasks, projects, users, moveTask, deleteTask } = useDataStore();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const admin = isAdmin(user);

  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    if (searchParams.get('action') === 'new' && admin) {
      setEditTask(null);
      setTaskModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams, admin]);

  const visibleTasks = useMemo(() => {
    let result = admin ? tasks : tasks.filter((t) => t.assignedTo === user?.id);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          projects.find((p) => p.id === t.projectId)?.name.toLowerCase().includes(q) ||
          users.find((u) => u.id === t.assignedTo)?.name.toLowerCase().includes(q)
      );
    }
    if (filterStatus) result = result.filter((t) => t.status === filterStatus);
    if (filterPriority) result = result.filter((t) => t.priority === filterPriority);
    if (filterProject) result = result.filter((t) => t.projectId === filterProject);
    if (filterAssignee) result = result.filter((t) => t.assignedTo === filterAssignee);
    if (filterOverdue) result = result.filter((t) => isOverdue(t.dueDate, t.status));
    return result;
  }, [tasks, admin, user, search, filterStatus, filterPriority, filterProject, filterAssignee, filterOverdue, projects, users]);

  const sortedTasks = useMemo(() => {
    const arr = [...visibleTasks];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'dueDate':
          cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority':
          cmp = priorityRank[a.priority] - priorityRank[b.priority];
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'completedHours':
          cmp = a.completedHours - b.completedHours;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [visibleTasks, sortKey, sortDir]);

  const activeFilters = [filterStatus, filterPriority, filterProject, filterAssignee].filter(Boolean).length + (filterOverdue ? 1 : 0);

  const clearFilters = () => {
    setFilterStatus('');
    setFilterPriority('');
    setFilterProject('');
    setFilterAssignee('');
    setFilterOverdue(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;
    if (!canMoveTask(user, task)) {
      toast.error("You can only move tasks assigned to you.");
      return;
    }
    moveTask(taskId, newStatus, user!.id, user!.name);
    toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
  };

  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];
  const assigneeOptions = [
    { value: '', label: 'All Assignees' },
    ...users.filter((u) => u.active).map((u) => ({ value: u.id, label: u.name })),
  ];
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'REVIEW', label: 'Review' },
    { value: 'COMPLETED', label: 'Completed' },
  ];
  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];
  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'completedHours', label: 'Completed Hours' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{admin ? 'Tasks' : 'My Tasks'}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{admin ? 'Manage all tasks across projects.' : 'Track and update your assigned tasks.'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
            <button
              onClick={() => setView('kanban')}
              className={`rounded-md p-1.5 transition-colors ${view === 'kanban' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              aria-label="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`rounded-md p-1.5 transition-colors ${view === 'list' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          {admin && (
            <Button size="sm" onClick={() => { setEditTask(null); setTaskModalOpen(true); }}>
              <Plus className="h-4 w-4" /> New Task
            </Button>
          )}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by task, project, assignee, or tag..."
              className="pl-9"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowFilters((s) => !s)}>
            <Filter className="h-4 w-4" />
            Filters
            {activeFilters > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs text-white dark:bg-slate-200 dark:text-slate-900">
                {activeFilters}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={statusOptions} />
            <Select label="Priority" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} options={priorityOptions} />
            <Select label="Project" value={filterProject} onChange={(e) => setFilterProject(e.target.value)} options={projectOptions} />
            {admin && <Select label="Assignee" value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} options={assigneeOptions} />}
            <div>
              <label className="label">Overdue</label>
              <button
                onClick={() => setFilterOverdue((o) => !o)}
                className={`flex w-full items-center justify-center rounded-lg border px-3 py-2 text-sm transition-colors ${
                  filterOverdue
                    ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-400'
                    : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                {filterOverdue ? 'Overdue Only' : 'Show All'}
              </button>
            </div>
          </div>
        )}

        {activeFilters > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {filterStatus && <FilterChip label={statusOptions.find((o) => o.value === filterStatus)?.label || ''} onClear={() => setFilterStatus('')} />}
            {filterPriority && <FilterChip label={priorityOptions.find((o) => o.value === filterPriority)?.label || ''} onClear={() => setFilterPriority('')} />}
            {filterProject && <FilterChip label={projectMap.get(filterProject)?.name || ''} onClear={() => setFilterProject('')} />}
            {filterAssignee && <FilterChip label={userMap.get(filterAssignee)?.name || ''} onClear={() => setFilterAssignee('')} />}
            {filterOverdue && <FilterChip label="Overdue" onClear={() => setFilterOverdue(false)} />}
            <button onClick={clearFilters} className="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
              Clear All
            </button>
          </div>
        )}
      </div>

      {visibleTasks.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<List className="h-6 w-6" />}
            title={search || activeFilters > 0 ? "No tasks match your filters" : "No tasks found"}
            description={search || activeFilters > 0 ? "Try adjusting your search or filters." : admin ? "Create your first task to get started." : "You have no assigned tasks yet."}
            action={admin && !search && activeFilters === 0 && <Button onClick={() => { setEditTask(null); setTaskModalOpen(true); }}><Plus className="h-4 w-4" />New Task</Button>}
          />
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard
          tasks={visibleTasks}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          onTaskClick={(t) => { setEditTask(t); setTaskModalOpen(true); }}
          user={user}
          userMap={userMap}
          projectMap={projectMap}
        />
      ) : (
        <TaskListView
          tasks={sortedTasks}
          onTaskClick={(t) => { setEditTask(t); setTaskModalOpen(true); }}
          admin={admin}
          onDelete={(t) => setDeleteTarget(t)}
          sortKey={sortKey}
          sortDir={sortDir}
          setSortKey={setSortKey}
          setSortDir={setSortDir}
          sortOptions={sortOptions}
          userMap={userMap}
          projectMap={projectMap}
        />
      )}

      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} task={editTask} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteTask(deleteTarget.id);
            toast.success('Task deleted');
          }
          setDeleteTarget(null);
        }}
        title="Delete Task"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      {label}
      <button onClick={onClear} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function KanbanBoard({
  tasks,
  onDragEnd,
  sensors,
  onTaskClick,
  user,
  userMap,
  projectMap,
}: {
  tasks: Task[];
  onDragEnd: (e: DragEndEvent) => void;
  sensors: ReturnType<typeof useSensors>;
  onTaskClick: (t: Task) => void;
  user: ReturnType<typeof useAuthStore.getState>['user'];
  userMap: Map<string, { id: string; name: string; avatarColor: string }>;
  projectMap: Map<string, { id: string; name: string }>;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={(e) => { onDragEnd(e); setActiveId(null); }}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={colTasks}
              onTaskClick={onTaskClick}
              user={user}
              userMap={userMap}
              projectMap={projectMap}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="w-72 opacity-80">
            <TaskCard
              task={activeTask}
              assignee={userMap.get(activeTask.assignedTo) as never}
              project={projectMap.get(activeTask.projectId) as never}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  column,
  tasks,
  onTaskClick,
  user,
  userMap,
  projectMap,
}: {
  column: { id: TaskStatus; label: string };
  tasks: Task[];
  onTaskClick: (t: Task) => void;
  user: ReturnType<typeof useAuthStore.getState>['user'];
  userMap: Map<string, { id: string; name: string; avatarColor: string }>;
  projectMap: Map<string, { id: string; name: string }>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${column.id === 'TODO' ? 'bg-slate-400' : column.id === 'IN_PROGRESS' ? 'bg-blue-500' : column.id === 'REVIEW' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{column.label}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">{tasks.length}</span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 rounded-xl border p-2 transition-colors ${
          isOver
            ? 'border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800/50'
            : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50'
        }`}
        style={{ minHeight: '200px' }}
      >
        {tasks.map((t) => {
          const canDrag = canMoveTask(user, t);
          return (
            <DraggableTask
              key={t.id}
              task={t}
              canDrag={canDrag}
              onClick={() => onTaskClick(t)}
              assignee={userMap.get(t.assignedTo)}
              project={projectMap.get(t.projectId)}
            />
          );
        })}
        {tasks.length === 0 && (
          <div className="flex h-32 items-center justify-center text-xs text-slate-300 dark:text-slate-600">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableTask({
  task,
  canDrag,
  onClick,
  assignee,
  project,
}: {
  task: Task;
  canDrag: boolean;
  onClick: () => void;
  assignee?: { id: string; name: string; avatarColor: string };
  project?: { id: string; name: string };
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.4 : 1 }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...(canDrag ? listeners : {})} {...attributes}>
      <TaskCard
        task={task}
        assignee={assignee as never}
        project={project as never}
        onClick={canDrag ? undefined : onClick}
        draggable={canDrag}
      />
      {canDrag && (
        <div onClick={onClick} className="cursor-pointer -mt-1 text-center text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          Click to view details
        </div>
      )}
    </div>
  );
}

function TaskListView({
  tasks,
  onTaskClick,
  admin,
  onDelete,
  sortKey,
  sortDir,
  setSortKey,
  setSortDir,
  sortOptions,
  userMap,
  projectMap,
}: {
  tasks: Task[];
  onTaskClick: (t: Task) => void;
  admin: boolean;
  onDelete: (t: Task) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  setSortKey: (k: SortKey) => void;
  setSortDir: (d: SortDir) => void;
  sortOptions: { value: string; label: string }[];
  userMap: Map<string, { id: string; name: string; avatarColor: string }>;
  projectMap: Map<string, { id: string; name: string }>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          options={sortOptions}
          className="max-w-[160px]"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortDir === 'asc' ? 'Ascending' : 'Descending'}
        </Button>
      </div>

      {/* Desktop table */}
      <div className="card hidden overflow-hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Task</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Project</th>
              {admin && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assignee</th>}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Hours</th>
              {admin && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((t) => {
              const overdue = isOverdue(t.dueDate, t.status);
              return (
                <tr key={t.id} className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30" onClick={() => onTaskClick(t)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${priorityDot[t.priority]}`} />
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{t.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{projectMap.get(t.projectId)?.name || '—'}</td>
                  {admin && (
                    <td className="px-4 py-3">
                      {userMap.get(t.assignedTo) && (
                        <div className="flex items-center gap-2">
                          <Avatar name={userMap.get(t.assignedTo)!.name} color={userMap.get(t.assignedTo)!.avatarColor} size="sm" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{userMap.get(t.assignedTo)!.name}</span>
                        </div>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <Badge className={priorityColors[t.priority]}>{t.priority}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={taskStatusColors[t.status]}>{t.status.replace('_', ' ')}</Badge>
                  </td>
                  <td className={`px-4 py-3 text-sm ${overdue ? 'font-medium text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {formatDateShort(t.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {t.completedHours}/{t.estimatedHours}h
                  </td>
                  {admin && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => onTaskClick(t)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDelete(t)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {tasks.map((t) => {
          const overdue = isOverdue(t.dueDate, t.status);
          return (
            <div key={t.id} className="card p-4" onClick={() => onTaskClick(t)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${priorityDot[t.priority]}`} />
                  <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">{t.title}</h4>
                </div>
                <Badge className={taskStatusColors[t.status]}>{t.status.replace('_', ' ')}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-400">{projectMap.get(t.projectId)?.name}</p>
              <div className="mt-3 flex items-center justify-between">
                <Badge className={priorityColors[t.priority]}>{t.priority}</Badge>
                <span className={`text-xs ${overdue ? 'text-rose-500' : 'text-slate-400'}`}>{formatDateShort(t.dueDate)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">{t.completedHours}/{t.estimatedHours}h</span>
                {admin && userMap.get(t.assignedTo) && (
                  <div className="flex items-center gap-1.5">
                    <Avatar name={userMap.get(t.assignedTo)!.name} color={userMap.get(t.assignedTo)!.avatarColor} size="sm" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{userMap.get(t.assignedTo)!.name.split(' ')[0]}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
