import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { useUIStore } from '@/store/uiStore';
import { Avatar } from './ui/Avatar';
import { Search, Bell, Sun, Moon, Menu, Command, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { relativeTime } from '@/utils/helpers';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { notifications, markAllRead, markNotificationRead } = useDataStore();
  const { theme, toggleTheme, toggleSidebar, setCommandPaletteOpen } = useUIStore();
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const userNotifs = notifications.filter((n) => n.userId === user?.id);
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/tasks?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setSearchFocused(false);
    }
  };

  const pageNames: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/users': 'Users',
    '/projects': user?.role === 'ADMIN' ? 'Projects' : 'My Projects',
    '/tasks': user?.role === 'ADMIN' ? 'Tasks' : 'My Tasks',
    '/calendar': 'Calendar',
    '/analytics': 'Analytics',
    '/notifications': 'Notifications',
    '/settings': 'Settings',
  };

  const breadcrumb = pageNames[location.pathname] || (location.pathname.startsWith('/projects/') ? 'Project Details' : '');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden sm:block">
        <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{breadcrumb}</h1>
      </div>

      <form onSubmit={handleSearch} className="relative ml-auto hidden max-w-xs flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          placeholder="Search tasks..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-12 text-sm text-slate-700 placeholder-slate-400 transition-colors focus:border-slate-300 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-slate-600 dark:focus:bg-slate-900"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 md:block">
          /
        </kbd>
      </form>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 sm:ml-0"
        aria-label="Command palette"
      >
        <Command className="h-5 w-5" />
      </button>

      <button
        onClick={toggleTheme}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>

      <div ref={notifRef} className="relative">
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead(user!.id)}
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {userNotifs.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications</p>
              ) : (
                userNotifs.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.link) navigate(n.link);
                      setNotifOpen(false);
                    }}
                    className={`flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/50 ${
                      !n.read ? 'bg-sky-50/50 dark:bg-sky-500/5' : ''
                    }`}
                  >
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" />}
                    <div className={n.read ? 'ml-5' : ''}>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{relativeTime(n.createdAt)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => {
                navigate('/notifications');
                setNotifOpen(false);
              }}
              className="w-full border-t border-slate-100 py-2.5 text-center text-sm font-medium text-sky-600 hover:bg-slate-50 dark:border-slate-700 dark:text-sky-400 dark:hover:bg-slate-700/50"
            >
              View all
            </button>
          </div>
        )}
      </div>

      <div ref={profileRef} className="relative">
        <button
          onClick={() => setProfileOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Avatar name={user?.name || ''} color={user?.avatarColor || '#888'} size="sm" />
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {user?.role}
              </span>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  navigate('/settings');
                  setProfileOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
