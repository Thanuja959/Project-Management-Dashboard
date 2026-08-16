import type { User, Task, UserRole } from '@/types';

export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN';
}

export function canManageProjects(user: User | null): boolean {
  return isAdmin(user);
}

export function canManageUsers(user: User | null): boolean {
  return isAdmin(user);
}

export function canManageTasks(user: User | null): boolean {
  return isAdmin(user);
}

export function canEditTask(user: User | null, task: Task): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return false; // users can only update status/hours, not edit
}

export function canMoveTask(user: User | null, task: Task): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return task.assignedTo === user.id;
}

export function canAccessRoute(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

export const adminRoutes = ['/users', '/analytics'];
