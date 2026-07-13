import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  sub?: string;
  accent?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',           label: 'Overview',   icon: '⊞',   sub: undefined },
  { to: '/idea/1',     label: 'Idea 1',     icon: '🤖',  sub: 'Agent Debate' },
  { to: '/idea/2',     label: 'Idea 2',     icon: '📋',  sub: 'Arg. Verify' },
  { to: '/idea/3',     label: 'Idea 3',     icon: '⏱',   sub: 'Temporal KG' },
  { to: '/idea/4',     label: 'Idea 4',     icon: '🧬',  sub: 'Rare Disease' },
  { to: '/idea/5',     label: 'Idea 5',     icon: '📊',  sub: 'Stat Verify' },
  { to: '/conclusion', label: 'Conclusion', icon: '🎯',  sub: undefined },
  { to: '/roadmap',    label: 'Roadmap',    icon: '🗺️', sub: 'Idea 1', accent: true },
  { to: '/proposal',   label: 'Proposal',   icon: '📄',  sub: 'Idea 1', accent: true },
];

export function SiteNav() {
  return (
    <nav
      id="site-nav"
      className="sticky top-0 z-[200] border-b border-[rgba(99,102,241,0.22)] shadow-[0_4px_32px_rgba(0,0,0,0.28),0_1px_0_rgba(99,102,241,0.15)]"
      style={{
        background: 'rgba(10,14,36,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div
        className="max-w-[1280px] mx-auto px-6 h-14 flex items-center gap-1 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Brand */}
        <NavLink
          to="/"
          className="font-extrabold text-[0.72rem] tracking-[0.1em] uppercase text-[#6366f1] px-2.5 py-1 rounded-lg mr-2 flex-shrink-0 border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.08)] transition-all hover:bg-[rgba(99,102,241,0.18)] hover:text-[#818cf8] no-underline"
        >
          FYDP ➤
        </NavLink>

        {/* Divider */}
        <div className="w-px h-6 bg-[rgba(99,102,241,0.2)] mx-1.5 flex-shrink-0" />

        {/* Nav Links */}
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center px-3.5 py-1.5 rounded-lg no-underline flex-shrink-0 min-w-fit relative transition-all duration-200',
                'hover:-translate-y-px',
                item.accent && !isActive && 'border border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.07)] ml-2.5',
                item.accent && !isActive && 'hover:border-[rgba(99,102,241,0.55)]',
                isActive && 'bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] shadow-[0_2px_14px_rgba(99,102,241,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] -translate-y-px',
                !isActive && 'hover:bg-[rgba(99,102,241,0.12)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  'text-[0.8rem] font-semibold leading-tight transition-colors duration-200',
                  isActive ? 'text-white' : 'text-[#94a3b8] hover:text-[#c7d2fe]'
                )}>
                  {item.icon} {item.label}
                </span>
                {item.sub && (
                  <span className={cn(
                    'text-[0.62rem] leading-none mt-px transition-colors duration-200',
                    isActive ? 'text-[rgba(255,255,255,0.72)]' : 'text-[#4b5563]'
                  )}>
                    {item.sub}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
