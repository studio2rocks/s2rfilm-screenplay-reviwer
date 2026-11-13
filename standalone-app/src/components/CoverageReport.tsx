import React from 'react';
import { FullCoverageReport } from '../types/script';
import { 
  Award, 
  Download, 
  FileCode, 
  Printer, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Compass,
  Film
} from 'lucide-react';
import { exportCoverageReportToDocx, exportCoverageToJson } from '../utils/fileExporter';

interface CoverageReportProps {
  coverage: FullCoverageReport;
  onNavigateToWorkshop?: () => void;
  onNavigateToDoctor?: () => void;
}

export const CoverageReport: React.FC<CoverageReportProps> = ({
  coverage,
  onNavigateToWorkshop,
  onNavigateToDoctor
}) => {
  const getVerdictStyle = (verdict: FullCoverageReport['verdict']) => {
    switch (verdict) {
      case 'RECOMMEND':
        return {
          bg: 'bg-zinc-900 border-zinc-700 text-zinc-100',
          badge: 'bg-white text-zinc-950 font-extrabold shadow-sm',
          dot: 'bg-white'
        };
      case 'CONSIDER':
        return {
          bg: 'bg-zinc-900 border-zinc-750 text-zinc-200',
          badge: 'bg-zinc-200 text-zinc-950 font-extrabold',
          dot: 'bg-zinc-300'
        };
      case 'CONSIDER WITH RESERVATIONS':
        return {
          bg: 'bg-zinc-900/90 border-zinc-800 text-zinc-300',
          badge: 'bg-zinc-800 text-zinc-200 border border-zinc-600 font-bold',
          dot: 'bg-zinc-400'
        };
      case 'PASS':
        return {
          bg: 'bg-zinc-950 border-zinc-800 text-zinc-400',
          badge: 'bg-zinc-850 text-zinc-400 border border-zinc-750 font-bold',
          dot: 'bg-zinc-600'
        };
    }
  };

  const verdictStyle = getVerdictStyle(coverage.verdict);

  const scoresList = [
    { label: 'Premise & Hook Originality', value: coverage.craftScores.premiseOriginality, desc: 'Freshness of conceit vs market saturation' },
    { label: 'Structural Cohesion', value: coverage.craftScores.structuralCohesion, desc: 'Act engine, turning points, pacing symmetry' },
    { label: 'Character Depth & Agency', value: coverage.craftScores.characterDepthAndAgency, desc: 'Want vs need dialectic & proactive momentum' },
    { label: 'Dialogue Cadence & Subtext', value: coverage.craftScores.dialogueCadenceAndSubtext, desc: 'Ping-pong velocity & avoidance of on-the-nose exposition' },
    { label: 'Narrative Velocity', value: coverage.craftScores.narrativeVelocity, desc: 'Scene page-turn efficiency & urgency' },
    { label: 'Commercial Viability', value: coverage.craftScores.commercialViability, desc: 'Festival/theatrical/SVOD buyer appetite' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Action Bar for Exporting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800 no-print">
        <div>
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">
            Development Executive Coverage
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight mt-0.5">
            {coverage.metadata.title}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            By {coverage.metadata.author} · {coverage.metadata.genre} · {coverage.metadata.targetFormat} · {coverage.timestamp}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => exportCoverageReportToDocx(coverage)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-300" />
            <span>Word (.docx)</span>
          </button>
          <button
            onClick={() => exportCoverageToJson(coverage)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-zinc-300" />
            <span>JSON</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-300" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Hero Executive Verdict Card - Monochrome */}
      <div className={`border rounded-2xl p-5 sm:p-7 ${verdictStyle.bg} transition-all shadow-xl`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-zinc-800">
          <div>
            <span className="text-2xs uppercase tracking-wider font-semibold text-zinc-400">
              Hollywood Studio Executive Determination
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xl sm:text-3xl font-extrabold tracking-tight px-3 py-1 rounded-lg ${verdictStyle.badge}`}>
                {coverage.verdict}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <span className="text-2xs text-zinc-400 uppercase font-medium">Composite Score</span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
                {coverage.craftScores.overallScore}<span className="text-xs text-zinc-500 font-sans">/100</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="pt-5">
          <h4 className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Verdict Analysis & Dramaturgical Rationale
          </h4>
          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
            {coverage.verdictRationale}
          </p>
        </div>
      </div>

      {/* Logline & Synopsis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-1 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center gap-2 text-zinc-200">
            <Compass className="w-4 h-4 text-zinc-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Commercial Logline
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
            "{coverage.logline}"
          </p>

          <div className="pt-3 border-t border-zinc-800">
            <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
              Market Comparables
            </span>
            <div className="space-y-1">
              {coverage.marketComparables.map((comp, idx) => (
                <div key={idx} className="text-xs text-zinc-300 flex items-start gap-1.5">
                  <span className="text-zinc-400 font-bold">▸</span>
                  <span>{comp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-zinc-200">
            <Film className="w-4 h-4 text-zinc-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              3-Act Narrative Synopsis
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {coverage.synopsis}
          </p>
        </div>
      </div>

      {/* Craft Scores Breakdown Grid in Crisp Monochrome */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">
              Craft & Commercial Viability Ratings
            </h3>
            <p className="text-2xs text-zinc-400 mt-0.5">
              Calibrated metrics scored against competitive studio submissions.
            </p>
          </div>
          <TrendingUp className="w-4 h-4 text-zinc-300" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scoresList.map((item, idx) => {
            const pct = item.value;
            return (
              <div key={idx} className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{item.label}</span>
                  <span className="font-mono font-bold text-white tabular-nums">{item.value}/100</span>
                </div>
                {/* Monochrome progress track */}
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-white"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-2xs text-zinc-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voice Safeguard Fingerprint Certificate - Monochrome */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400">
                S2RFilm Voice Safeguard Certificate
              </span>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 mt-0.5">
                Authorial Fingerprint & Tonal Palette Protection
              </h3>
            </div>
          </div>
          <span className="text-2xs text-zinc-300 font-mono hidden sm:inline-block">
            AUTHENTIC VOICE VERIFIED
          </span>
        </div>

        <div className="space-y-3.5">
          <div>
            <span className="text-2xs uppercase font-medium text-zinc-400 block mb-0.5">
              Detected Signature Voice:
            </span>
            <p className="text-xs sm:text-sm font-medium text-zinc-200">
              {coverage.voiceSafeguard.signatureTone}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <div className="bg-zinc-950/60 rounded-xl p-3.5 border border-zinc-800">
              <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Tonal Palette Elements
              </span>
              <ul className="space-y-1 text-2xs sm:text-xs text-zinc-300">
                {coverage.voiceSafeguard.tonalPalette.map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-zinc-400 font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-950/60 rounded-xl p-3.5 border border-zinc-800">
              <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Hollywood Clichés Avoided
              </span>
              <ul className="space-y-1 text-2xs sm:text-xs text-zinc-300">
                {coverage.voiceSafeguard.clichéTrapsAvoided.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-white font-bold">✓</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-2xs text-zinc-300 font-mono">
            {coverage.voiceSafeguard.safeguardCertification}
          </div>
        </div>
      </div>

      {/* Strengths & Critical Doctor Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-zinc-200">
            <CheckCircle className="w-4 h-4 text-zinc-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Key Script Strengths
            </h3>
          </div>
          <ul className="space-y-2">
            {coverage.keyStrengths.map((str, idx) => (
              <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                <span className="text-zinc-400 font-bold shrink-0">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-zinc-200">
            <AlertTriangle className="w-4 h-4 text-zinc-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Critical Script Doctor Notes
            </h3>
          </div>
          <ul className="space-y-2">
            {coverage.criticalDoctorNotes.map((note, idx) => (
              <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                <span className="text-zinc-400 font-bold shrink-0">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
};
