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
        "rounded-xl border-2 px-[2.2cqw] py-[1.8cqh] flex flex-col",
        className,
      )}
      style={{ borderColor: color, background: "#ffffff" }}
    >
      <div className="flex items-center gap-[1cqw] mb-[1.2cqh]">
        <span
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: "4cqh", height: "4cqh", background: color }}
        >
          {icon}
        </span>
        <span
          className="text-[2.7cqh] font-extrabold uppercase tracking-wide"
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
        className="rounded-full flex-shrink-0 mt-[1.1cqh]"
        style={{ width: "1.1cqh", height: "1.1cqh", background: DEEP_INK }}
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
    <div className="mb-[1.5cqh]">
      <div
        className="inline-block rounded px-[1.6cqw] py-[0.5cqh] text-[1.9cqh] font-bold uppercase tracking-wider"
        style={{ background: badgeBg, color: badgeColor }}
      >
        {badge}
      </div>
      <h1
        className="mt-[1.1cqh] text-[4cqh] font-extrabold leading-tight"
        style={{ color: NEAR_BLACK }}
      >
        {title}
      </h1>
      {subtitle && (
        <div
          className="mt-[0.7cqh] text-[2.25cqh] font-semibold"
          style={{ color: DEEP_INK }}
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
        className="max-h-full max-w-full object-contain rounded-lg border-2"
        style={{ borderColor: "#cbd5e1" }}
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
      className="rounded-xl border-2 px-[1.2cqw] py-[1.5cqh] flex flex-col items-center justify-center text-center"
      style={{ borderColor: color, background: "#ffffff" }}
    >
      <span
        className="text-[5cqh] font-extrabold leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span
        className="mt-[0.9cqh] text-[1.9cqh] font-semibold leading-snug"
        style={{ color: DEEP_INK }}
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
    <table
      className="w-full border-collapse"
      style={{ tableLayout: "fixed" }}
    >
      <colgroup>
        {colWidths?.map((w, i) => <col key={i} style={{ width: w }} />)}
      </colgroup>
      <thead>
        <tr>
          {head.map((h) => (
            <th
              key={h}
              className="px-[1cqw] py-[1.1cqh] text-left text-[2.1cqh] font-extrabold uppercase tracking-wide"
              style={{
                border: "2px solid #94a3b8",
                background: `${accent}14`,
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
  );
}
