import React from 'react';
import { Card } from '../Card';
import { TrendingDown, AlertTriangle, Clock, PieChart, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';

interface InsightsTabProps {
  onNavigateToProjects: () => void;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({ onNavigateToProjects }) => {
  const insights = [
    {
      id: 1,
      title: 'Realisasi agregat tertinggal, celah menyempit',
      subtitle: 'Agu 2026: 93,7% vs rencana 99,5% (−5,8 pp)',
      icon: <TrendingDown className="w-5 h-5 text-amber-500" />,
      color: 'border-l-amber-500',
      description:
        'Proyek agregat sempat unggul hingga Januari 2025 (puncak surplus +10,6 pp pada Mei 2024), menyilang negatif di Februari 2025, dan mencapai deviasi negatif terdalam −10,4 pp di Januari 2026 sebelum berangsur menyempit ke −5,8 pp.',
      sources: 'S2, S4, S5',
      action: 'Perlu akselerasi sisa pekerjaan mekanikal & comtest pada 2 bulan mendatang.'
    },
    {
      id: 2,
      title: 'Target 100% pada September 2026 sulit tercapai tanpa percepatan',
      subtitle: 'Kekurangan ±6,3 pp dalam kurun waktu singkat',
      icon: <Clock className="w-5 h-5 text-rose-500" />,
      color: 'border-l-rose-500',
      description:
        'Dengan rerata realisasi bulanan di tahun 2026 hanya berkisar ±2,2 pp per bulan, pemenuhan sisa 6,3 pp memerlukan percepatan terfokus pada proyek-proyek berbobot tinggi atau rebaseline jadwal penyelesaian.',
      sources: 'S4',
      action: 'Fokuskan sumber daya pada commissioning test dan penutupan punchlist.'
    },
    {
      id: 3,
      title: 'Risiko portofolio terkonsentrasi pada 10 proyek kritis',
      subtitle: '10 dari 31 proyek At Risk/Delayed bernilai total Rp120,7 M (42%)',
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
      color: 'border-l-rose-500',
      description:
        'Lima proyek berstatus AT RISK mengalami deviasi parah antara −22% hingga −45% (misalnya Revitalisasi Conveyor C Bengkulu −40% dan QCC Banjarmasin −45%). Keterlambatan proyek-proyek ini berdampak signifikan terhadap nilai portofolio.',
      sources: 'S3, S7, S9',
      action: 'Eskalasi mingguan bersama General Manager Terminal terkait izin shutdown alat.'
    },
    {
      id: 4,
      title: 'Pola penyebab masalah (Root Cause) berulang',
      subtitle: 'Procurement, izin shutdown terminal, addendum kontrak, dan vendor financing',
      icon: <ShieldAlert className="w-5 h-5 text-purple-500" />,
      color: 'border-l-purple-500',
      description:
        'Hambatan utama di lapangan berulang pada 4 klaster: (1) Keterlambatan proses procurement subkontraktor, (2) Sulitnya memperoleh slot shutdown dari operasional terminal, (3) Proses sirkuler addendum persetujuan user yang lambat, dan (4) Kendala cashflow rekanan pelaksana.',
      sources: 'S9',
      action: 'Standarisasi SOP kick-off meeting dan kesepakatan jadwal shutdown sebelum BAMK diterbitkan.'
    },
    {
      id: 5,
      title: 'Proyek Delayed didominasi hambatan administrasi & perhitungan denda',
      subtitle: 'Tiga dari 5 proyek delayed sudah mencapai 100% progres fisik',
      icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
      color: 'border-l-blue-500',
      description:
        'Unit alat telah beroperasi secara komersial di terminal (mis. Spreader IPC, Chassis IPC, Emergency Brake CC Nilam), namun status kontrak tertahan di DELAYED akibat negosiasi denda keterlambatan dan proses penagihan termin BAST.',
      sources: 'S3, S9',
      action: 'Ajukan klausul denda secara parsial per lokasi dan terbitkan BA justifikasi teknis.'
    },
    {
      id: 6,
      title: 'Pipeline pekerjaan baru senilai Rp42,0 M belum berjalan',
      subtitle: '3 proyek Active (0%) dan 3 proyek tahap Lelang/Aanwijzing',
      icon: <PieChart className="w-5 h-5 text-emerald-500" />,
      color: 'border-l-emerald-500',
      description:
        'Proyek dengan status ACTIVE (PO/SP3 sudah rilis dari user) masih mencatat progres 0% karena BAMK resmi belum terbit dan draft PR/RKS masih tahap pembahasan di internal PT BIMA. Selain itu Rp25,2 M berada di tahap lelang/aanwijzing.',
      sources: 'S1, S6, S11',
      action: 'Percepat penerbitan BAMK user dan penyusunan Purchase Requisition (PR).'
    },
    {
      id: 7,
      title: 'Tingkat konsentrasi nilai per entitas pemilik pekerjaan',
      subtitle: 'Pelindo TPK mendominasi ±47% dan Pelindo Multi Terminal ±28%',
      icon: <PieChart className="w-5 h-5 text-blue-500" />,
      color: 'border-l-blue-500',
      description:
        'Secara bobot Kurva S, satu proyek tunggal ("Elektrifikasi 22 RTG di TPK Surabaya") memiliki bobot raksasa sebesar 31,6%, sehingga dinamika proyek tersebut sangat mendikte kurva agregat korporasi.',
      sources: 'S8, S10',
      action: 'Berikan pengawasan ketat terhadap monitoring progres harian pada proyek Elektrifikasi 22 RTG.'
    }
  ];

  return (
    <div className="space-y-3.5">
      <Card
        title="Insight Strategis & Rekomendasi Manajerial Portofolio Proyek ME"
        sourceId="S2"
        chartType="Executive briefing"
        action={
          <button
            onClick={onNavigateToProjects}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Lihat Data Proyek <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {insights.map(item => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 border-l-4 ${item.color} shadow-2xs space-y-2`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-2xs shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {item.id}. {item.title}
                  </div>
                  <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.description}
              </p>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10.5px]">
                <div className="text-slate-500 font-medium">
                  Rekomendasi: <span className="text-slate-700 dark:text-slate-200 font-semibold">{item.action}</span>
                </div>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold shrink-0 ml-2">
                  ({item.sources})
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
