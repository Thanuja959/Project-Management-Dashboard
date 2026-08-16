import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Modal } from './ui/Modal';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Calendar,
  BarChart3,
  Users,
  Sun,
  Moon,
  Bell,
  LogOut,
  Search,
  Plus,
  CornerDownLeft,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface Command {
  id: string;
  label: string;
  icon: ReactNode;
  action: () => void;
  adminOnly?: boolean;
  shortcut?: string;
}

export function CommandPalette() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { commandPaletteOpen, setCommandPaletteOpen, theme, toggleTheme } = useUIStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const isAdmin = user?.role === 'ADMIN';

  const commands: Command[] = useMemo(() => {
    const close = () => setCommandPaletteOpen(false);
    return [
      { id: 'go-dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, action: () => { close(); navigate('/dashboard'); } },
      { id: 'go-projects', label: 'Go to Projects', icon: <FolderKanban className="h-4 w-4" />, action: () => { close(); navigate('/projects'); } },
      { id: 'go-tasks', label: 'Go to Tasks', icon: <ListTodo className="h-4 w-4" />, action: () => { close(); navigate('/tasks'); } },
      { id: 'go-calendar', label: 'Go to Calendar', icon: <Calendar className="h-4 w-4" />, action: () => { close(); navigate('/calendar'); } },
      { id: 'go-analytics', label: 'Go to Analytics', icon: <BarChart3 className="h-4 w-4" />, adminOnly: true, action: () => { close(); navigate('/analytics'); } },
      { id: 'go-users', label: 'Go to Users', icon: <Users className="h-4 w-4" />, adminOnly: true, action: () => { close(); navigate('/users'); } },
      { id: 'go-notifications', label: 'Open Notifications', icon: <Bell className="h-4 w-4" />, action: () => { close(); navigate('/notifications'); } },
      { id: 'create-task', label: 'Create Task', icon: <Plus className="h-4 w-4" />, adminOnly: true, action: () => { close(); navigate('/tasks?action=new'); } },
      { id: 'create-project', label: 'Create Project', icon: <Plus className="h-4 w-4" />, adminOnly: true, action: () => { close(); navigate('/projects?action=new'); } },
      { id: 'add-user', label: 'Add User', icon: <Users className="h-4 w-4" />, adminOnly: true, action: () => { close(); navigate('/users?action=new'); } },
      { id: 'search-tasks', label: 'Search Tasks', icon: <Search className="h-4 w-4" />, action: () => { close(); navigate('/tasks'); } },
      { id: 'toggle-theme', label: `Toggle ${theme === 'light' ? 'Dark' : 'Light'} Mode`, icon: theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />, action: () => { close(); toggleTheme(); } },
      { id: 'logout', label: 'Logout', icon: <LogOut className="h-4 w-4" />, action: () => { close(); logout(); navigate('/login'); } },
    ].filter((c) => !c.adminOnly || isAdmin);
  }, [navigate, isAdmin, logout, setCommandPaletteOpen, theme, toggleTheme]);

  const filtered = useMemo(() => {
    if (!query) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));
  }, [query, commands]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('');
      setSelected(0);
    }
  }, [commandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[selected]?.action();
    }
  };

  return (
    <Modal open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} size="md">
      <div className="-mx-5 -mt-4">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-200"
          />
          <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 dark:border-slate-700">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-400">No commands found</p>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                onMouseEnter={() => setSelected(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  i === selected
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="text-slate-400">{cmd.icon}</span>
                <span className="flex-1">{cmd.label}</span>
                {i === selected && <CornerDownLeft className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />}
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
