import React, { useState, useEffect } from 'react';
import { ProjectItem, TabId, AppTheme } from './types';
import { INITIAL_PROJECTS, INITIAL_AGGREGATE, MASTER_PROJECTS_CURVE } from './data/initialData';
import { exportProjectsToCSV } from './utils/helpers';
import { Header } from './components/Header';
import { OverviewTab } from './components/tabs/OverviewTab';
import { SCurveTab } from './components/tabs/SCurveTab';
import { ProjectsTab } from './components/tabs/ProjectsTab';
import { ContractsTab } from './components/tabs/ContractsTab';
import { DataQualityTab } from './components/tabs/DataQualityTab';
import { InsightsTab } from './components/tabs/InsightsTab';
import { SourceDataTab } from './components/tabs/SourceDataTab';
import { ProjectEditModal } from './components/ProjectEditModal';

const STORAGE_KEY_PROJECTS = 'portofolio_me_projects_v1';
const STORAGE_KEY_THEME = 'portofolio_me_theme_mode';
const STORAGE_KEY_DARK = 'portofolio_me_dark_mode';

export default function App() {
  // Load saved projects or fallback to initial
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_PROJECTS;
  });

  const [currentTab, setCurrentTab] = useState<TabId>('r');
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY_THEME) as AppTheme) || 'web';
    } catch {
      return 'web';
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedDark = localStorage.getItem(STORAGE_KEY_DARK);
      if (savedDark !== null) return savedDark === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Filter State
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterOwner, setFilterOwner] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected project for detail view & modal
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(projects[0] || null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  // Sync projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_DARK, String(isDarkMode));
  }, [isDarkMode]);

  // Sync theme
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Keep selectedProject valid if projects list changes
  useEffect(() => {
    if (selectedProject) {
      const current = projects.find(p => p.n === selectedProject.n);
      if (current) setSelectedProject(current);
    }
  }, [projects]);

  // Handlers
  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'web' ? 'looker' : 'web'));
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleOpenAddProject = () => {
    setEditingProject(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditProject = (p: ProjectItem) => {
    setEditingProject(p);
    setIsEditModalOpen(true);
  };

  const handleSaveProject = (savedProject: ProjectItem) => {
    setProjects(prev => {
      const exists = prev.some(p => p.n === savedProject.n);
      if (exists) {
        return prev.map(p => (p.n === savedProject.n ? savedProject : p));
      } else {
        return [...prev, savedProject];
      }
    });
    setSelectedProject(savedProject);
  };

  const handleDeleteProject = (projectNo: number) => {
    setProjects(prev => prev.filter(p => p.n !== projectNo));
    if (selectedProject?.n === projectNo) {
      const remaining = projects.filter(p => p.n !== projectNo);
      setSelectedProject(remaining[0] || null);
    }
  };

  const handleResetData = () => {
    if (confirm('Kembalikan seluruh data proyek ke kondisi awal spreadsheet?')) {
      setProjects(INITIAL_PROJECTS);
      setSelectedProject(INITIAL_PROJECTS[0]);
      try {
        localStorage.removeItem(STORAGE_KEY_PROJECTS);
      } catch {
        // ignore
      }
    }
  };

  const handleExportCSV = () => {
    exportProjectsToCSV(projects);
  };

  const handleSelectProjectAndGoToDetail = (p: ProjectItem) => {
    setSelectedProject(p);
    setCurrentTab('p');
  };

  const nextProjectNo = projects.length > 0 ? Math.max(...projects.map(p => p.n)) + 1 : 1;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors ${theme === 'looker' ? 'theme-looker' : ''}`}>
      {/* Header & Tabs */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenAddProject={handleOpenAddProject}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        totalProjects={projects.length}
      />

      {/* Main Content View */}
      <main className="max-w-[1360px] mx-auto px-3 sm:px-6 py-4">
        {currentTab === 'r' && (
          <OverviewTab
            projects={projects}
            aggregate={INITIAL_AGGREGATE}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterOwner={filterOwner}
            setFilterOwner={setFilterOwner}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectProject={handleSelectProjectAndGoToDetail}
          />
        )}

        {currentTab === 'k' && (
          <SCurveTab masterProjects={MASTER_PROJECTS_CURVE} />
        )}

        {currentTab === 'p' && (
          <ProjectsTab
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            onEditProject={handleOpenEditProject}
            onAddProject={handleOpenAddProject}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterOwner={filterOwner}
            setFilterOwner={setFilterOwner}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {currentTab === 'd' && <ContractsTab />}

        {currentTab === 'q' && (
          <DataQualityTab projects={projects} masterProjects={MASTER_PROJECTS_CURVE} />
        )}

        {currentTab === 'i' && (
          <InsightsTab onNavigateToProjects={() => setCurrentTab('p')} />
        )}

        {currentTab === 's' && <SourceDataTab />}
      </main>

      {/* Project Add / Edit Modal */}
      <ProjectEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={editingProject}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        nextNo={nextProjectNo}
      />
    </div>
  );
}
