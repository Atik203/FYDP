import { SlideDeck } from "@/components/shared/SlideDeck";
import { CE_DECK_SLIDES } from "@/pages/SlidePage";

export function SlidesCePage() {
  return <SlideDeck slides={CE_DECK_SLIDES} />;
}
