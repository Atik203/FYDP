import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionTitle } from '@/components/shared/Section';
import { Callout } from '@/components/shared/Callout';
import { paperStages } from '@/data/papers';
import type { Priority, ReadPhase } from '@/data/papers';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, ExternalLink, AlertTriangle, CheckCircle, Clock, BookOpen, Brain, FlaskConical, Target, Wrench, BarChart3 } from 'lucide-react';

const stageIcons = [BookOpen, Brain, FlaskConical, Target, Wrench, BarChart3];

const priorityStyles: Record<Priority, string> = {
  critical: 'bg-[#e03131]/10 text-[#e03131] dark:bg-[#e03131]/20 dark:text-[#fca5a5] border-[#e03131]/30',
  high:     'bg-[#f08c00]/10 text-[#f08c00] dark:bg-[#f08c00]/20 dark:text-[#fcd34d] border-[#f08c00]/30',
  medium:   'bg-[#1c7ed6]/10 text-[#1c7ed6] dark:bg-[#1c7ed6]/20 dark:text-[#93c5fd] border-[#1c7ed6]/30',
};

const phaseLabels: Record<ReadPhase, string> = {
  phase0:      'Before Phase 0',
  impl:        'During Implementation',
  experiments: 'Before Experiments',
  writing:     'Before Writing',
};

const phaseColors: Record<ReadPhase, string> = {
  phase0:      'bg-[#7c3aed]',
  impl:        'bg-[#0ca678]',
  experiments: 'bg-[#f08c00]',
  writing:     'bg-[#e03131]',
};

