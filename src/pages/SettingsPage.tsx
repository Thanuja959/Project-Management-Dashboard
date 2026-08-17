import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { useUIStore } from '@/store/uiStore';
import { useToast } from '@/components/ui/Toast';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Sun,
  Moon,
  User as UserIcon,
  Bell,
  Palette,
  LogOut,
  Keyboard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { updateUser } = useDataStore();
  const { theme, toggleTheme } = useUIStore();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [password, setPassword] = useState(user?.password || '');

  const handleSave = () => {
    if (!user) return;
    updateUser(user.id, { name, email, department,password });
    toast.success('Profile updated successfully');
  };

  const shortcuts = [
    { keys: 'Ctrl + K', desc: 'Open command palette' },
    { keys: '/', desc: 'Focus search' },
    { keys: 'N', desc: 'New task (admin only)' },
    { keys: 'G then D', desc: 'Go to Dashboard' },
    { keys: 'G then P', desc: 'Go to Projects' },
    { keys: 'Esc', desc: 'Close modal' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your profile and preferences.</p>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Profile</h3>
        </div>
        <div className="flex items-center gap-4">
          <Avatar name={user?.name || ''} color={user?.avatarColor || '#888'} size="lg" />
          <div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.role} • {user?.department}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="mt-5 flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Palette className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Appearance</h3>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {theme === 'light' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-sky-400" />}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
              <p className="text-xs text-slate-400">Toggle between light and dark themes</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => { toggleTheme(); toast.success(`Switched to ${theme === 'light' ? 'dark' : 'light'} mode`); }}>
            Switch to {theme === 'light' ? 'Dark' : 'Light'}
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Keyboard Shortcuts</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {shortcuts.map((s) => (
            <div key={s.keys} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-400">{s.desc}</span>
              <kbd className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications info */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notifications</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You receive in-app notifications when tasks are assigned, completed, or when deadlines are approaching.
          Email notifications are simulated — no real emails are sent in this demo.
        </p>
      </div>

      {/* Danger zone */}
      <div className="card border-rose-200 p-6 dark:border-rose-500/30">
        <h3 className="mb-4 text-sm font-semibold text-rose-600 dark:text-rose-400">Sign Out</h3>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Sign out of your account. You'll need to sign in again to access the dashboard.</p>
        <Button
          variant="danger"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
