import { useState, useEffect, type FormEvent } from 'react';
import type { Task, TaskStatus, TaskPriority, Project, User } from '@/types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { useToast } from './ui/Toast';
import { useDataStore } from '@/store/dataStore';
import { useAuthStore } from '@/store/authStore';
import { buildTaskAssignedEmail, sendMockEmail } from '@/services/emailService';
import { isAdmin } from '@/utils/permissions';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultProjectId?: string;
  defaultAssigneeId?: string;
}

const statusOptions = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'COMPLETED', label: 'Completed' },
];

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export function TaskModal({ open, onClose, task, defaultProjectId, defaultAssigneeId }: TaskModalProps) {
  const { projects, users, addTask, updateTask, addNotification, addActivity } = useDataStore();
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const admin = isAdmin(user);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('0');
  const [completedHours, setCompletedHours] = useState('0');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setProjectId(task.projectId);
        setAssignedTo(task.assignedTo);
        setStatus(task.status);
        setPriority(task.priority);
        setDueDate(task.dueDate.slice(0, 10));
        setEstimatedHours(String(task.estimatedHours));
        setCompletedHours(String(task.completedHours));
        setTags(task.tags.join(', '));
      } else {
        setTitle('');
        setDescription('');
        setProjectId(defaultProjectId || projects[0]?.id || '');
        setAssignedTo(defaultAssigneeId || '');
        setStatus('TODO');
        setPriority('MEDIUM');
        setDueDate('');
        setEstimatedHours('0');
        setCompletedHours('0');
        setTags('');
      }
      setErrors({});
    }
  }, [open, task, defaultProjectId, defaultAssigneeId, projects]);

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  const activeUsers = users.filter((u) => u.active);
  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...activeUsers.map((u) => ({ value: u.id, label: `${u.name} (${u.department})` })),
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!projectId) errs.projectId = 'Project is required';
    if (!dueDate) errs.dueDate = 'Due date is required';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
    const estHours = Number(estimatedHours) || 0;
    const compHours = Number(completedHours) || 0;

    if (task) {
      const wasAssignedTo = task.assignedTo;
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        projectId,
        assignedTo,
        status,
        priority,
        dueDate: new Date(dueDate).toISOString(),
        estimatedHours: estHours,
        completedHours: compHours,
        tags: tagArray,
      });

      // Notify if assignment changed
      if (assignedTo && assignedTo !== wasAssignedTo) {
        const project = projects.find((p) => p.id === projectId);
        const assignee = users.find((u) => u.id === assignedTo);
        if (project && assignee) {
          addNotification({
            userId: assignedTo,
            type: 'TASK_ASSIGNED',
            title: 'New Task Assigned',
            message: `You have been assigned: ${title.trim()}`,
            link: '/tasks',
          });
          const email = buildTaskAssignedEmail(assignee, { ...task, title: title.trim() }, project);
          sendMockEmail(email);
          toast.success(`Task assigned. Notification email queued for ${assignee.name}.`);
        }
      } else {
        toast.success('Task updated successfully');
      }

      addActivity({
        userId: user!.id,
        action: 'updated',
        target: title.trim(),
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        projectId,
        assignedTo,
        status,
        priority,
        dueDate: new Date(dueDate).toISOString(),
        estimatedHours: estHours,
        completedHours: compHours,
        tags: tagArray,
      });

      if (assignedTo) {
        const project = projects.find((p) => p.id === projectId);
        const assignee = users.find((u) => u.id === assignedTo);
        if (project && assignee) {
          addNotification({
            userId: assignedTo,
            type: 'TASK_ASSIGNED',
            title: 'New Task Assigned',
            message: `You have been assigned: ${title.trim()}`,
            link: '/tasks',
          });
          const email = buildTaskAssignedEmail(assignee, {
            id: '', title: title.trim(), description: description.trim(), projectId,
            assignedTo, status, priority, dueDate: new Date(dueDate).toISOString(),
            estimatedHours: estHours, completedHours: compHours, createdAt: '', updatedAt: '', tags: tagArray,
          } as Task, project);
          sendMockEmail(email);
          toast.success(`Task created. Notification email queued for ${assignee.name}.`);
        } else {
          toast.success('Task created successfully');
        }
      } else {
        toast.success('Task created successfully');
      }

      addActivity({
        userId: user!.id,
        action: 'created',
        target: title.trim(),
      });
    }

    onClose();
  };

  // User view: limited fields
  if (!admin && task) {
    return (
      <Modal open={open} onClose={onClose} title={task.title} size="md">
        <div className="space-y-4">
          <div>
            <p className="label">Description</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{task.description || 'No description provided.'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="label">Project</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {projects.find((p) => p.id === task.projectId)?.name || '—'}
              </p>
            </div>
            <div>
              <p className="label">Priority</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{task.priority}</p>
            </div>
            <div>
              <p className="label">Deadline</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="label">Estimated Hours</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{task.estimatedHours}h</p>
            </div>
          </div>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={statusOptions}
          />
          <Input
            label="Completed Hours"
            type="number"
            min="0"
            max={task.estimatedHours}
            value={completedHours}
            onChange={(e) => setCompletedHours(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => {
                updateTask(task.id, {
                  status,
                  completedHours: Number(completedHours) || 0,
                });
                if (status !== task.status) {
                  addActivity({
                    userId: user!.id,
                    action: `moved to ${status.replace('_', ' ')}`,
                    target: task.title,
                  });
                }
                toast.success('Progress updated successfully');
                onClose();
              }}
            >
              Update Progress
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create Task'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{task ? 'Save Changes' : 'Create Task'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="Enter task title"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Enter task description"
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={projectOptions}
            error={errors.projectId}
          />
          <Select
            label="Assignee"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            options={userOptions}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={statusOptions}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={priorityOptions}
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            error={errors.dueDate}
          />
          <Input
            label="Estimated Hours"
            type="number"
            min="0"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
          />
          <Input
            label="Completed Hours"
            type="number"
            min="0"
            value={completedHours}
            onChange={(e) => setCompletedHours(e.target.value)}
          />
          <Input
            label="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="frontend, backend"
          />
        </div>
      </form>
    </Modal>
  );
}
