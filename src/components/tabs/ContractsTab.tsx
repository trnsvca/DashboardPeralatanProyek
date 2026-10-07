import React, { useState } from 'react';
import { ContractDocumentRow, DocumentStatus } from '../../types';
import { INITIAL_CONTRACTS, DOCUMENT_TYPES } from '../../data/initialData';
import { Card } from '../Card';
import { KpiCard } from '../KpiCard';
import { formatRupiah } from '../../utils/helpers';
import { FileText, CheckCircle2, Clock, AlertCircle, User, Info } from 'lucide-react';

export const ContractsTab: React.FC = () => {
  const [contracts, setContracts] = useState<ContractDocumentRow[]>(INITIAL_CONTRACTS);
  const [selectedPic, setSelectedPic] = useState<string>('');

  // Status cycling for interactive editing of matrix
  const cycleStatus = (status: DocumentStatus): DocumentStatus => {
    switch (status) {
      case 'ADA': return 'PROSES';
      case 'PROSES': return 'BELUM';
      case 'BELUM': return 'TIDAK_DIPERLUKAN';
      case 'TIDAK_DIPERLUKAN': return 'ADA';
      default: return 'ADA';
    }
  };

  const handleToggleDoc = (contractId: number, docType: string) => {
    setContracts(prev =>
      prev.map(c => {
        if (c.id === contractId) {
          const current = c.docs[docType] || 'BELUM';
          return {
            ...c,
            docs: {
              ...c.docs,
              [docType]: cycleStatus(current)
            }
          };
        }
        return c;
      })
    );
  };

  // Metrics computation
  const totalContracts = contracts.length;
  let totalDocsCount = 0;
  let adaDocsCount = 0;
  let missingDocsCount = 0;

  contracts.forEach(c => {
    DOCUMENT_TYPES.forEach(doc => {
      const st = c.docs[doc];
      if (st === 'ADA') {
        adaDocsCount++;
        totalDocsCount++;
      } else if (st === 'BELUM' || st === 'PROSES') {
        missingDocsCount++;
        totalDocsCount++;
      }
    });
  });

  const completenessRate = totalDocsCount > 0 ? (adaDocsCount / totalDocsCount) * 100 : 0;
  const progressUnder100 = contracts.filter(c => c.progress < 100).length;

  // PIC workload
  const picWorkload: Record<string, { count: number; value: number }> = {};
  contracts.forEach(c => {
    if (!picWorkload[c.pic]) {
      picWorkload[c.pic] = { count: 0, value: 0 };
    }
    picWorkload[c.pic].count++;
    picWorkload[c.pic].value += c.value;
  });

  // Value tier breakdown
  const tiers = [
    { label: '< Rp2,5 M', count: 0, val: 0 },
    { label: 'Rp2,5 M - Rp5 M', count: 0, val: 0 },
    { label: 'Rp5 M - Rp10 M', count: 0, val: 0 },
    { label: '> Rp10 M', count: 0, val: 0 },
  ];

  contracts.forEach(c => {
    const v = c.value;
    if (v < 2.5e9) {
      tiers[0].count++;
      tiers[0].val += v;
    } else if (v <= 5e9) {
      tiers[1].count++;
      tiers[1].val += v;
    } else if (v <= 10e9) {
      tiers[2].count++;
      tiers[2].val += v;
    } else {
      tiers[3].count++;
      tiers[3].val += v;
    }
  });

  const getDocColor = (st: DocumentStatus | undefined) => {
    switch (st) {
      case 'ADA':
        return 'bg-emerald-500/80 hover:bg-emerald-600 text-white';
      case 'PROSES':
        return 'bg-amber-500/80 hover:bg-amber-600 text-white';
      case 'BELUM':
        return 'bg-rose-500/80 hover:bg-rose-600 text-white';
      case 'TIDAK_DIPERLUKAN':
        return 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 text-slate-700 dark:text-slate-200';
      default:
        return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const getDocTooltip = (st: DocumentStatus | undefined) => {
    switch (st) {
      case 'ADA': return 'ADA (Lengkap) - Klik untuk ganti';
      case 'PROSES': return 'PROSES PENGURUSAN / TTD - Klik untuk ganti';
      case 'BELUM': return 'BELUM ADA / HILANG - Klik untuk ganti';
      case 'TIDAK_DIPERLUKAN': return 'TIDAK DIPERLUKAN - Klik untuk ganti';
      default: return 'Status Belum Ditentukan';
    }
  };

  const filteredContracts = selectedPic
    ? contracts.filter(c => c.pic === selectedPic)
    : contracts;

  return (
    <div className="space-y-3.5">
      {/* Informative Wireframe Banner from Mockup */}
      <div className="bg-amber-500/10 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <b>Simulasi & Analisis Dokumen Kontrak.</b> Berdasarkan pemetaan tab kontrak Google Sheet (DATA CLOSE & DATA on going). Anda dapat mengklik langsung setiap sel matriks untuk mengubah status dokumen secara interaktif.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Total Kontrak (Sample Terpetakan)"
          sourceId="S12"
          value={totalContracts}
          subtitle="User & Rekanan Utama"
          icon={<FileText className="w-4 h-4" />}
        />
        <KpiCard
          title="Rata-rata Kelengkapan Dokumen"
          sourceId="S12"
          value={`${completenessRate.toFixed(1)}%`}
          subtitle="ADA ÷ (ADA + PROSES + BELUM)"
          isPositive={completenessRate >= 75}
          isNegative={completenessRate < 75}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <KpiCard
          title="Dokumen Belum / Perlu Follow-up"
          sourceId="S12"
          value={missingDocsCount}
          subtitle="Status BELUM & PROSES TTD"
          isNegative={missingDocsCount > 0}
          icon={<AlertCircle className="w-4 h-4" />}
        />
        <KpiCard
          title="Kontrak Progres < 100%"
          sourceId="S12"
          value={progressUnder100}
          subtitle={`dari ${totalContracts} kontrak aktif`}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Document Matrix Heatmap & PIC Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Heatmap Matrix */}
        <div className="lg:col-span-2">
          <Card
            title="Heatmap Kelengkapan Dokumen (Kontrak × 20 Jenis Dokumen)"
            sourceId="S12"
            chartType="Pivot table + heatmap"
          >
            <div className="pt-1">
              <div className="flex items-center gap-3 text-[11px] mb-2 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" /> ADA
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" /> PROSES TTD
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" /> BELUM / HILANG
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 dark:bg-slate-700 inline-block" /> TIDAK DIPERLUKAN
                </span>
                <span className="text-slate-400 text-[10px] ml-auto">
                  *Klik sel untuk mengubah status
                </span>
              </div>

              <div className="overflow-x-auto max-h-[360px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10.5px]">
                      <th className="py-2 px-2 sticky left-0 bg-white dark:bg-slate-900 z-20 min-w-[180px]">
                        Kontrak
                      </th>
                      <th className="py-2 px-1 text-center min-w-[50px]">PIC</th>
                      {DOCUMENT_TYPES.map(doc => (
                        <th
                          key={doc}
                          className="py-2 px-1 font-mono text-[9.5px] text-slate-500 text-center min-w-[32px] max-w-[42px]"
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                          {doc}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredContracts.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-1.5 px-2 font-medium text-slate-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900 z-10 text-[11px] truncate max-w-[200px]" title={c.contractName}>
                          {c.contractName}
                        </td>
                        <td className="py-1.5 px-1 text-center font-mono text-[10px] text-slate-500">
                          {c.pic}
                        </td>
                        {DOCUMENT_TYPES.map(doc => {
                          const status = c.docs[doc] || 'BELUM';
                          return (
                            <td key={doc} className="p-0.5 text-center">
                              <button
                                onClick={() => handleToggleDoc(c.id, doc)}
                                className={`w-full h-5 rounded-xs text-[8px] font-bold transition-all ${getDocColor(status)}`}
                                title={`${c.contractName} - ${doc}: ${getDocTooltip(status)}`}
                              >
                                {status === 'ADA' ? '✓' : status === 'BELUM' ? '✕' : status === 'PROSES' ? '⋯' : '-'}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        {/* Beban per PIC */}
        <div>
          <Card
            title="Beban per PIC Administrasi"
            sourceId="S12"
            chartType="Bar chart"
            action={
              selectedPic && (
                <button
                  onClick={() => setSelectedPic('')}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Reset PIC
                </button>
              )
            }
          >
            <div className="space-y-1.5 pt-1">
              {Object.entries(picWorkload).map(([pic, data]) => {
                const isSelected = selectedPic === pic;
                const widthPct = Math.min(100, data.count * 35);

                return (
                  <div
                    key={pic}
                    onClick={() => setSelectedPic(isSelected ? '' : pic)}
                    className={`p-1.5 rounded cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {pic}
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        {data.count} Kontrak ({formatRupiah(data.value, true)})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-xs overflow-hidden">
                      <div
                        className="bg-blue-900 dark:bg-blue-500 h-full rounded-xs transition-all"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <small className="block text-[10px] text-slate-400 mt-2">
              Klik nama PIC untuk memfilter tabel heatmap di samping.
            </small>
          </Card>
        </div>
      </div>

      {/* Contract Tiers & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Sebaran Tingkat Nilai Kontrak */}
        <Card
          title="Sebaran Tingkat Nilai Kontrak"
          sourceId="S12"
          chartType="Bar horizontal"
        >
          <div className="space-y-2 pt-1">
            {tiers.map((tier, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{tier.label}</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">
                    {tier.count} Kontrak ({formatRupiah(tier.val, true)})
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-xs overflow-hidden">
                  <div
                    className="bg-blue-700 dark:bg-blue-500 h-full rounded-xs"
                    style={{ width: `${(tier.count / totalContracts) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Kontrak Perlu Tindak Lanjut */}
        <div className="lg:col-span-2">
          <Card
            title="Kontrak Memerlukan Tindak Lanjut Administrasi Segera"
            sourceId="S12"
            chartType="Table"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                    <th className="py-2 px-2">Kontrak</th>
                    <th className="py-2 px-2 w-20">PIC</th>
                    <th className="py-2 px-2 w-32">Dokumen Belum Lengkap</th>
                    <th className="py-2 px-2">Catatan Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {contracts
                    .filter(c => Object.values(c.docs).includes('BELUM') || Object.values(c.docs).includes('PROSES'))
                    .map(c => {
                      const missing = Object.entries(c.docs)
                        .filter(([_, v]) => v === 'BELUM' || v === 'PROSES')
                        .map(([k, v]) => `${k} (${v === 'BELUM' ? 'Belum' : 'Proses'})`)
                        .slice(0, 3)
                        .join(', ');

                      return (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-2 font-medium text-slate-800 dark:text-slate-200">
                            {c.contractName}
                          </td>
                          <td className="py-2 px-2 font-mono text-slate-600 dark:text-slate-400">
                            {c.pic}
                          </td>
                          <td className="py-2 px-2 text-rose-600 dark:text-rose-400 text-[11px] font-medium">
                            {missing}
                          </td>
                          <td className="py-2 px-2 text-slate-600 dark:text-slate-400 text-[11px]">
                            {c.notes}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
