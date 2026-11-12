import React from 'react';
import { Film, Play, Download, Settings, Archive } from 'lucide-react';
import { downloadProjectZip } from '../utils/fileExporter';

export type NavTab = 
  | 'script'
  | 'coverage'
  | 'dialogue'
  | 'characters'
  | 'plotholes'
  | 'structure'
  | 'workshop'
  | 'doctor'
  | 'reader';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isAnalyzing: boolean;
  onRunCoverage: () => void;
  hasCoverage: boolean;
  onOpenSettings: () => void;
  onQuickExportDocx: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isAnalyzing,
  onRunCoverage,
  hasCoverage,
  onOpenSettings,
  onQuickExportDocx
}) => {
  const navItems: Array<{ id: NavTab; label: string }> = [
    { id: 'script', label: 'Screenplay' },
    { id: 'coverage', label: 'Coverage' },
    { id: 'dialogue', label: 'Dialogue' },
    { id: 'characters', label: 'Characters' },
    { id: 'plotholes', label: 'Continuity' },
    { id: 'structure', label: 'Structure' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'doctor', label: 'Story Doctor' },
    { id: 'reader', label: 'Reader' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-850 px-3 sm:px-6 py-2 sm:py-2.5 transition-colors no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Zone 1: Brand wordmark in crisp monochrome */}
        <button
          onClick={() => onTabChange('script')}
          className="flex items-center gap-2 text-left group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-md cursor-pointer shrink-0"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 shadow-xs group-hover:bg-white transition-colors">
            <Film className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="text-sm sm:text-base font-bold tracking-tight text-zinc-100 whitespace-nowrap shrink-0 group-hover:text-white transition-colors">
            S2RFilm Reviewer
          </span>
        </button>

        {/* Zone 2: Navigation tabs with compact text & monochrome active state */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs font-medium py-0.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-all cursor-pointer text-xs ${
                  isActive
                    ? 'bg-zinc-800 text-white font-semibold shadow-2xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions in high-contrast monochrome */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={downloadProjectZip}
            title="Download Full Project Source Code Archive (.zip)"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden sm:inline whitespace-nowrap">Source (.zip)</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Settings & AI Model Connections"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-300" />
            <span className="whitespace-nowrap">Settings</span>
          </button>

          {hasCoverage && (
            <button
              onClick={onQuickExportDocx}
              title="Download Hollywood Coverage in Word (.docx)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden sm:inline whitespace-nowrap">Export</span>
              <span className="sm:hidden whitespace-nowrap">DOCX</span>
            </button>
          )}

          <button
            onClick={onRunCoverage}
            disabled={isAnalyzing}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer ${
              isAnalyzing
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700'
                : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-xs hover:scale-[1.01]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                <span className="whitespace-nowrap">Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span className="whitespace-nowrap">Run Coverage</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Mobile/Tablet Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto pt-2 pb-0.5 border-t border-zinc-850 mt-1.5 no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2 py-0.5 text-2xs rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
