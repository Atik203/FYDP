import type { ResourceCard } from '@/data/overview';

interface InfoGridProps {
  cards: ResourceCard[];
}

export function InfoGrid({ cards }: InfoGridProps) {
  return (
    <div className="grid gap-4 my-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
      {cards.map((card, i) => (
        <div key={i} className="bg-[#f0f2f7] border border-[#e2e8f0] rounded-md p-4">
          <div className="text-[0.7rem] uppercase tracking-wider text-[#64748b] mb-1 font-semibold">{card.label}</div>
          <div className="text-[0.93rem] font-semibold text-[#12172b]">{card.value}</div>
          <div className="text-[0.78rem] text-[#64748b] mt-0.5">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
