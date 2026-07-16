import { cn } from '@/lib/utils';
import type { KpiCard } from '@/data/overview';

const variantClasses: Record<NonNullable<KpiCard['variant']>, { card: string; val: string }> = {
  default: { card: 'bg-[#dce4ff] dark:bg-[rgba(59,91,219,0.2)]', val: 'text-[#3b5bdb] dark:text-[#93c5fd]' },
  green:   { card: 'bg-[#d3f9d8] dark:bg-[rgba(12,166,120,0.2)]', val: 'text-[#0ca678] dark:text-[#6ee7b7]' },
  amber:   { card: 'bg-[#fff3bf] dark:bg-[rgba(240,140,0,0.2)]', val: 'text-[#f08c00] dark:text-[#fcd34d]' },
  rose:    { card: 'bg-[#ffe3e3] dark:bg-[rgba(224,49,49,0.2)]', val: 'text-[#e03131] dark:text-[#fca5a5]' },
  sky:     { card: 'bg-[#dbe4ff] dark:bg-[rgba(28,126,214,0.2)]', val: 'text-[#1c7ed6] dark:text-[#93c5fd]' },
};

interface KpiRowProps {
  kpis: KpiCard[];
}

export function KpiRow({ kpis }: KpiRowProps) {
  return (
    <div className="grid gap-4 my-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
      {kpis.map((kpi, i) => {
        const v = variantClasses[kpi.variant ?? 'default'];
        return (
          <div key={i} className={cn('rounded-md p-4 text-center', v.card)}>
            <div className={cn('text-2xl font-extrabold leading-none', v.val)}>{kpi.value}</div>
            <div className="text-xs uppercase tracking-wide text-[#64748b] dark:text-[#94a3b8] mt-1.5 font-semibold">{kpi.label}</div>
          </div>
        );
      })}
    </div>
  );
}
