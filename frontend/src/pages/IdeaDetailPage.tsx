import { PageHeader } from '@/components/layout/PageHeader';
import { DocsToc } from '@/components/shared/DocsToc';
import { Section, SectionTitle } from '@/components/shared/Section';
import { KpiRow } from '@/components/shared/KpiRow';
import { BarChart3 } from 'lucide-react';
import { ideaMetadata } from '@/data/ideas';
import { IDEA1_SECTIONS, Idea1Content } from './ideas/Idea1Content';

const idea = ideaMetadata[0];

export function IdeaDetailPage() {
  return (
    <>
      <PageHeader
        docType={idea.docType}
        label="Project Idea"
        title={idea.title}
        subtitle={idea.subtitle}
        coverItems={idea.coverItems}
      />

      <div className="mx-auto my-10 flex max-w-[1400px] flex-col px-4 sm:px-5 lg:flex-row lg:gap-10">
        <DocsToc sections={[...IDEA1_SECTIONS]} title="Blueprint contents" />

        <main className="min-w-0 flex-1 lg:max-w-[1150px]">
          <Section>
            <SectionTitle icon={BarChart3}>At a Glance</SectionTitle>
            <KpiRow kpis={idea.kpis} />
          </Section>

          <Idea1Content />
        </main>
      </div>
    </>
  );
}
