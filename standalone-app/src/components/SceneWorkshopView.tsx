import React, { useState } from 'react';
import { AISettings, ParsedScene, PolishSceneResult, ScriptMetadata } from '../types/script';
import { Sparkles, Check, ShieldCheck, RefreshCw } from 'lucide-react';

interface SceneWorkshopViewProps {
  scenes: ParsedScene[];
  metadata: ScriptMetadata;
  onApplyPolishedScene?: (sceneNumber: number, polishedText: string) => void;
  aiSettings?: AISettings;
}

export const SceneWorkshopView: React.FC<SceneWorkshopViewProps> = ({
  scenes,
  metadata,
  onApplyPolishedScene,
  aiSettings
}) => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [polishResult, setPolishResult] = useState<PolishSceneResult | null>(null);
  const [activeTab, setActiveTab] = useState<'side-by-side' | 'rationales'>('side-by-side');
  const [hasApplied, setHasApplied] = useState<boolean>(false);

  const currentScene = scenes[selectedSceneIndex] || scenes[0];

  const handlePolish = async () => {
    if (!currentScene) return;
    setIsPolishing(true);
    setHasApplied(false);

    try {
      const response = await fetch('/api/polish-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneText: currentScene.rawText,
          instructions: customInstructions,
          metadata,
          aiSettings
        })
      });

      const data = await response.json();
      if (data.result) {
        setPolishResult(data.result);
      }
    } catch (err) {
      console.error('Scene polish failed:', err);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleApplyToScript = () => {
    if (polishResult && onApplyPolishedScene && currentScene) {
      onApplyPolishedScene(currentScene.sceneNumber, polishResult.polishedScene);
      setHasApplied(true);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">
          Surgical Refinement Suite
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight mt-0.5">
          Scene Workshop & Voice-Preserving Polishing
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Side-by-side scene comparison with line-by-line dramaturgical rationales under the Strict Voice-Preservation Mandate.
        </p>
      </div>

      {/* Scene Selector & Polish Controls in Monochrome */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3.5 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          <div className="md:col-span-1">
            <label className="block text-2xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Select Scene to Polish
            </label>
            <select
              value={selectedSceneIndex}
              onChange={(e) => {
                setSelectedSceneIndex(parseInt(e.target.value, 10));
                setPolishResult(null);
                setHasApplied(false);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-400 font-mono"
            >
              {scenes.map((s, idx) => (
                <option key={s.id} value={idx}>
                  Scene {s.sceneNumber}: {s.slugline.slice(0, 42)}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-2xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Custom Director / Polish Direction
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Accelerate dialogue ping-pong, cut on-the-nose exposition..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-400"
              />
              <button
                onClick={handlePolish}
                disabled={isPolishing || !currentScene}
                className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-xs rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                {isPolishing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Polishing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Polish Scene</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Preset Director Prompts */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-zinc-800 text-xs">
          <span className="text-zinc-500 text-3xs uppercase">Presets:</span>
          {[
            'Sharpen ping-pong cadence',
            'Excise expository dialogue flab',
            'Convert action blocks into kinetic whitespace',
            'Deepen subtextual conflict between leads'
          ].map((preset, pIdx) => (
            <button
              key={pIdx}
              onClick={() => setCustomInstructions(preset)}
              className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-750 transition-colors cursor-pointer text-3xs"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Workspace */}
      {currentScene && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          
          {/* Workspace Tabs & Actions */}
          <div className="bg-zinc-950/80 border-b border-zinc-800 px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase">
                {currentScene.slugline}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-2xs text-zinc-400 font-mono">
                {currentScene.wordCount} words
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
                <button
                  onClick={() => setActiveTab('side-by-side')}
                  className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors cursor-pointer ${
                    activeTab === 'side-by-side'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setActiveTab('rationales')}
                  className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors cursor-pointer ${
                    activeTab === 'rationales'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Line Rationales ({polishResult?.rationales.length || 0})
                </button>
              </div>

              {polishResult && onApplyPolishedScene && (
                <button
                  onClick={handleApplyToScript}
                  disabled={hasApplied}
                  className={`px-2.5 py-1 text-2xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    hasApplied
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      : 'bg-white hover:bg-zinc-200 text-zinc-950'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>{hasApplied ? 'Applied' : 'Apply to Manuscript'}</span>
                </button>
              )}
            </div>
          </div>

          {activeTab === 'side-by-side' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
              
              {/* Left Column: Original Scene */}
              <div className="p-4 sm:p-5 bg-zinc-950/90 space-y-2">
                <div className="flex items-center justify-between text-2xs font-semibold uppercase text-zinc-400 pb-1.5 border-b border-zinc-800">
                  <span>Original Manuscript</span>
                  <span className="font-mono text-zinc-500">Unpolished</span>
                </div>
                <div className="font-screenplay text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto pr-1">
                  {currentScene.rawText}
                </div>
              </div>

              {/* Right Column: Polished Scene in Monochrome */}
              <div className="p-4 sm:p-5 bg-zinc-950 space-y-2">
                <div className="flex items-center justify-between text-2xs font-semibold uppercase text-white pb-1.5 border-b border-zinc-800">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Voice-Preserved Polish</span>
                  </span>
                  <span className="font-mono text-zinc-400 text-3xs">Pacing Refined</span>
                </div>

                {polishResult ? (
                  <div className="font-screenplay text-xs sm:text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto pr-1">
                    {polishResult.polishedScene}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 text-zinc-500">
                    <Sparkles className="w-6 h-6 text-zinc-700" />
                    <p className="text-2xs">
                      Click <strong className="text-white font-semibold">Polish Scene</strong> above to inspect voice-preserving refinements.
                    </p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Line-by-Line Rationale Tab */
            <div className="p-5 bg-zinc-950 space-y-3.5">
              {!polishResult || polishResult.rationales.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-6 text-center">
                  Run a scene polish to view line-by-line dramaturgical rationales.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200">
                    <strong className="text-white">Polish Summary:</strong> {polishResult.summaryOfImprovements}
                  </div>

                  <div className="space-y-2.5">
                    {polishResult.rationales.map((rat, idx) => (
                      <div key={idx} className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                            <span className="text-3xs text-zinc-500 uppercase font-semibold block mb-0.5">Original:</span>
                            <p className="font-screenplay text-zinc-300 italic">"{rat.original}"</p>
                          </div>
                          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-700">
                            <span className="text-3xs text-white uppercase font-semibold block mb-0.5">Refined:</span>
                            <p className="font-screenplay text-white font-medium">"{rat.revised}"</p>
                          </div>
                        </div>

                        <div className="text-2xs text-zinc-400 flex items-start gap-1.5 pt-1 border-t border-zinc-800">
                          <span className="text-zinc-200 font-semibold shrink-0">Rationale:</span>
                          <span>{rat.explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
