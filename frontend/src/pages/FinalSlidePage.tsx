import { SlideDeck } from "@/components/shared/SlideDeck";
import { FINAL_SLIDES, FINAL_SLIDES_COMPACT } from "@/pages/FinalSlides";

/* Full final-defence deck — route /slide/final (18 slides). */
export function FinalSlidePage() {
  return <SlideDeck slides={FINAL_SLIDES} />;
}

/* Compact final-defence deck — route /slide/final/1 (14 slides). */
export function FinalCompactSlidePage() {
  return <SlideDeck slides={FINAL_SLIDES_COMPACT} />;
}
