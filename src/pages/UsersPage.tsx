import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDataStore } from '@/store/dataStore';
import { useToast } from '@/components/ui/Toast';
import { UserModal } from '@/components/UserModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users as UsersIcon, Plus, Search, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import type { User } from '@/types';

export function UsersPage() {
  const { users, projects, addUser, updateUser, deleteUser } = useDataStore();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setEditUser(null);
      setModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q)
    );
  }, [users, search]);

  const projectCount = (userId: string) => projects.filter((p) => p.memberIds.includes(userId)).length;

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id);
    toast.success(`User ${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  };

  const toggleActive = (u: User) => {
    updateUser(u.id, { active: !u.active });
    toast.success(`${u.name} ${u.active ? 'deactivated' : 'activated'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Users</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage team members and their access.</p>
        </div>
        <Button onClick={() => { setEditUser(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<UsersIcon className="h-6 w-6" />}
            title="No users found"
            description={search ? "Try a different search term." : "Add your first team member to get started."}
            action={!search && <Button onClick={() => { setEditUser(null); setModalOpen(true); }}><Plus className="h-4 w-4" />Add User</Button>}
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Projects</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} color={u.avatarColor} size="md" />
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={u.role === 'ADMIN' ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{u.department}</td>
                    <td className="px-4 py-3">
                      <Badge className={u.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'}>
                        {u.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{projectCount(u.id)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditUser(u); setModalOpen(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => toggleActive(u)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300" aria-label="Toggle active">
                          {u.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button onClick={() => setDeleteTarget(u)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((u) => (
              <div key={u.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} color={u.avatarColor} size="md" />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <Badge className={u.role === 'ADMIN' ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300'}>
                    {u.role}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{u.department}</span>
                    <span>•</span>
                    <Badge className={u.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'}>
                      {u.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span>•</span>
                    <span>{projectCount(u.id)} projects</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => { setEditUser(u); setModalOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(u)}>
                    {u.active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                    {u.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-rose-500" onClick={() => setDeleteTarget(u)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <UserModal open={modalOpen} onClose={() => setModalOpen(false)} user={editUser} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
