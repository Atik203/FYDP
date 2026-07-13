import { useParams, Navigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionTitle, ColBox, TwoCol } from '@/components/shared/Section';
import { KpiRow } from '@/components/shared/KpiRow';
import { Callout } from '@/components/shared/Callout';
import { InfoGrid } from '@/components/shared/InfoGrid';
import { ideaMetadata } from '@/data/ideas';
import { Idea1Content } from './ideas/Idea1Content';
import { Idea2Content } from './ideas/Idea2Content';
import { Idea3Content } from './ideas/Idea3Content';
import { Idea4Content } from './ideas/Idea4Content';
import { Idea5Content } from './ideas/Idea5Content';

const ideaContentMap: Record<number, React.ComponentType> = {
  1: Idea1Content,
  2: Idea2Content,
  3: Idea3Content,
  4: Idea4Content,
  5: Idea5Content,
};

export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ideaId = parseInt(id ?? '1', 10);
  const idea = ideaMetadata.find((m) => m.id === ideaId);

  if (!idea) return <Navigate to="/" replace />;

  const ContentComponent = ideaContentMap[ideaId];

  return (
    <>
      <PageHeader
        docType={idea.docType}
        label="Project Idea Title"
        title={idea.title}
        subtitle={idea.subtitle}
        coverItems={idea.coverItems}
      />

      <main className="max-w-[1150px] mx-auto my-10 px-5">
        {/* At a Glance KPIs */}
        <Section>
          <SectionTitle icon="📊">At a Glance</SectionTitle>
          <KpiRow kpis={idea.kpis} />
          {idea.warningCallout && (
            <Callout variant={idea.warningCallout.variant} title={idea.warningCallout.title} className="mt-5">
              {idea.warningCallout.body}
            </Callout>
          )}
        </Section>

        {/* Idea-specific rich content */}
        <ContentComponent />
      </main>
    </>
  );
}
