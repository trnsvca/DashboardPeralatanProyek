import React, { useState } from 'react';
import { ProjectItem, AggregateCurveData, ProjectStatus } from '../../types';
import { KpiCard } from '../KpiCard';
import { Card } from '../Card';
import { formatRupiah, formatPercent, STATUS_COLORS, MONTH_NAMES } from '../../utils/helpers';
import { Search, AlertTriangle, TrendingDown, Layers, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface OverviewTabProps {
  projects: ProjectItem[];
  aggregate: AggregateCurveData;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  filterOwner: string;
  setFilterOwner: (o: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectProject: (proj: ProjectItem) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  projects,
  aggregate,
  filterStatus,
  setFilterStatus,
  filterOwner,
  setFilterOwner,
  searchQuery,
  setSearchQuery,
  onSelectProject,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  // Filtered projects
  const filtered = projects.filter(p => {
    const matchStatus = !filterStatus || p.s === filterStatus;
    const matchOwner = !filterOwner || p.g === filterOwner;
    const matchQuery = !searchQuery || p.nm.toLowerCase().includes(searchQuery.toLowerCase()) || (p.ow && p.ow.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchOwner && matchQuery;
  });

  // Calculate metrics
  const totalValue = filtered.reduce((acc, p) => acc + (p.v || 0), 0);
  const completedProjects = filtered.filter(p => p.s === 'SELESAI').length;
  const atRiskDelayed = filtered.filter(p => p.s === 'AT RISK' || p.s === 'DELAYED');
  const atRiskDelayedValue = atRiskDelayed.reduce((acc, p) => acc + (p.v || 0), 0);
  const pipelineProjects = filtered.filter(p => p.s === 'ACTIVE' || p.s === 'LELANG');
  const pipelineValue = pipelineProjects.reduce((acc, p) => acc + (p.v || 0), 0);

  const lastIdx = aggregate.R.length - 1;
  const currentPlan = aggregate.P[lastIdx];
  const currentReal = aggregate.R[lastIdx];
  const currentDev = currentReal - currentPlan;

  // Status breakdown for donut
  const statusValues: { status: ProjectStatus; label: string; value: number; count: number; color: string }[] = [
    { status: 'ON TRACK', label: 'ON TRACK', value: 0, count: 0, color: STATUS_COLORS['ON TRACK'] },
    { status: 'AT RISK', label: 'AT RISK', value: 0, count: 0, color: STATUS_COLORS['AT RISK'] },
    { status: 'DELAYED', label: 'DELAYED', value: 0, count: 0, color: STATUS_COLORS['DELAYED'] },
    { status: 'SELESAI', label: 'SELESAI', value: 0, count: 0, color: STATUS_COLORS['SELESAI'] },
    { status: 'ACTIVE', label: 'ACTIVE', value: 0, count: 0, color: STATUS_COLORS['ACTIVE'] },
    { status: 'LELANG', label: 'LELANG', value: 0, count: 0, color: STATUS_COLORS['LELANG'] },
  ];

  filtered.forEach(p => {
    const entry = statusValues.find(s => s.status === p.s);
    if (entry) {
      entry.value += p.v / 1e9;
      entry.count += 1;
    }
  });

  const activeStatusValues = statusValues.filter(s => s.value > 0);
  const totalStatusVal = activeStatusValues.reduce((a, b) => a + b.value, 0) || 1;

  // Owner breakdown
  const ownerMap: Record<string, number> = {};
  filtered.forEach(p => {
    ownerMap[p.g] = (ownerMap[p.g] || 0) + p.v;
  });
  const ownerList = Object.entries(ownerMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, val]) => ({ name, val: val / 1e9, rawVal: val }));

  // Projects with deviations (ongoing, non-completed)
  const deviationProjects = filtered
    .filter(p => p.dv != null && p.s !== 'SELESAI')
    .sort((a, b) => (a.dv ?? 0) - (b.dv ?? 0));

  // Unique owners for filter
  const ownerOptions = Array.from(new Set(projects.map(p => p.g))).filter(Boolean);

  return (
    <div className="space-y-3.5">
      {/* Global Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-900 text-white">
          S13
        </span>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Semua Status ({projects.length})</option>
          <option value="ON TRACK">ON TRACK</option>
          <option value="AT RISK">AT RISK</option>
          <option value="DELAYED">DELAYED</option>
          <option value="SELESAI">SELESAI / DONE</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="LELANG">LELANG / AANWIJZING</option>
        </select>

        <select
          value={filterOwner}
          onChange={e => setFilterOwner(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[200px] truncate"
        >
          <option value="">Semua Pemilik</option>
          {ownerOptions.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari proyek berdasarkan nama / lokasi..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {(filterStatus || filterOwner || searchQuery) && (
          <button
            onClick={() => {
              setFilterStatus('');
              setFilterOwner('');
              setSearchQuery('');
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 font-medium"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Total Proyek & Nilai"
          sourceId="S1"
          value={`${filtered.length} · ${formatRupiah(totalValue, true)}`}
          subtitle={`${completedProjects} proyek selesai fisik`}
          icon={<FileSpreadsheet className="w-4 h-4" />}
        />
        <KpiCard
          title="Realisasi Kumulatif Agu 2026"
          sourceId="S2"
          value={`${currentReal.toFixed(1)}%`}
          subtitle={`▼ ${Math.abs(currentDev).toFixed(1)} pp vs rencana ${currentPlan.toFixed(1)}%`}
          isNegative={currentDev < 0}
          isPositive={currentDev >= 0}
          icon={<TrendingDown className="w-4 h-4" />}
        />
        <KpiCard
          title="At Risk + Delayed"
          sourceId="S3"
          value={atRiskDelayed.length}
          subtitle={`Nilai ${formatRupiah(atRiskDelayedValue, true)}`}
          isNegative={atRiskDelayed.length > 0}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <KpiCard
          title="Pipeline (Active + Lelang)"
          sourceId="S3"
          value={pipelineProjects.length}
          subtitle={`Nilai ${formatRupiah(pipelineValue, true)}`}
          icon={<Layers className="w-4 h-4" />}
        />
      </div>

      {/* S-Curve Agregat + Donut Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* S-Curve Agregat */}
        <div className="lg:col-span-2">
          <Card
            title="Kurva S Agregat (10 proyek berbobot)"
            sourceId="S4"
            chartType="Time series"
          >
            <div className="relative pt-2 pb-1">
              {/* Legend & Hover Info */}
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
                    Plan {aggregate.P[hoveredMonth]?.toFixed(1)}% | Real {aggregate.R[hoveredMonth]?.toFixed(1)}% ({aggregate.D[hoveredMonth] > 0 ? '+' : ''}{aggregate.D[hoveredMonth]?.toFixed(1)} pp)
                  </div>
                ) : (
                  <span className="text-[10.5px] text-slate-400">Arahkan kursor ke grafik untuk detail bulan</span>
                )}
              </div>

              {/* Responsive SVG Curve */}
              <div className="w-full aspect-[21/9] min-h-[190px]">
                {(() => {
                  const W = 640;
                  const H = 200;
                  const left = 32;
                  const right = 10;
                  const top = 12;
                  const bottom = 26;
                  const count = aggregate.P.length;

                  const getX = (idx: number) => left + (idx * (W - left - right)) / (count - 1);
                  const getY = (val: number) => H - bottom - (val * (H - bottom - top)) / 100;

                  const planPath = aggregate.P
                    .map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)}`)
                    .join(' ');

                  const realPath = aggregate.R
                    .map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)}`)
                    .join(' ');

                  // Grid percentages
                  const gridLines = [0, 25, 50, 75, 100];

                  return (
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
                      {/* Grid Lines */}
                      {gridLines.map(g => (
                        <g key={g}>
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
                            {g}%
                          </text>
                        </g>
                      ))}

                      {/* X-axis labels (every 6 months) */}
                      {aggregate.P.map((_, i) => {
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

                      {/* Plan Line */}
                      <path
                        d={planPath}
                        fill="none"
                        stroke="#9aa4b2"
                        strokeWidth="2.2"
                        strokeDasharray="5 3"
                      />

                      {/* Realization Line */}
                      <path
                        d={realPath}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                      />

                      {/* Hover Interactive Columns */}
                      {aggregate.P.map((_, i) => {
                        const x = getX(i);
                        const yPlan = getY(aggregate.P[i]);
                        const yReal = getY(aggregate.R[i]);
                        const isHovered = hoveredMonth === i;

                        return (
                          <g
                            key={i}
                            onMouseEnter={() => setHoveredMonth(i)}
                            onMouseLeave={() => setHoveredMonth(null)}
                            className="cursor-pointer"
                          >
                            {/* Hitbox */}
                            <rect
                              x={x - (W / count) / 2}
                              y={top}
                              width={W / count}
                              height={H - top - bottom}
                              fill="transparent"
                            />

                            {isHovered && (
                              <>
                                <line
                                  x1={x}
                                  x2={x}
                                  y1={top}
                                  y2={H - bottom}
                                  stroke="#2563eb"
                                  strokeWidth="1"
                                  strokeDasharray="2 2"
                                  opacity="0.7"
                                />
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

        {/* Nilai Kontrak per Status (Donut) */}
        <div>
          <Card
            title="Nilai Kontrak per Status (Rp M)"
            sourceId="S6"
            chartType="Donut"
          >
            <div className="flex flex-col items-center justify-center pt-1">
              <div className="w-full max-w-[240px] aspect-square relative">
                {(() => {
                  const size = 200;
                  const center = size / 2;
                  const radius = 72;
                  const innerRadius = 45;

                  let accumulatedAngle = -Math.PI / 2;
                  const slices = activeStatusValues.map(item => {
                    const angle = (item.value / totalStatusVal) * 2 * Math.PI;
                    const startAngle = accumulatedAngle;
                    const endAngle = accumulatedAngle + angle;
                    accumulatedAngle = endAngle;

                    const x1 = center + radius * Math.cos(startAngle);
                    const y1 = center + radius * Math.sin(startAngle);
                    const x2 = center + radius * Math.cos(endAngle);
                    const y2 = center + radius * Math.sin(endAngle);

                    const ix1 = center + innerRadius * Math.cos(startAngle);
                    const iy1 = center + innerRadius * Math.sin(startAngle);
                    const ix2 = center + innerRadius * Math.cos(endAngle);
                    const iy2 = center + innerRadius * Math.sin(endAngle);

                    const largeArc = angle > Math.PI ? 1 : 0;

                    const path = `
                      M ${ix1} ${iy1}
                      L ${x1} ${y1}
                      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                      L ${ix2} ${iy2}
                      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}
                      Z
                    `;

                    return { ...item, path };
                  });

                  return (
                    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
                      {slices.map((slice, idx) => (
                        <path
                          key={idx}
                          d={slice.path}
                          fill={slice.color}
                          opacity={hoveredStatus === null || hoveredStatus === slice.status ? 1 : 0.4}
                          onMouseEnter={() => setHoveredStatus(slice.status)}
                          onMouseLeave={() => setHoveredStatus(null)}
                          className="transition-opacity duration-150 cursor-pointer"
                        >
                          <title>{`${slice.label}: Rp${slice.value.toFixed(1)} M (${slice.count} proyek)`}</title>
                        </path>
                      ))}
                      <circle cx={center} cy={center} r={innerRadius - 2} fill="transparent" />
                      <text
                        x={center}
                        y={center - 3}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="bold"
                        fill="currentColor"
                        className="font-mono"
                      >
                        Rp{totalStatusVal.toFixed(0)} M
                      </text>
                      <text
                        x={center}
                        y={center + 11}
                        textAnchor="middle"
                        fontSize="9"
                        fill="currentColor"
                        opacity="0.6"
                      >
                        {filtered.length} Proyek
                      </text>
                    </svg>
                  );
                })()}
              </div>

              {/* Donut Legend */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                {activeStatusValues.map((item, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredStatus(item.status)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    className={`flex items-center justify-between px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      hoveredStatus === item.status ? 'bg-slate-100 dark:bg-slate-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-mono text-slate-500 shrink-0 text-[10.5px]">
                      {item.value.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Deviasi Bulanan & Deviasi Proyek Berjalan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Deviasi Bulanan Agregat */}
        <Card
          title="Deviasi Bulanan Agregat (pp)"
          sourceId="S5"
          chartType="Bar chart"
        >
          <div className="pt-2">
            <div className="w-full aspect-[22/9] min-h-[160px]">
              {(() => {
                const W = 400;
                const H = 160;
                const top = 15;
                const bottom = 20;
                const left = 24;
                const right = 10;
                const zeroY = H / 2 + 5;
                const maxDeviation = 12; // pp scale
                const scale = (H / 2 - top) / maxDeviation;
                const arr = aggregate.D;
                const barWidth = (W - left - right) / arr.length;

                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                    {/* Zero baseline */}
                    <line x1={left} x2={W - right} y1={zeroY} y2={zeroY} stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                    <text x={left - 4} y={zeroY + 3} fontSize="8" textAnchor="end" fill="currentColor" opacity="0.5" className="font-mono">
                      0
                    </text>
                    <text x={left - 4} y={top + 4} fontSize="8" textAnchor="end" fill="currentColor" opacity="0.5" className="font-mono">
                      +{maxDeviation}
                    </text>
                    <text x={left - 4} y={H - bottom} fontSize="8" textAnchor="end" fill="currentColor" opacity="0.5" className="font-mono">
                      -{maxDeviation}
                    </text>

                    {/* Bars */}
                    {arr.map((val, i) => {
                      const h = Math.abs(val) * scale;
                      const x = left + i * barWidth + 1;
                      const y = val >= 0 ? zeroY - h : zeroY;
                      const isPositive = val >= 0;

                      return (
                        <g key={i}>
                          <rect
                            x={x}
                            y={y}
                            width={Math.max(1.5, barWidth - 2)}
                            height={Math.max(1, h)}
                            fill={isPositive ? '#2e9e5b' : '#d9534f'}
                            rx="1"
                            className="hover:opacity-80 transition-opacity"
                          >
                            <title>{`${MONTH_NAMES[i % 12]} 20${24 + Math.floor(i / 12)}: ${val > 0 ? '+' : ''}${val.toFixed(1)} pp`}</title>
                          </rect>
                        </g>
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
            <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-1">
              <span>Hijau: Realisasi mendahului rencana (+)</span>
              <span>Merah: Realisasi tertinggal (-)</span>
            </div>
          </div>
        </Card>

        {/* Deviasi Realisasi vs Plan, Proyek Berjalan */}
        <Card
          title="Deviasi Realisasi vs Plan, Proyek Berjalan"
          sourceId="S7"
          chartType="Bar horizontal"
        >
          <div className="space-y-1.5 pt-1 max-h-[220px] overflow-y-auto pr-1">
            {deviationProjects.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">Tidak ada data deviasi pada filter ini</div>
            ) : (
              deviationProjects.map((p, idx) => {
                const devPct = (p.dv ?? 0) * 100;
                const isNeg = devPct < 0;
                const barWidth = Math.min(100, Math.max(3, Math.abs(devPct) * 1.8));

                return (
                  <div
                    key={idx}
                    onClick={() => onSelectProject(p)}
                    className="flex items-center gap-2 text-xs py-1 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <span className="w-36 sm:w-44 truncate text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" title={p.nm}>
                      {p.nm}
                    </span>
                    <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 rounded-sm h-3 overflow-hidden">
                      <div
                        className="h-full rounded-xs transition-all"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: isNeg ? STATUS_COLORS[p.s] || '#d9534f' : '#2e9e5b'
                        }}
                      />
                    </div>
                    <span className={`w-14 text-right font-mono text-[11px] font-semibold ${isNeg ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {formatPercent(p.dv)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Watchlist & Nilai per Pemilik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Watchlist At Risk / Delayed */}
        <div className="lg:col-span-2">
          <Card
            title={`Watchlist Proyek Kritis (At Risk / Delayed) — ${atRiskDelayed.length} Proyek`}
            sourceId="S9"
            chartType="Table"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-2 px-2">Proyek</th>
                    <th className="py-2 px-2 w-24">Status</th>
                    <th className="py-2 px-2 w-16 text-right">Deviasi</th>
                    <th className="py-2 px-2">Mitigasi & Rencana Tindak Lanjut</th>
                    <th className="py-2 px-1 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {atRiskDelayed.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        Tidak ada proyek berstatus kritis pada filter ini
                      </td>
                    </tr>
                  ) : (
                    atRiskDelayed.map(p => (
                      <tr
                        key={p.n}
                        onClick={() => onSelectProject(p)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-2 px-2">
                          <div className="font-medium text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {p.nm}
                          </div>
                          <div className="text-[10.5px] text-slate-400">{p.ow}</div>
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap"
                            style={{ backgroundColor: STATUS_COLORS[p.s] }}
                          >
                            {p.s}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                          {formatPercent(p.dv)}
                        </td>
                        <td className="py-2 px-2 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                          {p.mi && p.mi !== '-' ? p.mi : p.si}
                        </td>
                        <td className="py-2 px-1 text-slate-400 group-hover:text-blue-600">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Nilai per Pemilik */}
        <div>
          <Card
            title="Nilai per Pemilik (Rp M)"
            sourceId="S8"
            chartType="Bar horizontal"
          >
            <div className="space-y-2 pt-1">
              {ownerList.map((item, idx) => {
                const maxVal = ownerList[0]?.val || 1;
                const widthPct = Math.max(5, (item.val / maxVal) * 100);

                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title={item.name}>
                        {item.name}
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                        Rp{item.val.toFixed(1)} M
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xs h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-900 dark:bg-blue-600 h-full rounded-xs transition-all duration-300"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
