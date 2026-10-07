import React, { useState } from 'react';
import { MasterProjectCurve } from '../../types';
import { Card } from '../Card';
import { KpiCard } from '../KpiCard';
import { MONTH_NAMES } from '../../utils/helpers';
import { ChevronLeft, ChevronRight, Activity, Percent, DollarSign, Target } from 'lucide-react';

interface SCurveTabProps {
  masterProjects: MasterProjectCurve[];
}

export const SCurveTab: React.FC<SCurveTabProps> = ({ masterProjects }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const currentProject = masterProjects[selectedIdx] || masterProjects[0];
  const totalWeight = masterProjects.reduce((acc, p) => acc + p.weight, 0);

  // Real vs Plan comparison
  const lastMonthIdx = 31; // Agustus 2026 (index 31 in 33-month series)
  const planVal = currentProject.plan[lastMonthIdx] ?? currentProject.plan[currentProject.plan.length - 1];
  const realVal = currentProject.real[currentProject.real.length - 1] ?? 0;
  const deviation = Number((realVal - planVal).toFixed(1));

  // Monthly deviation series for selected project
  const monthlyDeviations = currentProject.real.map((r, i) => {
    const p = currentProject.plan[i] || 0;
    return Number((r - p).toFixed(1));
  });

  const maxAbsDev = Math.max(5, Math.ceil(Math.max(...monthlyDeviations.map(Math.abs)) / 5) * 5);

  return (
    <div className="space-y-3.5">
      {/* Project Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-900 text-white">
            S10
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Pilih Proyek Kurva S:
          </span>
          <select
            value={selectedIdx}
            onChange={e => setSelectedIdx(Number(e.target.value))}
            className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-blue-500"
          >
            {masterProjects.map((p, idx) => (
              <option key={p.id} value={idx}>
                {p.id}. {p.name} (Bobot: {p.weight}%)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            onClick={() => setSelectedIdx(prev => (prev > 0 ? prev - 1 : masterProjects.length - 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Proyek Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-500 px-1">
            {selectedIdx + 1} / {masterProjects.length}
          </span>
          <button
            onClick={() => setSelectedIdx(prev => (prev < masterProjects.length - 1 ? prev + 1 : 0))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Proyek Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Scorecards for Selected Project */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Bobot Proyek"
          sourceId="S10"
          value={`${currentProject.weight}%`}
          subtitle={`dari total bobot Kurva S (${totalWeight.toFixed(1)}%)`}
          icon={<Percent className="w-4 h-4" />}
        />
        <KpiCard
          title="Nilai Pekerjaan"
          sourceId="S10"
          value={`Rp${currentProject.valueM.toFixed(1)} M`}
          subtitle="Master_10_Proyek_KurvaS"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          title="Realisasi Kumulatif"
          sourceId="S10"
          value={`${realVal.toFixed(1)}%`}
          subtitle={`rencana ${planVal.toFixed(1)}%`}
          icon={<Target className="w-4 h-4" />}
        />
        <KpiCard
          title="Deviasi per Agu 2026"
          sourceId="S10"
          value={`${deviation > 0 ? '+' : ''}${deviation.toFixed(1)} pp`}
          subtitle={deviation < 0 ? 'Tertinggal dari target rencana' : 'Sesuai atau melampaui rencana'}
          isNegative={deviation < 0}
          isPositive={deviation >= 0}
          icon={<Activity className="w-4 h-4" />}
        />
      </div>

      {/* Selected Project Curve & Monthly Deviation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Selected Project Line Chart */}
        <div className="lg:col-span-2">
          <Card
            title={`Kurva S Proyek: ${currentProject.name}`}
            sourceId="S10"
            chartType="Time series"
          >
            <div className="pt-2 pb-1">
              <div className="flex items-center justify-between mb-2 text-xs flex-wrap gap-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 border-t-2 border-dashed border-slate-400 inline-block" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">Rencana</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-1 bg-blue-600 rounded-full inline-block" />
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-[11px]">Realisasi</span>
                  </div>
                </div>
                {hoveredMonth != null ? (
                  <div className="text-[11px] font-mono px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
                    <span className="font-semibold">{MONTH_NAMES[hoveredMonth % 12]} 20{24 + Math.floor(hoveredMonth / 12)}</span>:{' '}
                    Plan {currentProject.plan[hoveredMonth]?.toFixed(1)}% | Real {currentProject.real[hoveredMonth]?.toFixed(1)}%
                  </div>
                ) : (
                  <span className="text-[10.5px] text-slate-400">Arahkan kursor ke grafik untuk nilai bulanan</span>
                )}
              </div>

              <div className="w-full aspect-[21/9] min-h-[190px]">
                {(() => {
                  const W = 640;
                  const H = 200;
                  const left = 32;
                  const right = 10;
                  const top = 12;
                  const bottom = 26;
                  const count = currentProject.plan.length;
                  const maxVal = Math.max(...currentProject.plan, ...currentProject.real, 10);
                  const scaleMax = Math.ceil(maxVal / 10) * 10;

                  const getX = (idx: number) => left + (idx * (W - left - right)) / (count - 1);
                  const getY = (val: number) => H - bottom - (val * (H - bottom - top)) / scaleMax;

                  const planPath = currentProject.plan
                    .map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)}`)
                    .join(' ');

                  const realPath = currentProject.real
                    .map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)}`)
                    .join(' ');

                  const gridLines = [0, scaleMax / 4, scaleMax / 2, (scaleMax * 3) / 4, scaleMax];

                  return (
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
                      {gridLines.map((g, gi) => (
                        <g key={gi}>
                          <line
                            x1={left}
                            x2={W - right}
                            y1={getY(g)}
                            y2={getY(g)}
                            stroke="currentColor"
                            strokeOpacity="0.08"
                            strokeWidth="1"
                          />
                          <text
                            x={left - 6}
                            y={getY(g) + 3}
                            fontSize="9"
                            textAnchor="end"
                            fill="currentColor"
                            opacity="0.5"
                            className="font-mono"
                          >
                            {g.toFixed(0)}%
                          </text>
                        </g>
                      ))}

                      {currentProject.plan.map((_, i) => {
                        if (i % 6 !== 0 && i !== count - 1) return null;
                        const x = getX(i);
                        const label = `${MONTH_NAMES[i % 12]} '${String(24 + Math.floor(i / 12))}`;
                        return (
                          <text
                            key={i}
                            x={x}
                            y={H - 8}
                            fontSize="9"
                            textAnchor="middle"
                            fill="currentColor"
                            opacity="0.5"
                            className="font-mono"
                          >
                            {label}
                          </text>
                        );
                      })}

                      <path d={planPath} fill="none" stroke="#9aa4b2" strokeWidth="2.2" strokeDasharray="5 3" />
                      <path d={realPath} fill="none" stroke="#2563eb" strokeWidth="2.8" strokeLinecap="round" />

                      {currentProject.plan.map((_, i) => {
                        const x = getX(i);
                        const yPlan = getY(currentProject.plan[i]);
                        const yReal = getY(currentProject.real[i] || 0);
                        const isHovered = hoveredMonth === i;

                        return (
                          <g
                            key={i}
                            onMouseEnter={() => setHoveredMonth(i)}
                            onMouseLeave={() => setHoveredMonth(null)}
                            className="cursor-pointer"
                          >
                            <rect
                              x={x - (W / count) / 2}
                              y={top}
                              width={W / count}
                              height={H - top - bottom}
                              fill="transparent"
                            />
                            {isHovered && (
                              <>
                                <line x1={x} x2={x} y1={top} y2={H - bottom} stroke="#2563eb" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
                                <circle cx={x} cy={yPlan} r="4" fill="#9aa4b2" stroke="#fff" strokeWidth="1.5" />
                                <circle cx={x} cy={yReal} r="5" fill="#2563eb" stroke="#fff" strokeWidth="2" />
                              </>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
            </div>
          </Card>
        </div>

        {/* Selected Project Deviation Bars */}
        <div>
          <Card
            title="Deviasi Kumulatif Bulanan (pp)"
            sourceId="S10"
            chartType="Bar chart"
          >
            <div className="pt-2">
              <div className="w-full aspect-[22/11] min-h-[160px]">
                {(() => {
                  const W = 400;
                  const H = 160;
                  const top = 15;
                  const bottom = 20;
                  const left = 24;
                  const right = 10;
                  const zeroY = H / 2 + 5;
                  const scale = (H / 2 - top) / maxAbsDev;
                  const arr = monthlyDeviations;
                  const barWidth = (W - left - right) / arr.length;

                  return (
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                      <line x1={left} x2={W - right} y1={zeroY} y2={zeroY} stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                      <text x={left - 4} y={zeroY + 3} fontSize="8" textAnchor="end" fill="currentColor" opacity="0.5" className="font-mono">
                        0
                      </text>
                      <text x={left - 4} y={top + 4} fontSize="8" textAnchor="end" fill="currentColor" opacity="0.5" className="font-mono">
                        +{maxAbsDev}
                      </text>
                      <text x={left - 4} y={H - bottom} fontSize="8" textAnchor="end" fill="currentColor" opacity="0.5" className="font-mono">
                        -{maxAbsDev}
                      </text>

                      {arr.map((val, i) => {
                        const h = Math.abs(val) * scale;
                        const x = left + i * barWidth + 1;
                        const y = val >= 0 ? zeroY - h : zeroY;
                        const isPositive = val >= 0;

                        return (
                          <rect
                            key={i}
                            x={x}
                            y={y}
                            width={Math.max(1.5, barWidth - 2)}
                            height={Math.max(1, h)}
                            fill={isPositive ? '#2e9e5b' : '#d9534f'}
                            rx="1"
                          >
                            <title>{`${MONTH_NAMES[i % 12]} 20${24 + Math.floor(i / 12)}: ${val > 0 ? '+' : ''}${val.toFixed(1)} pp`}</title>
                          </rect>
                        );
                      })}

                      <text x={left} y={H - 4} fontSize="8" fill="currentColor" opacity="0.5">
                        Jan 2024
                      </text>
                      <text x={W - right} y={H - 4} textAnchor="end" fontSize="8" fill="currentColor" opacity="0.5">
                        Agu 2026
                      </text>
                    </svg>
                  );
                })()}
              </div>
              <div className="text-[10.5px] text-slate-500 mt-2 text-center">
                Maksimum rentang deviasi proyek ini: ±{maxAbsDev} pp
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Comparison Table of 10 Master Projects */}
      <Card
        title="Perbandingan 10 Proyek Kurva S (Posisi Agu 2026)"
        sourceId="S10"
        chartType="Table + bar in cell"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-2.5 px-2 w-10">No</th>
                <th className="py-2.5 px-2">Nama Proyek</th>
                <th className="py-2.5 px-2 text-right">Bobot</th>
                <th className="py-2.5 px-2 text-right">Nilai (Rp M)</th>
                <th className="py-2.5 px-2 text-right">Rencana</th>
                <th className="py-2.5 px-2 text-right">Realisasi</th>
                <th className="py-2.5 px-2 text-right">Deviasi (pp)</th>
                <th className="py-2.5 px-3">Kontribusi ke Realisasi Agregat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {masterProjects.map((p, idx) => {
                const plan = p.plan[31] ?? p.plan[p.plan.length - 1];
                const real = p.real[p.real.length - 1] ?? 0;
                const dev = Number((real - plan).toFixed(1));
                const contributionPp = Number(((p.weight * real) / 100).toFixed(1));
                const isSelected = idx === selectedIdx;

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-2.5 px-2 text-slate-500 font-bold">{p.id}</td>
                    <td className="py-2.5 px-2 font-sans text-slate-800 dark:text-slate-100 max-w-sm truncate" title={p.name}>
                      {p.name}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-600 dark:text-slate-300">
                      {p.weight}%
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-600 dark:text-slate-300">
                      {p.valueM.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-500">
                      {plan.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2 text-right text-blue-600 dark:text-blue-400 font-bold">
                      {real.toFixed(1)}%
                    </td>
                    <td className={`py-2.5 px-2 text-right font-bold ${dev < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {dev > 0 ? '+' : ''}{dev.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-xs overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-xs"
                            style={{ width: `${Math.min(100, (contributionPp / 32) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {contributionPp} pp
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <small className="block text-[11px] text-slate-400 mt-2">
          Total bobot 10 proyek adalah {totalWeight.toFixed(1)}%. Klik salah satu baris untuk melihat grafik Kurva S detail di atas.
        </small>
      </Card>
    </div>
  );
};
