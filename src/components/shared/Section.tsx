import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AccentVariant = 'blue' | 'teal' | 'amber' | 'rose' | 'none';

const accentBorder: Record<AccentVariant, string> = {
  blue:  'border-l-[4px] border-l-[#3b5bdb]',
  teal:  'border-l-[4px] border-l-[#0ca678]',
  amber: 'border-l-[4px] border-l-[#f08c00]',
  rose:  'border-l-[4px] border-l-[#e03131]',
  none:  '',
};

interface SectionProps {
  accent?: AccentVariant;
  className?: string;
  children: React.ReactNode;
}

export function Section({ accent = 'none', className, children }: SectionProps) {
  return (
    <section className={cn(
      'glass-card p-8 rounded-[10px] mb-7',
      accentBorder[accent],
      className
    )}>
      {children}
    </section>
  );
}

interface SectionTitleProps {
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
  children: React.ReactNode;
}

export function SectionTitle({ icon: Icon, className, children }: SectionTitleProps) {
  return (
    <h2 className={cn(
      'font-serif text-[1.35rem] font-bold text-[#12172b] dark:text-[#c7d2fe] mb-4 pb-2 border-b-2 border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)] tracking-[-0.01em] flex items-center gap-2.5',
      className
    )}>
      {Icon && (
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#3b5bdb]/10 dark:bg-[#3b5bdb]/20 text-[#3b5bdb] dark:text-[#93c5fd] flex-shrink-0">
          <Icon size={18} />
        </span>
      )}
      {children}
    </h2>
  );
}

interface ColBoxProps {
  children: React.ReactNode;
  className?: string;
}

export function ColBox({ children, className }: ColBoxProps) {
  return (
    <div className={cn('bg-[#f0f2f7] dark:bg-[rgba(255,255,255,0.04)] border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] rounded-md p-5', className)}>
      {children}
    </div>
  );
}

interface TwoColProps {
  children: React.ReactNode;
  className?: string;
}

export function TwoCol({ children, className }: TwoColProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-5 my-4', className)}>
      {children}
    </div>
  );
}

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'amber' | 'rose';
}

const chipVariants: Record<NonNullable<ChipProps['variant']>, string> = {
  default: 'bg-[#dce4ff] dark:bg-[rgba(59,91,219,0.2)] text-[#3b5bdb] dark:text-[#93c5fd]',
  green:   'bg-[#d3f9d8] dark:bg-[rgba(12,166,120,0.2)] text-[#0ca678] dark:text-[#6ee7b7]',
  amber:   'bg-[#fff3bf] dark:bg-[rgba(240,140,0,0.2)] text-[#f08c00] dark:text-[#fcd34d]',
  rose:    'bg-[#ffe3e3] dark:bg-[rgba(224,49,49,0.2)] text-[#e03131] dark:text-[#fca5a5]',
};

export function Chip({ children, variant = 'default' }: ChipProps) {
  return (
    <span className={cn(
      'inline-block px-3 py-1 rounded-full text-[0.76rem] font-semibold',
      chipVariants[variant]
    )}>
      {children}
    </span>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2 my-3">{children}</div>
  );
}

export function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#3b5bdb] text-white font-bold text-sm flex-shrink-0 shadow-[0_2px_8px_rgba(59,91,219,.35)]">
      {rank}
    </span>
  );
}