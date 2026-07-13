import type { RiskRow } from '@/data/overview';
import { Badge } from './Badge';

interface RiskTableProps {
  rows: RiskRow[];
}

export function RiskTable({ rows }: RiskTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {['Risk', 'Likelihood', 'Impact', 'Mitigation'].map((h) => (
              <th key={h} className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
              <td className="p-3">{row.risk}</td>
              <td className="p-3"><Badge variant={row.likelihoodVariant}>{row.likelihood}</Badge></td>
              <td className="p-3"><Badge variant={row.impactVariant}>{row.impact}</Badge></td>
              <td className="p-3">{row.mitigation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
