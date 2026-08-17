import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ListTodo,
  Calendar,
  BarChart3,
  Bell,
  Settings,
  CheckSquare,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

const adminNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/users', label: 'Users', icon: <Users className="h-5 w-5" />, adminOnly: true },
  { to: '/projects', label: 'Projects', icon: <FolderKanban className="h-5 w-5" /> },
  { to: '/tasks', label: 'Tasks', icon: <ListTodo className="h-5 w-5" /> },
  { to: '/calendar', label: 'Calendar', icon: <Calendar className="h-5 w-5" /> },
  { to: '/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" />, adminOnly: true },
  { to: '/notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
  { to: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

const userNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/projects', label: 'My Projects', icon: <FolderKanban className="h-5 w-5" /> },
  { to: '/tasks', label: 'My Tasks', icon: <ListTodo className="h-5 w-5" /> },
  { to: '/calendar', label: 'Calendar', icon: <Calendar className="h-5 w-5" /> },
  { to: '/notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
  { to: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const items = user?.role === 'ADMIN' ? adminNav : userNav;

  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
          <img src="/images/logo.png" alt="FlowBoard Logo" className="h-8 w-9" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">FlowBoard</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-5 py-4 dark:border-slate-800">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {user?.role === 'ADMIN' ? 'Admin Workspace' : 'Team Workspace'}
        </p>
        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">v1.0.0</p>
      </div>
    </aside>
  );
}
