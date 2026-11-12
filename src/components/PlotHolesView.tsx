import React, { useState } from 'react';
import { PlotHoleIssue, PlotHoleSeverity } from '../types/script';
import { CheckCircle2, Wrench } from 'lucide-react';

interface PlotHolesViewProps {
  issues: PlotHoleIssue[];
}

export const PlotHolesView: React.FC<PlotHolesViewProps> = ({ issues }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredIssues = issues.filter(issue => {
    if (selectedSeverity === 'all') return true;
    return issue.severity.toLowerCase() === selectedSeverity.toLowerCase();
  });

  const getSeverityStyle = (severity: PlotHoleSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-zinc-800 text-white border-zinc-600 font-bold';
      case 'Moderate':
        return 'bg-zinc-850 text-zinc-200 border-zinc-700 font-semibold';
      case 'Minor':
        return 'bg-zinc-900 text-zinc-400 border-zinc-800';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">
            Continuity & Logic Seam Auditor
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight mt-0.5">
            Plot Holes, Logic Traps & Continuity Risks
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Spots temporal inconsistencies, unexplained knowledge leaps, and unearned payoffs with surgical non-destructive fixes.
          </p>
        </div>

        {/* Monochrome Segmented Filter Controls */}
        <div className="flex items-center gap-1 p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg self-start sm:self-auto text-xs">
          {['all', 'critical', 'moderate', 'minor'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 text-2xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-zinc-800 text-white font-semibold shadow-2xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400">
          <CheckCircle2 className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
          <p className="text-sm font-medium">No {selectedSeverity !== 'all' ? selectedSeverity : ''} plot holes or continuity seams found.</p>
          <p className="text-xs text-zinc-500 mt-1">Script demonstrates airtight causality and consistent character knowledge.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-3.5 hover:border-zinc-700 transition-colors shadow-md"
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 pb-2.5 border-b border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-3xs uppercase px-2 py-0.5 rounded-md border ${getSeverityStyle(issue.severity)}`}>
                      {issue.severity} Severity
                    </span>
                    <span className="text-3xs font-medium text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700">
                      {issue.category}
                    </span>
                    <span className="text-2xs text-zinc-400 font-mono">
                      Location: {issue.sceneReference}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">
                    {issue.title}
                  </h3>
                </div>
              </div>

              {/* Description & Dramatic Impact */}
              <div className="space-y-2.5">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {issue.description}
                </p>

                <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800 text-2xs">
                  <span className="text-zinc-500 font-semibold uppercase block mb-0.5">Story / Reader Impact:</span>
                  <p className="text-zinc-300 leading-relaxed">
                    {issue.impactOnStory}
                  </p>
                </div>
              </div>

              {/* Non-Destructive Surgical Solution - Monochrome */}
              <div className="bg-zinc-950 border border-zinc-700/80 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-200">
                  <Wrench className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="text-2xs font-bold uppercase tracking-wider text-white">
                    S2R Non-Destructive Surgical Fix
                  </span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {issue.surgicalFix}
                </p>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
