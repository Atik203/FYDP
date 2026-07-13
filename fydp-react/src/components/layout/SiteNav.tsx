import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bot, Route, FileText, Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

const navIconMap: Record<string, React.ReactNode> = {
  overview: <LayoutDashboard size={18} />,
  idea: <Bot size={18} />,
  roadmap: <Route size={18} />,
  proposal: <FileText size={18} />,
};

interface NavItem {
  to: string;
  label: string;
  key: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', key: 'overview' },
  { to: '/idea/1', label: 'Blueprint', key: 'idea' },
  { to: '/roadmap', label: 'Roadmap', key: 'roadmap' },
  { to: '/proposal', label: 'Proposal', key: 'proposal' },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 px-3.5 py-2 rounded-lg no-underline flex-shrink-0 transition-all duration-200 min-h-[44px]',
      'text-sm font-semibold',
      isActive
        ? 'bg-gradient-to-br from-[#6366f1] to-[#a78bfa] text-white shadow-[0_2px_14px_rgba(99,102,241,0.65)] ring-1 ring-[rgba(255,255,255,0.25)]'
        : 'text-white/70 hover:text-white hover:bg-[rgba(99,102,241,0.18)]',
      isActive && 'dark:from-[#6366f1] dark:to-[#a78bfa] dark:text-white dark:shadow-[0_2px_14px_rgba(129,140,248,0.5)]',
      !isActive && 'dark:text-white/60 dark:hover:text-white',
    );

  return (
    <nav
      className="sticky top-0 z-[200] border-b border-[rgba(99,102,241,0.22)] shadow-[0_4px_32px_rgba(0,0,0,0.28)]"
      style={{
        background: 'rgba(10,14,36,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <NavLink
          to="/"
          className="font-extrabold text-[0.72rem] tracking-[0.1em] uppercase text-[#6366f1] px-2.5 py-1.5 rounded-lg border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.08)] transition-all hover:bg-[rgba(99,102,241,0.18)] hover:text-[#818cf8] no-underline flex-shrink-0"
        >
          FYDP ➤
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              <span className="flex items-center">{navIconMap[item.key]}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#94a3b8] hover:text-white hover:bg-[rgba(99,102,241,0.18)] transition-all min-h-[44px] min-w-[44px]"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#94a3b8] hover:text-white hover:bg-[rgba(99,102,241,0.18)] transition-all min-h-[44px] min-w-[44px]"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0',
        )}
        style={{
          background: 'rgba(10,14,36,0.97)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="px-4 pb-4 pt-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg no-underline transition-all min-h-[44px] text-sm font-semibold',
                  isActive
                    ? 'bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[rgba(99,102,241,0.12)]',
                )
              }
            >
              <span className="flex items-center">{navIconMap[item.key]}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
