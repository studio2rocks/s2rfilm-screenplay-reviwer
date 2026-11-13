import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Cpu, 
  Server, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Laptop, 
  Download, 
  Terminal, 
  Apple, 
  Eye, 
  EyeOff,
  Sparkles,
  Sliders,
  Archive
} from 'lucide-react';
import { AIProvider, AISettings } from '../types/script';
import { downloadProjectZip, downloadStandaloneDesktopZip } from '../utils/fileExporter';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSaveSettings: (settings: AISettings) => void;
  isPWAInstallable: boolean;
  isPWAInstalled: boolean;
  onInstallPWA: () => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  isPWAInstallable,
  isPWAInstalled,
  onInstallPWA
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'dramaturgy' | 'desktop'>('ai');
  const [tempSettings, setTempSettings] = useState<AISettings>({ ...settings });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latencyMs?: number } | null>(null);

  if (!isOpen) return null;

  const handleProviderChange = (provider: AIProvider) => {
    setTempSettings(prev => ({
      ...prev,
      provider,
      endpointUrl: provider === 'local' && !prev.endpointUrl 
        ? 'http://localhost:11434/v1' 
        : provider === 'custom_web' && !prev.endpointUrl 
        ? 'https://api.openai.com/v1' 
        : prev.endpointUrl,
      modelName: provider === 'local' && !prev.modelName 
        ? 'llama3' 
        : provider === 'custom_web' && !prev.modelName 
        ? 'gpt-4o' 
        : prev.modelName
    }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const resp = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiSettings: tempSettings })
      });
      const data = await resp.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err.message || 'Connection failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveSettings(tempSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-4 sm:p-5 space-y-4 shadow-2xl relative max-h-[88vh] flex flex-col text-zinc-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header in Monochrome */}
        <div className="flex items-center gap-3 shrink-0 pr-8">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">
              Settings & Model Connections
            </h3>
            <p className="text-2xs text-zinc-400">
              Select web or local models, configure API keys, and manage offline options.
            </p>
          </div>
        </div>

        {/* Scaled-down Tab Bar in Monochrome */}
        <div className="flex items-center gap-1 p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-1.5 px-2 text-2xs sm:text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-zinc-800 text-white font-semibold shadow-2xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>AI Model & Key</span>
          </button>
          <button
            onClick={() => setActiveTab('dramaturgy')}
            className={`flex-1 py-1.5 px-2 text-2xs sm:text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'dramaturgy'
                ? 'bg-zinc-800 text-white font-semibold shadow-2xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Voice & Strictness</span>
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-1.5 px-2 text-2xs sm:text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-zinc-800 text-white font-semibold shadow-2xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Laptop className="w-3 h-3" />
            <span>Desktop & Zip</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          {activeTab === 'ai' && (
            <div className="space-y-3">
              
              {/* Provider Selection 2x2 Grid */}
              <div className="space-y-1.5">
                <label className="block text-2xs font-semibold uppercase tracking-wider text-zinc-400">
                  Model Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* Google Gemini */}
                  <button
                    type="button"
                    onClick={() => handleProviderChange('gemini')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      tempSettings.provider === 'gemini'
                        ? 'bg-zinc-800 border-zinc-500 text-white'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-zinc-100 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-zinc-300" />
                        <span>Google Gemini</span>
                      </span>
                      {tempSettings.provider === 'gemini' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <p className="text-3xs text-zinc-400 leading-tight">
                      Gemini 3.8 Flash (Built-in or personal key)
                    </p>
                  </button>

                  {/* Local AI */}
                  <button
                    type="button"
                    onClick={() => handleProviderChange('local')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      tempSettings.provider === 'local'
                        ? 'bg-zinc-800 border-zinc-500 text-white'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-zinc-100 flex items-center gap-1">
                        <Server className="w-3 h-3 text-zinc-300" />
                        <span>Local AI</span>
                      </span>
                      {tempSettings.provider === 'local' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <p className="text-3xs text-zinc-400 leading-tight">
                      Ollama / LM Studio on localhost
                    </p>
                  </button>

                  {/* Custom Web */}
                  <button
                    type="button"
                    onClick={() => handleProviderChange('custom_web')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      tempSettings.provider === 'custom_web'
                        ? 'bg-zinc-800 border-zinc-500 text-white'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-zinc-100 flex items-center gap-1">
                        <Key className="w-3 h-3 text-zinc-300" />
                        <span>Custom Web API</span>
                      </span>
                      {tempSettings.provider === 'custom_web' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <p className="text-3xs text-zinc-400 leading-tight">
                      OpenAI, Groq, OpenRouter REST endpoint
                    </p>
                  </button>

                  {/* Offline Heuristic */}
                  <button
                    type="button"
                    onClick={() => handleProviderChange('heuristic')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      tempSettings.provider === 'heuristic'
                        ? 'bg-zinc-800 border-zinc-500 text-white'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-zinc-100 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-zinc-300" />
                        <span>Offline Heuristic</span>
                      </span>
                      {tempSettings.provider === 'heuristic' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <p className="text-3xs text-zinc-400 leading-tight">
                      Zero network calls; on-device parser
                    </p>
                  </button>

                </div>
              </div>

              {/* Provider Config Box */}
              {tempSettings.provider === 'gemini' && (
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-2xs">
                    <span className="font-semibold text-zinc-300">
                      Google Gemini 3.8 Flash
                    </span>
                    <span className="text-zinc-200 font-mono bg-zinc-850 border border-zinc-700 px-1.5 py-0.5 rounded">
                      Server Key Active
                    </span>
                  </div>

                  <p className="text-3xs text-zinc-400 leading-normal">
                    Server environment key is attached by default. You may also specify your personal Gemini API key below.
                  </p>

                  <div>
                    <label className="block text-2xs text-zinc-400 mb-1">
                      User Gemini API Key (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type={showGeminiKey ? 'text' : 'password'}
                        value={tempSettings.geminiApiKey || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, geminiApiKey: e.target.value })}
                        placeholder="Leave blank to use default server key..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                        className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {tempSettings.provider === 'local' && (
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-2xs text-zinc-400 mb-1">
                        Local Base URL
                      </label>
                      <input
                        type="text"
                        value={tempSettings.endpointUrl || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, endpointUrl: e.target.value })}
                        placeholder="http://localhost:11434/v1"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs text-zinc-400 mb-1">
                        Model Name
                      </label>
                      <input
                        type="text"
                        value={tempSettings.modelName || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, modelName: e.target.value })}
                        placeholder="llama3.2, mistral..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs text-zinc-400 mb-1">
                      User API Key / Token (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={tempSettings.apiKey || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, apiKey: e.target.value })}
                        placeholder="Optional local auth token..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {tempSettings.provider === 'custom_web' && (
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-2xs text-zinc-400 mb-1">
                        Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={tempSettings.endpointUrl || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, endpointUrl: e.target.value })}
                        placeholder="https://api.openai.com/v1"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs text-zinc-400 mb-1">
                        Model Name
                      </label>
                      <input
                        type="text"
                        value={tempSettings.modelName || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, modelName: e.target.value })}
                        placeholder="gpt-4o, llama-3.3-70b..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs text-zinc-400 mb-1">
                      User API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={tempSettings.apiKey || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, apiKey: e.target.value })}
                        placeholder="sk-..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Connection Probe */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 disabled:opacity-50 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-zinc-300" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3 h-3 text-zinc-300" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>

                {testResult && (
                  <div
                    className={`px-2.5 py-1 rounded-lg border text-2xs flex items-center gap-1.5 flex-1 min-w-0 ${
                      testResult.ok
                        ? 'bg-zinc-950 border-zinc-700 text-zinc-200'
                        : 'bg-zinc-950 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {testResult.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-200 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    )}
                    <span className="truncate">{testResult.message}</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 2: Voice Strictness & Sampling */}
          {activeTab === 'dramaturgy' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-2xs font-semibold uppercase tracking-wider text-zinc-400">
                  Voice-Preservation Strictness
                </label>
                <div className="space-y-1.5">
                  {[
                    {
                      id: 'maximum',
                      title: 'Maximum (Zero-Trope Mandate)',
                      desc: 'Strictly preserves character slang, quirks, and idiosyncratic rhythm.'
                    },
                    {
                      id: 'balanced',
                      title: 'Balanced Commercial Polish',
                      desc: 'Tightens dialogue ping-pong while fiercely defending authorial voice.'
                    },
                    {
                      id: 'aggressive_tightening',
                      title: 'Aggressive Whitespace Tightening',
                      desc: 'Surgically streamlines action paragraphs for high reader velocity.'
                    }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setTempSettings({ ...tempSettings, voicePreservationStrictness: tier.id as any })}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        (tempSettings.voicePreservationStrictness || 'maximum') === tier.id
                          ? 'bg-zinc-800 border-zinc-500 text-white'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-200">{tier.title}</span>
                        {(tempSettings.voicePreservationStrictness || 'maximum') === tier.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <p className="text-3xs text-zinc-400 mt-0.5">{tier.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-2xs">
                  <span className="font-semibold text-zinc-300">Sampling Temperature</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {tempSettings.temperature ?? 0.3}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={tempSettings.temperature ?? 0.3}
                  onChange={(e) => setTempSettings({ ...tempSettings, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-white cursor-pointer h-1 bg-zinc-800 rounded"
                />
                <div className="flex justify-between text-3xs text-zinc-500">
                  <span>0.0 (Analytical)</span>
                  <span>0.5 (Balanced)</span>
                  <span>1.0 (Divergent)</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Desktop App & Project Archive */}
          {activeTab === 'desktop' && (
            <div className="space-y-3">
              {/* Standalone Desktop Edition (Mac & Windows) */}
              <div className="bg-zinc-950/80 border border-zinc-600 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Laptop className="w-3.5 h-3.5 text-white" />
                    <span>Standalone Desktop App (Mac &amp; Windows)</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-600 text-white text-3xs font-mono">
                    ELECTRON + EXPRESS
                  </span>
                </div>

                <p className="text-3xs text-zinc-400 leading-relaxed">
                  Duplicated standalone desktop edition (<span className="font-mono text-zinc-300">S2RFilm Studio Desktop</span>) with embedded Express server, macOS <span className="font-mono text-zinc-300">.app/.dmg</span> bundle, and Windows silent desktop launcher &amp; <span className="font-mono text-zinc-300">.exe</span> builder.
                </p>

                <button
                  type="button"
                  onClick={() => downloadStandaloneDesktopZip('all')}
                  className="w-full py-2 px-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full Desktop Edition (Mac + Win .zip)</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => downloadStandaloneDesktopZip('mac')}
                    className="py-1.5 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 text-2xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Apple className="w-3.5 h-3.5 text-zinc-300" />
                    <span>macOS Bundle (.zip)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadStandaloneDesktopZip('windows')}
                    className="py-1.5 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 text-2xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Windows Bundle (.zip)</span>
                  </button>
                </div>
              </div>

              {/* Packaged Web App Source Archive Card */}
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                    <Archive className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Web App Source Archive (.zip)</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-3xs font-mono">
                    ZIP
                  </span>
                </div>

                <button
                  type="button"
                  onClick={downloadProjectZip}
                  className="w-full py-1.5 px-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-medium text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download s2rfilm-screenplay-reviewer.zip</span>
                </button>
              </div>

              <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">
                    Standalone Progressive Web App
                  </span>
                  {isPWAInstalled && (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-3xs font-mono">
                      INSTALLED
                    </span>
                  )}
                </div>

                <p className="text-3xs text-zinc-400">
                  Installs into a chromeless, dedicated window with offline caching.
                </p>

                {isPWAInstallable && !isPWAInstalled && (
                  <button
                    type="button"
                    onClick={onInstallPWA}
                    className="w-full py-2 px-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install PWA to Desktop</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2.5 border-t border-zinc-850 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-3xs text-zinc-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
            <span>Saved in session storage</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
            >
              Save Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
