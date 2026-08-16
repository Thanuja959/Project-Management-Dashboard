import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { useToast } from '@/components/ui/Toast';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectModal } from '@/components/ProjectModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { FolderKanban, Plus } from 'lucide-react';
import type { Project } from '@/types';
import { isAdmin } from '@/utils/permissions';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, tasks, users, deleteProject } = useDataStore();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const admin = isAdmin(user);

  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  useEffect(() => {
    if (searchParams.get('action') === 'new' && admin) {
      setEditProject(null);
      setModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams, admin]);

  const visibleProjects = useMemo(() => {
    if (admin) return projects;
    return projects.filter((p) => p.memberIds.includes(user?.id || ''));
  }, [projects, admin, user]);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProject(deleteTarget.id);
    toast.success(`Project ${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {admin ? 'Projects' : 'My Projects'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {admin ? 'Manage all projects and team assignments.' : 'Projects you are assigned to.'}
          </p>
        </div>
        {admin && (
          <Button onClick={() => { setEditProject(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {visibleProjects.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<FolderKanban className="h-6 w-6" />}
            title={admin ? "No projects found" : "No projects assigned to you"}
            description={admin ? "Create your first project to get started." : "Ask your admin to assign you to a project."}
            action={admin && <Button onClick={() => { setEditProject(null); setModalOpen(true); }}><Plus className="h-4 w-4" />New Project</Button>}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((p) => {
            const pTasks = tasks.filter((t) => t.projectId === p.id);
            const members = users.filter((u) => p.memberIds.includes(u.id));
            return (
              <div key={p.id} className="relative">
                <ProjectCard project={p} tasks={pTasks} members={members} onClick={() => navigate(`/projects/${p.id}`)} />
                {admin && (
                  <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditProject(p); setModalOpen(true); }}
                      className="rounded-lg bg-white/80 p-1.5 text-slate-500 shadow-sm backdrop-blur hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                      className="rounded-lg bg-white/80 p-1.5 text-rose-500 shadow-sm backdrop-blur hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} project={editProject} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete ${deleteTarget?.name}? All tasks in this project will also be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
