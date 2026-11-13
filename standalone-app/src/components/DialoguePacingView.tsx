import React from 'react';
import { DialoguePacingMetrics } from '../types/script';
import { MessageSquare, Zap, AlertCircle, Sparkles, User, Activity } from 'lucide-react';

interface DialoguePacingViewProps {
  metrics: DialoguePacingMetrics;
  onNavigateToWorkshop?: () => void;
}

export const DialoguePacingView: React.FC<DialoguePacingViewProps> = ({
  metrics,
  onNavigateToWorkshop
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">
          Acoustic & Rhythm Engine
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight mt-0.5">
          Dialogue Cadence & Pacing Audit
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Line-by-line inspection of dialogue speed, white-space balance, subtext density, and character voice differentiation.
        </p>
      </div>

      {/* Top Velocity & Balance KPI Cards in Monochrome */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Dialogue to Action Ratio */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-2xs font-medium uppercase tracking-wider">Page Balance</span>
            <Activity className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white tabular-nums">
              {metrics.dialoguePercentage}%
            </span>
            <span className="text-2xs text-zinc-400">Dialogue / {metrics.actionPercentage}% Action</span>
          </div>
          {/* Dual monochrome bar */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full flex overflow-hidden">
            <div className="bg-white h-full" style={{ width: `${metrics.dialoguePercentage}%` }} />
            <div className="bg-zinc-600 h-full" style={{ width: `${metrics.actionPercentage}%` }} />
          </div>
        </div>

        {/* Average Dialogue Length */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-2xs font-medium uppercase tracking-wider">Words per Beat</span>
            <MessageSquare className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white tabular-nums">
              {metrics.averageDialogueLengthWords}
            </span>
            <span className="text-2xs text-zinc-400">words / line</span>
          </div>
          <p className="text-2xs text-zinc-400">
            {metrics.averageDialogueLengthWords < 12 
              ? 'Fast-paced ping-pong rhythm' 
              : metrics.averageDialogueLengthWords > 24 
              ? 'Rich, theatrical monologues' 
              : 'Balanced conversational tempo'}
          </p>
        </div>

        {/* Subtext Density Score */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-2xs font-medium uppercase tracking-wider">Subtext Density</span>
            <Zap className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white tabular-nums">
              {metrics.subtextDensityScore}
            </span>
            <span className="text-2xs text-zinc-400">/ 100</span>
          </div>
          <p className="text-2xs text-zinc-400">
            Measures avoidance of on-the-nose exposition and hidden emotional subcurrents.
          </p>
        </div>

        {/* Cadence Archetype */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-2xs font-medium uppercase tracking-wider">Cadence Profile</span>
            <Sparkles className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-xs font-semibold text-zinc-200 line-clamp-2">
            {metrics.overallCadenceProfile}
          </div>
          <p className="text-3xs text-zinc-500">
            Calculated from line length distribution & syntactic patterns.
          </p>
        </div>

      </div>

      {/* Character Voice Profiles (Differentiation Engine) */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">
              Character Voice Differentiation & Idiosyncrasy Matrix
            </h3>
            <p className="text-2xs text-zinc-400 mt-0.5">
              Ensures each character speaks with unique syntax, vocabulary richness, and psychological perspective.
            </p>
          </div>
          <User className="w-4 h-4 text-zinc-300" />
        </div>

        {metrics.characterVoices.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-4">
            No recurring speaking characters detected. Add formatted dialogue blocks to inspect voice differentiation.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {metrics.characterVoices.map((char, idx) => (
              <div key={idx} className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-100 font-mono tracking-wide">
                      {char.character}
                    </h4>
                    <span className="text-2xs text-zinc-400 font-medium">
                      {char.dominantCadence}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xs text-zinc-500 block">Distinctiveness</span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-white tabular-nums">
                      {char.distinctivenessScore}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-y border-zinc-800 text-center font-mono">
                  <div className="bg-zinc-900/60 p-1.5 rounded-lg">
                    <span className="text-zinc-500 text-3xs block">LINES</span>
                    <span className="text-xs font-semibold text-zinc-200 tabular-nums">{char.lineCount}</span>
                  </div>
                  <div className="bg-zinc-900/60 p-1.5 rounded-lg">
                    <span className="text-zinc-500 text-3xs block">AVG WORDS</span>
                    <span className="text-xs font-semibold text-zinc-200 tabular-nums">{char.avgWordsPerLine}</span>
                  </div>
                  <div className="bg-zinc-900/60 p-1.5 rounded-lg">
                    <span className="text-zinc-500 text-3xs block">VOCAB</span>
                    <span className="text-xs font-semibold text-zinc-200 tabular-nums">{char.vocabularyRichness}%</span>
                  </div>
                </div>

                {char.sampleDialogue && (
                  <div className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-3xs font-semibold text-zinc-500 uppercase block mb-0.5">
                      Sample Beat:
                    </span>
                    <p className="text-xs text-zinc-300 font-screenplay italic">
                      "{char.sampleDialogue}"
                    </p>
                  </div>
                )}

                <p className="text-2xs text-zinc-400 leading-relaxed">
                  {char.voiceNotes}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subtext Tracker & On-The-Nose Warnings in Monochrome */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">
              Subtext Density & On-The-Nose Dialogue Tracker
            </h3>
            <p className="text-2xs text-zinc-400 mt-0.5">
              Flags lines where characters state their internal emotions or backstory directly instead of behaving through subtext.
            </p>
          </div>
          <AlertCircle className="w-4 h-4 text-zinc-300" />
        </div>

        {metrics.onTheNoseWarnings.length === 0 ? (
          <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center gap-2">
            <span className="text-white font-bold">✓</span>
            <span>No critical on-the-nose expository crutches detected. Dialogue exhibits strong subtextual discipline.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.onTheNoseWarnings.map((warning, idx) => (
              <div key={idx} className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    Speaker: {warning.speaker}
                  </span>
                  <span className="text-2xs text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded font-mono">
                    Expository Risk
                  </span>
                </div>

                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <span className="text-3xs text-zinc-500 font-medium block mb-0.5">Flagged Line:</span>
                  <p className="text-xs font-screenplay text-zinc-200">
                    "{warning.line}"
                  </p>
                </div>

                <div className="text-2xs text-zinc-400 space-y-0.5">
                  <div>
                    <span className="text-zinc-500 font-medium mr-1.5">Diagnosis:</span>
                    <span>{warning.reason}</span>
                  </div>
                  <div>
                    <span className="text-zinc-300 font-medium mr-1.5">Subtextual Pivot:</span>
                    <span className="text-zinc-300">{warning.suggestedSubtext}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
