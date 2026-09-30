import { Maximize } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";

/* ────────────────────────────────────────────────────────────────
   Shared projector-safe slide deck chrome.
   - 16:9 canvas, letterboxed on any screen
   - Keyboard-only navigation: ← → , PageUp/PageDown (clicker), Home/End
   - Click the left/right third of the canvas (or swipe on touch) to navigate
   - Press F to toggle fullscreen
   ──────────────────────────────────────────────────────────────── */

export function SlideDeck({ slides }: { slides: ComponentType[] }) {
  const [index, setIndex] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [flash, setFlash] = useState<"prev" | "next" | null>(null);

  const go = useCallback(
    (dir: number) => {
      setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + dir)));
      setFlash(dir < 0 ? "prev" : "next");
    },
    [slides.length],
  );

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 260);
    return () => window.clearTimeout(t);
  }, [flash]);

  const onCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width / 3) go(-1);
      else if (x > (rect.width * 2) / 3) go(1);
    },
    [go],
  );

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      go(dx < 0 ? 1 : -1);
    },
    [go],
  );

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          go(1);
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          go(-1);
          break;
        case "Home":
          e.preventDefault();
          setIndex(0);
          break;
        case "End":
          e.preventDefault();
          setIndex(slides.length - 1);
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, toggleFullscreen, slides.length]);

  useEffect(() => {
    const onFsChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const Slide = slides[index];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(1100px 620px at 18% -10%, #2b3a63 0%, #1e293b 48%, #0b1120 100%)",
      }}
    >
      {/* 16:9 slide canvas — fills height, letterboxes width */}
      <div
        className="relative shadow-2xl"
        onClick={onCanvasClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          aspectRatio: "16 / 9",
          width: "min(100vw, calc(100vh * 16 / 9))",
          height: "min(100vh, calc(100vw * 9 / 16))",
          containerType: "size",
          background:
            "linear-gradient(180deg, #ffffff 0%, #fbfcfe 55%, #f2f6fb 100%)",
          boxShadow:
            "0 3.4cqh 8cqh -3cqh rgba(2,6,23,0.85), 0 0 0 1px rgba(148,163,184,0.35)",
        }}
      >
        {/* Slide chrome: top rule + soft colour fields (behind content) */}
        <div
          className="absolute inset-x-0 top-0 h-[0.6cqh]"
          style={{
            background:
              "linear-gradient(90deg, #1e40af 0%, #0f766e 55%, #b45309 100%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-20cqh",
            right: "-14cqw",
            width: "52cqw",
            height: "52cqw",
            borderRadius: "50%",
            background:
              "radial-gradient(closest-side, rgba(30,64,175,0.10), transparent 72%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-26cqh",
            left: "-16cqw",
            width: "46cqw",
            height: "46cqw",
            borderRadius: "50%",
            background:
              "radial-gradient(closest-side, rgba(15,118,110,0.09), transparent 72%)",
          }}
        />

        <div key={index} className="relative z-[1] w-full h-full animate-slide-in">
          <Slide />
        </div>

        {/* Tap zones — left/right thirds click to navigate (mobile-friendly) */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-[3] cursor-pointer" aria-hidden="true">
          <div
            className="absolute inset-y-0 left-0 w-full transition-opacity duration-200"
            style={{
              opacity: flash === "prev" ? 1 : 0,
              background:
                "linear-gradient(90deg, rgba(30,64,175,0.16), transparent 85%)",
            }}
          />
        </div>
        <div className="absolute inset-y-0 right-0 w-1/3 z-[3] cursor-pointer" aria-hidden="true">
          <div
            className="absolute inset-y-0 right-0 w-full transition-opacity duration-200"
            style={{
              opacity: flash === "next" ? 1 : 0,
              background:
                "linear-gradient(270deg, rgba(15,118,110,0.16), transparent 85%)",
            }}
          />
        </div>

        {/* Slide counter — inside the canvas, bottom-right */}
        <div
          className="absolute bottom-[1cqh] right-[1.4cqw] z-[2] text-[1.8cqh] font-extrabold tabular-nums select-none pointer-events-none"
          style={{ color: "#0f172a" }}
        >
          {index + 1}
        </div>
      </div>

      {/* Fullscreen toggle — only shown when NOT in fullscreen (use Esc / F to exit) */}
      {!isFs && (
        <button
          onClick={toggleFullscreen}
          title="Enter fullscreen (F)"
          aria-label="Enter fullscreen"
          className="fixed top-4 right-4 z-[110] flex items-center justify-center w-11 h-11 rounded-lg border-0 cursor-pointer text-white/80 hover:text-white"
          style={{ background: "rgba(15,23,42,0.6)" }}
        >
          <Maximize size={20} />
        </button>
      )}

      {/* One-time hint (does not print/interfere) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[110] text-[13px] font-medium text-white/50 select-none pointer-events-none text-center px-4">
        Tap / click the sides · ← → · swipe · F for fullscreen
      </div>
    </div>
  );
}
