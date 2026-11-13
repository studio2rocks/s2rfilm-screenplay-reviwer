import React from 'react';
import { CharacterArc } from '../types/script';
import { Users, Target, Heart, ShieldAlert, Sparkles } from 'lucide-react';

interface CharacterArcsViewProps {
  arcs: CharacterArc[];
}

export const CharacterArcsView: React.FC<CharacterArcsViewProps> = ({ arcs }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">
          Dramaturgical Psychology
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight mt-0.5">
          Character Arcs & Dramatic Agency Matrix
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Maps the conscious external objective (Want) against the unconscious emotional transformation (Need), measuring proactive dramatic agency.
        </p>
      </div>

      {arcs.length === 0 ? (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
          <Users className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm">No speaking characters detected for arc mapping.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {arcs.map((char, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-zinc-700 transition-colors shadow-md"
            >
              {/* Character Name & Role Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-mono font-bold text-base">
                    {char.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-zinc-100 font-mono tracking-tight">
                        {char.name}
                      </h3>
                      <span className="text-3xs font-semibold uppercase px-2 py-0.5 rounded-md border bg-zinc-800 text-zinc-200 border-zinc-750">
                        {char.role}
                      </span>
                    </div>
                    <span className="text-2xs text-zinc-400 font-medium mt-0.5 inline-block">
                      {char.arcTrajectory}
                    </span>
                  </div>
                </div>

                {/* Agency Gauge in Monochrome */}
                <div className="bg-zinc-950/70 border border-zinc-800 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shrink-0">
                  <div>
                    <span className="text-3xs text-zinc-500 uppercase font-medium block">Dramatic Agency</span>
                    <span className="text-2xs text-zinc-400">Proactive momentum</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-mono font-bold text-white tabular-nums">
                      {char.agencyScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Want vs. Need Split Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Dramatic Want */}
                <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <Target className="w-3.5 h-3.5 text-zinc-300" />
                    <span className="text-2xs font-bold uppercase tracking-wider text-zinc-300">
                      Dramatic Want (Conscious External Goal)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    {char.dramaticWant}
                  </p>
                </div>

                {/* Emotional Need */}
                <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <Heart className="w-3.5 h-3.5 text-zinc-300" />
                    <span className="text-2xs font-bold uppercase tracking-wider text-zinc-300">
                      Emotional Need (Internal Transformation)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    {char.emotionalNeed}
                  </p>
                </div>
              </div>

              {/* Fatal Flaw & Turning Point */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="flex items-start gap-2.5 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800">
                  <div className="p-1 rounded-lg bg-zinc-800 text-zinc-300 shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-3xs uppercase font-semibold text-zinc-500 block">
                      Fatal Flaw / Defense Mechanism
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed mt-0.5">
                      {char.fatalFlaw}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800">
                  <div className="p-1 rounded-lg bg-zinc-800 text-zinc-300 shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-3xs uppercase font-semibold text-zinc-500 block">
                      Key Inflection / Turning Point
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed mt-0.5">
                      {char.keyTurningPoint}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dramaturgical Notes */}
              <div className="p-2.5 bg-zinc-950/60 rounded-xl text-2xs text-zinc-400 border border-zinc-800">
                <span className="font-semibold text-zinc-300 mr-1.5">Doctor Diagnosis:</span>
                {char.arcNotes}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
