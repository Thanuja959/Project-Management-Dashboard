import type { User, Project, Task } from '@/types';
import { formatDate } from '@/utils/helpers';
import { useDataStore } from '@/store/dataStore';

export interface EmailContent {
  to: string;
  toName: string;
  subject: string;
  body: string;
}

export function buildProjectAssignedEmail(user: User, project: Project): EmailContent {
  return {
    to: user.email,
    toName: user.name,
    subject: `New Project Assigned: ${project.name}`,
    body: `Hello ${user.name},\n\nYou have been assigned to the ${project.name} project.\n\nDeadline: ${formatDate(project.deadline)}.\n\nPlease log in to your dashboard to view your assigned tasks.\n\nRegards,\nProject Admin`,
  };
}

export function buildTaskAssignedEmail(user: User, task: Task, project: Project): EmailContent {
  return {
    to: user.email,
    toName: user.name,
    subject: `New Task Assigned: ${task.title}`,
    body: `Hello ${user.name},\n\nYou have been assigned a new task: ${task.title}\n\nProject: ${project.name}\nDue Date: ${formatDate(task.dueDate)}\nPriority: ${task.priority}\n\nPlease log in to your dashboard to view the task details.\n\nRegards,\nProject Admin`,
  };
}

export function sendMockEmail(email: EmailContent): void {
  const store = useDataStore.getState();
  store.addEmail({
    to: email.to,
    toName: email.toName,
    subject: email.subject,
    body: email.body,
  });
}
