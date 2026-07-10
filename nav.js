/**
 * FYDP 2026-27 — Shared Navigation + Footer Component
 * Add  <script src="nav.js" defer></script>  to every page's <head>.
 * Active page is auto-detected from location.pathname.
 */
(function () {
  'use strict';

  /* ── Page detection ─────────────────────────────────── */
  const page = location.pathname.split('/').pop() || 'index.html';

  /* ── Navigation items ───────────────────────────────── */
  const PAGES = [
    { href: 'index.html',      label: 'Overview',    icon: '⊞',   sub: null           },
    { href: 'idea1.html',      label: 'Idea 1',      icon: '🤖',  sub: 'Agent Debate' },
    { href: 'idea2.html',      label: 'Idea 2',      icon: '📋',  sub: 'Arg. Verify'  },
    { href: 'idea3.html',      label: 'Idea 3',      icon: '⏱',   sub: 'Temporal KG'  },
    { href: 'idea4.html',      label: 'Idea 4',      icon: '🧬',  sub: 'Rare Disease' },
    { href: 'idea5.html',      label: 'Idea 5',      icon: '📊',  sub: 'Stat Verify'  },
    { href: 'conclusion.html', label: 'Conclusion',  icon: '🎯',  sub: null           },
    { href: 'topic.html',      label: 'Roadmap',     icon: '🗺️', sub: 'Idea 1',  accent: true },
    { href: 'idea1_proposal_supervisor.html', label: 'Proposal', icon: '📄', sub: 'Idea 1', accent: true },
  ];


  /* ── Beautiful Nav CSS ──────────────────────────────── */
  const css = `
    nav#site-nav {
      position: sticky;
      top: 0;
      z-index: 200;
      background: rgba(10, 14, 36, 0.82);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(99, 102, 241, 0.22);
      box-shadow: 0 4px 32px rgba(0,0,0,0.28), 0 1px 0 rgba(99,102,241,0.15);
    }
    nav#site-nav .sn-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 56px;
      display: flex;
      align-items: center;
      gap: 4px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    nav#site-nav .sn-inner::-webkit-scrollbar { display: none; }

    /* Brand */
    nav#site-nav .sn-brand {
      font-family: 'Inter', sans-serif;
      font-weight: 800;
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #6366f1;
      text-decoration: none;
      padding: 0.25rem 0.6rem;
      border-radius: 7px;
      margin-right: 0.5rem;
      flex-shrink: 0;
      border: 1px solid rgba(99,102,241,0.3);
      background: rgba(99,102,241,0.08);
      transition: background 0.2s, color 0.2s;
    }
    nav#site-nav .sn-brand:hover {
      background: rgba(99,102,241,0.18);
      color: #818cf8;
      text-decoration: none;
    }

    /* Divider */
    nav#site-nav .sn-sep {
      width: 1px; height: 24px;
      background: rgba(99,102,241,0.2);
      margin: 0 0.35rem;
      flex-shrink: 0;
    }

    /* Nav links */
    nav#site-nav a.sn-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.32rem 0.9rem;
      border-radius: 9px;
      text-decoration: none;
      white-space: nowrap;
      flex-shrink: 0;
      min-width: fit-content;
      position: relative;
      transition: background 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
    }
    nav#site-nav a.sn-link:hover { text-decoration: none; }

    /* Hover shimmer */
    nav#site-nav a.sn-link::after {
      content: '';
      position: absolute; inset: 0;
      border-radius: 9px;
      background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12));
      opacity: 0;
      transition: opacity 0.18s;
      pointer-events: none;
    }
    nav#site-nav a.sn-link:hover::after  { opacity: 1; }
    nav#site-nav a.sn-link:hover         { transform: translateY(-1px); }

    nav#site-nav a.sn-link .sn-lbl {
      font-size: 0.8rem;
      font-weight: 600;
      color: #94a3b8;
      line-height: 1.2;
      transition: color 0.18s;
    }
    nav#site-nav a.sn-link .sn-sub {
      font-size: 0.62rem;
      color: #4b5563;
      line-height: 1;
      font-weight: 400;
      transition: color 0.18s;
      margin-top: 1px;
    }
    nav#site-nav a.sn-link:hover .sn-lbl { color: #c7d2fe; }
    nav#site-nav a.sn-link:hover .sn-sub { color: #818cf8; }

    /* Active state — gradient pill */
    nav#site-nav a.sn-link.active {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      box-shadow: 0 2px 14px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
      transform: translateY(-1px);
    }
    nav#site-nav a.sn-link.active::after { opacity: 0 !important; }
    nav#site-nav a.sn-link.active .sn-lbl { color: #fff; }
    nav#site-nav a.sn-link.active .sn-sub { color: rgba(255,255,255,0.72); }

    /* Roadmap accent pill */
    nav#site-nav a.sn-link.sn-accent {
      border: 1px solid rgba(99,102,241,0.35);
      background: rgba(99,102,241,0.07);
      margin-left: 0.6rem;
    }
    nav#site-nav a.sn-link.sn-accent:hover    { border-color: rgba(99,102,241,0.55); }
    nav#site-nav a.sn-link.sn-accent.active   { border-color: transparent; }

    /* ── Mobile: structured wrap ─────────────────────── */
    @media (max-width: 900px) {
      nav#site-nav .sn-inner {
        height: auto;
        flex-wrap: wrap;
        justify-content: center;
        padding: 0.55rem 1rem;
        gap: 5px;
      }
      nav#site-nav .sn-brand {
        width: 100%;
        text-align: center;
        margin-right: 0;
        margin-bottom: 0.3rem;
      }
      nav#site-nav .sn-sep { display: none; }
      nav#site-nav a.sn-link {
        flex: 0 0 auto;
        padding: 0.3rem 0.75rem;
      }
      nav#site-nav a.sn-link.sn-accent { margin-left: 0; }
    }

    @media (max-width: 480px) {
      nav#site-nav .sn-inner {
        padding: 0.5rem 0.75rem;
        gap: 4px;
      }
      nav#site-nav .sn-brand {
        font-size: 0.68rem;
        margin-bottom: 0.25rem;
      }
      nav#site-nav a.sn-link {
        padding: 0.28rem 0.6rem;
        border-radius: 7px;
      }
      nav#site-nav a.sn-link .sn-lbl { font-size: 0.74rem; }
      nav#site-nav a.sn-link .sn-sub { font-size: 0.58rem; }
    }

    @media print { nav#site-nav { display: none; } }
  `;

  /* ── Build nav HTML ─────────────────────────────────── */
  const links = PAGES.map(p => {
    const active = p.href === page ? 'active' : '';
    const accent = p.accent ? 'sn-accent' : '';
    const sub    = p.sub ? `<span class="sn-sub">${p.sub}</span>` : '';
    return `<a href="${p.href}" class="sn-link ${active} ${accent}">
        <span class="sn-lbl">${p.icon} ${p.label}</span>${sub}
      </a>`;
  }).join('\n');

  const navHTML = `
    <div class="sn-inner">
      <a href="index.html" class="sn-brand">FYDP &#x27A4;</a>
      <div class="sn-sep"></div>
      ${links}
    </div>
  `;

  /* ── Inject styles ──────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.id    = 'site-nav-style';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── Inject nav ─────────────────────────────────────── */
  const navEl    = document.createElement('nav');
  navEl.id       = 'site-nav';
  navEl.innerHTML = navHTML;

  const existing = document.querySelector('body > nav');
  if (existing) {
    existing.replaceWith(navEl);
  } else {
    const h = document.querySelector('header');
    if (h) h.after(navEl); else document.body.prepend(navEl);
  }

  /* ── Patch footer nav links ─────────────────────────── */
  const footer = document.querySelector('footer');
  if (footer && !footer.querySelector('.fn-links')) {
    const fn = document.createElement('p');
    fn.className = 'fn-links';
    fn.style.cssText = 'margin-top:.6rem;font-size:.78rem;opacity:.65;line-height:2';
    fn.innerHTML = PAGES.map(p => `<a href="${p.href}" style="color:#93c5fd;margin:0 .25rem">${p.label}</a>`).join('·');
    footer.appendChild(fn);
  }
})();
