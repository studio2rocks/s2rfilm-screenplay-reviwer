import React, { useState, useEffect, useMemo } from 'react';
import { Header, NavTab } from './components/Header';
import { ScriptEditor } from './components/ScriptEditor';
import { CoverageReport } from './components/CoverageReport';
import { DialoguePacingView } from './components/DialoguePacingView';
import { CharacterArcsView } from './components/CharacterArcsView';
import { PlotHolesView } from './components/PlotHolesView';
import { StructureView } from './components/StructureView';
import { SceneWorkshopView } from './components/SceneWorkshopView';
import { StoryDoctorChat } from './components/StoryDoctorChat';
import { ScreenplayReader } from './components/ScreenplayReader';
import { SettingsModal } from './components/SettingsModal';
import { SAMPLE_SCRIPTS } from './data/sampleScripts';
import { AISettings, FullCoverageReport, ScriptMetadata } from './types/script';
import { parseScreenplayText, generateHeuristicCoverage } from './server/dramaturgyEngine';
import { exportCoverageReportToDocx, downloadStandaloneDesktopZip } from './utils/fileExporter';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Laptop, Download } from 'lucide-react';

const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'gemini',
  endpointUrl: '',
  modelName: 'gemini-3.8-flash',
  apiKey: '',
  geminiApiKey: '',
  temperature: 0.3,
  voicePreservationStrictness: 'maximum'
};

