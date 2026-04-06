import { cn } from '@/lib/utils';

export default function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-4 h-4 border-2 border-gray-200 border-t-brand rounded-full animate-spin',
        className
      )}
    />
  );
}
