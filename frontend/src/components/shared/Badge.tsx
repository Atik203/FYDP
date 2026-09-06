import { cn } from '@/lib/utils';

type BadgeVariant = 'blue' | 'green' | 'amber' | 'rose';

const variantClasses: Record<BadgeVariant, string> = {
  blue:  'bg-[#dce4ff] dark:bg-[rgba(59,91,219,0.25)] text-[#3b5bdb] dark:text-[#93c5fd]',
  green: 'bg-[#d3f9d8] dark:bg-[rgba(12,166,120,0.25)] text-[#0ca678] dark:text-[#6ee7b7]',
  amber: 'bg-[#fff3bf] dark:bg-[rgba(240,140,0,0.25)] text-[#f08c00] dark:text-[#fcd34d]',
  rose:  'bg-[#ffe3e3] dark:bg-[rgba(224,49,49,0.25)] text-[#e03131] dark:text-[#fca5a5]',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'blue', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-block px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold tracking-wider uppercase',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}
