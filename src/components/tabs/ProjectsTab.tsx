import React, { useState } from 'react';
import { ProjectItem } from '../../types';
import { Card } from '../Card';
import { formatRupiah, formatPercent, STATUS_COLORS, parseDateToMonthIndex } from '../../utils/helpers';
import { Search, Edit3, Plus, Calendar, AlertCircle, Lightbulb, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ProjectsTabProps {
  projects: ProjectItem[];
  selectedProject: ProjectItem | null;
  onSelectProject: (p: ProjectItem) => void;
  onEditProject: (p: ProjectItem) => void;
  onAddProject: () => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  filterOwner: string;
  setFilterOwner: (o: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  onEditProject,
  onAddProject,
  filterStatus,
  setFilterStatus,
  filterOwner,
  setFilterOwner,
  searchQuery,
  setSearchQuery
}) => {
  const [sortField, setSortField] = useState<keyof ProjectItem>('n');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const filtered = projects.filter(p => {
    const matchStatus = !filterStatus || p.s === filterStatus;
    const matchOwner = !filterOwner || p.g === filterOwner;
    const matchQuery =
      !searchQuery ||
      p.nm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.ow && p.ow.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchOwner && matchQuery;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'string') {
      return sortAsc
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleSort = (field: keyof ProjectItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const activeProject = selectedProject || projects[0];

  // Gantt calculation parameters
  // Range from Jan 2024 (0) to Mid 2027 (42) -> Span: 44 months
  const x0 = -1; // Dec 2023
  const totalMonths = 45;
  // Current simulated reference date: Okt 2026 -> month index: (2026 - 2024) * 12 + 9 + 4/30 = 33.13
  const todayIdx = 33.13;

  const ownerOptions = Array.from(new Set(projects.map(p => p.g))).filter(Boolean);

  return (
    <div className="space-y-3.5">
      {/* Filter and Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-900 text-white">
            S13
          </span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="">Semua Status ({projects.length})</option>
            <option value="ON TRACK">ON TRACK</option>
            <option value="AT RISK">AT RISK</option>
            <option value="DELAYED">DELAYED</option>
            <option value="SELESAI">SELESAI</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="LELANG">LELANG</option>
          </select>

          <select
            value={filterOwner}
            onChange={e => setFilterOwner(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-medium max-w-[200px] truncate"
          >
            <option value="">Semua Pemilik</option>
            {ownerOptions.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari proyek..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
          </div>
        </div>

        <button
          onClick={onAddProject}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Proyek</span>
        </button>
      </div>

      {/* Main Projects Table */}
      <Card
        title={`Daftar Proyek (${sorted.length} dari ${projects.length} tampil · klik baris untuk detail & timeline)`}
        sourceId="S9"
        chartType="Table"
      >
        <div className="overflow-x-auto max-h-[460px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-semibold select-none">
                <th
                  onClick={() => handleSort('n')}
                  className="py-2.5 px-2 w-10 cursor-pointer hover:text-blue-600"
                >
                  No {sortField === 'n' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('nm')}
                  className="py-2.5 px-2 cursor-pointer hover:text-blue-600"
                >
                  Nama Proyek {sortField === 'nm' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('g')}
                  className="py-2.5 px-2 cursor-pointer hover:text-blue-600"
                >
                  Pemilik {sortField === 'g' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('v')}
                  className="py-2.5 px-2 text-right cursor-pointer hover:text-blue-600"
                >
                  Nilai (Rp M) {sortField === 'v' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-2.5 px-2">BAMK</th>
                <th className="py-2.5 px-2">Akhir Kontrak</th>
                <th
                  onClick={() => handleSort('pl')}
                  className="py-2.5 px-2 text-right cursor-pointer hover:text-blue-600"
                >
                  Plan {sortField === 'pl' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('rl')}
                  className="py-2.5 px-2 text-right cursor-pointer hover:text-blue-600"
                >
                  Real. {sortField === 'rl' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('dv')}
                  className="py-2.5 px-2 text-right cursor-pointer hover:text-blue-600"
                >
                  Dev. {sortField === 'dv' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('s')}
                  className="py-2.5 px-2 text-center cursor-pointer hover:text-blue-600 w-24"
                >
                  Status {sortField === 's' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tidak ditemukan proyek yang cocok dengan filter
                  </td>
                </tr>
              ) : (
                sorted.map(p => {
                  const isSelected = activeProject?.n === p.n;
                  const isNegDev = (p.dv ?? 0) < 0;

                  return (
                    <tr
                      key={p.n}
                      onClick={() => onSelectProject(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 ring-1 ring-blue-500/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2 px-2 font-mono text-slate-400 font-bold">{p.n}</td>
                      <td className="py-2 px-2 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate" title={p.nm}>
                        {p.nm}
                      </td>
                      <td className="py-2 px-2 text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-[130px]" title={p.g}>
                        {p.g}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {(p.v / 1e9).toFixed(1)}
                      </td>
                      <td className="py-2 px-2 text-slate-500 text-[11px] truncate max-w-[110px]" title={p.bm}>
                        {p.bm.split('\n')[0]}
                      </td>
                      <td className="py-2 px-2 text-slate-500 text-[11px] truncate max-w-[120px]" title={p.ak}>
                        {p.ak.split('\n')[0]}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-500">
                        {formatPercent(p.pl)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                        {formatPercent(p.rl)}
                      </td>
                      <td className={`py-2 px-2 text-right font-mono font-bold ${isNegDev ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatPercent(p.dv)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-2xs"
                          style={{ backgroundColor: STATUS_COLORS[p.s] }}
                        >
                          {p.s}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Panel & Timeline Gantt Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Selected Project Detail Drawer/Card */}
        <Card
          title={`Detail Proyek #${activeProject.n}: ${activeProject.nm}`}
          sourceId="S9"
          chartType="Detail panel"
          action={
            <button
              onClick={() => onEditProject(activeProject)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Data</span>
            </button>
          }
        >
          <div className="space-y-3 pt-1 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">NILAI KONTRAK</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {formatRupiah(activeProject.v, false)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">STATUS</span>
                <span
                  className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10.5px] font-bold text-white"
                  style={{ backgroundColor: STATUS_COLORS[activeProject.s] }}
                >
                  {activeProject.st || activeProject.s}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">RENCANA / REALISASI</span>
                <span className="font-mono font-semibold text-xs text-slate-700 dark:text-slate-300">
                  {formatPercent(activeProject.pl)} / <span className="text-blue-600 dark:text-blue-400 font-bold">{formatPercent(activeProject.rl)}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">DEVIASI</span>
                <span className={`font-mono font-bold text-xs ${activeProject.dv && activeProject.dv < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatPercent(activeProject.dv)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                Pemilik Pekerjaan
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {activeProject.ow} <span className="text-slate-400 font-normal">({activeProject.g})</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10.5px] font-semibold text-slate-500 block mb-0.5">
                  BAMK (Mulai Kerja)
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {activeProject.bm || '-'}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10.5px] font-semibold text-slate-500 block mb-0.5">
                  Akhir Kontrak
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 whitespace-pre-line">
                  {activeProject.ak || '-'}
                </span>
              </div>
            </div>

            {/* Situasi Proyek */}
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Situasi Proyek:</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {activeProject.si || 'Belum ada catatan situasi khusus.'}
              </div>
            </div>

            {/* Mitigasi */}
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Mitigasi:</span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {activeProject.mi && activeProject.mi !== '-' ? activeProject.mi : 'Tidak ada mitigasi khusus yang diperlukan.'}
              </div>
            </div>

            {/* Learning Stop */}
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Learning Stop:</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {activeProject.ls && activeProject.ls !== '-' ? activeProject.ls : 'Belum ada catatan learning stop.'}
              </div>
            </div>
          </div>
        </Card>

        {/* Gantt Timeline */}
        <Card
          title="Timeline BAMK → Akhir Kontrak (Garis Merah = Posisi Okt 2026)"
          sourceId="S11"
          chartType="Gantt (bar)"
        >
          <div className="pt-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 px-1">
              <span>Jan 2024</span>
              <span>Jan 2025</span>
              <span className="text-rose-500 font-bold">Okt 2026 (Saat Ini)</span>
              <span>Mei 2027</span>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {projects
                .filter(p => parseDateToMonthIndex(p.bm) != null && parseDateToMonthIndex(p.ak) != null)
                .map(p => {
                  const startMonth = parseDateToMonthIndex(p.bm)!;
                  const endMonth = parseDateToMonthIndex(p.ak)!;
                  const isCurrent = p.n === activeProject.n;

                  const leftPct = Math.max(0, Math.min(100, ((startMonth - x0) / totalMonths) * 100));
                  const widthPct = Math.max(2, Math.min(100 - leftPct, ((endMonth - startMonth) / totalMonths) * 100));
                  const todayPct = ((todayIdx - x0) / totalMonths) * 100;

                  return (
                    <div
                      key={p.n}
                      onClick={() => onSelectProject(p)}
                      className={`group p-1 rounded transition-colors cursor-pointer ${
                        isCurrent ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className={`truncate max-w-[240px] font-medium ${isCurrent ? 'text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                          #{p.n} {p.nm}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {p.bm.split(' ')[1] || ''} '{p.bm.split(' ')[2]?.slice(2) || ''} → {p.ak.split(' ')[1] || ''} '{p.ak.split(' ')[2]?.slice(2) || ''}
                        </span>
                      </div>

                      {/* Timeline Track with Today Marker */}
                      <div className="relative h-3.5 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                        {/* Project Bar */}
                        <div
                          className="absolute top-0.5 bottom-0.5 rounded-xs transition-all shadow-2xs"
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            backgroundColor: STATUS_COLORS[p.s]
                          }}
                          title={`${p.nm}: ${p.bm} sampai ${p.ak}`}
                        />

                        {/* Reference Line (Okt 2026) */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                          style={{ left: `${todayPct}%` }}
                          title="Garis waktu saat ini: Oktober 2026"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" /> Posisi saat ini (Okt 2026)
              </span>
              <span>Bar berwarna sesuai status proyek</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
