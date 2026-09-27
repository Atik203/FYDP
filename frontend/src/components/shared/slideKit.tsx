import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/* ────────────────────────────────────────────────────────────────
   Shared slide kit — palette + primitives used by every deck
   (/slide, /slide/ce, /slide/final). All sizes use container-query
   units so text scales with the 16:9 canvas, not the window.
   ──────────────────────────────────────────────────────────────── */

export const NEAR_BLACK = "#0a0a0a";
export const DEEP_INK = "#101828";
export const ACCENT = "#1e40af";
export const TEAL = "#0f766e";
export const AMBER = "#b45309";
export const ROSE = "#b91c1c";

export function Card({
  icon,
  title,
  color,
  children,
  className,
}: {
  icon: ReactNode;
  title: string;
  color: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 flex flex-col px-[2.2cqw] py-[1.8cqh] overflow-hidden",
        className,
      )}
      style={{
        borderColor: `${color}4d`,
        background: "linear-gradient(180deg, #ffffff 55%, #f8fafc 100%)",
        boxShadow: `0 1.6cqh 2.8cqh -1.8cqh ${color}40, 0 0.4cqh 0.8cqh -0.4cqh rgba(15,23,42,0.10)`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[0.42cqh]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}22)` }}
      />
      <div className="flex items-center gap-[1cqw] mb-[1.2cqh]">
        <span
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: "4cqh",
            height: "4cqh",
            background: `linear-gradient(135deg, ${color}, ${color}c9)`,
            boxShadow: `0 0.8cqh 1.6cqh -0.8cqh ${color}99`,
          }}
        >
          {icon}
        </span>
        <span
          className="text-[2.55cqh] font-extrabold uppercase tracking-[0.06em]"
          style={{ color }}
        >
          {title}
        </span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-[0.9cqw] mb-[0.7cqh] last:mb-0">
      <span
        className="flex-shrink-0 mt-[1cqh]"
        style={{
          width: "0.9cqh",
          height: "0.9cqh",
          background: `linear-gradient(135deg, ${DEEP_INK}, ${ACCENT})`,
          transform: "rotate(45deg)",
          borderRadius: "0.15cqh",
        }}
      />
      <span
        className="text-[2.55cqh] font-medium leading-snug"
        style={{ color: NEAR_BLACK }}
      >
        {children}
      </span>
    </li>
  );
}

export function Mark({ ok, size = "2.4cqh" }: { ok: boolean; size?: string }) {
  return (
    <span
      className="font-extrabold leading-none"
      style={{ fontSize: size, color: ok ? TEAL : ROSE }}
    >
      {ok ? "✓" : "✗"}
    </span>
  );
}

export function SlideHeader({
  badge,
  badgeBg,
  badgeColor,
  title,
  subtitle,
}: {
  badge: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative mb-[1.4cqh] pl-[1.3cqw]">
      <div
        className="absolute left-0 top-[0.3cqh] bottom-[0.3cqh] w-[0.38cqw] rounded-full"
        style={{
          background: `linear-gradient(180deg, ${badgeColor}, ${badgeColor}44)`,
        }}
      />
      <div
        className="inline-flex items-center gap-[0.7cqw] rounded-full px-[1.4cqw] py-[0.45cqh] text-[1.75cqh] font-extrabold uppercase tracking-[0.14em]"
        style={{
          background: badgeBg,
          color: badgeColor,
          boxShadow: `0 0.8cqh 1.8cqh -1cqh ${badgeColor}99`,
        }}
      >
        <span
          className="rounded-full"
          style={{ width: "0.85cqh", height: "0.85cqh", background: badgeColor }}
        />
        {badge}
      </div>
      <h1
        className="mt-[0.9cqh] text-[4cqh] font-extrabold leading-[1.08] tracking-tight"
        style={{
          color: NEAR_BLACK,
          fontFamily: "'Source Serif 4', Georgia, serif",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <div
          className="mt-[0.5cqh] text-[2.15cqh] font-semibold leading-snug"
          style={{ color: DEEP_INK, opacity: 0.72 }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

/* Image figure for slides — bordered, scaled to fit its container. */
export function Figure({
  src,
  alt,
  caption,
  className,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "flex flex-col items-center justify-center min-h-0",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain rounded-xl border-2"
        style={{
          borderColor: "#cbd5e1",
          boxShadow: "0 2cqh 4cqh -2.4cqh rgba(15,23,42,0.45)",
        }}
      />
      {caption && (
        <figcaption
          className="mt-[0.9cqh] text-[1.8cqh] font-semibold text-center"
          style={{ color: "#475569" }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* Big number + label — used on motivation/results slides. */
export function Stat({
  value,
  label,
  color = ACCENT,
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <div
      className="relative rounded-2xl border-2 flex flex-col items-center justify-center text-center px-[1.2cqw] py-[1.5cqh] overflow-hidden"
      style={{
        borderColor: `${color}4d`,
        background: "linear-gradient(180deg, #ffffff 50%, #f8fafc 100%)",
        boxShadow: `0 1.6cqh 2.8cqh -1.9cqh ${color}59`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[0.42cqh]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
      <span
        className="text-[5.4cqh] font-black leading-none tracking-tight"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}b3)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {value}
      </span>
      <span
        className="mt-[0.9cqh] text-[1.85cqh] font-bold leading-snug tracking-wide"
        style={{ color: DEEP_INK, opacity: 0.8 }}
      >
        {label}
      </span>
    </div>
  );
}

/* Simple bordered table for final-deck reference slides. */
export function SlideTable({
  head,
  rows,
  colWidths,
  accent = ACCENT,
}: {
  head: string[];
  rows: string[][];
  colWidths?: string[];
  accent?: string;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: "1.5px solid #cbd5e1",
        boxShadow:
          "0 1.8cqh 3cqh -2cqh rgba(15,23,42,0.35), 0 0.4cqh 0.8cqh -0.4cqh rgba(15,23,42,0.08)",
      }}
    >
      <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
        <colgroup>
          {colWidths?.map((w, i) => <col key={i} style={{ width: w }} />)}
        </colgroup>
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="px-[1cqw] py-[1.1cqh] text-left text-[2.05cqh] font-extrabold uppercase tracking-[0.1em]"
                style={{
                  border: "1.5px solid #cbd5e1",
                  background: `linear-gradient(180deg, ${accent}1f, ${accent}0a)`,
                  color: accent,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, ci) => (
                <td
                  key={ci}
                  className="px-[1cqw] py-[1cqh] align-top text-[2cqh] font-medium leading-snug"
                  style={{
                    border: "1.5px solid #cbd5e1",
                    background: ri % 2 ? "#f8fafc" : "#ffffff",
                    color: NEAR_BLACK,
                  }}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
