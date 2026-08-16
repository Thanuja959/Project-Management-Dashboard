export type UserRole = 'ADMIN' | 'USER';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  avatarColor: string;
  active: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  memberIds: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  estimatedHours: number;
  completedHours: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export type NotificationType =
  | 'PROJECT_ASSIGNED'
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'TASK_STATUS_CHANGED'
  | 'DEADLINE_APPROACHING'
  | 'PROJECT_PROGRESS';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  target: string;
  createdAt: string;
}

export interface EmailRecord {
  id: string;
  to: string;
  toName: string;
  subject: string;
  body: string;
  createdAt: string;
}
