import React from 'react';
import { TabId, AppTheme } from '../types';
import { LayoutDashboard, Download, Plus, RotateCcw, Sun, Moon, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAddProject: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  totalProjects: number;
}

const TABS: { id: TabId; label: string; badge?: string }[] = [
  { id: 'r', label: 'Ringkasan' },
  { id: 'k', label: 'Kurva S', badge: '10' },
  { id: 'p', label: 'Proyek', badge: '31' },
  { id: 'd', label: 'Kontrak & Dokumen' },
  { id: 'q', label: 'Data Quality' },
  { id: 'i', label: 'Insight' },
  { id: 's', label: 'Sumber Data', badge: '14' },
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  theme,
  onToggleTheme,
  isDarkMode,
  onToggleDarkMode,
  onOpenAddProject,
  onExportCSV,
  onResetData,
  totalProjects
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-[1360px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              ME
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-blue-950 dark:text-blue-200 m-0 leading-tight">
                  Portofolio Proyek ME
                </h1>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {totalProjects} Proyek Aktif
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden md:inline">
                  · mockup interaktif lengkap · arahkan kursor ke lencana Sx untuk sumber data
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
            <button
              onClick={onOpenAddProject}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
              title="Tambah proyek baru ke dashboard"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Proyek</span>
            </button>

            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Unduh data dalam format CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor</span>
            </button>

            <button
              onClick={onResetData}
              className="p-1.5 text-xs rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset ke data awal spreadsheet"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

            <button
              onClick={onToggleTheme}
              className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors border ${
                theme === 'looker'
                  ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title="Ganti mode visual antara Web Modern dan Looker Studio style"
            >
              <span className="text-[11px]">Tampilan: <b>{theme === 'looker' ? 'Looker Studio' : 'Web'}</b> ⇄</span>
            </button>

            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pt-2 scrollbar-none">
          {TABS.map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all select-none ${
                  isActive
                    ? theme === 'looker'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold border-b-2 border-blue-600'
                      : 'bg-blue-950 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
