import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { ArrowDown, CornerRightDown } from 'lucide-react';

export interface PipeStep {
  id: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  color: 'indigo' | 'teal' | 'amber' | 'emerald' | 'rose' | 'sky' | 'violet';
  branch?: 'confident' | 'uncertain' | null;
}

const colorMap: Record<string, { dot: string; line: string; bg: string; border: string; icon: string }> = {
  indigo:  { dot: 'bg-[#6366f1]', line: 'border-[#6366f1]', bg: 'bg-[rgba(99,102,241,0.08)]', border: 'border-[#6366f1]/30', icon: 'text-[#6366f1]' },
  teal:    { dot: 'bg-[#0ca678]', line: 'border-[#0ca678]', bg: 'bg-[rgba(12,166,120,0.08)]', border: 'border-[#0ca678]/30', icon: 'text-[#0ca678]' },
  amber:   { dot: 'bg-[#f08c00]', line: 'border-[#f08c00]', bg: 'bg-[rgba(240,140,0,0.08)]', border: 'border-[#f08c00]/30', icon: 'text-[#f08c00]' },
  emerald: { dot: 'bg-[#2b8a3e]', line: 'border-[#2b8a3e]', bg: 'bg-[rgba(43,138,62,0.08)]', border: 'border-[#2b8a3e]/30', icon: 'text-[#2b8a3e]' },
  rose:    { dot: 'bg-[#e03131]', line: 'border-[#e03131]', bg: 'bg-[rgba(224,49,49,0.08)]', border: 'border-[#e03131]/30', icon: 'text-[#e03131]' },
  sky:     { dot: 'bg-[#1c7ed6]', line: 'border-[#1c7ed6]', bg: 'bg-[rgba(28,126,214,0.08)]', border: 'border-[#1c7ed6]/30', icon: 'text-[#1c7ed6]' },
  violet:  { dot: 'bg-[#7c3aed]', line: 'border-[#7c3aed]', bg: 'bg-[rgba(124,58,237,0.08)]', border: 'border-[#7c3aed]/30', icon: 'text-[#7c3aed]' },
};

interface PipelineFlowProps {
  steps: PipeStep[];
  className?: string;
}

export function PipelineFlow({ steps, className }: PipelineFlowProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-[#e2e8f0] dark:bg-[rgba(255,255,255,0.1)]" />

      {steps.map((step, i) => {
        const c = colorMap[step.color];
        const isBranch = step.branch === 'uncertain';
        const isJoin = step.branch === 'confident';
        return (
          <div key={step.id} className="relative flex items-start gap-4 pb-6 last:pb-0">
            {/* Branch indicator */}
            {isBranch && (
              <div className="absolute left-[11px] -top-1 text-[#f08c00] dark:text-[#fcd34d]">
                <CornerRightDown size={14} />
              </div>
            )}
            {isJoin && (
              <div className="absolute left-[11px] -bottom-3 text-[#0ca678] dark:text-[#6ee7b7]">
                <ArrowDown size={14} />
              </div>
            )}

            {/* Dot */}
            <div className={cn(
              'relative z-10 mt-1 w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm',
              c.bg, c.border, 'border',
            )}>
              <step.icon size={18} className={c.icon} />
            </div>

            {/* Card */}
            <div className={cn(
              'flex-1 min-w-0 rounded-lg border p-3.5 transition-shadow hover:shadow-sm',
              'bg-white dark:bg-[#1a1d35]',
              'border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)]',
            )}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0', c.dot)}>
                  {i + 1}
                </span>
                <span className="font-semibold text-[13px] text-[#1e2d3d] dark:text-[#e2e8f0]">{step.title}</span>
              </div>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] ml-7">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}