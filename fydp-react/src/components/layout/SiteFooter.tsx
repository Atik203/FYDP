import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { to: '/idea/1', label: 'Idea 1' },
  { to: '/idea/2', label: 'Idea 2' },
  { to: '/idea/3', label: 'Idea 3' },
  { to: '/idea/4', label: 'Idea 4' },
  { to: '/idea/5', label: 'Idea 5' },
  { to: '/conclusion', label: 'Conclusion' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/proposal', label: 'Proposal' },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#12172b] text-[rgba(255,255,255,0.65)] text-center py-8 px-4 text-[0.83rem] mt-12">
      <p>
        <strong className="text-white">FYDP Research Ideas 2026–2027</strong>
        &nbsp;·&nbsp; Prepared by Md. Atikur Rahaman &nbsp;·&nbsp; © 2026
      </p>
      <p className="mt-2" style={{ lineHeight: 2 }}>
        {FOOTER_LINKS.map((link, i) => (
          <span key={link.to}>
            <Link to={link.to} className="text-[#93c5fd] mx-1 hover:underline">
              {link.label}
            </Link>
            {i < FOOTER_LINKS.length - 1 && '·'}
          </span>
        ))}
      </p>
    </footer>
  );
}
