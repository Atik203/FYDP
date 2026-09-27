import { Maximize } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";

/* ────────────────────────────────────────────────────────────────
   Shared projector-safe slide deck chrome.
   - 16:9 canvas, letterboxed on any screen
   - Keyboard-only navigation: ← → , PageUp/PageDown (clicker), Home/End
   - Press F to toggle fullscreen
   ──────────────────────────────────────────────────────────────── */

export function SlideDeck({ slides }: { slides: ComponentType[] }) {
  const [index, setIndex] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (dir: number) => {
      setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + dir)));
    },
    [slides.length],
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
      style={{ background: "#1e293b" }}
    >
      {/* 16:9 slide canvas — fills height, letterboxes width */}
      <div
        className="relative bg-white shadow-2xl"
        style={{
          aspectRatio: "16 / 9",
          width: "min(100vw, calc(100vh * 16 / 9))",
          height: "min(100vh, calc(100vw * 9 / 16))",
          containerType: "size",
        }}
      >
        <div key={index} className="w-full h-full animate-fade-in">
          <Slide />
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
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[110] text-[13px] font-medium text-white/50 select-none pointer-events-none">
        ← → to navigate · F for fullscreen
      </div>
    </div>
  );
}