function PaperCard({ paper }: { paper: (typeof paperStages)[number]['papers'][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] rounded-lg bg-white dark:bg-[#1a1d35] overflow-hidden transition-shadow hover:shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-3.5 text-left cursor-pointer bg-transparent border-0"
      >
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#3b5bdb]/10 dark:bg-[#3b5bdb]/20 text-[#3b5bdb] dark:text-[#93c5fd] text-[11px] font-bold flex-shrink-0 mt-0.5">
          {paper.id}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <span className="text-sm font-semibold text-[#1e2d3d] dark:text-[#e2e8f0] leading-snug">{paper.title}</span>
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border flex-shrink-0 mt-0.5',
              priorityStyles[paper.priority]
            )}>
              {paper.priority}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#64748b] dark:text-[#94a3b8]">
            <span>{paper.authors}</span>
            <span className="flex items-center gap-1">
              {paper.verified ? <CheckCircle size={10} className="text-[#0ca678]" /> : <AlertTriangle size={10} className="text-[#f08c00]" />}
              {paper.venue}
            </span>
          </div>
        </div>
        <span className="flex-shrink-0 text-[#94a3b8] mt-1">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 pt-0 border-t border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
            <div className="flex items-center gap-2 text-xs text-[#64748b] dark:text-[#94a3b8]">
              <Clock size={13} />
              <span className="font-medium">{paper.readTime}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748b] dark:text-[#94a3b8]">
              <span className="font-medium">Difficulty:</span>
              <span className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                paper.difficulty === 'Beginner' && 'text-[#0ca678] bg-[#0ca678]/10',
                paper.difficulty === 'Intermediate' && 'text-[#1c7ed6] bg-[#1c7ed6]/10',
                paper.difficulty === 'Advanced' && 'text-[#f08c00] bg-[#f08c00]/10',
                paper.difficulty === 'Expert' && 'text-[#e03131] bg-[#e03131]/10',
              )}>
                {paper.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold text-white', phaseColors[paper.phase])}>
                {phaseLabels[paper.phase]}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs leading-relaxed">
            <div>
              <span className="font-semibold text-[#1e2d3d] dark:text-[#e2e8f0]">What to read: </span>
              <span className="text-[#64748b] dark:text-[#94a3b8]">{paper.readSections}</span>
            </div>
            <div>
              <span className="font-semibold text-[#1e2d3d] dark:text-[#e2e8f0]">Why important: </span>
              <span className="text-[#64748b] dark:text-[#94a3b8]">{paper.whyImportant}</span>
            </div>
            <div>
              <span className="font-semibold text-[#1e2d3d] dark:text-[#e2e8f0]">Key takeaways: </span>
              <span className="text-[#64748b] dark:text-[#94a3b8]">{paper.keyTakeaways}</span>
            </div>
            {paper.note && (
              <div className="flex items-start gap-1.5 p-2 rounded bg-[#f08c00]/5 dark:bg-[#f08c00]/10 border border-[#f08c00]/20">
                <AlertTriangle size={12} className="text-[#f08c00] mt-0.5 flex-shrink-0" />
                <span className="text-[#f08c00] dark:text-[#fcd34d] font-medium">{paper.note}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PapersPage() {
  const [allOpen, setAllOpen] = useState(false);

  return (
    <>
      <PageHeader
        docType="FYDP Literature Roadmap · Idea 1"
        title={<>Research Literature<br />Reading Roadmap</>}
        subtitle="35 papers across 6 stages · Verified publication status · Reading timeline · Priority & difficulty"
        coverItems={[
          { label: 'Total Papers', value: '35' },
          { label: 'Critical Priority', value: '12' },
          { label: 'Last Verified', value: 'Jul 2026' },
          { label: 'Tracking Tool', value: 'Zotero + Shared Matrix' },
        ]}
      />

      <main className="max-w-[1150px] mx-auto my-10 px-4 sm:px-5">
        {/* Methodology note */}
        <Callout variant="info" title="ℹ Verification Methodology" className="mb-7">
          <p className="text-sm mb-2">
            Stage 4 (Closest Related Work) and every 2024–2026 paper has been checked via live search — publication
            status, venue, and DOI are current as of July 2026. Older foundational papers (Stages 1, 5, 6) are
            well-established, high-confidence citations. <strong>Re-verify all Stage 4 papers before final
            thesis submission</strong> — this subfield moves fast (three status changes happened during compilation).
          </p>
        </Callout>

        {/* Quick overview chips */}
        <div className="flex flex-wrap gap-2 mb-6 print:hidden">
          <button
            onClick={() => setAllOpen(!allOpen)}
            className="px-3 py-1.5 rounded-lg bg-[#3b5bdb]/10 dark:bg-[#3b5bdb]/20 text-[#3b5bdb] dark:text-[#93c5fd] text-xs font-semibold hover:bg-[#3b5bdb]/20 dark:hover:bg-[#3b5bdb]/30 transition-colors border-0 cursor-pointer"
          >
            {allOpen ? 'Collapse All' : 'Expand All'}
          </button>
          {(['critical', 'high', 'medium'] as const).map((p) => (
            <span key={p} className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
              priorityStyles[p]
            )}>
              {p}
            </span>
          ))}
        </div>

        {/* Stages */}
        {paperStages.map((stage, si) => {
          const Icon = stageIcons[si];
          return (
            <Section key={stage.title} className="animate-fade-up" accent={si === 3 ? 'rose' : si === 1 ? 'blue' : si === 0 ? 'teal' : 'none'}>
              <SectionTitle icon={Icon} className="mb-4">
                {stage.title}
              </SectionTitle>
              <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mb-4">{stage.description}</p>
              <div className="space-y-2.5">
                {stage.papers.map((paper) => (
                  <PaperCard key={paper.id} paper={allOpen ? { ...paper } : paper} />
                ))}
              </div>
            </Section>
          );
        })}

        {/* Reading Timeline Summary */}
        <Section className="animate-fade-up">
          <SectionTitle icon={Clock}>Reading Timeline (per Phase)</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { pid: 'p0', label: 'Before Implementation', desc: 'Papers 1-3, 7-9, 14-15, 21-22, 24, 35. ~20h across team, parallelizable.', color: 'bg-[#7c3aed]' },
              { pid: 'p1', label: 'During Implementation', desc: 'Papers 4, 10, 15 (re-read), 26, 30-31. Read before building specific components.', color: 'bg-[#0ca678]' },
              { pid: 'p2', label: 'Before Experiments', desc: 'Papers 6, 18-20, 28-29, 32-34. Read before finalizing eval pipeline.', color: 'bg-[#f08c00]' },
              { pid: 'p3', label: 'Before Writing', desc: 'Papers 21-25, 27. Re-read for sharp related-work differentiation.', color: 'bg-[#e03131]' },
            ].map((ph) => (
              <div key={ph.pid} className="rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={'w-2.5 h-2.5 rounded-full ' + ph.color} />
                  <h4 className="text-sm font-bold text-[#1e2d3d] dark:text-[#e2e8f0]">{ph.label}</h4>
                </div>
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">{ph.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Living tracker tools */}
        <Section className="animate-fade-up">
          <SectionTitle icon={Brain}>Living Literature Tracker</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'Alerts', desc: 'arXiv (cs.CL, cs.AI, cs.MA) + Google Scholar alerts for "multi-agent debate", "sycophancy", "trust calibration", "evidence-grounded"' },
              { title: 'Venues to Monitor', desc: 'ACL, EMNLP, NAACL, NeurIPS, ICLR, ICML, AAAI — where closest competing work has historically landed' },
              { title: 'Tooling', desc: 'Zotero (free, BibTeX export) + shared Notion/spreadsheet matrix with columns: venue (verified), arXiv ID, contribution, limitation, relevance, last-verified-date' },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] p-4">
                <h4 className="text-sm font-bold mb-1 text-[#1e2d3d] dark:text-[#e2e8f0]">{title}</h4>
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[#64748b] dark:text-[#94a3b8] p-3 rounded-lg bg-[#fff3bf]/30 dark:bg-[rgba(240,140,0,0.1)] border border-[#f08c00]/20">
            <strong>⚠ Best practice:</strong> Re-check every Stage 4 paper's status if its "last verified" date is
            more than ~2 months old by the time it's actually cited in the thesis. This single practice would have
            caught both surprises (iMAD venue update, Yao et al. withdrawal) automatically.
          </p>
        </Section>
      </main>
    </>
  );
}