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
      'bg-white p-8 rounded-[10px] shadow-sm mb-7 border border-[#e2e8f0]',
      'hover:shadow-md hover:border-[#cbd5e1] transition-all duration-200',
      accentBorder[accent],
      className
    )}>
      {children}
    </section>
  );
}

interface SectionTitleProps {
  icon?: string;
  children: React.ReactNode;
}

export function SectionTitle({ icon, children }: SectionTitleProps) {
  return (
    <h2 className="font-serif text-[1.35rem] font-bold text-[#12172b] mb-4 pb-2 border-b-2 border-[#e2e8f0] tracking-[-0.01em] flex items-center gap-2">
      {icon && <span className="text-[1.1rem] flex-shrink-0">{icon}</span>}
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
    <div className={cn('bg-[#f0f2f7] border border-[#e2e8f0] rounded-md p-5', className)}>
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
  default: 'bg-[#dce4ff] text-[#3b5bdb]',
  green:   'bg-[#d3f9d8] text-[#0ca678]',
  amber:   'bg-[#fff3bf] text-[#f08c00]',
  rose:    'bg-[#ffe3e3] text-[#e03131]',
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
