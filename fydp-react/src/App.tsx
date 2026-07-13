import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SiteNav } from '@/components/layout/SiteNav';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { OverviewPage } from '@/pages/OverviewPage';
import { IdeaDetailPage } from '@/pages/IdeaDetailPage';
import { ConclusionPage } from '@/pages/ConclusionPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { ProposalPage } from '@/pages/ProposalPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <SiteNav />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/idea/:id" element={<IdeaDetailPage />} />
            <Route path="/conclusion" element={<ConclusionPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/proposal" element={<ProposalPage />} />
          </Routes>
        </div>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}

export default App;
