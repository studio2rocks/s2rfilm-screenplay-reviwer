import React, { useState } from 'react';
import { StructureAct, TensionPoint } from '../types/script';
import { GitBranch, Activity } from 'lucide-react';

interface StructureViewProps {
  acts: StructureAct[];
  tensionCurve: TensionPoint[];
}

export const StructureView: React.FC<StructureViewProps> = ({
  acts,
  tensionCurve
}) => {
  const [activePointIndex, setActivePointIndex] = useState<number>(4); // Default to midpoint

  const activePoint = tensionCurve[activePointIndex] || tensionCurve[0];

  // SVG dimensions for Tension Curve Graph
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;

  const pointsCount = Math.max(1, tensionCurve.length - 1);
  const stepX = (width - paddingX * 2) / pointsCount;

  // Calculate coordinates
  const coords = tensionCurve.map((pt, i) => {
    const x = paddingX + i * stepX;
    const y = height - paddingY - (pt.intensity / 100) * (height - paddingY * 2);
    return { x, y, pt, index: i };
  });

  // Build SVG path
  let pathD = '';
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const mx = (p0.x + p1.x) / 2;
      pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  // Area under curve
  const areaD = `${pathD} L ${coords[coords.length - 1]?.x || 0} ${height - paddingY} L ${coords[0]?.x || 0} ${height - paddingY} Z`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">
          Macro-Architecture & Narrative Velocity
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight mt-0.5">
          Structure & Tension Curve Visualization
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Dynamic dramatic velocity mapping across standard 3-act Hollywood architecture, tracking pacing inflection points.
        </p>
      </div>

      {/* Interactive Tension Curve Chart in Monochrome */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-7 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-300" />
              <span>Dramatic Tension & Narrative Velocity Curve</span>
            </h3>
            <p className="text-2xs text-zinc-400 mt-0.5">
              Click any node on the curve to inspect dramatic phase dynamics.
            </p>
          </div>

          {activePoint && (
            <div className="bg-zinc-950/70 border border-zinc-800 px-3 py-1 rounded-xl flex items-center gap-2">
              <span className="text-3xs font-semibold uppercase text-zinc-500">Phase:</span>
              <span className="text-xs font-semibold text-white">{activePoint.tensionPhase}</span>
              <span className="text-zinc-700">|</span>
              <span className="text-xs font-mono font-bold text-zinc-200 tabular-nums">{activePoint.intensity}% Intensity</span>
            </div>
          )}
        </div>

        {/* SVG Monochrome Curve Container */}
        <div className="w-full overflow-x-auto no-scrollbar py-2">
          <div className="min-w-[650px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="monochromeCurveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                  <stop offset="80%" stopColor="#ffffff" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid Lines */}
              {[25, 50, 75, 100].map((level) => {
                const y = height - paddingY - (level / 100) * (height - paddingY * 2);
                return (
                  <g key={level}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="#27272a"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      fill="#52525b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {level}%
                    </text>
                  </g>
                );
              })}

              {/* Area fill in silver monochrome */}
              <path d={areaD} fill="url(#monochromeCurveGradient)" />

              {/* Curved line in crisp white */}
              <path
                d={pathD}
                fill="none"
                stroke="#f4f4f5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Nodes in Monochrome */}
              {coords.map((c) => {
                const isSelected = activePointIndex === c.index;
                return (
                  <g
                    key={c.index}
                    onClick={() => setActivePointIndex(c.index)}
                    className="cursor-pointer group"
                  >
                    {/* Ring for selected */}
                    {isSelected && (
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="11"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        opacity="0.8"
                      />
                    )}
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={isSelected ? '5.5' : '4'}
                      fill={isSelected ? '#ffffff' : '#18181b'}
                      stroke={isSelected ? '#ffffff' : '#a1a1aa'}
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-125"
                    />
                    {/* Node label */}
                    <text
                      x={c.x}
                      y={height - 8}
                      fill={isSelected ? '#ffffff' : '#71717a'}
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {c.pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Node Details Box */}
        {activePoint && (
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white">
                  {activePoint.label}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-zinc-400">
                  {activePoint.tensionPhase} (Scene {activePoint.sceneNumber})
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                {activePoint.summary}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-3xs text-zinc-500 uppercase block">Dramatic Charge</span>
              <span className="text-base font-mono font-bold text-white tabular-nums">
                {activePoint.intensity}/100
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Act Breakdown & Beat Progression */}
      <div className="space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-zinc-300" />
          <span>Act-by-Act Architecture & Beat Progression</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {acts.map((act, actIdx) => (
            <div
              key={actIdx}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3.5 hover:border-zinc-700 transition-colors shadow-md"
            >
              {/* Act Header */}
              <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-zinc-800">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">
                    {act.actName}
                  </h4>
                  <span className="text-2xs text-zinc-400 font-mono mt-0.5 inline-block">
                    {act.pageRange}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-3xs text-zinc-500 uppercase block">Act Intensity</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">
                    {act.intensityLevel}%
                  </span>
                </div>
              </div>

              {/* Assessment */}
              <p className="text-xs text-zinc-300 leading-relaxed italic bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800">
                "{act.structuralAssessment}"
              </p>

              {/* Story Beats List */}
              <div className="space-y-2 pt-0.5">
                <span className="text-3xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
                  Key Act Turning Beats
                </span>
                {act.beats.map((beat, bIdx) => (
                  <div key={bIdx} className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800 space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200">{beat.beatName}</span>
                      <span className="text-3xs font-mono text-zinc-300 bg-zinc-850 border border-zinc-700 px-1.5 py-0.5 rounded">
                        {beat.status}
                      </span>
                    </div>
                    <p className="text-2xs text-zinc-400 leading-relaxed">
                      {beat.description}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
