import type { User, Project, Task } from '@/types';
import { formatDate } from '@/utils/helpers';
import { useDataStore } from '@/store/dataStore';
import emailjs from '@emailjs/browser';


export interface EmailContent {
  to: string;
  toName: string;
  subject: string;
  body: string;
}

export function buildWelcomeEmail(user: Pick<User, 'name' | 'email' | 'password'>): EmailContent {
  return {
    to: user.email,
    toName: user.name,
    subject: 'Welcome to FlowBoard — Your Account Credentials',
    body: `Hello ${user.name},\n\nWelcome to FlowBoard! Your account has been created.\n\nHere are your login credentials:\n\nEmail: ${user.email}\nPassword: ${user.password}\n\nPlease log in to your dashboard to get started. We recommend changing your password after your first login.\n\nRegards,\nFlowBoard Admin`,
  };
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

export async function sendEmail(
  email: EmailContent,
  credentials?: {
    userEmail?: string;
    userPassword?: string;
  }
): Promise<void> {
  try {
    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: email.to,
        to_name: email.toName,
        subject: email.subject,
        message: email.body,
        user_email: credentials?.userEmail ?? email.to,
        user_password: credentials?.userPassword ?? '',
      },
      {
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      }
    );

    console.log('EMAILJS SUCCESS:', response.status, response.text);

  } catch (error) {
    console.error('EMAILJS FULL ERROR:', error);
    throw error;
  }
}
