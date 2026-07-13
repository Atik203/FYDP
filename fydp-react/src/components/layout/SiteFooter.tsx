import { Link } from 'react-router-dom';

const QUICK_LINKS = [
  { to: '/', label: 'Overview' },
  { to: '/idea/1', label: 'Idea 1' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/proposal', label: 'Proposal' },
];

const CONTACT_LINKS = [
  { icon: null, label: 'GitHub', href: 'https://github.com/atik203', value: '@atik203' },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0c1023] text-[rgba(255,255,255,0.65)] mt-16 border-t border-[rgba(99,102,241,0.15)]">
      {/* Gradient top bar */}
      <div className="h-[2px] bg-gradient-to-r from-[#3b5bdb] via-[#a78bfa] to-[#3b5bdb]" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Column 1 — Project */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3">FYDP Research</h3>
            <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.55)]">
              Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning.
            </p>
            <p className="text-sm mt-2 text-[rgba(255,255,255,0.45)]">
              Jul 2026 – Apr 2027 &middot; Single A100 &middot; Open-weight Models
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-[rgba(255,255,255,0.55)] hover:text-[#93c5fd] transition-colors no-underline hover:underline min-h-[44px] inline-flex items-center"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3">Connect</h3>
            <ul className="space-y-2">
              {CONTACT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.55)] hover:text-[#93c5fd] transition-colors no-underline hover:underline min-h-[44px]"
                  >
                    <span className="w-4 text-center">⌨</span>
                    {link.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[rgba(255,255,255,0.08)] text-center text-xs text-[rgba(255,255,255,0.35)]">
          &copy; {new Date().getFullYear()} Md. Atikur Rahaman &middot; Final Year Design Project
        </div>
      </div>
    </footer>
  );
}
