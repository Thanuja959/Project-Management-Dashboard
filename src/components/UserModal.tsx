import { useState, useEffect, type FormEvent } from 'react';
import type { User, UserRole } from '@/types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useToast } from './ui/Toast';
import { useDataStore } from '@/store/dataStore';
import { useAuthStore } from '@/store/authStore';
import { buildWelcomeEmail, sendMockEmail,  sendEmail } from '@/services/emailService';
// import { openEmailPreview } from './EmailPreviewModal';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

const roleOptions = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'USER', label: 'User' },
];

const departmentOptions = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Design', label: 'Design' },
  { value: 'QA', label: 'QA' },
  { value: 'Management', label: 'Management' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
];

const avatarColors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#ef4444', '#6366f1'];

export function UserModal({ open, onClose, user: editUser }: UserModalProps) {
  const { addUser, updateUser, addNotification, addActivity } = useDataStore();
  const currentUser = useAuthStore((s) => s.user);
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [department, setDepartment] = useState('Engineering');
  const [avatarColor, setAvatarColor] = useState(avatarColors[0]);
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editUser) {
        setName(editUser.name);
        setEmail(editUser.email);
        setPassword(editUser.password);
        setRole(editUser.role);
        setDepartment(editUser.department);
        setAvatarColor(editUser.avatarColor);
        setActive(editUser.active);
      } else {
        setName('');
        setEmail('');
        setPassword('');
        setRole('USER');
        setDepartment('Engineering');
        setAvatarColor(avatarColors[Math.floor(Math.random() * avatarColors.length)]);
        setActive(true);
      }
      setErrors({});
    }
  }, [open, editUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    if (!password.trim()) errs.password = 'Password is required';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (editUser) {
      updateUser(editUser.id, {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        department,
        avatarColor,
        active,
      });
      toast.success('User updated successfully');
    } else {
      const welcomeEmail = buildWelcomeEmail({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      sendMockEmail(welcomeEmail);

      try {
  await sendEmail(welcomeEmail, {
    userEmail: email.trim(),
    userPassword: password,
  });

  console.log('Welcome email sent successfully!');
} catch (error) {
  console.error('Failed to send welcome email:', error);
}

      const newUserId = addUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        department,
        avatarColor,
        active,
      });

      addNotification({
        userId: newUserId,
        type: 'PROJECT_ASSIGNED',
        title: 'Welcome to FlowBoard',
        message: `Welcome ${name.trim()}! Your account has been created. Check your email for login credentials.`,
        link: '/dashboard',
      });

      addActivity({
        userId: currentUser!.id,
        action: 'added user',
        target: name.trim(),
      });

      toast.success(`User added. Credentials email queued for ${name.trim()}.`);
      // setTimeout(() => openEmailPreview(), 300);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editUser ? 'Edit User' : 'Add User'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{editUser ? 'Save Changes' : 'Add User'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="Enter full name"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="user@example.com"
          />
          <Input
            label="Password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="Enter password"
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={roleOptions}
          />
          <Select
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={departmentOptions}
          />
        </div>
        <div>
          <p className="label">Avatar Color</p>
          <div className="flex flex-wrap gap-2">
            {avatarColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAvatarColor(c)}
                className={`h-8 w-8 rounded-full transition-transform ${avatarColor === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">Active account</span>
        </label>
      </form>
    </Modal>
  );
}
