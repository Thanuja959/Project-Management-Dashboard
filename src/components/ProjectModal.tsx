import { useState, useEffect, type FormEvent } from 'react';
import type { Project, ProjectStatus } from '@/types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Avatar } from './ui/Avatar';
import { useToast } from './ui/Toast';
import { useDataStore } from '@/store/dataStore';
import { useAuthStore } from '@/store/authStore';
import { buildProjectAssignedEmail, sendMockEmail } from '@/services/emailService';

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
}

const statusOptions = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function ProjectModal({ open, onClose, project }: ProjectModalProps) {
  const { users, addProject, updateProject, addNotification, addActivity } = useDataStore();
  const user = useAuthStore((s) => s.user);
  const toast = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (project) {
        setName(project.name);
        setDescription(project.description);
        setStartDate(project.startDate.slice(0, 10));
        setDeadline(project.deadline.slice(0, 10));
        setStatus(project.status);
        setMemberIds(project.memberIds);
      } else {
        setName('');
        setDescription('');
        setStartDate(new Date().toISOString().slice(0, 10));
        setDeadline('');
        setStatus('PLANNING');
        setMemberIds([]);
      }
      setErrors({});
    }
  }, [open, project]);

  const activeUsers = users.filter((u) => u.active);

  const toggleMember = (id: string) => {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!deadline) errs.deadline = 'Deadline is required';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const startIso = startDate ? new Date(startDate).toISOString() : new Date().toISOString();
    const deadlineIso = new Date(deadline).toISOString();

    if (project) {
      const oldMembers = project.memberIds;
      updateProject(project.id, {
        name: name.trim(),
        description: description.trim(),
        startDate: startIso,
        deadline: deadlineIso,
        status,
        memberIds,
      });

      // Notify newly assigned members
      const newMembers = memberIds.filter((m) => !oldMembers.includes(m));
      newMembers.forEach((memberId) => {
        const member = users.find((u) => u.id === memberId);
        if (member) {
          addNotification({
            userId: memberId,
            type: 'PROJECT_ASSIGNED',
            title: 'New Project Assigned',
            message: `You have been added to the ${name.trim()} project.`,
            link: `/projects/${project.id}`,
          });
          const email = buildProjectAssignedEmail(member, { ...project, name: name.trim(), deadline: deadlineIso });
          sendMockEmail(email);
        }
      });

      if (newMembers.length > 0) {
        const names = newMembers.map((m) => users.find((u) => u.id === m)?.name).filter(Boolean).join(', ');
        toast.success(`Project updated. Notification email queued for ${names}.`);
      } else {
        toast.success('Project updated successfully');
      }

      addActivity({ userId: user!.id, action: 'updated', target: name.trim() });
    } else {
      const id = addProject({
        name: name.trim(),
        description: description.trim(),
        startDate: startIso,
        deadline: deadlineIso,
        status,
        memberIds,
      });

      memberIds.forEach((memberId) => {
        const member = users.find((u) => u.id === memberId);
        if (member) {
          addNotification({
            userId: memberId,
            type: 'PROJECT_ASSIGNED',
            title: 'New Project Assigned',
            message: `You have been added to the ${name.trim()} project.`,
            link: `/projects/${id}`,
          });
          const email = buildProjectAssignedEmail(member, {
            id, name: name.trim(), description: description.trim(), startDate: startIso,
            deadline: deadlineIso, status, memberIds, createdAt: '',
          });
          sendMockEmail(email);
        }
      });

      if (memberIds.length > 0) {
        const names = memberIds.map((m) => users.find((u) => u.id === m)?.name).filter(Boolean).join(', ');
        toast.success(`Project created. Notification email queued for ${names}.`);
      } else {
        toast.success('Project created successfully');
      }

      addActivity({ userId: user!.id, action: 'created project', target: name.trim() });
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? 'Edit Project' : 'Create Project'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{project ? 'Save Changes' : 'Create Project'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="Enter project name"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Enter project description"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            error={errors.deadline}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            options={statusOptions}
          />
        </div>
        <div>
          <p className="label">Team Members</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {activeUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleMember(u.id)}
                className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-colors ${
                  memberIds.includes(u.id)
                    ? 'border-slate-800 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'
                }`}
              >
                <Avatar name={u.name} color={u.avatarColor} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">{u.name}</p>
                  <p className="truncate text-[10px] text-slate-400">{u.department}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
