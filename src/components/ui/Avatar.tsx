import { initials } from '@/utils/helpers';

interface AvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({ name, color, size = 'md', className = '' }: AvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizes[size]} ${className}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials(name)}
    </div>
  );
}
