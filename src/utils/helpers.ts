import { ProjectItem, ProjectStatus } from '../types';

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  'ON TRACK': '#2e9e5b',
  'AT RISK': '#e0a100',
  'DELAYED': '#d9534f',
  'SELESAI': '#7b8794',
  'ACTIVE': '#3b82c4',
  'LELANG': '#7c6bc4'
};

export const STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
  'ON TRACK': 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  'AT RISK': 'bg-amber-600/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  'DELAYED': 'bg-rose-600/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  'SELESAI': 'bg-slate-600/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
  'ACTIVE': 'bg-blue-600/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  'LELANG': 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
};

export function formatRupiah(value: number, short = true): string {
  if (value == null || isNaN(value)) return 'Rp0';
  if (short) {
    const inBillion = value / 1e9;
    return `Rp${inBillion.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value == null || isNaN(value)) return '-';
  const pct = value * 100;
  return `${pct.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

export function normalizeStatus(raw: string): ProjectStatus {
  const upper = (raw || '').trim().toUpperCase();
  if (upper.startsWith('DONE') || upper.startsWith('SELESAI')) return 'SELESAI';
  if (upper.includes('LELANG') || upper.includes('AANWIJZING') || upper.includes('PENAWARAN')) return 'LELANG';
  if (upper === 'DELAYED') return 'DELAYED';
  if (upper === 'AT RISK') return 'AT RISK';
  if (upper === 'ON TRACK') return 'ON TRACK';
  if (upper === 'ACTIVE') return 'ACTIVE';
  return 'ON TRACK';
}

const MONTH_LOOKUP: Record<string, number> = {
  januari: 0, jan: 0,
  februari: 1, feb: 1,
  maret: 2, mar: 2,
  april: 3, apr: 3,
  mei: 4, may: 4,
  juni: 5, jun: 5,
  juli: 6, jul: 6,
  agustus: 7, agu: 7, ags: 7,
  september: 8, sep: 8,
  oktober: 9, okt: 9,
  november: 10, nov: 10,
  desember: 11, des: 11, desemb: 11
};

/**
 * Returns month index relative to Jan 2024 (Jan 2024 = 0)
 */
export function parseDateToMonthIndex(str: string | null | undefined): number | null {
  if (!str) return null;
  const match = str.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const mStr = match[2].toLowerCase();
  const year = parseInt(match[3], 10);
  const month = MONTH_LOOKUP[mStr];
  if (month == null || isNaN(year)) return null;
  return (year - 2024) * 12 + month + (day - 1) / 30;
}

export function exportProjectsToCSV(projects: ProjectItem[]): void {
  const headers = [
    'No',
    'Nama Project',
    'Nomor WBS',
    'Kelompok',
    'Nilai Pekerjaan',
    'Pemilik Pekerjaan',
    'BAMK',
    'Akhir Kontrak',
    'Akhir Kontrak Terkini',
    'Rencana',
    'Realisasi',
    'Deviasi',
    'Status',
    'Situasi Proyek',
    'Mitigasi',
    'Learning stop'
  ];

  const rows = projects.map(p => [
    p.n,
    `"${(p.nm || '').replace(/"/g, '""')}"`,
    `"${(p.wbs || '').replace(/"/g, '""')}"`,
    `"${(p.kelompok_status || p.g || '').replace(/"/g, '""')}"`,
    p.v,
    `"${(p.ow || '').replace(/"/g, '""')}"`,
    `"${(p.bm || '').replace(/"/g, '""')}"`,
    `"${(p.ak || '').replace(/"/g, '""')}"`,
    `"${(p.ak_terkini || '').replace(/"/g, '""')}"`,
    p.pl != null ? (p.pl * 100).toFixed(2) + '%' : '',
    p.rl != null ? (p.rl * 100).toFixed(2) + '%' : '',
    p.dv != null ? (p.dv * 100).toFixed(2) + '%' : '',
    p.st || p.s,
    `"${(p.si || '').replace(/"/g, '""')}"`,
    `"${(p.mi || '').replace(/"/g, '""')}"`,
    `"${(p.ls || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Daftar_Proyek_ME_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
