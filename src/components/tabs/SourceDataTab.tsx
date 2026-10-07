import React from 'react';
import { Card } from '../Card';
import { SOURCE_CATALOG } from '../../data/initialData';
import { SourceBadge } from '../SourceBadge';
import { Database, FileCode, CheckCircle } from 'lucide-react';

const USAGE_MAP: Record<string, string> = {
  S1: 'KPI Total Proyek & Nilai Pekerjaan',
  S2: 'KPI Realisasi Kumulatif; Insight Executive',
  S3: 'KPI Risiko (At Risk / Delayed) & Pipeline Nilai; Watchlist Kritis',
  S4: 'Grafik Garis Kurva S Agregat (10 Proyek Berbobot)',
  S5: 'Grafik Deviasi Bulanan Agregat (Persentase Poin)',
  S6: 'Donut Chart Distribusi Nilai Kontrak per Status',
  S7: 'Grafik Bar Horizontal Deviasi Realisasi vs Rencana per Proyek',
  S8: 'Grafik Distribusi Nilai per Kelompok Pemilik Pekerjaan',
  S9: 'Tabel Master Proyek, Watchlist Detail, Panel Situasi & Mitigasi',
  S10: 'Halaman Detail Kurva S (Master 10 Proyek, Kurva Individu, Tabel Kontribusi)',
  S11: 'Diagram Gantt Bar Timeline BAMK → Akhir Kontrak',
  S12: 'Halaman Kontrak & Dokumen (Heatmap 20 Jenis Dokumen, Beban PIC)',
  S13: 'Filter Global (Status, Pemilik, Input Pencarian)',
  S14: 'Audit Otomatis Kualitas & Integritas Data (Data Quality)'
};

export const SourceDataTab: React.FC = () => {
  return (
    <div className="space-y-3.5">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Katalog Silsilah Data (Data Lineage Catalog)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Setiap komponen pada dashboard ditautkan dengan badge identifikasi sumber data (S1 sampai S14) untuk transparansi dan auditibilitas laporan portofolio.
            </p>
          </div>
        </div>
      </div>

      <Card
        title="Peta Sumber Data per Komponen Dashboard"
        sourceId="S13"
        chartType="Data dictionary"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-2.5 px-3 w-16 text-center">ID Sumber</th>
                <th className="py-2.5 px-3">Sumber Data (Nama Sheet : Kolom Terkait)</th>
                <th className="py-2.5 px-3">Komponen Pengguna di Dashboard</th>
                <th className="py-2.5 px-3 w-28 text-center">Integritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {Object.entries(SOURCE_CATALOG).map(([id, sourcePath]) => (
                <tr key={id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-center">
                    <SourceBadge id={id} className="text-[11px] px-2 py-0.5" />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11.5px] text-slate-800 dark:text-slate-200 font-medium">
                    {sourcePath}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                    {USAGE_MAP[id] || 'Komponen Terkait'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Terpetakan
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
