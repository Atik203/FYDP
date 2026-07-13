import { cn } from '@/lib/utils';

type CalloutVariant = 'gap' | 'feasibility' | 'info' | 'success';

const variantClasses: Record<CalloutVariant, { box: string; title: string }> = {
  gap:         { box: 'bg-[#ffe3e3] border-[#e03131]', title: 'text-[#e03131]' },
  feasibility: { box: 'bg-[#fff3bf] border-[#f08c00]', title: 'text-[#f08c00]' },
  info:        { box: 'bg-[#dbe4ff] border-[#1c7ed6]', title: 'text-[#1c7ed6]' },
  success:     { box: 'bg-[#d3f9d8] border-[#0ca678]', title: 'text-[#0ca678]' },
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
