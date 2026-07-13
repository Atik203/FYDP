import type { CoverItem } from '@/data/overview';

interface PageHeaderProps {
  docType: string;
  label?: string;
  title: React.ReactNode;
  subtitle?: string;
  coverItems?: CoverItem[];
}

export function PageHeader({ docType, label, title, subtitle, coverItems }: PageHeaderProps) {
  return (
    <header
      className="text-white text-center px-8 py-14 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #12172b 0%, #1e2a4a 60%, #2d3f7a 100%)',
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 70% 20%, rgba(59,91,219,.25) 0%, transparent 60%)' }}
      />
      {/* Bottom stripe */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #3b5bdb, #748ffc, #a78bfa, #3b5bdb)' }}
      />

      <div className="relative z-10">
        {/* Doc type pill */}
        <div className="inline-block text-[0.72rem] font-bold tracking-[0.12em] uppercase bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.2)] px-4 py-1.5 rounded-full mb-5 text-[rgba(255,255,255,0.9)]">
          {docType}
        </div>

        {/* Optional label */}
        {label && (
          <div className="text-sm uppercase tracking-[0.1em] mb-2 opacity-80 font-semibold">{label}</div>
        )}

        {/* Title */}
        <h1
          className="text-[clamp(1.7rem,3.5vw,2.6rem)] font-bold tracking-[-0.025em] leading-tight mb-2.5"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-base font-normal opacity-85 mb-8">{subtitle}</p>
        )}

        {/* Cover grid */}
        {coverItems && coverItems.length > 0 && (
          <div className="flex justify-center gap-6 flex-wrap mt-6">
            {coverItems.map((item, i) => (
              <div
                key={i}
                className="bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.18)] rounded-md px-4 py-2 text-sm text-[rgba(255,255,255,0.9)] text-left"
              >
                <span className="block text-[0.68rem] uppercase tracking-[0.08em] opacity-60 mb-0.5">{item.label}</span>
                {item.href ? (
                  <a href={item.href} className="text-white no-underline hover:underline">{item.value}</a>
                ) : (
                  item.value
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
