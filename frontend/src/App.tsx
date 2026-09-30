import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNav } from "@/components/layout/SiteNav";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { ThemeProvider } from "@/context/ThemeContext";
import { IdeaDetailPage } from "@/pages/IdeaDetailPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { PapersPage } from "@/pages/PapersPage";
import { ProposalPage } from "@/pages/ProposalPage";
import { RoadmapPage } from "@/pages/RoadmapPage";
import { FinalCompactSlidePage, FinalSlidePage } from "@/pages/FinalSlidePage";
import { SlidePage } from "@/pages/SlidePage";
import { SlidesCePage } from "@/pages/SlidesCePage";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/idea/1" element={<IdeaDetailPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/papers" element={<PapersPage />} />
          <Route path="/proposal" element={<ProposalPage />} />
        </Routes>
      </div>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone presentation decks — intentionally not in the navbar.
              Main deck: /slide · Complex Engineering: /slide/ce
              Final defence: /slide/final (18 slides) · compact: /slide/final/1 (14 slides) */}
          <Route path="/slide" element={<SlidePage />} />
          <Route path="/slide/ce" element={<SlidesCePage />} />
          <Route path="/slide/final" element={<FinalSlidePage />} />
          <Route path="/slide/final/1" element={<FinalCompactSlidePage />} />
          <Route path="/*" element={<SiteLayout />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
