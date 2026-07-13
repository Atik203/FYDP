import { cn } from '@/lib/utils';
import type { KpiCard } from '@/data/overview';

const variantClasses: Record<NonNullable<KpiCard['variant']>, { card: string; val: string }> = {
  default: { card: 'bg-[#dce4ff]', val: 'text-[#3b5bdb]' },
  green:   { card: 'bg-[#d3f9d8]', val: 'text-[#0ca678]' },
  amber:   { card: 'bg-[#fff3bf]', val: 'text-[#f08c00]' },
  rose:    { card: 'bg-[#ffe3e3]', val: 'text-[#e03131]' },
  sky:     { card: 'bg-[#dbe4ff]', val: 'text-[#1c7ed6]' },
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
            <div className="text-xs uppercase tracking-wide text-[#64748b] mt-1.5 font-semibold">{kpi.label}</div>
          </div>
        );
      })}
    </div>
  );
}
