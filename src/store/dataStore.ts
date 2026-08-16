import { create } from 'zustand';
import type { User, Project, Task, AppNotification, Activity, EmailRecord, TaskStatus } from '@/types';
import { loadState, saveState } from '@/utils/storage';
import { uid } from '@/utils/helpers';
import {
  mockUsers,
  mockProjects,
  mockTasks,
  mockNotifications,
  mockActivities,
} from '@/data/mockData';

interface DataState {
  users: User[];
  projects: Project[];
  tasks: Task[];
  notifications: AppNotification[];
  activities: Activity[];
  emails: EmailRecord[];
  initialized: boolean;

  init: () => void;

  // Users
  addUser: (u: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Projects
  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Tasks
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus, actorId: string, actorName: string) => void;

  // Notifications
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: (userId: string) => void;

  // Activities
  addActivity: (a: Omit<Activity, 'id' | 'createdAt'>) => void;

  // Emails
  addEmail: (e: Omit<EmailRecord, 'id' | 'createdAt'>) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  users: mockUsers,
  projects: mockProjects,
  tasks: mockTasks,
  notifications: mockNotifications,
  activities: mockActivities,
  emails: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const users = loadState<User[]>('users', mockUsers);
    const projects = loadState<Project[]>('projects', mockProjects);
    const tasks = loadState<Task[]>('tasks', mockTasks);
    const notifications = loadState<AppNotification[]>('notifications', mockNotifications);
    const activities = loadState<Activity[]>('activities', mockActivities);
    const emails = loadState<EmailRecord[]>('emails', []);
    saveState('users', users);
    saveState('projects', projects);
    saveState('tasks', tasks);
    saveState('notifications', notifications);
    saveState('activities', activities);
    saveState('emails', emails);
    set({ users, projects, tasks, notifications, activities, emails, initialized: true });
  },

  addUser: (u) => {
    const user: User = { ...u, id: uid('u'), createdAt: new Date().toISOString() };
    set((s) => {
      const users = [...s.users, user];
      saveState('users', users);
      return { users };
    });
  },

  updateUser: (id, patch) => {
    set((s) => {
      const users = s.users.map((u) => (u.id === id ? { ...u, ...patch } : u));
      saveState('users', users);
      return { users };
    });
  },

  deleteUser: (id) => {
    set((s) => {
      const users = s.users.filter((u) => u.id !== id);
      saveState('users', users);
      return { users };
    });
  },

  addProject: (p) => {
    const id = uid('p');
    const project: Project = { ...p, id, createdAt: new Date().toISOString() };
    set((s) => {
      const projects = [...s.projects, project];
      saveState('projects', projects);
      return { projects };
    });
    return id;
  },

  updateProject: (id, patch) => {
    set((s) => {
      const projects = s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p));
      saveState('projects', projects);
      return { projects };
    });
  },

  deleteProject: (id) => {
    set((s) => {
      const projects = s.projects.filter((p) => p.id !== id);
      const tasks = s.tasks.filter((t) => t.projectId !== id);
      saveState('projects', projects);
      saveState('tasks', tasks);
      return { projects, tasks };
    });
  },

  addTask: (t) => {
    const task: Task = {
      ...t,
      id: uid('t'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => {
      const tasks = [...s.tasks, task];
      saveState('tasks', tasks);
      return { tasks };
    });
  },

  updateTask: (id, patch) => {
    set((s) => {
      const tasks = s.tasks.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
      );
      saveState('tasks', tasks);
      return { tasks };
    });
  },

  deleteTask: (id) => {
    set((s) => {
      const tasks = s.tasks.filter((t) => t.id !== id);
      saveState('tasks', tasks);
      return { tasks };
    });
  },

  moveTask: (id, status, actorId, actorName) => {
    set((s) => {
      const task = s.tasks.find((t) => t.id === id);
      if (!task) return s;
      const tasks = s.tasks.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      );
      saveState('tasks', tasks);

      // Create notification for assignee if someone else moved it
      let notifications = s.notifications;
      if (task.assignedTo !== actorId) {
        const notif: AppNotification = {
          id: uid('n'),
          userId: task.assignedTo,
          type: 'TASK_STATUS_CHANGED',
          title: 'Task Status Updated',
          message: `${actorName} moved your task "${task.title}" to ${status.replace('_', ' ')}.`,
          read: false,
          createdAt: new Date().toISOString(),
          link: '/tasks',
        };
        notifications = [notif, ...notifications];
        saveState('notifications', notifications);
      }

      // Create activity
      const activity: Activity = {
        id: uid('a'),
        userId: actorId,
        action: `moved to ${status.replace('_', ' ')}`,
        target: task.title,
        createdAt: new Date().toISOString(),
      };
      const activities = [activity, ...s.activities];
      saveState('activities', activities);

      return { tasks, notifications, activities };
    });
  },

  addNotification: (n) => {
    const notif: AppNotification = {
      ...n,
      id: uid('n'),
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((s) => {
      const notifications = [notif, ...s.notifications];
      saveState('notifications', notifications);
      return { notifications };
    });
  },

  markNotificationRead: (id) => {
    set((s) => {
      const notifications = s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveState('notifications', notifications);
      return { notifications };
    });
  },

  markAllRead: (userId) => {
    set((s) => {
      const notifications = s.notifications.map((n) =>
        n.userId === userId ? { ...n, read: true } : n
      );
      saveState('notifications', notifications);
      return { notifications };
    });
  },

  addActivity: (a) => {
    const activity: Activity = {
      ...a,
      id: uid('a'),
      createdAt: new Date().toISOString(),
    };
    set((s) => {
      const activities = [activity, ...s.activities];
      saveState('activities', activities);
      return { activities };
    });
  },

  addEmail: (e) => {
    const email: EmailRecord = {
      ...e,
      id: uid('email'),
      createdAt: new Date().toISOString(),
    };
    set((s) => {
      const emails = [email, ...s.emails];
      saveState('emails', emails);
      return { emails };
    });
  },
}));
