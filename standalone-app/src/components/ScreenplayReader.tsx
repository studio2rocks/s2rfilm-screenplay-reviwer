import React, { useState } from 'react';
import { ParsedScene, ScriptMetadata } from '../types/script';
import { Printer, Download, List, Sun, Moon } from 'lucide-react';
import { exportScreenplayToDocx, exportScreenplayText } from '../utils/fileExporter';

interface ScreenplayReaderProps {
  metadata: ScriptMetadata;
  content: string;
  scenes: ParsedScene[];
}

export const ScreenplayReader: React.FC<ScreenplayReaderProps> = ({
  metadata,
  content,
  scenes
}) => {
  const [paperTheme, setPaperTheme] = useState<'paper' | 'dark'>('paper');
  const [activeSceneId, setActiveSceneId] = useState<string>(scenes[0]?.id || '');

  const scrollToScene = (sceneId: string) => {
    setActiveSceneId(sceneId);
    const element = document.getElementById(sceneId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Action & Viewport Bar in Monochrome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800 no-print">
        <div>
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">
            Archival Production Reader
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight mt-0.5">
            {metadata.title}
          </h2>
          <p className="text-xs text-zinc-400">
            Written by {metadata.author} · Courier Prime 12pt Standard Industry Pagination
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Paper / Dark Toggle */}
          <button
            onClick={() => setPaperTheme(t => t === 'paper' ? 'dark' : 'paper')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            {paperTheme === 'paper' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Dark Theme</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-zinc-300" />
                <span>Paper 12pt</span>
              </>
            )}
          </button>

          {/* Export Screenplay DOCX */}
          <button
            onClick={() => exportScreenplayToDocx(metadata.title, metadata.author, content)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-300" />
            <span>Word (.docx)</span>
          </button>

          {/* Export Fountain */}
          <button
            onClick={() => exportScreenplayText(metadata.title, content, 'fountain')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-300" />
            <span>Fountain</span>
          </button>

          {/* Print PDF in Monochrome */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Reader Layout Grid: Left Scene Navigator, Right Simulated Script Paper */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Scene Navigator Sidebar */}
        <div className="lg:col-span-1 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sticky top-20 max-h-[80vh] overflow-y-auto no-print">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider">
            <List className="w-4 h-4 text-zinc-300" />
            <span>Scene Index ({scenes.length})</span>
          </div>

          <div className="space-y-1 mt-3">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => scrollToScene(scene.id)}
                className={`w-full text-left p-2 rounded-lg text-xs font-mono transition-colors block truncate cursor-pointer ${
                  activeSceneId === scene.id
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
                title={scene.slugline}
              >
                <span className="text-zinc-500 mr-1.5">#{scene.sceneNumber}</span>
                {scene.slugline}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Screenplay Paper */}
        <div className="lg:col-span-3">
          <div
            className={`screenplay-paper rounded-2xl p-8 sm:p-14 shadow-2xl transition-all border ${
              paperTheme === 'paper'
                ? 'bg-white text-zinc-950 border-zinc-200'
                : 'bg-zinc-950 text-zinc-200 border-zinc-800'
            }`}
          >
            {/* Title Page Block */}
            <div className="text-center py-12 border-b border-zinc-300/40 mb-12">
              <h1 className="text-2xl sm:text-3xl font-screenplay font-bold tracking-tight uppercase">
                {metadata.title}
              </h1>
              <p className="text-sm font-screenplay text-zinc-600 mt-2">
                Written by {metadata.author}
              </p>
              <div className="text-xs font-screenplay text-zinc-500 mt-4 space-y-0.5">
                <p>{metadata.genre} · {metadata.targetFormat}</p>
                <p>Standard Hollywood Archival Typesetting (Courier Prime)</p>
              </div>
            </div>

            {/* Script Scenes with IDs for Navigation */}
            {scenes.length > 0 ? (
              <div className="space-y-8 font-screenplay text-xs sm:text-sm leading-relaxed">
                {scenes.map((scene) => (
                  <div key={scene.id} id={scene.id} className="pt-2">
                    {/* Scene Slugline */}
                    <div className="font-bold uppercase tracking-wider py-1 border-b border-zinc-300/30 mb-3 flex items-center justify-between">
                      <span>{scene.slugline}</span>
                      <span className="text-zinc-400 text-xs no-print">SCENE {scene.sceneNumber}</span>
                    </div>

                    {/* Action & Dialogue blocks formatted properly */}
                    <div className="whitespace-pre-wrap pl-0 sm:pl-2">
                      {scene.rawText.replace(scene.slugline, '').trim()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="font-screenplay text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                {content}
              </div>
            )}

            {/* Script Footer */}
            <div className="text-center pt-16 pb-8 border-t border-zinc-300/40 mt-16 font-screenplay text-xs text-zinc-500 uppercase tracking-widest">
              — FADE OUT. THE END —
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
