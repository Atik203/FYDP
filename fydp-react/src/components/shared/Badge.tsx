import { cn } from '@/lib/utils';

type BadgeVariant = 'blue' | 'green' | 'amber' | 'rose';

const variantClasses: Record<BadgeVariant, string> = {
  blue:  'bg-[#dce4ff] text-[#3b5bdb]',
  green: 'bg-[#d3f9d8] text-[#0ca678]',
  amber: 'bg-[#fff3bf] text-[#f08c00]',
  rose:  'bg-[#ffe3e3] text-[#e03131]',
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
