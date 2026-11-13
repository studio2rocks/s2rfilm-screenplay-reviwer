import React, { useRef, useState } from 'react';
import { ScriptMetadata, TargetFormat } from '../types/script';
import { SAMPLE_SCRIPTS } from '../data/sampleScripts';
import { importScriptFile } from '../utils/fileImporter';
import { Upload, Sparkles, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ScriptEditorProps {
  metadata: ScriptMetadata;
  content: string;
  onMetadataChange: (meta: ScriptMetadata) => void;
  onContentChange: (text: string) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  sceneCount: number;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  metadata,
  content,
  onMetadataChange,
  onContentChange,
  onRunAnalysis,
  isAnalyzing,
  sceneCount
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const estimatedPages = Math.max(1, Math.round(wordCount / 220));
  const estimatedReadTimeMinutes = Math.round(wordCount / 180);

  const handleSelectSample = (sampleId: string) => {
    const found = SAMPLE_SCRIPTS.find(s => s.id === sampleId);
    if (found) {
      onMetadataChange({ ...found.metadata });
      onContentChange(found.content);
      setImportStatus(`Loaded: ${found.metadata.title}`);
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const handleProcessFile = async (file: File) => {
    try {
      setImportStatus(`Importing ${file.name}...`);
      const imported = await importScriptFile(file);
      onContentChange(imported.text);
      onMetadataChange({
        ...metadata,
        title: imported.inferredMetadata.title || metadata.title,
        author: imported.inferredMetadata.author || metadata.author,
        genre: imported.inferredMetadata.genre || metadata.genre,
        targetFormat: imported.inferredMetadata.targetFormat || metadata.targetFormat,
        estimatedPages: imported.inferredMetadata.estimatedPages || metadata.estimatedPages
      });
      setImportStatus(`Parsed: ${file.name}`);
      setTimeout(() => setImportStatus(null), 3500);
    } catch (err: any) {
      console.error(err);
      setImportStatus(`Import failed: ${err.message || 'Unknown format'}`);
      setTimeout(() => setImportStatus(null), 5000);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Voice-Preservation Mandate Ribbon - Monochrome */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-100 border border-zinc-700 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                S2RFilm Voice-Preservation Mandate
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">Zero Trope Dilution</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-3xl leading-relaxed">
              Never rewrite the author's story into generic Hollywood formulas. S2RFilm audits dialogue cadence, tightens narrative velocity, and exposes logic seams while fiercely safeguarding your authentic authorial voice and idiosyncratic tone.
            </p>
          </div>
        </div>

        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing || !content.trim()}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          {isAnalyzing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Draft...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Studio Coverage</span>
            </>
          )}
        </button>
      </div>

      {/* Script Metadata Card & Sample Selector */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">
              Screenplay Specifications & Provenance
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Calibrate project parameters to tailor studio coverage metrics and commercial comparables.
            </p>
          </div>

          {/* Sample Scripts Quick-Load in Monochrome */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">Load Sample:</span>
            {SAMPLE_SCRIPTS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample.id)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                  metadata.title === sample.metadata.title
                    ? 'bg-zinc-200 text-zinc-950 border-zinc-300 font-bold'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700/80 hover:bg-zinc-750 hover:text-white'
                }`}
              >
                {sample.metadata.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="md:col-span-2">
            <label className="block text-2xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Screenplay Title
            </label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => onMetadataChange({ ...metadata, title: e.target.value })}
              placeholder="e.g. THE GLASS MERIDIAN"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Author / Screenwriter(s)
            </label>
            <input
              type="text"
              value={metadata.author}
              onChange={(e) => onMetadataChange({ ...metadata, author: e.target.value })}
              placeholder="e.g. Evelyn Vane"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Target Format
            </label>
            <select
              value={metadata.targetFormat}
              onChange={(e) => onMetadataChange({ ...metadata, targetFormat: e.target.value as TargetFormat })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-zinc-400 transition-colors"
            >
              <option value="Feature Film">Feature Film</option>
              <option value="TV Drama Pilot">TV Drama Pilot (60 min)</option>
              <option value="TV Comedy Pilot">TV Comedy Pilot (30 min)</option>
              <option value="Limited Series">Limited Series Episode</option>
              <option value="Short Film">Short Film</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Genre & Sub-Genre
            </label>
            <input
              type="text"
              value={metadata.genre}
              onChange={(e) => onMetadataChange({ ...metadata, genre: e.target.value })}
              placeholder="e.g. Neo-Noir / Psychological Thriller"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Estimated Script Pages
            </label>
            <input
              type="number"
              value={metadata.estimatedPages || estimatedPages}
              onChange={(e) => onMetadataChange({ ...metadata, estimatedPages: parseInt(e.target.value, 10) || 1 })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-2xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Writer's Voice Statement & Mandate (Optional)
            </label>
            <input
              type="text"
              value={metadata.authorStatement || ''}
              onChange={(e) => onMetadataChange({ ...metadata, authorStatement: e.target.value })}
              placeholder="e.g. Grounded dialogue; avoid high-tech tropes; naturalistic silence"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Drag & Drop File Importer Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
          isDragging
            ? 'border-white bg-zinc-900/80'
            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
          accept=".docx,.epub,.txt,.fountain,.fdx"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
            <Upload className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-semibold text-zinc-200">
              Drag & drop screenplay file here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-white hover:text-zinc-300 underline font-semibold cursor-pointer"
              >
                browse files
              </button>
            </p>
            <p className="text-2xs text-zinc-400">
              Supports Word (.docx), EPUB (.epub), Plain Text (.txt), Fountain (.fountain), and Final Draft (.fdx)
            </p>
          </div>

          {importStatus && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Screenplay Content Editor & Live Metrics Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-zinc-950/80 border-b border-zinc-800 px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-zinc-300" />
            <span className="text-xs sm:text-sm font-semibold text-zinc-200">
              Screenplay Manuscript (Courier 12pt Standard)
            </span>
          </div>

          {/* Real-Time Metric Strip in Monochrome */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-zinc-400 font-mono">
            <div>
              <span className="text-zinc-500 mr-1">SCENES:</span>
              <span className="text-zinc-200 font-semibold tabular-nums">{sceneCount}</span>
            </div>
            <div>
              <span className="text-zinc-500 mr-1">WORDS:</span>
              <span className="text-zinc-200 font-semibold tabular-nums">{wordCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-zinc-500 mr-1">EST. PAGES:</span>
              <span className="text-white font-bold tabular-nums">~{estimatedPages}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-zinc-500 mr-1">READ TIME:</span>
              <span className="text-zinc-200 font-semibold tabular-nums">~{estimatedReadTimeMinutes}m</span>
            </div>
          </div>
        </div>

        {/* Screenplay Text Area */}
        <div className="p-4 sm:p-6 bg-zinc-950">
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={22}
            placeholder="Type or paste your screenplay here in standard Hollywood format (INT./EXT. SLUGLINES, ACTION, CHARACTER, DIALOGUE)..."
            className="w-full bg-transparent text-zinc-200 font-screenplay text-xs sm:text-sm leading-relaxed p-2 focus:outline-none resize-y selection:bg-zinc-700/60 selection:text-white"
            spellCheck={false}
          />
        </div>

        <div className="bg-zinc-950/60 border-t border-zinc-800/80 px-4 sm:px-5 py-2.5 flex items-center justify-between text-2xs text-zinc-400">
          <span>Format Tip: Use ALL-CAPS sluglines like INT. ROOM - DAY to automatically index scene breaks.</span>
          <span className="text-zinc-400 font-mono">1 page ≈ 1 minute screen time</span>
        </div>
      </div>

    </div>
  );
};
