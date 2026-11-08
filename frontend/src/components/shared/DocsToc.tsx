import { useEffect, useState } from 'react';
import { List } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TocSection {
  id: string;
  label: string;
}

/** Tracks which section is currently at the top of the viewport. */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '');

  useEffect(() => {
    let frame = 0;
    const compute = () => {
      frame = 0;
      let current = ids[0] ?? '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 140) current = id;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // ids array identity is stable at call sites (module-level constant)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join('|')]);

  return active;
}

function TocList({ sections, active }: { sections: TocSection[]; active: string }) {
  return (
    <ul className="space-y-0.5">
      {sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className={cn(
              'block border-l-2 pl-3 py-1.5 text-[0.8rem] leading-snug transition-colors',
              active === section.id
                ? 'border-l-[#3b5bdb] bg-[#3b5bdb]/5 font-semibold text-[#3b5bdb] dark:text-[#93c5fd]'
                : 'border-l-[#e2e8f0] text-[#64748b] hover:border-l-[#3b5bdb] hover:text-[#3b5bdb] dark:border-[rgba(255,255,255,0.12)] dark:text-[#94a3b8] dark:hover:text-[#93c5fd]'
            )}
          >
            {section.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Docs-style table of contents for long pages.
 * Desktop: sticky left sidebar. Mobile/tablet: static card above the content.
 * The contents stay visible at every breakpoint so long pages remain navigable.
 */
export function DocsToc({
  sections,
  title = 'On this page',
}: {
  sections: TocSection[];
  title?: string;
}) {
  const active = useActiveSection(sections.map((s) => s.id));

  return (
    <aside className="mb-6 w-full flex-shrink-0 lg:mb-0 lg:w-60 xl:w-64">
      <nav className="glass-card max-h-[65vh] overflow-y-auto rounded-[10px] p-4 pr-2 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)]">
        <p className="mb-2 flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-widest text-[#94a3b8]">
          <List size={14} /> {title}
        </p>
        <TocList sections={sections} active={active} />
      </nav>
    </aside>
  );
}
