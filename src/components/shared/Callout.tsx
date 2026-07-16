import { cn } from '@/lib/utils';

type CalloutVariant = 'gap' | 'feasibility' | 'info' | 'success' | 'warning';

const variantClasses: Record<CalloutVariant, { box: string; title: string }> = {
  gap:         { box: 'bg-[#ffe3e3] dark:bg-[rgba(224,49,49,0.15)] border-[#e03131] dark:border-[rgba(224,49,49,0.4)]', title: 'text-[#e03131] dark:text-[#fca5a5]' },
  feasibility: { box: 'bg-[#fff3bf] dark:bg-[rgba(240,140,0,0.15)] border-[#f08c00] dark:border-[rgba(240,140,0,0.4)]', title: 'text-[#f08c00] dark:text-[#fcd34d]' },
  info:        { box: 'bg-[#dbe4ff] dark:bg-[rgba(28,126,214,0.15)] border-[#1c7ed6] dark:border-[rgba(28,126,214,0.4)]', title: 'text-[#1c7ed6] dark:text-[#93c5fd]' },
  success:     { box: 'bg-[#d3f9d8] dark:bg-[rgba(12,166,120,0.15)] border-[#0ca678] dark:border-[rgba(12,166,120,0.4)]', title: 'text-[#0ca678] dark:text-[#6ee7b7]' },
  warning:     { box: 'bg-[#fff3bf] dark:bg-[rgba(240,140,0,0.15)] border-[#f08c00] dark:border-[rgba(240,140,0,0.4)]', title: 'text-[#f08c00] dark:text-[#fcd34d]' },
};

interface CalloutProps {
  variant?: CalloutVariant;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Callout({ variant = 'info', title, children, className }: CalloutProps) {
  const v = variantClasses[variant];
  return (
    <div className={cn('p-4 rounded-md my-5 text-sm leading-relaxed border-l-4', v.box, className)}>
      <div className={cn('font-bold text-xs uppercase tracking-wider mb-1.5', v.title)}>{title}</div>
      <div className="mb-0">{children}</div>
    </div>
  );
}