export default function App() {
  const initialSample = SAMPLE_SCRIPTS[0];

  const [metadata, setMetadata] = useState<ScriptMetadata>({ ...initialSample.metadata });
  const [content, setContent] = useState<string>(initialSample.content);
  const [activeTab, setActiveTab] = useState<NavTab>('script');
  const [coverage, setCoverage] = useState<FullCoverageReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDownloadBanner, setShowDownloadBanner] = useState<boolean>(true);

  // Load AI Settings from localStorage or defaults
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem('s2r_ai_settings');
      if (saved) {
        return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not load saved AI settings:', e);
    }
    return DEFAULT_AI_SETTINGS;
  });

  const handleSaveSettings = (newSettings: AISettings) => {
    setAiSettings(newSettings);
    try {
      localStorage.setItem('s2r_ai_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed to save AI settings to localStorage:', e);
    }
  };

  const { isInstallable, isInstalled, installPWA } = usePWAInstall();

  // Parse scenes whenever content changes
  const parsedScenes = useMemo(() => {
    return parseScreenplayText(content);
  }, [content]);

  // Generate initial heuristic coverage on first mount so the user has immediate rich data
  useEffect(() => {
    const initialCoverage = generateHeuristicCoverage(metadata, content);
    setCoverage(initialCoverage);
  }, []);

  // Run full coverage analysis (queries server which calls Gemini, local model, or heuristic fallback)
  const handleRunCoverage = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata, content, aiSettings })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.coverage) {
        setCoverage(data.coverage);
        setActiveTab('coverage');
      } else {
        const fallback = generateHeuristicCoverage(metadata, content);
        setCoverage(fallback);
        setActiveTab('coverage');
      }
    } catch (err: any) {
      console.warn('Network call failed, utilizing local deterministic engine:', err);
      const localCoverage = generateHeuristicCoverage(metadata, content);
      setCoverage(localCoverage);
      setActiveTab('coverage');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyPolishedScene = (sceneNumber: number, polishedText: string) => {
    const targetScene = parsedScenes.find(s => s.sceneNumber === sceneNumber);
    if (targetScene) {
      const updatedContent = content.replace(targetScene.rawText, polishedText);
      setContent(updatedContent);
      // Re-run fast heuristic update
      const updatedCoverage = generateHeuristicCoverage(metadata, updatedContent);
      setCoverage(updatedCoverage);
    }
  };

  const handleQuickExportDocx = () => {
    if (coverage) {
      exportCoverageReportToDocx(coverage);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-700/60 selection:text-white">
      
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAnalyzing={isAnalyzing}
        onRunCoverage={handleRunCoverage}
        hasCoverage={!!coverage}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onQuickExportDocx={handleQuickExportDocx}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Standalone Desktop Edition Download Banner */}
        {showDownloadBanner && (
          <div className="mb-6 p-3.5 sm:p-4 rounded-xl bg-zinc-900 border border-zinc-750 text-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-white">
                <Laptop className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-2 flex-wrap">
                  <span>S2RFilm Studio Desktop — Duplicated Standalone Edition</span>
                  <span className="text-3xs font-mono text-zinc-300 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                    macOS &amp; WINDOWS
                  </span>
                </div>
                <p className="text-2xs text-zinc-400 mt-0.5">
                  Includes embedded Electron + Express runtime, macOS <span className="font-mono text-zinc-300">.app / .dmg</span> builder, and Windows silent desktop shortcut &amp; <span className="font-mono text-zinc-300">.exe</span> builder.
                </p>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-2 shrink-0">
              <button
                onClick={() => downloadStandaloneDesktopZip('mac')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700 font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>macOS (.zip)</span>
              </button>
              <button
                onClick={() => downloadStandaloneDesktopZip('windows')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700 font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Windows (.zip)</span>
              </button>
              <button
                onClick={() => downloadStandaloneDesktopZip('all')}
                className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>All-in-One Mac + Win (.zip)</span>
              </button>
              <button
                onClick={() => setShowDownloadBanner(false)}
                className="px-2 py-1.5 text-2xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-750 text-xs text-zinc-200 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="underline text-zinc-400 hover:text-white cursor-pointer ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'script' && (
          <ScriptEditor
            metadata={metadata}
            content={content}
            onMetadataChange={setMetadata}
            onContentChange={setContent}
            onRunAnalysis={handleRunCoverage}
            isAnalyzing={isAnalyzing}
            sceneCount={parsedScenes.length}
          />
        )}

        {activeTab === 'coverage' && coverage && (
          <CoverageReport
            coverage={coverage}
            onNavigateToWorkshop={() => setActiveTab('workshop')}
            onNavigateToDoctor={() => setActiveTab('doctor')}
          />
        )}

        {activeTab === 'dialogue' && coverage && (
          <DialoguePacingView
            metrics={coverage.dialogueMetrics}
            onNavigateToWorkshop={() => setActiveTab('workshop')}
          />
        )}

        {activeTab === 'characters' && coverage && (
          <CharacterArcsView arcs={coverage.characterArcs} />
        )}

        {activeTab === 'plotholes' && coverage && (
          <PlotHolesView issues={coverage.plotHoles} />
        )}

        {activeTab === 'structure' && coverage && (
          <StructureView
            acts={coverage.structureActs}
            tensionCurve={coverage.tensionCurve}
          />
        )}

        {activeTab === 'workshop' && (
          <SceneWorkshopView
            scenes={parsedScenes}
            metadata={metadata}
            onApplyPolishedScene={handleApplyPolishedScene}
            aiSettings={aiSettings}
          />
        )}

        {activeTab === 'doctor' && (
          <StoryDoctorChat
            metadata={metadata}
            screenplayText={content}
            aiSettings={aiSettings}
          />
        )}

        {activeTab === 'reader' && (
          <ScreenplayReader
            metadata={metadata}
            content={content}
            scenes={parsedScenes}
          />
        )}

      </main>

      {/* Settings Modal (AI Model Connection, User API Key, Voice Strictness & Desktop Options) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={aiSettings}
        onSaveSettings={handleSaveSettings}
        isPWAInstallable={isInstallable}
        isPWAInstalled={isInstalled}
        onInstallPWA={installPWA}
      />

      {/* Clean Footer (No Telemetry or Slop) */}
      <footer className="border-t border-zinc-850 bg-zinc-950 py-6 px-4 sm:px-6 text-center text-xs text-zinc-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">S2RFilm Screenplay Reviewer</span>
            <span>·</span>
            <span>Strict Voice-Preservation Mandate</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>
              Connected AI: {aiSettings.provider === 'gemini' ? 'Google Gemini 3.8 Flash' : aiSettings.provider === 'local' ? `Local (${aiSettings.modelName || 'Ollama'})` : aiSettings.provider === 'custom_web' ? `Custom Web (${aiSettings.modelName || 'REST'})` : 'Offline Heuristic'}
            </span>
            <span>·</span>
            <span>Courier Prime 12pt Standard</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
