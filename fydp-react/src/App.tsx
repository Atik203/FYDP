import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNav } from "@/components/layout/SiteNav";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { ThemeProvider } from "@/context/ThemeContext";
import { IdeaDetailPage } from "@/pages/IdeaDetailPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { ProposalPage } from "@/pages/ProposalPage";
import { RoadmapPage } from "@/pages/RoadmapPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <SiteNav />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/idea/1" element={<IdeaDetailPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/proposal" element={<ProposalPage />} />
            </Routes>
          </div>
          <SiteFooter />
          <ScrollToTop />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
