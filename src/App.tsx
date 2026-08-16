import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { useUIStore } from '@/store/uiStore';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { CommandPalette } from '@/components/CommandPalette';
import { ToastContainer } from '@/components/ui/Toast';
import { EmailPreviewModal } from '@/components/EmailPreviewModal';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsersPage } from '@/pages/UsersPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { TasksPage } from '@/pages/TasksPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SettingsPage } from '@/pages/SettingsPage';

function KeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { setCommandPaletteOpen } = useUIStore();

  useEffect(() => {
    let gPressed = false;
    let gTimeout: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: KeyboardEvent) => {
      if (!user) return;
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      // Ctrl+K / Cmd+K — command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (isTyping) return;

      // N — new task (admin only)
      if (e.key === 'n' && user.role === 'ADMIN' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigate('/tasks?action=new');
        return;
      }

      // G then D / P — navigation
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        gPressed = true;
        if (gTimeout) clearTimeout(gTimeout);
        gTimeout = setTimeout(() => { gPressed = false; }, 800);
        return;
      }

      if (gPressed) {
        if (e.key === 'd') {
          e.preventDefault();
          navigate('/dashboard');
          gPressed = false;
        } else if (e.key === 'p') {
          e.preventDefault();
          navigate('/projects');
          gPressed = false;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [user, navigate, location, setCommandPaletteOpen]);

  return null;
}

function ThemeInitializer() {
  const theme = useUIStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <KeyboardShortcuts />
      <ThemeInitializer />
      <CommandPalette />
      <ToastContainer />
      <EmailPreviewModal />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute adminOnly>
              <DashboardLayout>
                <UsersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProjectsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProjectDetailPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TasksPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CalendarPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute adminOnly>
              <DashboardLayout>
                <AnalyticsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NotificationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  const init = useDataStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
