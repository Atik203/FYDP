import type { GanttPhase } from '@/data/overview';
import { cn } from '@/lib/utils';

const barVariants: Record<NonNullable<GanttPhase['barVariant']>, string> = {
  default: 'bg-gradient-to-r from-[#3b5bdb] to-[#748ffc]',
  teal:    'bg-gradient-to-r from-[#0ca678] to-[#38d9a9]',
  amber:   'bg-gradient-to-r from-[#f08c00] to-[#fcc419]',
  rose:    'bg-gradient-to-r from-[#e03131] to-[#ff6b6b]',
};

interface GanttTableProps {
  phases: GanttPhase[];
}

export function GanttTable({ phases }: GanttTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="p-2.5 text-left font-bold text-xs bg-[#f1f5f9] border-b-2 border-[#e2e8f0] w-[25%]">Phase</th>
            <th className="p-2.5 text-left font-bold text-xs bg-[#f1f5f9] border-b-2 border-[#e2e8f0] w-[22%]">Duration</th>
            <th className="p-2.5 text-left font-bold text-xs bg-[#f1f5f9] border-b-2 border-[#e2e8f0] w-[35%]">Key Deliverables</th>
            <th className="p-2.5 text-left font-bold text-xs bg-[#f1f5f9] border-b-2 border-[#e2e8f0] w-[18%]">Progress</th>
          </tr>
        </thead>
        <tbody>
          {phases.map((phase, i) => (
            <tr key={i} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
              <td className="p-2.5"><strong>{phase.name}</strong></td>
              <td className="p-2.5">{phase.duration}</td>
              <td className="p-2.5">{phase.deliverables}</td>
              <td className="p-2.5">
                <div className="bg-[#f1f5f9] rounded h-[18px] w-full min-w-[80px] overflow-hidden">
                  <div
                    className={cn('h-full rounded transition-all duration-500', barVariants[phase.barVariant ?? 'default'])}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
