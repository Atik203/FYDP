import type { TimelineItem } from '@/data/overview';

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <ul className="list-none ml-0 pl-6 border-l-[3px] border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)] mt-6">
      {items.map((item, i) => (
        <li key={i} className="relative pl-4 mb-5 last:mb-0">
          <span className="absolute left-[-1.65rem] top-[0.45rem] w-2.5 h-2.5 rounded-full bg-[#3b5bdb] border-2 border-white dark:border-[#1a1d35] shadow-[0_0_0_2px_#3b5bdb]" />
          <span className="font-bold text-[#12172b] dark:text-[#c7d2fe]">{item.milestone} ({item.date}):</span>
          {' '}{item.description}
          <div>
            <span className="inline-block mt-1 text-[0.78rem] bg-[#dce4ff] dark:bg-[rgba(59,91,219,0.2)] text-[#3b5bdb] dark:text-[#93c5fd] px-2 py-0.5 rounded font-semibold">
              {item.deliverable}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
