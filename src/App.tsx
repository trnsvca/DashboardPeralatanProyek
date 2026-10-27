import {
  initAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken,
  getCurrentUser
} from './services/sheetsService';
import type { User as FirebaseUser } from 'firebase/auth';
import { saveStatusUpdate } from './api';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  K,
  M,
  C,
  GK,
  MAP,
  OW,
  SC,
  DN,
  BK,
  CL,
  MasterProject,
  ContractItem,
  PROJECT_PIC_MAP,
  getProjectPic
} from './data/bimaData';
import {
  LayoutDashboard,
  FolderKanban,
  TrendingUp,
  FileCheck2,
  Search,
  Menu,
  X,
  AlertTriangle,
  Clock,
  Layers,
  Info,
  Sun,
  Moon,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  History,
  Plus,
  Trash2,
  Check,
  User,
  PanelLeft,
  Pin,
  PinOff,
  Calendar,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { PeriodFilter } from './components/PeriodFilter';
  import { normalizeStatus } from './utils/helpers';
   const isOngoingGroup = (g?: string) => (g ?? '').replace(/\s+/g, '').toUpperCase() === 'ONGOING';

// Status Update Record and History Types
export interface ProjectStatusUpdate {
  st: string;
  sit: string;
  mit: string;
  lastUpdated: string;
  author?: string;
}

export interface StatusHistoryEntry {
  id: string;
  timestamp: string;
  st: string;
  sit: string;
  mit: string;
  note?: string;
  author: string;
}

export const PIC_UPDATE_OPTIONS = [
  'Muhaimin',
  'Tommy',
  'Sindy',
  'Faruq',
  'Sarah',
  'Ardi',
  'Aziz',
  'Dita',
  'Eltria',
  'Kiki Dea',
  'Saiful',
  'Wahyu',
  'Widya',
  'Yustaim'
];

// Interactive Kurva S Line Chart with Hover Crosshair and Month Tooltip
function InteractiveKurvaChart({
  d,
  cutoffIdx = 31,
  startMonthIdx = 0,
  cutoffLabel = 'Agustus 2026'
}: {
  d: { p: (number | null)[]; r: (number | null)[] };
  cutoffIdx?: number;
  startMonthIdx?: number;
  cutoffLabel?: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const n = K.m;
  const W = 640;
  const H = 240;
  const L = 34;
  const R = 12;
  const T = 12;
  const B = 28;
  const X = (i: number) => L + (i * (W - L - R)) / (n - 1);
  const Y = (v: number) => T + ((100 - Math.min(v, 100)) * (H - T - B)) / 100;
  const mn = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const path = (a: (number | null)[]) => {
    let o = '';
    let on = false;
    a.forEach((v, i) => {
      if (v == null) {
        on = false;
        return;
      }
      o += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1);
      on = true;
    });
    return o;
  };

  const areaPath = () => {
    const validPoints: [number, number][] = [];
    d.r.forEach((v, i) => {
      if (v != null) validPoints.push([X(i), Y(v)]);
    });
    if (validPoints.length === 0) return '';
    const firstX = validPoints[0][0];
    const lastX = validPoints[validPoints.length - 1][0];
    const bottomY = H - B;
    const pts = validPoints.map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    return `M ${firstX.toFixed(1)} ${bottomY} ${pts} L ${lastX.toFixed(1)} ${bottomY} Z`;
  };

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((relX - L) / (W - L - R)) * (n - 1));
    if (idx >= 0 && idx < n) {
      setHoverIdx(idx);
    }
  };

  const activeP = hoverIdx !== null ? d.p[hoverIdx] : null;
  const activeR = hoverIdx !== null ? d.r[hoverIdx] : null;
  const activeDev = activeP != null && activeR != null ? Number((activeR - activeP).toFixed(1)) : null;

  return (
    <div className="w-full relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="Kurva S rencana dan realisasi"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
        style={{ cursor: 'crosshair' }}
      >
        <defs>
          <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(g => (
          <React.Fragment key={g}>
            <line x1={L} x2={W - R} y1={Y(g)} y2={Y(g)} stroke="var(--line)" strokeDasharray="2 2" />
            <text x={L - 6} y={Y(g) + 3.5} textAnchor="end" fontSize="9.5" fill="var(--ink)" fontWeight="600">
              {g}%
            </text>
          </React.Fragment>
        ))}

        {/* X Axis Month Labels */}
        {Array.from({ length: Math.ceil(n / 3) }).map((_, idx) => {
          const i = idx * 3;
          if (i >= n) return null;
          return (
            <text key={i} x={X(i)} y={H - 8} textAnchor="middle" fontSize="9.5" fill="var(--ink)" fontWeight="600">
              {mn[i % 12]} '{String(24 + Math.floor(i / 12))}
            </text>
          );
        })}

        {/* Active range highlight band if date filter is active */}
        {(startMonthIdx > 0 || cutoffIdx < 31) && (
          <rect
            x={X(startMonthIdx)}
            y={T}
            width={Math.max(2, X(cutoffIdx) - X(startMonthIdx))}
            height={H - T - B}
            fill="#2563eb"
            fillOpacity="0.08"
            stroke="#2563eb"
            strokeOpacity="0.25"
            strokeDasharray="3 3"
          />
        )}

        {/* Dynamic cutoff marker based on date filter */}
        <line
          x1={X(cutoffIdx)}
          x2={X(cutoffIdx)}
          y1={T}
          y2={H - B}
          stroke="#2563eb"
          strokeWidth="1.8"
          strokeDasharray="4 3"
          opacity="0.9"
        />
        <text x={X(cutoffIdx) - 4} y={T + 10} textAnchor="end" fontSize="10" fill="#2563eb" fontWeight="700">
          {cutoffLabel}
        </text>

        {/* Gradient area under Realisasi */}
        <path d={areaPath()} fill="url(#realGradient)" />

        {/* Plan Line (dashed) */}
        <path d={path(d.p)} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 4" />

        {/* Real Line (bold electric blue) */}
        <path d={path(d.r)} fill="none" stroke="#2563eb" strokeWidth="2.8" strokeLinecap="round" />

        {/* Hover Crosshair and point indicators */}
        {hoverIdx !== null && (
          <>
            <line
              x1={X(hoverIdx)}
              x2={X(hoverIdx)}
              y1={T}
              y2={H - B}
              stroke="#0f172a"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              opacity="0.5"
            />
            {activeP != null && (
              <circle
                cx={X(hoverIdx)}
                cy={Y(activeP)}
                r="4.5"
                fill="#ffffff"
                stroke="#64748b"
                strokeWidth="2"
              />
            )}
            {activeR != null && (
              <circle
                cx={X(hoverIdx)}
                cy={Y(activeR)}
                r="5"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2.2"
              />
            )}
          </>
        )}
      </svg>

      <div
        className="legend"
        style={{
          marginTop: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span>
            <i className="dot" style={{ background: '#94a3b8' }} />
            Rencana (Kumulatif)
          </span>
          <span>
            <i className="dot" style={{ background: '#2563eb' }} />
            Realisasi (Kumulatif)
          </span>
        </div>

        {hoverIdx !== null ? (
          <div
            style={{
              fontSize: '11.5px',
              padding: '3px 12px',
              borderRadius: '999px',
              background: '#0b192c',
              color: '#ffffff',
              fontWeight: '600',
              display: 'flex',
              gap: '10px'
            }}
          >
            <span>
              {mn[hoverIdx % 12]} '{String(24 + Math.floor(hoverIdx / 12))}
            </span>
            <span>Rencana: {activeP != null ? `${activeP.toFixed(1)}%` : '-'}</span>
            <span>Realisasi: {activeR != null ? `${activeR.toFixed(1)}%` : '-'}</span>
            {activeDev !== null && (
              <span style={{ color: activeDev < 0 ? '#f87171' : '#34d399' }}>
                Deviasi: {activeDev > 0 ? `+${activeDev}%` : `${activeDev}%`}
              </span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--mute)' }}>
            Arahkan kursor ke grafik untuk detail per bulan
          </span>
        )}
      </div>
    </div>
  );
}

// Modern Interactive SVG Pie/Donut Chart for Project Stages
interface PieSliceData {
  key: string;
  label: string;
  value: number;
  color: string;
}

function ProjectStagePieChart({ data }: { data: PieSliceData[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data]);

  // Calculate slice angles
  const slices = useMemo(() => {
    let currentAngle = -Math.PI / 2; // start at top (12 o'clock)
    return data.map((item, idx) => {
      const fraction = total > 0 ? item.value / total : 0;
      const angle = fraction * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const midAngle = startAngle + angle / 2;
      currentAngle = endAngle;

      return {
        ...item,
        idx,
        fraction,
        percentage: (fraction * 100).toFixed(1),
        startAngle,
        endAngle,
        midAngle
      };
    });
  }, [data, total]);

  const cx = 110;
  const cy = 110;
  const outerR = 90;
  const innerR = 52; // Donut style for modern clean dashboard

  const getSlicePath = (startAngle: number, endAngle: number, isHovered: boolean, midAngle: number) => {
    const rOuter = isHovered ? outerR + 6 : outerR;
    const rInner = isHovered ? innerR - 2 : innerR;

    // slight offset in direction of midAngle if hovered
    const offX = isHovered ? Math.cos(midAngle) * 4 : 0;
    const offY = isHovered ? Math.sin(midAngle) * 4 : 0;

    const cX = cx + offX;
    const cY = cy + offY;

    // Handle full circle
    if (endAngle - startAngle >= 2 * Math.PI - 0.001) {
      return `M ${cX} ${cY - rOuter} A ${rOuter} ${rOuter} 0 1 1 ${cX} ${cY + rOuter} A ${rOuter} ${rOuter} 0 1 1 ${cX} ${cY - rOuter} M ${cX} ${cY - rInner} A ${rInner} ${rInner} 0 1 0 ${cX} ${cY + rInner} A ${rInner} ${rInner} 0 1 0 ${cX} ${cY - rInner} Z`;
    }

    const x1 = cX + rOuter * Math.cos(startAngle);
    const y1 = cY + rOuter * Math.sin(startAngle);
    const x2 = cX + rOuter * Math.cos(endAngle);
    const y2 = cY + rOuter * Math.sin(endAngle);

    const x3 = cX + rInner * Math.cos(endAngle);
    const y3 = cY + rInner * Math.sin(endAngle);
    const x4 = cX + rInner * Math.cos(startAngle);
    const y4 = cY + rInner * Math.sin(startAngle);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="stage-pie-container">
      <div className="stage-pie-chart-wrap">
        <svg
          viewBox="0 0 220 220"
          className="stage-pie-svg"
          aria-label="Pie chart posisi project menurut tahap"
        >
          {/* Slices */}
          {slices.map((slice) => {
            if (slice.value === 0) return null;
            const isHovered = hoveredIdx === slice.idx;
            const path = getSlicePath(slice.startAngle, slice.endAngle, isHovered, slice.midAngle);

            return (
              <path
                key={slice.key}
                d={path}
                fill={slice.color}
                stroke="var(--card)"
                strokeWidth={2}
                className="stage-pie-slice"
                style={{
                  cursor: 'pointer',
                  filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={() => setHoveredIdx(slice.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          {/* Center text / stats */}
          <g className="stage-pie-center-text" pointerEvents="none">
            {activeSlice ? (
              <>
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  fill="var(--mute)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {activeSlice.value} Project
                </text>
                <text
                  x={cx}
                  y={cy + 12}
                  textAnchor="middle"
                  fill="var(--ink)"
                  fontSize="18"
                  fontWeight="800"
                >
                  {activeSlice.percentage}%
                </text>
              </>
            ) : (
              <>
                <text
                  x={cx}
                  y={cy - 8}
                  textAnchor="middle"
                  fill="var(--mute)"
                  fontSize="11"
                  fontWeight="600"
                >
                  Total Project
                </text>
                <text
                  x={cx}
                  y={cy + 14}
                  textAnchor="middle"
                  fill="var(--ink)"
                  fontSize="20"
                  fontWeight="800"
                >
                  {total}
                </text>
              </>
            )}
          </g>
        </svg>

        {activeSlice && (
          <div className="stage-pie-hover-badge" style={{ borderColor: activeSlice.color }}>
            <span className="dot" style={{ background: activeSlice.color }} />
            <span className="stage-pie-hover-text">
              <b>{activeSlice.label}</b>: {activeSlice.value} project ({activeSlice.percentage}%)
            </span>
          </div>
        )}
      </div>

      {/* Legend list */}
      <div className="stage-pie-legend-list">
        {slices.map((slice) => {
          const isHovered = hoveredIdx === slice.idx;
          return (
            <div
              key={slice.key}
              className={`stage-pie-legend-item ${isHovered ? 'active' : ''}`}
              onMouseEnter={() => setHoveredIdx(slice.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="stage-pie-legend-left">
                <span className="stage-pie-legend-dot" style={{ background: slice.color }} />
                <span className="stage-pie-legend-label" title={slice.label}>
                  {slice.label}
                </span>
              </div>
              <div className="stage-pie-legend-right">
                <b className="stage-pie-legend-val">{slice.value}</b>
                <span className="stage-pie-legend-pct">({slice.percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Modern Interactive Bubble Chart for Risk Map (Peta Risiko)
function RiskBubbleChart({
  projects,
  onSelectProject,
  stc,
  stText,
  f1
}: {
  projects: MasterProject[];
  onSelectProject: (idx: number) => void;
  stc: (s: string) => string;
  stText: (s: string) => string;
  f1: (n: number) => string;
}) {
  const [hoveredProj, setHoveredProj] = useState<MasterProject | null>(null);

  const activeProjects = useMemo(() => {
    return projects.filter(m => isOngoingGroup(m.g));
  }, [projects]);

  if (activeProjects.length === 0) {
    return <p className="src">Tidak ada data project berjalan.</p>;
  }

  const W = 520;
  const H = 230;
  const L = 55;
  const R = 20;
  const T = 24;
  const B = 40;

    // ===== SKALA X: logaritmik (Nilai Pekerjaan, Rp M) =====
  const xVals = activeProjects.map(m => m.nv);
  const X_MIN = 0.5; // log tidak punya 0, jadi sumbu mulai sedikit di kiri 1M
  const X_MAX = Math.max(100, Math.max(...xVals) * 1.3);
  const lg = (v: number) => Math.log10(Math.max(v, X_MIN));
  const toX = (val: number) =>
    L + ((lg(val) - lg(X_MIN)) / (lg(X_MAX) - lg(X_MIN))) * (W - L - R);
  const xTicks = [1, 10, 100, 1000].filter(t => t <= X_MAX);                 // berlabel
  const xMinor = [2, 3, 4, 5, 6, 7, 8, 9, 20, 30, 40, 50, 60, 70, 80, 90]    // garis bantu
    .filter(t => t > X_MIN && t < X_MAX);

  // ===== SKALA Y: symlog (Deviasi %, ada nilai negatif dan 0) =====
  const yVals = activeProjects.map(m => m.dv ?? ((m.rl ?? 0) - (m.pl ?? 0)));
  const sl = (v: number) => Math.sign(v) * Math.log10(1 + Math.abs(v));
  const Y_LOW = [-10, -50, -100].find(t => t <= Math.min(...yVals)) ?? -100;
  const Y_HIGH = Math.max(10, ...yVals);
  const toY = (val: number) =>
    H - B - ((sl(val) - sl(Y_LOW)) / (sl(Y_HIGH) - sl(Y_LOW))) * (H - T - B);
  const yTicks = [-100, -50, -10, 0, Y_HIGH].filter(t => t >= Y_LOW);

  const sizeVals = activeProjects.map(m => m.nv);
  const minSz = Math.min(...sizeVals);
  const maxSz = Math.max(...sizeVals);
  const toRadius = (val: number) => {
    if (maxSz === minSz) return 8;
    const ratio = (val - minSz) / (maxSz - minSz);
    return 5 + ratio * 12;
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible' }}>
        {/* Y grid lines */}
                {/* Y grid lines */}
        {yTicks.map((val, idx) => {
          const yPos = toY(val);
          return (
            <React.Fragment key={idx}>
              <line x1={L} x2={W - R} y1={yPos} y2={yPos} stroke="var(--line)" strokeDasharray="3 3" />
              <text x={L - 6} y={yPos + 3.5} textAnchor="end" fontSize="11" fill="var(--mute)" fontWeight="600">
                {val === Y_HIGH ? '>0' : `${val}%`}
              </text>
            </React.Fragment>
          );
        })}

        {/* Axis title Y */}
        <text x={15} y={(T + H - B) / 2} transform={`rotate(-90, 15, ${(T + H - B) / 2})`} textAnchor="middle" fontSize="11.5" fill="var(--ink)" fontWeight="700">
          Deviasi (%, skala log)
        </text>

        {/* X axis zero line */}
        <line x1={L} x2={W - R} y1={toY(0)} y2={toY(0)} stroke="var(--ink)" strokeWidth="1" opacity="0.3" />

        {/* X grid: garis bantu minor + tick berlabel (skala log) */}
        {xMinor.map(val => (
          <line key={`m${val}`} x1={toX(val)} x2={toX(val)} y1={T} y2={H - B} stroke="var(--line)" opacity="0.45" />
        ))}
        {xTicks.map((val, idx) => (
          <g key={idx}>
            <line x1={toX(val)} x2={toX(val)} y1={T} y2={H - B} stroke="var(--line)" strokeWidth="1.2" />
            <text x={toX(val)} y={H - B + 14} textAnchor="middle" fontSize="11" fill="var(--mute)" fontWeight="600">
              {val}M
            </text>
          </g>
        ))}

        {/* Axis title X */}
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="11.5" fill="var(--ink)" fontWeight="700">
          Nilai Pekerjaan (Rp M, skala log) →
        </text>

        {/* Bubbles */}
        {activeProjects.map(m => {
          const valX = m.nv;
          const valY = m.dv ?? ((m.rl ?? 0) - (m.pl ?? 0));
          const cx = toX(valX);
          const cy = toY(valY);
          const r = toRadius(m.nv);
          const color = stc(m.st);
          const isHovered = hoveredProj?.no === m.no;

          return (
            <g
              key={m.no}
              onMouseEnter={() => setHoveredProj(m)}
              onMouseLeave={() => setHoveredProj(null)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? r + 3 : r}
                fill={color}
                fillOpacity={0.8}
                stroke="#ffffff"
                strokeWidth={isHovered ? 2.2 : 1.2}
                style={{
                  transition: 'all 0.2s ease',
                  filter: isHovered ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' : 'none'
                }}
              />
              <text
                x={cx}
                y={cy + 3.5}
                textAnchor="middle"
                fontSize="9.5"
                fill="#ffffff"
                fontWeight="700"
                pointerEvents="none"
              >
                {m.no}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredProj ? (
        <div
          style={{
            marginTop: '6px',
            padding: '6px 10px',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: '6px',
            fontSize: '11px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <b style={{ color: 'var(--ink)' }}>#{hoveredProj.no}. {hoveredProj.n}</b>
            <span
              className="tag"
              style={{
                background: stc(hoveredProj.st),
                color: stText(hoveredProj.st),
                fontSize: '9.5px',
                padding: '1px 5px'
              }}
            >
              {hoveredProj.st}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', color: 'var(--mute)' }}>
            <span>Pemilik: <b style={{ color: 'var(--ink)' }}>{hoveredProj.pem}</b></span>
            <span>Nilai: <b style={{ color: 'var(--ink)' }}>Rp{f1(hoveredProj.nv)}M</b></span>
            <span>Deviasi: <b style={{ color: 'var(--ink)' }}>{f1(hoveredProj.dv ?? 0)}%</b></span>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '4px', fontSize: '10.5px', color: 'var(--mute)', textAlign: 'center' }}>
          Arahkan kursor ke titik bubble untuk detail project, klik untuk membuka.
        </div>
      )}
    </div>
  );
}

// Modern Vertical Column Bar Chart for PIC Workload
function PicBarChart({
  data,
  onSelectPic,
  selectedPic
}: {
  data: [string, number][];
  onSelectPic?: (pic: string) => void;
  selectedPic?: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="src">Tidak ada data untuk filter ini.</p>;
  }

  const maxVal = Math.max(...data.map(d => d[1]), 1);
  const total = data.reduce((a, b) => a + b[1], 0);

  // SVG dimensions
  const barCount = data.length;
  const W = Math.max(650, barCount * 50);
  const H = 340;
  const padL = 42;
  const padR = 24;
  const padT = 38;
  const padB = 62;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const barSlotW = chartW / barCount;
  const barW = Math.min(36, Math.max(18, barSlotW * 0.62));

  // Y-axis grid ticks
  const yTicks = [0, Math.ceil(maxVal / 2), maxVal];
  const uniqueYTicks = Array.from(new Set(yTicks));

  // Garis rata-rata beban per PIC (contoh: 78 kontrak / 13 PIC = 6)
  const avg = total / data.length;
  const avgY = padT + chartH - (avg / maxVal) * chartH;

  return (
    <div className="pic-column-chart-container">
      <div className="pic-vbar-chart-card">
        <svg viewBox={`0 0 ${W} ${H}`} className="pic-vbar-chart-svg">
          <defs>
            <linearGradient id="picBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="picBarGradHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="picBarGradActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Sumbu Y Title */}
          <text
            transform={`translate(${padL - 28}, ${padT + chartH / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize="10"
            fill="var(--mute)"
            fontWeight="700"
          >
            Jumlah Kontrak
          </text>

          {/* Grid lines and Y labels */}
          {uniqueYTicks.map(val => {
            const yPos = padT + chartH - (val / maxVal) * chartH;
            return (
              <g key={val}>
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={yPos}
                  y2={yPos}
                  stroke="var(--line)"
                  strokeDasharray={val === 0 ? 'none' : '3 3'}
                  strokeWidth={val === 0 ? 1.2 : 0.8}
                />
                <text
                  x={padL - 6}
                  y={yPos + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--mute)"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Garis rata-rata */}
          <line
            x1={padL}
            x2={W - padR}
            y1={avgY}
            y2={avgY}
            stroke="var(--mute)"
            strokeDasharray="5 4"
            strokeWidth={1.2}
            opacity={0.6}
          />
          <text
            x={W - padR}
            y={avgY - 6}
            textAnchor="end"
            fontSize="11"
            fill="var(--mute)"
            fontWeight="700"
          >
            Rata-rata {Math.round(avg)}
          </text>

          {/* Bars */}
          {data.map(([pic, val], i) => {
            const barH = Math.max(4, (val / maxVal) * chartH);
            const x = padL + i * barSlotW + (barSlotW - barW) / 2;
            const y = padT + chartH - barH;
            const isHovered = hoveredIdx === i;
            const isSelected = selectedPic === pic;

            let fillGrad = 'url(#picBarGrad)';
            if (isSelected) fillGrad = 'url(#picBarGradActive)';
            else if (isHovered) fillGrad = 'url(#picBarGradHover)';

            return (
              <g
                key={pic}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectPic && onSelectPic(isSelected ? '' : pic)}
                style={{ cursor: onSelectPic ? 'pointer' : 'default' }}
              >
                {/* Background hover column hit area */}
                <rect
                  x={padL + i * barSlotW + 2}
                  y={padT}
                  width={barSlotW - 4}
                  height={chartH}
                  fill={isHovered ? 'rgba(37, 99, 235, 0.05)' : 'transparent'}
                  rx={6}
                />

                {/* Actual Bar */}
                <rect
                  className="pic-vbar-bar-rect"
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={5}
                  fill={fillGrad}
                />

                {/* Bar Value on Top */}
                <text
                  x={x + barW / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isSelected ? '#d97706' : isHovered ? '#2563eb' : 'var(--ink)'}
                  fontWeight="800"
                >
                  {val}
                </text>

                {/* PIC Name on X Axis */}
                <text
                  x={x + barW / 2}
                  y={H - padB + 16}
                  textAnchor="middle"
                  fontSize="10.5"
                  fill={isSelected ? '#d97706' : isHovered ? 'var(--ink)' : 'var(--mute)'}
                  fontWeight={isSelected || isHovered ? '700' : '600'}
                >
                  {pic.length > 7 ? `${pic.slice(0, 6)}.` : pic}
                </text>
              </g>
            );
          })}

          {/* Sumbu X Title */}
          <text
            x={padL + chartW / 2}
            y={H - 10}
            textAnchor="middle"
            fontSize="10"
            fill="var(--mute)"
            fontWeight="700"
          >
            PIC
          </text>
        </svg>

        {hoveredIdx !== null && (
          <div
            style={{
              marginTop: '6px',
              padding: '6px 12px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              fontSize: '11.5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>
              PIC: <b style={{ color: 'var(--ink)' }}>{data[hoveredIdx][0]}</b>
            </span>
            <span>
              Beban Kontrak: <b style={{ color: '#2563eb' }}>{data[hoveredIdx][1]}</b> (
              {total > 0 ? ((data[hoveredIdx][1] / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        )}
      </div>

      <div className="pic-vbar-chart-summary">
        <span>Total PIC: <b>{data.length} Orang</b></span>
        <span>Total Beban: <b>{total} Kontrak</b></span>
      </div>
    </div>
  );
}

// Formal Statistical Distribution Chart for Contract Values (Horizontal Bar Chart)
function StatisticalBucketChart({
  data,
  selectedBucket,
  onSelectBucket,
  totalFilteredContracts
}: {
  data: [string, number, string][];
  selectedBucket?: string;
  onSelectBucket?: (bucket: string) => void;
  totalFilteredContracts: number;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalN = totalFilteredContracts > 0 ? totalFilteredContracts : data.reduce((a, b) => a + b[1], 0);

  // Classification metadata for formal statistical tiers
  const tierMeta: Record<string, { label: string; desc: string; color: string }> = {
    '0 - 2.5M': { label: 'Mikro / Kecil', desc: '< Rp2.5 Miliar', color: '#3b82f6' },
    '2.5M - 5M': { label: 'Menengah Bawah', desc: 'Rp2.5M - Rp5M', color: '#06b6d4' },
    '5M - 10M': { label: 'Menengah Atas', desc: 'Rp5M - Rp10M', color: '#6366f1' },
    '> 10M': { label: 'Signifikan / Besar', desc: '> Rp10 Miliar', color: '#8b5cf6' }
  };

  let runningCum = 0;
  const statRows = data.map(([bucket, count]) => {
    runningCum += count;
    const propPct = totalN > 0 ? Number(((count / totalN) * 100).toFixed(1)) : 0;
    const cumPct = totalN > 0 ? Number(((runningCum / totalN) * 100).toFixed(1)) : 0;
    return {
      bucket,
      count,
      propPct,
      cumCount: runningCum,
      cumPct,
      meta: tierMeta[bucket] || { label: 'Interval', desc: '', color: '#2563eb' }
    };
  });

  // SVG Chart Geometry for Horizontal Bars
  const W = 650;
  const H = 340;
  const padL = 130;
  const padR = 65;
  const padT = 38;
  const padB = 48;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxFreq = Math.max(...data.map(d => d[1]), 1);
  const xCeil = Math.max(5, Math.ceil(maxFreq / 5) * 5);
  const xTicks = [0, xCeil * 0.5, xCeil].map(v => Math.round(v));
  const uniqueXTicks = Array.from(new Set(xTicks));

  const binCount = statRows.length;
  const rowH = chartH / Math.max(1, binCount);
  const barH = Math.min(34, rowH * 0.65);

  const getXPos = (val: number) => padL + (val / xCeil) * chartW;

  return (
    <div className="stat-dist-container">
      <div className="stat-chart-card">
        <div className="stat-chart-header">
          <div className="stat-chart-legend">
            <span style={{ fontSize: '11px', color: 'var(--mute)', fontWeight: 600 }}>
              Total: <strong style={{ color: 'var(--ink)' }}>{totalN}</strong> kontrak
            </span>
          </div>
          {selectedBucket && (
            <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>
              Filter Terpilih: {selectedBucket} (Klik bar untuk melepas)
            </span>
          )}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="stat-chart-svg">
          <defs>
            <linearGradient id="hBarGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style={{ stopColor: 'var(--accent-2)', stopOpacity: 0.85 }} />
              <stop offset="100%" style={{ stopColor: 'var(--accent-2)' }} />
            </linearGradient>
            <linearGradient id="hBarGradHover" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style={{ stopColor: 'var(--accent-2)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--accent-2)' }} />
            </linearGradient>
            <linearGradient id="hBarGradActive" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Sumbu Y Title */}
          <text
            transform={`translate(24, ${padT + chartH / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize="10"
            fill="var(--mute)"
            fontWeight="700"
          >
            Nilai Kontrak
          </text>

          {/* Grid lines and X-Axis ticks */}
          {uniqueXTicks.map(val => {
            const x = getXPos(val);
            return (
              <g key={`x-${val}`}>
                <line
                  x1={x}
                  x2={x}
                  y1={padT}
                  y2={H - padB}
                  stroke="var(--line)"
                  strokeDasharray={val === 0 ? 'none' : '3 3'}
                  strokeWidth={val === 0 ? 1.2 : 0.8}
                />
                <text
                  x={x}
                  y={H - padB + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--mute)"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Sumbu X Title */}
          <text
            x={padL + chartW / 2}
            y={H - 8}
            textAnchor="middle"
            fontSize="10"
            fill="var(--mute)"
            fontWeight="700"
          >
            Jumlah Kontrak
          </text>

          {/* Horizontal Bars */}
          {statRows.map((r, i) => {
            const isHovered = hoveredIdx === i;
            const isSelected = selectedBucket === r.bucket;
            const barW = Math.max(4, (r.count / xCeil) * chartW);
            const y = padT + i * rowH + (rowH - barH) / 2;

            let fillGrad = 'url(#hBarGrad)';
            if (isSelected) fillGrad = 'url(#hBarGradActive)';
            else if (isHovered) fillGrad = 'url(#hBarGradHover)';

            return (
              <g
                key={r.bucket}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectBucket && onSelectBucket(isSelected ? '' : r.bucket)}
                style={{ cursor: onSelectBucket ? 'pointer' : 'default' }}
              >
                {/* Row background highlight */}
                <rect
                  x={padL}
                  y={padT + i * rowH}
                  width={chartW}
                  height={rowH}
                  fill={isHovered ? 'rgba(124, 92, 224, 0.07)' : 'transparent'}
                  rx={4}
                />

                {/* Left Label (Bucket & Category) */}
                <text
                  x={padL - 10}
                  y={y + barH / 2 - 2}
                  textAnchor="end"
                  fontSize="11"
                  fill={isSelected ? '#f59e0b' : 'var(--ink)'}
                  fontWeight={isSelected ? '800' : '700'}
                >
                  {r.bucket}
                </text>
                <text
                  x={padL - 10}
                  y={y + barH / 2 + 10}
                  textAnchor="end"
                  fontSize="9"
                  fill="var(--mute)"
                  fontWeight="600"
                >
                  {r.meta.label}
                </text>

                {/* Horizontal Bar Rect */}
                <rect
                  x={padL}
                  y={y}
                  width={barW}
                  height={barH}
                  rx="4"
                  ry="4"
                  fill={fillGrad}
                  stroke={isSelected ? '#f59e0b' : isHovered ? 'var(--accent-2)' : 'rgba(255,255,255,0.1)'}
                  strokeWidth={isSelected ? 2 : 1}
                />

                {/* Value & Percentage on right of bar */}
                <text
                  x={padL + barW + 8}
                  y={y + barH / 2 + 4}
                  textAnchor="start"
                  fontSize="11"
                  fill={isSelected ? '#f59e0b' : 'var(--ink)'}
                  fontWeight="800"
                >
                  {r.count} <tspan fontSize="9.5" fill="var(--mute)" fontWeight="700">({r.propPct}%)</tspan>
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip on Hover */}
        {hoveredIdx !== null && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 14px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              fontSize: '11.5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <span>
              Interval: <b style={{ color: 'var(--ink)' }}>{statRows[hoveredIdx].bucket}</b> ({statRows[hoveredIdx].meta.label})
            </span>
            <span>
              Frekuensi (f<sub>i</sub>): <b style={{ color: 'var(--accent-2-ink)' }}>{statRows[hoveredIdx].count} kontrak</b> ({statRows[hoveredIdx].propPct}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Timeline Akhir Kontrak (Titik per Project terhadap Garis Hari Ini)
interface TimelineDeadlineItem {
  id: string | number;
  source: 'G' | 'C'; // Ongoing vs Closed/Selesai
  name: string;
  pic: string;
  endDate: string; // YYYY-MM-DD
  diffDays: number; // endDate - today in days
  statusCategory: 'LEWAT' | 'MENDEKATI' | 'AMAN';
  progress: number;
  rawStatus?: string;
}

function TimelineContractDeadlines({
  items,
  todayStr
}: {
  items: TimelineDeadlineItem[];
  todayStr?: string;
}) {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'LEWAT' | 'MENDEKATI' | 'AMAN'>('ALL');

  if (items.length === 0) {
    return <p className="src">Tidak ada data kontrak dengan tanggal akhir untuk filter ini.</p>;
  }

  const effectiveTodayStr = useMemo(() => {
    if (todayStr) return todayStr;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [todayStr]);

  const todayMs = useMemo(() => new Date(effectiveTodayStr).getTime(), [effectiveTodayStr]);

  // Summary counts
  const countLewat = items.filter(it => it.statusCategory === 'LEWAT').length;
  const countMendekati = items.filter(it => it.statusCategory === 'MENDEKATI').length;
  const countAman = items.filter(it => it.statusCategory === 'AMAN').length;

  // Filtered items
  const displayItems = items.filter(it => {
    if (filterCategory === 'ALL') return true;
    return it.statusCategory === filterCategory;
  });

  // Calculate timeline min & max date for plotting
  const allDates = items.map(it => new Date(it.endDate).getTime());
  const minDateMs = Math.min(...allDates, todayMs - 30 * 86400000);
  const maxDateMs = Math.max(...allDates, todayMs + 60 * 86400000);
  const spanMs = maxDateMs - minDateMs || 1;

  // SVG timeline visualization (Scatter dot plot against today line)
  const W = 620;
  const H = 160;
  const padL = 40;
  const padR = 40;
  const padT = 30;
  const padB = 40;
  const chartW = W - padL - padR;

  const toX = (dateMs: number) => padL + ((dateMs - minDateMs) / spanMs) * chartW;
  const todayX = toX(todayMs);

  const formatDate = (ms: number) =>
    new Date(ms).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

  // Month markers
  const monthMarkers: { ms: number; label: string }[] = [];
  const cur = new Date(minDateMs);
  cur.setDate(1);
  while (cur.getTime() <= maxDateMs) {
    monthMarkers.push({
      ms: cur.getTime(),
      label: cur.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
    });
    cur.setMonth(cur.getMonth() + 3); // every quarter
  }

  return (
    <div className="timeline-deadline-panel">
      {/* KPI Chips: Lewat, Mendekati, Aman */}
      <div className="timeline-deadline-kpi-bar">
        <button
          type="button"
          className={`td-kpi-chip danger ${filterCategory === 'LEWAT' ? 'active' : ''}`}
          onClick={() => setFilterCategory(prev => (prev === 'LEWAT' ? 'ALL' : 'LEWAT'))}
          style={{ cursor: 'pointer', background: filterCategory === 'LEWAT' ? 'rgba(239, 68, 68, 0.18)' : undefined }}
        >
          <span className="td-kpi-val">{countLewat}</span>
          <span className="td-kpi-lbl">Lewat Batas Waktu</span>
        </button>

        <button
          type="button"
          className={`td-kpi-chip warning ${filterCategory === 'MENDEKATI' ? 'active' : ''}`}
          onClick={() => setFilterCategory(prev => (prev === 'MENDEKATI' ? 'ALL' : 'MENDEKATI'))}
          style={{ cursor: 'pointer', background: filterCategory === 'MENDEKATI' ? 'rgba(245, 158, 11, 0.18)' : undefined }}
        >
          <span className="td-kpi-val">{countMendekati}</span>
          <span className="td-kpi-lbl">Mendekati (&lt; 60 Hari)</span>
        </button>

        <button
          type="button"
          className={`td-kpi-chip safe ${filterCategory === 'AMAN' ? 'active' : ''}`}
          onClick={() => setFilterCategory(prev => (prev === 'AMAN' ? 'ALL' : 'AMAN'))}
          style={{ cursor: 'pointer', background: filterCategory === 'AMAN' ? 'rgba(16, 185, 129, 0.18)' : undefined }}
        >
          <span className="td-kpi-val">{countAman}</span>
          <span className="td-kpi-lbl">Aman (&gt; 60 Hari)</span>
        </button>

        <button
          type="button"
          className={`td-kpi-chip all ${filterCategory === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterCategory('ALL')}
          style={{ cursor: 'pointer', background: filterCategory === 'ALL' ? 'rgba(37, 99, 235, 0.12)' : undefined }}
        >
          <span className="td-kpi-val">{items.length}</span>
          <span className="td-kpi-lbl">Total Proyek / Kontrak</span>
        </button>
      </div>

      {/* SVG Scatter Plot: Points of projects against "Hari Ini" line */}
      <div className="timeline-deadline-chart-card">
        <svg viewBox={`0 0 ${W} ${H}`} className="timeline-deadline-chart-svg">
          {/* Axis horizontal */}
          <line
            x1={padL}
            x2={W - padR}
            y1={H - padB}
            y2={H - padB}
            stroke="var(--line)"
            strokeWidth={1.5}
          />

          {/* Month tick marks */}
          {monthMarkers.map((m, idx) => {
            const x = toX(m.ms);
            if (x < padL || x > W - padR) return null;
            return (
              <g key={idx}>
                <line
                  x1={x}
                  x2={x}
                  y1={H - padB}
                  y2={H - padB + 5}
                  stroke="var(--line)"
                />
                <text
                  x={x}
                  y={H - padB + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--mute)"
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* Lewat Zone shading (Left of Today) */}
          <rect
            x={padL}
            y={padT - 10}
            width={Math.max(0, todayX - padL)}
            height={H - padT - padB + 10}
            fill="rgba(239, 68, 68, 0.04)"
            rx={4}
          />

          {/* Mendekati Zone shading (0 to 60 days right of Today) */}
          {(() => {
            const endMendekatiX = toX(todayMs + 60 * 86400000);
            const wM = Math.max(0, Math.min(W - padR, endMendekatiX) - todayX);
            return (
              <rect
                x={todayX}
                y={padT - 10}
                width={wM}
                height={H - padT - padB + 10}
                fill="rgba(245, 158, 11, 0.05)"
                rx={4}
              />
            );
          })()}

          {/* Vertical "HARI INI" Line */}
          <line
            x1={todayX}
            x2={todayX}
            y1={padT - 14}
            y2={H - padB + 4}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="4 3"
          />

          {/* "Hari Ini" Marker Label */}
          <g transform={`translate(${todayX}, ${padT - 16})`}>
            <rect
              x={-28}
              y={-14}
              width={56}
              height={16}
              rx={4}
              fill="#ef4444"
            />
            <text
              x={0}
              y={-3}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9.5"
              fontWeight="800"
            >
              HARI INI
            </text>
          </g>

          {/* Project Points (Scatter circles staggered vertically to avoid overlaps) */}
          {displayItems.map((item, idx) => {
            const itemMs = new Date(item.endDate).getTime();
            const cx = toX(itemMs);
            // Stagger y across 4 lanes
            const lane = idx % 4;
            const cy = padT + 12 + lane * 18;
            const isHovered = hoveredId === item.id;

            let color = '#10b981'; // Aman
            if (item.statusCategory === 'LEWAT') color = '#ef4444';
            else if (item.statusCategory === 'MENDEKATI') color = '#f59e0b';

            return (
              <g
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Thin stem connecting to axis */}
                <line
                  x1={cx}
                  x2={cx}
                  y1={cy}
                  y2={H - padB}
                  stroke={color}
                  strokeWidth={0.8}
                  strokeDasharray="2 2"
                  opacity={isHovered ? 0.9 : 0.35}
                />

                {/* Circle point */}
                <circle
                  className="td-point-circle"
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7.5 : 5}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />
              </g>
            );
          })}
        </svg>

        {hoveredId !== null ? (() => {
          const hoveredItem = items.find(it => it.id === hoveredId);
          if (!hoveredItem) return null;
          return (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                fontSize: '11.5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}
            >
              <div>
                <b style={{ color: 'var(--ink)' }}>{hoveredItem.name}</b>
                <div style={{ color: 'var(--mute)', fontSize: '11px', marginTop: '2px' }}>
                  PIC: {hoveredItem.pic} • Akhir: {hoveredItem.endDate} ({hoveredItem.source === 'G' ? 'Ongoing' : 'Closed'})
                </div>
              </div>
              <span
                className={`td-item-status-tag ${
                  hoveredItem.statusCategory === 'LEWAT'
                    ? 'lewat'
                    : hoveredItem.statusCategory === 'MENDEKATI'
                    ? 'mendekati'
                    : 'aman'
                }`}
              >
                {hoveredItem.statusCategory === 'LEWAT'
                  ? `Lewat ${Math.abs(hoveredItem.diffDays)} Hari`
                  : hoveredItem.statusCategory === 'MENDEKATI'
                  ? `Mendekati (${hoveredItem.diffDays} Hari lagi)`
                  : `Aman (${hoveredItem.diffDays} Hari lagi)`}
              </span>
            </div>
          );
        })() : (
          <p className="src" style={{ margin: '8px 0 0', textAlign: 'center', fontSize: '11px' }}>
            Arahkan kursor ke titik project pada timeline untuk melihat detail proyek, PIC, batas waktu, dan status keterlambatan.
          </p>
        )}
      </div>
    </div>
  );
}

// Helper to parse Indonesian date strings from BAMK or free text (e.g. "25 Jul 2024", "27 Desember 2024")
function parseIndoDate(str: string | null | undefined): string | null {
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const match = str.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!match) return null;
  const d = match[1].padStart(2, '0');
  const monthNames: Record<string, string> = {
    jan: '01', januari: '01',
    feb: '02', februari: '02',
    mar: '03', maret: '03',
    apr: '04', april: '04',
    mei: '05', may: '05',
    jun: '06', juni: '06',
    jul: '07', juli: '07',
    agu: '08', agustus: '08', aug: '08',
    sep: '09', september: '09',
    okt: '10', oktober: '10', oct: '10',
    nov: '11', november: '11',
    des: '12', desember: '12', dec: '12',
  };
  const m = monthNames[match[2].toLowerCase().slice(0, 3)] || monthNames[match[2].toLowerCase()] || '01';
  const y = match[3];
  return `${y}-${m}-${d}`;
}

// Convert date string YYYY-MM-DD or YYYY-MM to Kurva S month index (0 = Jan 2024, 31 = Agu 2026, 32 = Sep 2026)
function dateToKurvaMonthIndex(dateStr: string): number {
  if (!dateStr) return 31;
  const clean = dateStr.trim();
  const isoMatch = clean.match(/^(\d{4})-(\d{1,2})/);
  if (isoMatch) {
    const y = Number(isoMatch[1]);
    const m = Number(isoMatch[2]);
    const idx = (y - 2024) * 12 + (m - 1);
    return Math.max(0, Math.min(32, idx));
  }
  const textMatch = clean.match(/([a-zA-Z]+)\s*(\d{4})/);
  if (textMatch) {
    const monthNames: Record<string, number> = {
      jan: 0, januari: 0,
      feb: 1, februari: 1,
      mar: 2, maret: 2,
      apr: 3, april: 3,
      mei: 4, may: 4,
      jun: 5, juni: 5, june: 5,
      jul: 6, juli: 6, july: 6,
      agu: 7, agustus: 7, aug: 7, august: 7,
      sep: 8, september: 8,
      okt: 9, oktober: 9, oct: 9, october: 9,
      nov: 10, november: 10,
      des: 11, desember: 11, dec: 11, december: 11
    };
    const mKey = textMatch[1].toLowerCase().slice(0, 3);
    const mIdx = monthNames[mKey] ?? 7;
    const y = Number(textMatch[2]);
    const idx = (y - 2024) * 12 + mIdx;
    return Math.max(0, Math.min(32, idx));
  }
  const parts = clean.split('-');
  if (parts.length >= 2) {
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const idx = (y - 2024) * 12 + (m - 1);
    return Math.max(0, Math.min(32, idx));
  }
  return 31;
}

// Check if a MasterProject overlaps with the selected date range
function isProjectInDateRange(m: MasterProject, start: string, end: string): boolean {
  if (!start && !end) return true;
  const pStart = parseIndoDate(m.bamk) || '2024-01-01';
  const pEnd = m.akd || '2027-12-31';
  if (start && pEnd < start) return false;
  if (end && pStart > end) return false;
  return true;
}

const NAV_ITEMS = [
  { id: 't1', title: 'Overview', sub: 'Ringkasan & KPI Portofolio', Icon: LayoutDashboard },
  { id: 't2', title: 'Detail Project', sub: 'Daftar Project & Status Update', Icon: FolderKanban },
  { id: 't4', title: 'Kurva S', sub: 'Plan vs Realisasi Progres', Icon: TrendingUp },
  { id: 't3', title: 'Document Tracking', sub: 'Kelengkapan Dokumen Kontrak', Icon: FileCheck2 },
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<'t1' | 't2' | 't4' | 't3'>('t1');

  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = initAuth(
      (u) => setGoogleUser(u),
      () => setGoogleUser(null)
    );
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setStatusToast('Akun Google terhubung. Update status akan otomatis tercatat ke Google Sheets!');
        setTimeout(() => setStatusToast(null), 3500);
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
    }
  };

  const handleGoogleSignOut = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setStatusToast('Koneksi Google Sheets diputuskan.');
    setTimeout(() => setStatusToast(null), 3000);
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPinned, setMenuPinned] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem('menu-pinned') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('menu-pinned', String(menuPinned));
  }, [menuPinned]);

  const drawerVisible = menuOpen || menuPinned;

  const pickTab = (id: typeof activeTab) => {
    setActiveTab(id);
    if (!menuPinned) setMenuOpen(false); // auto-hide setelah pilih menu
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setMenuOpen(p => !p);
      }
      if (e.key === 'Escape' && !menuPinned) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuPinned]);

  // Dark and Light Mode System
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Tab 1 (Ringkasan) Filters
  const [fs, setFs] = useState<string>(''); // Status filter
  const [fo, setFo] = useState<string>(''); // Pemilik filter
  const [showAllSafe, setShowAllSafe] = useState<boolean>(false);
  const [criticalFilter, setCriticalFilter] = useState<'ALL' | 'Delayed' | 'At risk'>('ALL');

  // Tab 2 (Detail project) Filters & Modal
  const [gs, setGs] = useState<string>(''); // Kelompok filter
  const [ss, setSs] = useState<string>(''); // Status filter
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Global search input for topbar
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Tab 4 (Kurva S) Selector
  const [kSel, setKSel] = useState<string>('p'); // 'p' or project index string

  // Tab 3 (Kelengkapan dokumen) Filters
  const [dsS, setDsS] = useState<string>(''); // G, C, ''
  const [dsP, setDsP] = useState<string>(''); // PIC
  const [dsJ, setDsJ] = useState<string>(''); // '', 'U', 'V'
  const [dsB, setDsB] = useState<string>(''); // Bucket

  // Filter Rentang Tanggal Kalender (Global Across All Pages)
  // Isi input tanggal (apa adanya yang dipilih user)
  const [startInput, setStartInput] = useState<string>(''); // YYYY-MM-DD
  const [endInput, setEndInput] = useState<string>(''); // YYYY-MM-DD

  // Filter tanggal aktif secara mandiri maupun bersamaan:
  // Merespons seketika jika user hanya memilih batas akhir (misal sampai Juni 2026),
  // batas awal saja, maupun ketika rentang awal dan akhir dipilih bersamaan.
  const validStart = startInput && startInput >= '1900-01-01' ? startInput : '';
  const validEnd = endInput && endInput >= '1900-01-01' ? endInput : '';
  const dateStart = validStart && validEnd && validStart > validEnd ? '' : validStart;
  const dateEnd = validEnd;

  // Handler Reset Filter Global (Mereset seluruh filter aktif + rentang tanggal)
  const handleResetFilters = () => {
    setFs('');
    setFo('');
    setGs('');
    setSs('');
    setDsS('');
    setDsP('');
    setDsJ('');
    setDsB('');
    setKSel('p');
    setGlobalSearch('');
    setStartInput('');
    setEndInput('');
    setShowAllSafe(false);
    setCriticalFilter('ALL');
  };

  // Project Status Updates & History State (Persisted in localStorage)
  const [projectUpdates, setProjectUpdates] = useState<Record<number, ProjectStatusUpdate>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('project_status_updates_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.keys(parsed).forEach(k => {
            const no = Number(k);
            if (parsed[no] && (!parsed[no].author || /sistem|bima|user|tim\s*proyek/i.test(parsed[no].author))) {
              parsed[no].author = getProjectPic(no);
            }
          });
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  const [statusHistory, setStatusHistory] = useState<Record<number, StatusHistoryEntry[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('project_status_history_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.keys(parsed).forEach(k => {
            const no = Number(k);
            if (Array.isArray(parsed[no])) {
              parsed[no] = parsed[no].map((entry: StatusHistoryEntry) => {
                if (!entry.author || /sistem|bima|user|tim\s*proyek/i.test(entry.author)) {
                  return { ...entry, author: getProjectPic(no) };
                }
                return entry;
              });
            }
          });
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  const [projectIdentityEdits, setProjectIdentityEdits] = useState<Record<number, Partial<MasterProject>>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('project_identity_edits_v3');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  const [isIdentityEditOpen, setIsIdentityEditOpen] = useState(false);
  const [identityToast, setIdentityToast] = useState<string | null>(null);
  const [identityForm, setIdentityForm] = useState({
    n: '',
    wbs: '',
    pic: '',
    pem: '',
    bamk: '',
    ak: '',
    akt: '',
    nv: 0
  });

  const handleSaveIdentityEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIdx === null || !projects[selectedIdx]) return;
    const p = projects[selectedIdx];
    setProjectIdentityEdits(prev => ({
      ...prev,
      [p.no]: {
        n: identityForm.n,
        wbs: identityForm.wbs,
        pic: identityForm.pic,
        pem: identityForm.pem,
        bamk: identityForm.bamk,
        ak: identityForm.ak,
        akt: identityForm.akt,
        nv: identityForm.nv,
        nt: `Rp ${identityForm.nv.toLocaleString('id-ID')} Miliar`
      }
    }));
    setIsIdentityEditOpen(false);
    setIdentityToast('Project identity berhasil diperbarui.');
    setTimeout(() => setIdentityToast(null), 3000);

  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('project_status_updates_v2', JSON.stringify(projectUpdates));
    } catch (e) {
      console.error(e);
    }
  }, [projectUpdates]);

  useEffect(() => {
    try {
      localStorage.setItem('project_identity_edits_v3', JSON.stringify(projectIdentityEdits));
    } catch (e) {
      console.error(e);
    }
  }, [projectIdentityEdits]);

  useEffect(() => {
    try {
      localStorage.setItem('project_status_history_v2', JSON.stringify(statusHistory));
    } catch (e) {
      console.error(e);
    }
  }, [statusHistory]);

  // Merged live projects data reflecting all status and situation updates
  const projects = useMemo(() => {
    return M.map(m => {
      const idEdit = projectIdentityEdits[m.no] || {};
      const up = projectUpdates[m.no];
      const rawWbs = idEdit.wbs !== undefined && idEdit.wbs !== '' ? idEdit.wbs : m.wbs;
      const rawSt = up?.st || idEdit.st || m.st;
      return {
        ...m,
        ...idEdit,
        wbs: rawWbs,
        st: rawSt,
        s: normalizeStatus(rawSt),
        sit: up?.sit ?? idEdit.sit ?? m.sit,
        mit: up?.mit ?? idEdit.mit ?? m.mit,
      };
    });
  }, [projectUpdates, projectIdentityEdits]);

  const f1 = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 1 });

  const formatIndoDate = (val?: string | null): string => {
    if (!val || val.trim() === '-' || val.trim() === '—' || val.trim() === '') return '-';
    const clean = val.trim();
    if (/[a-zA-Z]{3,}/.test(clean)) return clean;
    const mMatch = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (mMatch) {
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      let m = Number(mMatch[1]);
      let d = Number(mMatch[2]);
      const y = Number(mMatch[3]);
      if (m > 12 && d <= 12) {
        const temp = m;
        m = d;
        d = temp;
      }
      if (m >= 1 && m <= 12) {
        const dayStr = d < 10 ? `0${d}` : `${d}`;
        return `${dayStr} ${months[m - 1]} ${y}`;
      }
    }
    return clean;
  };

  // Ongoing projects from Live Projects
  const P = useMemo(() => {
    return projects.filter(m => isOngoingGroup(m.g));
  }, [projects]);

  // Dynamic Kurva S Cutoff & Range based on Date Filter (Prioritas tanggal akhir, fallback tanggal awal)
  const effectiveCutoffDate = dateEnd || dateStart;

  const cutoffMonthIdx = useMemo(() => {
    if (effectiveCutoffDate) {
      const idx = dateToKurvaMonthIndex(effectiveCutoffDate);
      return Math.min(31, idx);
    }
    return 31; // Default Agu 2026 (Data realisasi terakhir)
  }, [effectiveCutoffDate]);

  // True kalau tanggal cut-off melewati data Kurva S (data terakhir: Agu 2026)
  const dateEndBeyondData = !!effectiveCutoffDate && dateToKurvaMonthIndex(effectiveCutoffDate) > 31;

  const startMonthIdx = useMemo(() => {
    if (dateStart) {
      return dateToKurvaMonthIndex(dateStart);
    }
    return 0; // Default Jan 2024
  }, [dateStart]);

  const cutoffMonthLabel = useMemo(() => {
    const mn = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    if (effectiveCutoffDate) {
      const clean = effectiveCutoffDate.trim();
      const isoMatch = clean.match(/^(\d{4})-(\d{1,2})/);
      if (isoMatch) {
        const y = Number(isoMatch[1]);
        const m = Number(isoMatch[2]);
        if (m >= 1 && m <= 12) {
          return `${mn[m - 1]} ${y}`;
        }
      }
    }
    const month = mn[cutoffMonthIdx % 12];
    const year = 2024 + Math.floor(cutoffMonthIdx / 12);
    return `${month} ${year}`;
  }, [effectiveCutoffDate, cutoffMonthIdx]);

  const devVal = useMemo(() => {
    const p = K.port.p[cutoffMonthIdx] ?? 0;
    const r = K.port.r[cutoffMonthIdx] ?? 0;
    return Number((r - p).toFixed(1));
  }, [cutoffMonthIdx]);

  // Dynamic current date (Hari ini) - otomatis mengikuti pergantian hari dan tanggal secara real-time
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    const handleRefreshDate = () => {
      if (document.visibilityState === 'visible') {
        setCurrentDate(new Date());
      }
    };
    document.addEventListener('visibilitychange', handleRefreshDate);
    window.addEventListener('focus', handleRefreshDate);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleRefreshDate);
      window.removeEventListener('focus', handleRefreshDate);
    };
  }, []);

  const todayIso = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentDate]);

  const todayDisplayLabel = useMemo(() => {
    return currentDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [currentDate]);

  const todayFullLabel = useMemo(() => {
    return currentDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [currentDate]);

  // Helper for remaining / late days (selisih hari terhadap hari ini secara dinamis & presisi kalender)
  const sisa = useCallback((iso: string | null) => {
    if (!iso) return null;
    const now = currentDate;
    const todayMidnight = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

    const match = iso.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const targetMidnight = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      return Math.round((targetMidnight - todayMidnight) / 86400000);
    }
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const targetMidnight = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((targetMidnight - todayMidnight) / 86400000);
  }, [currentDate]);

  // Tab 1 Filtered List (Respects Date Range)
  const homeList = useMemo(() => {
    return P.map((m, i) => ({
      m,
      i,
      o: OW[i] || m.pem,
    })).filter(x => {
      const matchStatus =
        !fs ||
        (fs === 'Ongoing' && x.m.st === 'Ongoing') ||
        (fs === 'Delayed' && x.m.st === 'Delayed') ||
        (fs === 'At risk' && x.m.st === 'At risk') ||
        (fs === 'Finished' && x.m.st === 'Finished') ||
        (fs === 'Closed' && x.m.st === 'Closed');
      const matchOwner = !fo || x.o === fo;
      const matchSearch =
        !globalSearch ||
        x.m.n.toLowerCase().includes(globalSearch.toLowerCase()) ||
        x.o.toLowerCase().includes(globalSearch.toLowerCase());
      const matchDate = isProjectInDateRange(x.m, dateStart, dateEnd);
      return matchStatus && matchOwner && matchSearch && matchDate;
    });
  }, [P, fs, fo, globalSearch, dateStart, dateEnd]);

  // Tab 1 Remaining days sorted (Akhir kontrak within selected Date Range)
  const homeDeadlineList = useMemo(() => {
    return homeList
      .map(x => {
        const rawD = sisa(x.m.akd);
        const isDone = x.m.st === 'Finished'   
        const d = isDone && rawD !== null && rawD < 0 ? 0 : rawD;
        return { x, d };
      })
      .filter((y): y is { x: typeof homeList[0]; d: number } => y.d !== null)
      .filter(y => {
        if (!dateStart && !dateEnd) return true;
        const akd = y.x.m.akd;
        if (!akd) return false;
        if (dateStart && akd < dateStart) return false;
        if (dateEnd && akd > dateEnd) return false;
        return true;
      })
      .sort((a, b) => a.d - b.d);
  }, [homeList, sisa, dateStart, dateEnd]);

  // Tab 1 Status Ongoing Categorization
  const isDelayedStatus = useCallback((st: string) => /delay/i.test(st), []);
  const isAtRiskStatus = useCallback((st: string) => /risk/i.test(st), []);
  const isSafeStatus = useCallback((st: string) => !isDelayedStatus(st) && !isAtRiskStatus(st), [isDelayedStatus, isAtRiskStatus]);

  const ongoingProjects = useMemo(() => {
    return homeList.filter(x => isOngoingGroup(x.m.g));
  }, [homeList]);

  const DelayedProjects = useMemo(() => {
    return ongoingProjects.filter(x => isDelayedStatus(x.m.st));
  }, [ongoingProjects, isDelayedStatus]);

  const atRiskProjects = useMemo(() => {
    return ongoingProjects.filter(x => isAtRiskStatus(x.m.st));
  }, [ongoingProjects, isAtRiskStatus]);

  const safeProjects = useMemo(() => {
    return ongoingProjects.filter(x => isSafeStatus(x.m.st));
  }, [ongoingProjects, isSafeStatus]);

  const sortedSafeProjects = useMemo(() => {
    return [...safeProjects].sort((a, b) => {
      const aRem = sisa(a.m.akd);
      const bRem = sisa(b.m.akd);
      const aOver = aRem !== null && aRem < 0 ? 1 : 0;
      const bOver = bRem !== null && bRem < 0 ? 1 : 0;
      if (aOver !== bOver) return bOver - aOver; // yang bertag "Lewat akhir kontrak" tampil duluan
      return (aRem ?? 9999) - (bRem ?? 9999);
    });
  }, [safeProjects, sisa]);

  const displayedSafeProjects = useMemo(() => {
    return showAllSafe ? sortedSafeProjects : sortedSafeProjects.slice(0, 3);
  }, [sortedSafeProjects, showAllSafe]);

  const totalOngoing = ongoingProjects.length;
  const DelayedPercent = totalOngoing ? Math.round((DelayedProjects.length / totalOngoing) * 100) : 0;
  const atRiskPercent = totalOngoing ? Math.round((atRiskProjects.length / totalOngoing) * 100) : 0;
  const safePercent = totalOngoing ? Math.round((safeProjects.length / totalOngoing) * 100) : 0;

  // Tab 1 At risk   & Delayed
  const homeCriticalList = useMemo(() => {
    return homeList
      .filter(x => x.m.st === 'At risk' || x.m.st === 'Delayed')
      .sort((a, b) => {
        const dvA = (a.m.rl ?? 0) - (a.m.pl ?? 0);
        const dvB = (b.m.rl ?? 0) - (b.m.pl ?? 0);
        return dvA - dvB;
      });
  }, [homeList]);

  const critDelayedCount = useMemo(() => homeCriticalList.filter(x => isDelayedStatus(x.m.st)).length, [homeCriticalList, isDelayedStatus]);
  const critAtRiskCount = useMemo(() => homeCriticalList.filter(x => isAtRiskStatus(x.m.st)).length, [homeCriticalList, isAtRiskStatus]);

  const displayedCriticalList = useMemo(() => {
    if (criticalFilter === 'Delayed') {
      return homeCriticalList.filter(x => isDelayedStatus(x.m.st));
    }
    if (criticalFilter === 'At risk') {
      return homeCriticalList.filter(x => isAtRiskStatus(x.m.st));
    }
    return homeCriticalList;
  }, [homeCriticalList, criticalFilter, isDelayedStatus, isAtRiskStatus]);

  // Tab 2 Filtered List (Respects Date Range)
  const detailList = useMemo(() => {
    return projects.map((m, i) => ({ m, i })).filter(({ m }) => {
      const matchKelompok = !gs || m.g === gs;
      const matchStatus =
        !ss ||
        (ss === 'Ongoing' && m.st === 'Ongoing') ||
        (ss === 'Delayed' && m.st === 'Delayed') ||
        (ss === 'At risk' && m.st === 'At risk') ||
        (ss === 'Finished' && m.st === 'Finished') ||
        (ss === 'Closed' && m.st === 'Closed');
      const matchSearch =
        !globalSearch ||
        m.n.toLowerCase().includes(globalSearch.toLowerCase()) ||
        m.pem.toLowerCase().includes(globalSearch.toLowerCase());
      const matchDate = isProjectInDateRange(m, dateStart, dateEnd);
      return matchKelompok && matchStatus && matchSearch && matchDate;
    });
  }, [projects, gs, ss, globalSearch, dateStart, dateEnd]);

  // Status update modal manager state
  const [statusViewMode, setStatusViewMode] = useState<'view' | 'edit' | 'history'>('view');
  const [editSt, setEditSt] = useState<string>('Ongoing');
  const [editSit, setEditSit] = useState<string>('');
  const [editMit, setEditMit] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Helper to get author/PIC for a project (avoids placeholder strings like "Sistem / BIMA" or "User / Tim Proyek")
  const getProjectAuthor = useCallback((p?: MasterProject | null): string => {
    if (!p) return 'Muhaimin';
    const upAuthor = projectUpdates[p.no]?.author;
    if (upAuthor && !/sistem|bima|user|tim\s*proyek/i.test(upAuthor)) {
      return upAuthor;
    }
    return p.pic || getProjectPic(p.no);
  }, [projectUpdates]);

  // Helper to get history for currently selected project
  const currentHistory = useMemo((): StatusHistoryEntry[] => {
    if (selectedIdx === null || !projects[selectedIdx]) return [];
    const p = projects[selectedIdx];
    const defaultPic = p.pic || getProjectPic(p.no);
    const list = statusHistory[p.no];
    if (list && list.length > 0) {
      return list.map(entry => {
        let auth = entry.author;
        if (!auth || /sistem|bima|user|tim\s*proyek/i.test(auth)) {
          auth = defaultPic;
        }
        if (entry.id.startsWith('baseline-')) {
          return {
            ...entry,
            author: auth,
            sit: M[selectedIdx]?.sit || '',
            mit: M[selectedIdx]?.mit || ''
          };
        }
        return { ...entry, author: auth };
      });
    }
    return [
      {
        id: `baseline-${p.no}`,
        timestamp: 'Baseline Awal Kontrak',
        st: M[selectedIdx].st,
        sit: M[selectedIdx].sit || '',
        mit: M[selectedIdx].mit || '',
        note: 'Baseline status awal data BIMA',
        author: defaultPic
      }
    ];
  }, [selectedIdx, projects, statusHistory]);

  // Handler: Save new status update (add/update)
  const handleSaveStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIdx === null || !projects[selectedIdx]) return;
    const p = projects[selectedIdx];
    const now = new Date();
    const timestampStr =
      now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) +
      ', ' +
      now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });

    const authorName = p.pic || getProjectPic(p.no);

    const newEntry: StatusHistoryEntry = {
      id: `up-${Date.now()}`,
      timestamp: timestampStr,
      st: editSt,
      sit: editSit.trim(),
      mit: editMit.trim(),
      note: editNote.trim() || 'Pembaruan Problem & Action Plan',
      author: authorName
    };

    setProjectUpdates(prev => ({
      ...prev,
      [p.no]: {
        st: editSt,
        sit: editSit.trim(),
        mit: editMit.trim(),
        lastUpdated: timestampStr,
        author: authorName
      }
    }));

    setStatusHistory(prev => {
      const existing = prev[p.no] || [
        {
          id: `baseline-${p.no}`,
          timestamp: 'Baseline Awal Kontrak',
          st: M[selectedIdx].st,
          sit: M[selectedIdx].sit,
          mit: M[selectedIdx].mit,
          note: 'Baseline status awal data BIMA',
          author: authorName
        }
      ];
      return {
        ...prev,
        [p.no]: [newEntry, ...existing]
      };
    });

    setStatusToast(`Status update berhasil diperbarui oleh ${authorName} dan dicatat dalam riwayat!`);
    setTimeout(() => setStatusToast(null), 3500);
    setStatusViewMode('view');

    (async () => {
      let token = await getAccessToken();
      if (!token) {
        try {
          const signRes = await googleSignIn();
          if (signRes) {
            token = signRes.accessToken;
            setGoogleUser(signRes.user);
          }
        } catch (authErr) {
          console.warn('Sign-in cancelled or bypassed:', authErr);
        }
      }

      saveStatusUpdate({
        no: p.no,
        wbs: p.wbs && p.wbs !== '—' && p.wbs !== '-' ? p.wbs : (p.wbs || '—'),
        tanggal: todayIso,
        problem: newEntry.sit,
        actionPlan: newEntry.mit,
        catatan: newEntry.note
      }, token)
        .then(res => {
          if (res.ok) {
            setStatusToast(`Berhasil disimpan & tercatat pada baris ${res.targetRow} sheet 'Detail Project Catatan'!`);
            setTimeout(() => setStatusToast(null), 4500);
          } else {
            setStatusToast(res.error || 'Catatan disimpan lokal (belum terhubung ke spreadsheet)');
            setTimeout(() => setStatusToast(null), 4500);
          }
        })
        .catch(err => {
          console.error('Error syncing status update:', err);
        });
    })();
  };

  // Handler: Restore past status from history
  const handleRestoreHistory = (entry: StatusHistoryEntry) => {
    if (selectedIdx === null || !projects[selectedIdx]) return;
    const p = projects[selectedIdx];
    const defaultPic = p.pic || getProjectPic(p.no);
    const authorName = entry.author && !/sistem|bima|user|tim\s*proyek/i.test(entry.author)
      ? entry.author
      : defaultPic;

    setProjectUpdates(prev => ({
      ...prev,
      [p.no]: {
        st: entry.st,
        sit: entry.sit,
        mit: entry.mit,
        lastUpdated: entry.timestamp,
        author: authorName
      }
    }));
    setStatusToast(`Status update berhasil dipulihkan ke versi (${entry.timestamp}) oleh ${authorName}`);
    setTimeout(() => setStatusToast(null), 3500);
    setStatusViewMode('view');
  };

  // Handler: Delete history entry (mengurangi status update)
  const handleDeleteHistory = (entryId: string) => {
    if (selectedIdx === null || !projects[selectedIdx]) return;
    const p = projects[selectedIdx];

    const currentList = statusHistory[p.no] || currentHistory;
    const updatedList = currentList.filter(item => item.id !== entryId);

    // 1. Update status history state
    setStatusHistory(prev => ({
      ...prev,
      [p.no]: updatedList
    }));

    // 2. Sync projectUpdates to the new top entry or reset back to baseline
    if (updatedList.length > 0) {
      const top = updatedList[0];
      if (top.id.startsWith('baseline-') && updatedList.length === 1) {
        setProjectUpdates(prev => {
          const copy = { ...prev };
          delete copy[p.no];
          return copy;
        });
      } else {
        setProjectUpdates(prev => ({
          ...prev,
          [p.no]: {
            st: top.st,
            sit: top.sit,
            mit: top.mit,
            lastUpdated: top.timestamp,
            author: top.author
          }
        }));
      }
    } else {
      setProjectUpdates(prev => {
        const copy = { ...prev };
        delete copy[p.no];
        return copy;
      });
    }

    setStatusToast('Catatan status update berhasil dihapus dari riwayat.');
    setTimeout(() => setStatusToast(null), 3000);
  };

  const stc = (s: string) => SC[normalizeStatus(s)] || '#94a3b8';
  const stText = (_s: string) => '#ffffff';

  const getOwnerBadge = (pem: string) => {
    if (/semarang/i.test(pem)) return { code: 'TS', name: 'TPK Semarang' };
    if (/regional\s*iv|reg\.\s*iv/i.test(pem)) return { code: 'PR', name: 'Pelindo Reg. IV' };
    if (/multi\s*terminal/i.test(pem)) return { code: 'PM', name: 'Pelindo Multi Terminal' };
    if (/prima\s*terminal/i.test(pem)) return { code: 'PT', name: 'Prima Terminal' };
    if (/surabaya|tps/i.test(pem)) return { code: 'TS', name: 'TPK Surabaya' };
    if (/ipc\s*terminal/i.test(pem)) return { code: 'IT', name: 'IPC Terminal Petikemas' };
    if (/pantoloan/i.test(pem)) return { code: 'TP', name: 'TPK Pantoloan' };
    if (/ternate/i.test(pem)) return { code: 'TT', name: 'TPK Ternate' };
    if (/banjarmasin/i.test(pem)) return { code: 'TB', name: 'TPK Banjarmasin' };
    if (/makassar/i.test(pem)) return { code: 'NM', name: 'TPK New Makassar' };
    if (/teluk\s*lamong/i.test(pem)) return { code: 'TL', name: 'Terminal Teluk Lamong' };
    if (/ambon/i.test(pem)) return { code: 'TA', name: 'TPK Ambon' };
    if (/bitung/i.test(pem)) return { code: 'TB', name: 'TPK Bitung' };
    if (/pelindo\s*terminal\s*petikemas/i.test(pem)) return { code: 'PT', name: 'Pelindo Terminal Petikemas' };
    const clean = pem.replace(/^(PT|Persero)\s+/gi, '').trim();
    const words = clean.split(/\s+/).filter(w => !/^(dan|di|ke|dari|-)$/i.test(w));
    const code = ((words[0]?.[0] || 'P') + (words[1]?.[0] || 'T')).toUpperCase();
    return { code, name: clean };
  };

  const formatStatusLabel = (s: string) => {
    if (/At risk/i.test(s)) return 'At risk';
    if (/Delayed/i.test(s) && !/done/i.test(s)) return 'Delayed';
    if (/Ongoing/i.test(s)) return 'Ongoing';
    if (/done/i.test(s) || /selesai/i.test(s)) return 'Selesai';
    if (/active/i.test(s)) return 'Active';
    if (/lelang/i.test(s)) return 'Lelang';
    return s;
  };

  const getGroupColor = (g: string) => {
    if (isOngoingGroup(g)) return '#10b981';
    if (g === 'SELESAI') return '#2563eb';
    if (g === 'PO') return '#eab308';
    return '#94a3b8';
  };

  const getGroupLabel = (g: string) => {
    if (isOngoingGroup(g)) return 'Ongoing';
    if (g === 'SELESAI') return 'Selesai';
    if (g === 'PO') return 'PO';
    if (g === 'LELANG') return 'Lelang';
    return g;
  };

  const openDetailModal = (idx: number) => {
    setSelectedIdx(idx);
    setStatusViewMode('view');
    setStatusToast(null);
    setIdentityToast(null);
  };

  const ClosedetailModal = () => {
    setSelectedIdx(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        ClosedetailModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Kurva S Line Chart Render Helper (Interactive with hover crosshair & tooltip)
  const renderKurvaSvg = (d: { p: (number | null)[]; r: (number | null)[] }) => {
    return (
      <InteractiveKurvaChart
        d={d}
        cutoffIdx={cutoffMonthIdx}
        startMonthIdx={startMonthIdx}
        cutoffLabel={cutoffMonthLabel}
      />
    );
  };

  // Horizontal bar helper
  const renderHorizontalBars = (rows: [string, number, string][], fm: (v: number) => string | number) => {
    const maxVal = Math.max(...rows.map(r => r[1]), 1);
    if (rows.length === 0) {
      return <p className="src">Tidak ada data untuk filter ini.</p>;
    }
    return rows.map((r, idx) => (
      <div className="hb" key={idx}>
        <span className="hl" title={r[0]}>
          {r[0]}
        </span>
        <div className="ht">
          <i style={{ width: `${(r[1] / maxVal) * 100}%`, background: r[2] }} />
        </div>
        <b>{fm(r[1])}</b>
      </div>
    ));
  };

  // Tab 3 Filtered Contracts (Respects Date Range)
  const docFiltered = useMemo(() => {
    return C.filter(c => {
      const matchSource = !dsS || c.s === dsS;
      const matchPic = !dsP || c.pic === dsP;
      const matchJenis = !dsJ || c.j === dsJ || (dsJ === 'U' && c.j === 'D');
      const matchBucket = !dsB || c.b === dsB;
      const matchSearch =
        !globalSearch ||
        c.n.toLowerCase().includes(globalSearch.toLowerCase()) ||
        c.pic.toLowerCase().includes(globalSearch.toLowerCase());

      let matchDate = true;
      if (dateStart || dateEnd) {
        const cStart = c.a || '2024-01-01';
        const cEnd = c.e || '2027-12-31';
        if (dateStart && cEnd < dateStart) matchDate = false;
        if (dateEnd && cStart > dateEnd) matchDate = false;
      }
      return matchSource && matchPic && matchJenis && matchBucket && matchSearch && matchDate;
    });
  }, [dsS, dsP, dsJ, dsB, globalSearch, dateStart, dateEnd]);

  const docStats = useMemo(() => {
    const cnt: Record<string, number> = { A: 0, T: 0, K: 0, H: 0, P: 0, D: 0 };
    docFiltered.forEach(c => {
      for (const ch of c.d) {
        cnt[ch] = (cnt[ch] || 0) + 1;
      }
    });
    const den = cnt.A + cnt.K + cnt.H + cnt.P;
    const rt = den ? Math.round((cnt.A / den) * 100) : 0;
    return {
      total: docFiltered.length,
      completeness: rt,
      missing: cnt.K + cnt.H,
      under100: docFiltered.filter(c => c.p != null && c.p < 100).length
    };
  }, [docFiltered]);

  const picStats = useMemo(() => {
    const pc: Record<string, number> = {};
    docFiltered.forEach(c => {
      pc[c.pic] = (pc[c.pic] || 0) + 1;
    });
    return Object.entries(pc).sort((a, b) => b[1] - a[1]);
  }, [docFiltered]);

  const bucketStats = useMemo(() => {
    return BK.map(b => [b, docFiltered.filter(c => c.b === b).length, 'var(--accent)'] as [string, number, string]);
  }, [docFiltered]);

  // Comprehensive Deadline Timeline Items (Khusus Data Ongoing with end dates)
  // Evaluates each project against "hari ini" (current date context secara dinamis)
  const contractDeadlineItems = useMemo<TimelineDeadlineItem[]>(() => {
    const now = currentDate;
    const todayMidnight = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const dayMs = 86400000;
    const itemsMap = new Map<string, TimelineDeadlineItem>();

    // 1. From docFiltered (Contracts C) that have an end date (e) - Khusus Ongoing (c.s === 'G')
    docFiltered.forEach(c => {
      if (c.s === 'G' && c.e && /^\d{4}-\d{2}-\d{2}$/.test(c.e)) {
        const [ey, em, ed] = c.e.split('-').map(Number);
        const endMidnight = Date.UTC(ey, em - 1, ed);
        const diffDays = Math.round((endMidnight - todayMidnight) / dayMs);
        let statusCategory: 'LEWAT' | 'MENDEKATI' | 'AMAN' = 'AMAN';
        if (diffDays < 0) {
          statusCategory = 'LEWAT';
        } else if (diffDays <= 60) {
          statusCategory = 'MENDEKATI';
        }

        const id = `c_${c.w}_${c.n}_${c.e}`;
        itemsMap.set(id, {
          id,
          source: 'G',
          name: c.n,
          pic: c.pic,
          endDate: c.e,
          diffDays,
          statusCategory,
          progress: c.p,
          rawStatus: 'Ongoing'
        });
      }
    });

    // 2. Also incorporate Master Projects (M) with akd that are Ongoing
    projects.forEach(m => {
      if (isOngoingGroup(m.g) && m.akd && /^\d{4}-\d{2}-\d{2}$/.test(m.akd)) {
        // Respect PIC filter
        const mPic = m.pic || getProjectPic(m.no);
        if (dsP && mPic.toUpperCase() !== dsP.toUpperCase()) return;
        // Respect search filter
        if (
          globalSearch &&
          !m.n.toLowerCase().includes(globalSearch.toLowerCase()) &&
          !mPic.toLowerCase().includes(globalSearch.toLowerCase())
        ) {
          return;
        }
        // Respect date range filter if active
        if (dateStart && m.akd < dateStart) return;
        if (dateEnd && m.akd > dateEnd) return;

        const [my, mm, md] = m.akd.split('-').map(Number);
        const endMidnight = Date.UTC(my, mm - 1, md);
        const diffDays = Math.round((endMidnight - todayMidnight) / dayMs);
        let statusCategory: 'LEWAT' | 'MENDEKATI' | 'AMAN' = 'AMAN';
        if (diffDays < 0) {
          statusCategory = 'LEWAT';
        } else if (diffDays <= 60) {
          statusCategory = 'MENDEKATI';
        }

        const id = `m_${m.no}_${m.akd}`;
        if (!itemsMap.has(id)) {
          itemsMap.set(id, {
            id,
            source: 'G',
            name: m.n,
            pic: mPic,
            endDate: m.akd,
            diffDays,
            statusCategory,
            progress: m.rl ?? 0,
            rawStatus: m.st
          });
        }
      }
    });

    return Array.from(itemsMap.values()).sort((a, b) => {
      // Sort: Lewat first, then ascending by end date
      return a.diffDays - b.diffDays;
    });
  }, [docFiltered, projects, dsP, globalSearch, dateStart, dateEnd, currentDate]);

  const timelineContracts = useMemo(() => {
    return docFiltered
      .filter(c => c.a && c.e && c.e >= c.a)
      .sort((a, b) => (a.e! < b.e! ? -1 : 1))
      .slice(0, 60);
  }, [docFiltered]);

  const timelineRange = useMemo(() => {
    if (timelineContracts.length === 0) return null;
    const t0 = Math.min(...timelineContracts.map(c => new Date(c.a!).getTime()));
    const t1 = Math.max(...timelineContracts.map(c => new Date(c.e!).getTime()));
    const sp = t1 - t0 || 1;
    const fm = (t: number) =>
      new Date(t).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    return { t0, t1, sp, label: `Rentang ${fm(t0)} sampai ${fm(t1)}` };
  }, [timelineContracts]);

  return (
    <div className="app-container">
      {menuOpen && !menuPinned && (
        <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <aside
        className={`drawer ${menuPinned ? 'pinned' : ''} ${drawerVisible ? 'open' : ''}`}
        aria-hidden={!drawerVisible}
      >
        <div className="drawer-head">
          <img src="/logo-bima.svg" alt="PT BIMA" className="drawer-logo" />
          <div className="drawer-brand">
            <b>PT. BIMA</b>
            <span>DIVISI PERALATAN</span>
          </div>
          <button
            className="drawer-icon-btn"
            onClick={() => setMenuPinned(p => !p)}
            title={menuPinned ? 'Lepas pin' : 'Pin menu'}
            aria-label="Pin menu"
          >
            {menuPinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
          <button
            className="drawer-icon-btn"
            onClick={() => { setMenuPinned(false); setMenuOpen(false); }}
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="drawer-nav">
          {NAV_ITEMS.map(({ id, title, sub, Icon }) => (
            <button
              key={id}
              className={`drawer-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => pickTab(id)}
            >
              <Icon size={20} />
              <span>
                <b>{title}</b>
                <small>{sub}</small>
              </span>
            </button>
          ))}
        </nav>

        <div className="drawer-foot">
          <button
            className="drawer-reset"
            onClick={handleResetFilters}
          >
            <RotateCcw size={14} /> Reset semua filter
          </button>
          <p>Divisi Peralatan<br />PT Berkah Industri Mesin Angkat (BIMA)</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-wrapper">
        {/* TOPBAR */}
        <header className="topbar topbar-hero">
          <div className="topbar-left">

            {!menuPinned && (
              <button className="menu-pill" onClick={() => setMenuOpen(true)} aria-label="Buka menu">
                <Menu size={18} />
              </button>
            )}

            <div className="topbar-title">
              <h1>Dashboard Monitoring Project</h1>
              <span>{NAV_ITEMS.find(n => n.id === activeTab)?.title || 'Overview'}</span>
            </div>
          </div>

          <div className="topbar-actions">
            {googleUser ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#059669',
                  fontWeight: 700
                }}
                title={`Google Sheets Terhubung: ${googleUser.email || googleUser.displayName}`}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
                <span>Sheets Terhubung</span>
                <button
                  type="button"
                  onClick={handleGoogleSignOut}
                  style={{ background: 'none', border: 'none', color: 'var(--mute)', cursor: 'pointer', padding: '0 2px', fontSize: '11px', marginLeft: '4px' }}
                  title="Putuskan sambungan Google"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg-card, #ffffff)',
                  color: 'var(--ink, #374151)',
                  border: '1px solid var(--border, #d1d5db)',
                  padding: '5px 11px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
                title="Hubungkan akun Google untuk menyimpan otomatis ke spreadsheet 'Detail Project Catatan'"
              >
                <svg width="14" height="14" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Hubungkan Sheets</span>
              </button>
            )}

            <button
              id="fr"
              className="tg reset-filter-btn"
              onClick={handleResetFilters}
              title="Reset seluruh filter dan rentang tanggal"
            >
              <RotateCcw size={14} className="reset-filter-icon" />
              <span>Reset Filter</span>
            </button>

            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              title={theme === 'dark' ? 'Mode Terang (Light Mode)' : 'Mode Gelap (Dark Mode)'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={16} className="theme-toggle-icon" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={16} className="theme-toggle-icon" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          {/* FILTER BAR SATU BARIS (Rentang Tanggal + Filter Tab + Button Reset Filter di Kanan) */}
          <div className="topbar-filters">
            {/* Filter Periode (Sesuai Mockup: Bulan, Tahun mulai 2023, & Kartu Minggu W-90 dst) */}
            <PeriodFilter
              startInput={startInput}
              endInput={endInput}
              onSelectPeriod={(start, end) => {
                setStartInput(start);
                setEndInput(end);
              }}
              onClearPeriod={() => {
                setStartInput('');
                setEndInput('');
              }}
            />

            {/* Filter spesifik tab Ringkasan (Tab 1) */}
            {activeTab === 't1' && (
              <>
                <select
                  id="fs"
                  aria-label="Status"
                  value={fs}
                  onChange={e => setFs(e.target.value)}
                >
                  <option value="">Semua Status</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Delayed">Delayed</option>
                  <option value="At risk">At risk</option>
                  <option value="Finished">Finished</option>
                  <option value="Closed">Closed</option>
                </select>
                <select
                  id="fo"
                  aria-label="Pemilik pekerjaan"
                  value={fo}
                  onChange={e => setFo(e.target.value)}
                >
                  <option value="">Semua Pemilik</option>
                  {Array.from(new Set(OW))
                    .sort()
                    .map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
              </>
            )}

            {/* Filter spesifik tab Detail Project (Tab 2) */}
            {activeTab === 't2' && (
              <>
                <select
                  id="gs"
                  aria-label="Kelompok"
                  value={gs}
                  onChange={e => setGs(e.target.value)}
                >
                  <option value="">Semua Kelompok</option>
                  {GK.map(g => (
                    <option key={g[0]} value={g[0]}>
                      {g[1]}
                    </option>
                  ))}
                </select>
                <select
                  id="ss"
                  aria-label="Status"
                  value={ss}
                  onChange={e => setSs(e.target.value)}
                >
                  <option value="">Semua Status</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Delayed">Delayed</option>
                  <option value="At risk">At risk</option>
                  <option value="Finished">Finished</option>
                  <option value="Closed">Closed</option>
                </select>
              </>
            )}

            {/* Filter spesifik tab Kurva S (Tab 4) */}
            {activeTab === 't4' && (
              <>
                <select
                  id="ksel"
                  aria-label="Tampilkan proyek"
                  value={kSel}
                  onChange={e => setKSel(e.target.value)}
                >
                  <option value="p">Seluruh Proyek</option>
                  {K.names.map((n, i) => (
                    <option key={i} value={String(i)}>
                      {n}
                    </option>
                  ))}
                </select>

                <select
                  id="kcutoff-sel"
                  aria-label="Posisi Cutoff Kurva S"
                  value={
                    endInput
                      ? endInput.slice(0, 7)
                      : startInput
                      ? startInput.slice(0, 7)
                      : ''
                  }
                  onChange={e => {
                    const ym = e.target.value;
                    if (!ym) {
                      setEndInput('');
                    } else {
                      const [yStr, mStr] = ym.split('-');
                      const y = Number(yStr);
                      const m = Number(mStr);
                      const lastDay = new Date(y, m, 0).getDate();
                      const dStr = String(lastDay).padStart(2, '0');
                      setEndInput(`${yStr}-${mStr}-${dStr}`);
                    }
                  }}
                  title="Pilih posisi bulan cut-off Kurva S"
                >
                  <option value="">Cutoff: Default (Agustus 2026)</option>
                  <option value="2026-06">Cutoff: Juni 2026</option>
                  <option value="2026-07">Cutoff: Juli 2026</option>
                  <option value="2026-09">Cutoff: September 2026</option>
                  <option value="2026-05">Cutoff: Mei 2026</option>
                  <option value="2026-04">Cutoff: April 2026</option>
                  <option value="2026-03">Cutoff: Maret 2026</option>
                  <option value="2026-02">Cutoff: Februari 2026</option>
                  <option value="2026-01">Cutoff: Januari 2026</option>
                  <option value="2025-12">Cutoff: Desember 2025</option>
                  <option value="2025-06">Cutoff: Juni 2025</option>
                  <option value="2024-12">Cutoff: Desember 2024</option>
                </select>
              </>
            )}

            {/* Filter spesifik tab Document Tracking (Tab 3) */}
            {activeTab === 't3' && (
              <>
                <select
                  id="dsS"
                  aria-label="Sumber"
                  value={dsS}
                  onChange={e => setDsS(e.target.value)}
                >
                  <option value="">Semua Kontrak</option>
                  <option value="G">Kontrak Ongoing</option>
                  <option value="C">Kontrak Selesai (Closed)</option>
                </select>
                <select
                  id="dsP"
                  aria-label="PIC"
                  value={dsP}
                  onChange={e => setDsP(e.target.value)}
                >
                  <option value="">Semua PIC</option>
                  {Array.from(new Set(C.map(c => c.pic)))
                    .sort()
                    .map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
                <select
                  id="dsJ"
                  aria-label="Jenis"
                  value={dsJ}
                  onChange={e => setDsJ(e.target.value)}
                >
                  <option value="">User + Vendor</option>
                  <option value="U">User</option>
                  <option value="V">Vendor</option>
                </select>
                <select
                  id="dsB"
                  aria-label="Tingkat nilai"
                  value={dsB}
                  onChange={e => setDsB(e.target.value)}
                >
                  <option value="">Semua Nilai</option>
                  {BK.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="page-content">
          {activeTab === 't1' && (
            <div className="note">
              Sistem pemantauan portofolio dan progres pekerjaan Mekanikal &amp; Elektrikal (ME) secara terpadu, menyajikan ringkasan eksekutif status proyek berjalan, analisis realisasi Kurva S terhadap rencana kumulatif, pemetaan mitigasi risiko kritis, serta pelacakan kelengkapan dokumen administrasi kontrak.
            </div>
          )}

          {/* TAB 1: RINGKASAN */}
          {activeTab === 't1' && (
            <section id="t1">
              <div className="kp" id="hk">
                <div className="kk" style={{ borderTop: '3px solid #3b82f6' }}>
                  <div className="kk-top">
                    <i className="kk-ic"><FolderKanban size={18} /></i>
                    <span>Project Ongoing</span>
                  </div>
                  <b>{homeList.length}</b>
                  <div className="kk-bar"><i style={{ width: '100%', background: '#3b82f6' }} /></div>
                </div>
                <div className="kk" style={{ borderTop: '3px solid #10b981' }}>
                  <div className="kk-top">
                    <i className="kk-ic" style={{ background: '#d1fae5', color: '#059669' }}><TrendingUp size={18} /></i>
                    <span>Total Nilai Kontrak</span>
                  </div>
                  <b>Rp{f1(homeList.reduce((a, x) => a + x.m.nv, 0))} M</b>
                  <div className="kk-bar"><i style={{ width: '85%', background: '#10b981' }} /></div>
                </div>
                <div className="kk" style={{ borderTop: '3px solid #ef4444' }}>
                  <div className="kk-top">
                    <i className="kk-ic bad"><AlertTriangle size={18} /></i>
                    <span>At risk   Atau Delayed</span>
                  </div>
                  <b style={{ color: homeList.filter(x => (x.m.st === 'Delayed' || x.m.st === 'At risk')).length > 0 ? '#ef4444' : 'inherit' }}>
                    {homeList.filter(x => (x.m.st === 'Delayed' || x.m.st === 'At risk')).length}
                    {homeList.length
                      ? ` (${Math.round(
                          (homeList.filter(x => (x.m.st === 'Delayed' || x.m.st === 'At risk')).length / homeList.length) * 100
                        )}%)`
                      : ''}
                  </b>
                  <div className="kk-bar bad" style={{ background: '#BFC6C4' }}>
                    <i style={{ width: `${homeList.length ? (homeList.filter(x => (x.m.st === 'Delayed' || x.m.st === 'At risk')).length / homeList.length) * 100 : 0}%`, background: '#ef4444' }} />
                  </div>
                </div>
                <div className="kk" style={{ borderTop: '3px solid #6366f1' }}>
                  <div className="kk-top">
                    <i className="kk-ic" style={{ background: '#e0e7ff', color: '#4f46e5' }}><Activity size={18} /></i>
                    <span>
                      Deviasi Kurva S{' '}
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>
                        (per {cutoffMonthLabel}{dateEndBeyondData ? ', data terakhir' : ''})
                      </span>
                    </span>
                  </div>
                  <b style={{ color: devVal < 0 ? '#ef4444' : '#10b981' }}>
                    {devVal > 0 ? `+${f1(devVal)}%` : `${f1(devVal)}%`}
                  </b>
                  <div className="kk-bar">
                    <i style={{ width: `${Math.min(100, Math.max(10, Math.abs(devVal) * 5))}%`, background: devVal < 0 ? '#ef4444' : '#10b981' }} />
                  </div>
                </div>
              </div>

              <div className="g2x">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="panel" style={{ marginBottom: 0 }}>
                    <h2>Jumlah Proyek Berdasarkan Status</h2>
                    <div id="hs">
                      <ProjectStagePieChart
                        data={GK.map(([k, l, c]) => ({
                          key: k,
                          label: l,
                          value: detailList.filter(d => d.m.g === k).length,
                          color: c
                        }))}
                      />
                    </div>
                  </div>

                  <div className="panel" style={{ marginBottom: 0 }}>
                    <h2>Peta Risiko</h2>
                    <RiskBubbleChart projects={homeList.map(x => x.m)} onSelectProject={openDetailModal} stc={stc} stText={stText} f1={f1} />
                  </div>
                </div>

                <div className="panel">
                  <div style={{ marginBottom: '14px' }}>
                    <h2 style={{ margin: '0 0 2px 0' }}>Status project</h2>
                  </div>

                  {/* 3 Status Cards in grid: Ongoing, Delay, At Risk */}
                  <div className="ov-status-grid">
                    {/* 1. Ongoing (Hijau #10b981) */}
                    <div className="ov-status-card" style={{ borderTop: '3px solid #10b981' }}>
                      <div>
                        <div className="ov-status-head">
                          <span className="ov-status-dot" style={{ background: '#10b981' }} />
                          <span>Ongoing</span>
                        </div>
                        <div className="ov-status-num">{safeProjects.length}</div>
                        <div className="ov-status-sub">{safePercent}% dari project ongoing</div>
                      </div>
                    </div>

                    {/* 2. Delay (Orange #f97316) */}
                    <div className="ov-status-card" style={{ borderTop: '3px solid #f97316' }}>
                      <div>
                        <div className="ov-status-head">
                          <span className="ov-status-dot" style={{ background: '#f97316' }} />
                          <span>Delay</span>
                        </div>
                        <div className="ov-status-num">{DelayedProjects.length}</div>
                        <div className="ov-status-sub">{DelayedPercent}% dari project ongoing</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCriticalFilter('Delayed');
                          document.getElementById('hp-panel')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="ov-status-link"
                      >
                        Lihat detail di tabel
                      </button>
                    </div>

                    {/* 3. At Risk (Merah #ef4444) */}
                    <div className="ov-status-card" style={{ borderTop: '3px solid #ef4444' }}>
                      <div>
                        <div className="ov-status-head">
                          <span className="ov-status-dot" style={{ background: '#ef4444' }} />
                          <span>At Risk</span>
                        </div>
                        <div className="ov-status-num">{atRiskProjects.length}</div>
                        <div className="ov-status-sub">{atRiskPercent}% dari project ongoing</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCriticalFilter('At risk');
                          document.getElementById('hp-panel')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="ov-status-link"
                      >
                        Lihat detail di tabel
                      </button>
                    </div>
                  </div>

                  {/* Segmented Proportion Bar: Ongoing (Green), Delay (Orange), At Risk (Red) */}
                  <div className="ov-seg-bar">
                    {safeProjects.length > 0 && (
                      <div
                        className="ov-seg-item"
                        style={{
                          width: `${totalOngoing ? (safeProjects.length / totalOngoing) * 100 : 0}%`,
                          background: '#10b981'
                        }}
                        title={`Ongoing: ${safeProjects.length} (${safePercent}%)`}
                      />
                    )}
                    {DelayedProjects.length > 0 && (
                      <div
                        className="ov-seg-item"
                        style={{
                          width: `${totalOngoing ? (DelayedProjects.length / totalOngoing) * 100 : 0}%`,
                          background: '#f97316'
                        }}
                        title={`Delay: ${DelayedProjects.length} (${DelayedPercent}%)`}
                      />
                    )}
                    {atRiskProjects.length > 0 && (
                      <div
                        className="ov-seg-item"
                        style={{
                          width: `${totalOngoing ? (atRiskProjects.length / totalOngoing) * 100 : 0}%`,
                          background: '#ef4444'
                        }}
                        title={`At Risk: ${atRiskProjects.length} (${atRiskPercent}%)`}
                      />
                    )}
                  </div>

                  {/* Warning Box */}
                  <div className="ov-alert-box">
                    <strong>{DelayedProjects.length + atRiskProjects.length} project perlu perhatian</strong>{' '}
                    <span>Detail lengkap ada di tabel di bawah.</span>
                  </div>

                  {/* Project Ongoing yang Aman List */}
                  <div>
                    <div className="ov-safe-header">
                      <span className="ov-status-dot" style={{ background: '#10b981' }} />
                      <span>Project Ongoing</span>
                    </div>

                    <div className="ov-safe-list">
                      {displayedSafeProjects.length === 0 ? (
                        <div style={{ fontSize: '12px', color: 'var(--mute)', padding: '8px 0' }}>
                          Tidak ada project Ongoing yang aman untuk filter ini.
                        </div>
                      ) : (
                        displayedSafeProjects.map(x => {
                          const rem = sisa(x.m.akd);
                          const isOverdue = rem !== null && rem < 0;
                          const picName = x.m.pic || getProjectPic(x.m.no);
                          return (
                            <div
                              key={x.m.no}
                              tabIndex={0}
                              onClick={() => openDetailModal(x.m.no - 1)}
                              className="ov-safe-item"
                              title={`${x.m.n} - Klik untuk membuka detail`}
                            >
                              <div className="ov-safe-name">
                                <span className="ov-status-dot" style={{ background: '#10b981', width: '6px', height: '6px' }} />
                                <span className="ov-safe-title">{x.m.n}</span>
                              </div>
                              <div className="ov-safe-meta">
                                {picName && <span className="ov-safe-pic">{picName}</span>}
                                {isOverdue && <span className="ov-safe-tag">Lewat akhir kontrak</span>}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {sortedSafeProjects.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowAllSafe(!showAllSafe)}
                        className="ov-toggle-btn"
                      >
                        {showAllSafe
                          ? 'Tampilkan lebih sedikit'
                          : `Lihat semua ${sortedSafeProjects.length} project`}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabel Perlu Perhatian: At risk   dan Delay */}
              <div className="panel" id="hp-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <h2 style={{ margin: 0 }}>Perlu Perhatian: At risk   dan Delay</h2>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setCriticalFilter('ALL')}
                      className={`ov-filter-btn ${criticalFilter === 'ALL' ? 'active' : ''}`}
                    >
                      Semua ({homeCriticalList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCriticalFilter('At risk')}
                      className={`ov-filter-btn ${criticalFilter === 'At risk' ? 'active' : ''}`}
                    >
                      At risk   ({critAtRiskCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCriticalFilter('Delayed')}
                      className={`ov-filter-btn ${criticalFilter === 'Delayed' ? 'active' : ''}`}
                    >
                      Delay ({critDelayedCount})
                    </button>
                  </div>
                </div>

                <div className="scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Pemilik</th>
                        <th>Nilai (Rp M)</th>
                        <th>Deviasi</th>
                        <th>Status</th>
                        <th>Akhir kontrak terkini</th>
                        <th>Keterlambatan</th>
                        <th>Situasi</th>
                      </tr>
                    </thead>
                    <tbody id="hp">
                      {displayedCriticalList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="src">
                            Tidak ada project untuk filter ini.
                          </td>
                        </tr>
                      ) : (
                        displayedCriticalList.map(x => {
                          const dv = (x.m.rl ?? 0) - (x.m.pl ?? 0);
                          const d = sisa(x.m.akd);
                          return (
                            <tr
                              key={x.m.no}
                              tabIndex={0}
                              onClick={() => {
                                openDetailModal(x.m.no - 1);
                              }}
                            >
                              <td>{x.m.n}</td>
                              <td>{x.o}</td>
                              <td>{f1(x.m.nv)}</td>
                              <td style={{ color: dv < -20 ? 'var(--bad)' : 'inherit', fontWeight: 600 }}>
                                {f1(dv)}%
                              </td>
                              <td>
                                <span
                                  className="tag"
                                  style={{
                                    background: stc(x.m.st),
                                    color: stText(x.m.st)
                                  }}
                                >
                                  {x.m.st}
                                </span>
                              </td>
                              <td>{x.m.akt}</td>
                              <td>
                                {d === null ? (
                                  <span style={{ color: 'var(--mute)' }}>-</span>
                                ) : d < 0 ? (
                                  <span
                                    style={{
                                      color: 'var(--bad)',
                                      fontWeight: 700,
                                      background: 'rgba(239, 68, 68, 0.08)',
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      display: 'inline-block',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    Terlambat {-d} hari
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      color: d <= 30 ? 'var(--risk)' : 'var(--good)',
                                      fontWeight: 600
                                    }}
                                  >
                                    Sisa {d} hari
                                  </span>
                                )}
                              </td>
                              <td>
                                {x.m.sit.length > 150 ? x.m.sit.slice(0, 150) + '...' : x.m.sit}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="src">Klik baris untuk membuka detail project.</p>
              </div>
            </section>
          )}

          {/* TAB 2: DETAIL PROJECT */}
          {activeTab === 't2' && (
            <section id="t2">
              <div className="kp" id="t2k">
                <div className="kk" style={{ borderTop: '3px solid #3b82f6' }}>
                  <div className="kk-top">
                    <i className="kk-ic"><FolderKanban size={18} /></i>
                    <span>Total Proyek (Filter)</span>
                  </div>
                  <b>{detailList.length}</b>
                  <div className="kk-bar"><i style={{ width: `${projects.length ? (detailList.length / projects.length) * 100 : 100}%`, background: '#3b82f6' }} /></div>
                </div>
                <div className="kk" style={{ borderTop: '3px solid #10b981' }}>
                  <div className="kk-top">
                    <i className="kk-ic" style={{ background: '#d1fae5', color: '#059669' }}><TrendingUp size={18} /></i>
                    <span>Nilai Kontrak (Filter)</span>
                  </div>
                  <b>Rp{f1(detailList.reduce((a, x) => a + x.m.nv, 0))} M</b>
                  <div className="kk-bar"><i style={{ width: '85%', background: '#10b981' }} /></div>
                </div>
                <div className="kk" style={{ borderTop: '3px solid #06b6d4' }}>
                  <div className="kk-top">
                    <i className="kk-ic" style={{ background: '#cffafe', color: '#0891b2' }}><CheckCircle2 size={18} /></i>
                    <span>Status Ongoing</span>
                  </div>
                  <b>{detailList.filter(x => x.m.st === 'Ongoing').length}</b>
                  <div className="kk-bar">
                    <i style={{ width: `${detailList.length ? (detailList.filter(x => x.m.st === 'Ongoing').length / detailList.length) * 100 : 0}%`, background: '#06b6d4' }} />
                  </div>
                </div>
                <div className="kk" style={{ borderTop: '3px solid #ef4444' }}>
                  <div className="kk-top">
                    <i className="kk-ic bad"><AlertTriangle size={18} /></i>
                    <span>Delayed / At risk</span>
                  </div>
                  <b style={{ color: detailList.filter(x => (x.m.st === 'Delayed' || x.m.st === 'At risk')).length > 0 ? '#ef4444' : 'inherit' }}>
                    {detailList.filter(x => (x.m.st === 'Delayed' || x.m.st === 'At risk')).length}
                  </b>
                  <div className="kk-bar bad">
                    <i style={{ width: `${detailList.length ? (detailList.filter(x => (x.m.st === 'Delayed' || x.m.st === 'At risk')).length / detailList.length) * 100 : 0}%`, background: '#ef4444' }} />
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="ph">
                  <h2 id="ttl">
                    Daftar project ({detailList.length} dari {projects.length})
                  </h2>
                  <span
                    className="plan-legend-badge"
                    title="Garis penanda tegak pada progress bar menunjukkan target Realisasi (Plan)"
                  >
                    <i className="plan-line-marker" />
                    <span>Garis hitam pada bar = Plan</span>
                  </span>
                </div>
                <div className="scroll">
                  <table>
                    <thead>
                      <tr>
                        <th></th>
                        <th>Project</th>
                        <th>Pemilik</th>
                        <th>Nilai</th>
                        <th>Realisasi Vs Plan</th>
                        <th>Deviasi</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody id="rows">
                      {detailList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="empty">Tidak ada project yang cocok dengan filter ini.</td>
                        </tr>
                      ) : (
                        detailList.map(({ m, i }) => {
                          const c = stc(m.st);
                          const badge = getOwnerBadge(m.pem);
                          const gInfo = GK.find(g => g[0] === m.g) || ['Ongoing', m.g, '#10b981'];
                          const dv = m.dv;
                          const dvElem = dv == null ? (
                            <span className="dv nil">–</span>
                          ) : dv < 0 ? (
                            <span className="dv neg">▼ {f1(dv)}%</span>
                          ) : dv > 0 ? (
                            <span className="dv pos">▲ +{f1(dv)}%</span>
                          ) : (
                            <span className="dv nil">0%</span>
                          );

                          return (
                            <tr
                              key={m.no}
                              className="row"
                              style={{ '--c': c } as React.CSSProperties}
                              aria-selected={selectedIdx === i}
                            >
                              <td className="no">{m.no}</td>
                              <td className="nm">
                                {m.n}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                                  {m.wbs && m.wbs !== '—' && m.wbs !== '-' && (
                                    <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, background: 'rgba(37, 99, 235, 0.08)', color: 'var(--accent)', padding: '1px 5px', borderRadius: '4px' }}>
                                      {m.wbs}
                                    </span>
                                  )}
                                  <div className="grp" style={{ '--g': gInfo[2] } as React.CSSProperties}>
                                    <i></i>
                                    <span>{gInfo[1]}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="own">
                                  {m.pem}
                                </span>
                              </td>
                              <td className="val">
                                {f1(m.nv)}<small>M</small>
                              </td>
                              <td>
                                {m.rl == null ? (
                                  <span style={{ color: 'var(--mute)' }}>Belum Mulai</span>
                                ) : (
                                  <div className="pg">
                                    <div className="pg-l">
                                      <b>{f1(m.rl)}%</b>
                                      <span>{m.pl == null ? '' : `Plan ${f1(m.pl)}%`}</span>
                                    </div>
                                    <div className="bar">
                                      <i style={{ width: `${Math.min(m.rl, 100)}%` }} />
                                      {m.pl != null && <u style={{ left: `${Math.min(m.pl, 100)}%` }} />}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td>{dvElem}</td>
                              <td>
                                <span className="st" style={{ '--c': c } as React.CSSProperties}>
                                  {m.st}
                                </span>
                                {(() => {
                                  const d = sisa(m.akd);
                                  const isDone = m.st === 'Finished'    
                                  if (!isDone && d !== null && d < 0) {
                                    return (
                                      <div
                                        style={{
                                          marginTop: '3px',
                                          fontSize: '11px',
                                          color: 'var(--bad)',
                                          fontWeight: 700,
                                          whiteSpace: 'nowrap'
                                        }}
                                        title={`Akhir kontrak terkini: ${m.akt} (dihitung dinamis per hari ini: ${todayDisplayLabel})`}
                                      >
                                        Terlambat {-d} hari
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn"
                                  onClick={() => openDetailModal(i)}
                                  aria-label={`Lihat detail ${m.n}`}
                                >
                                  Detail
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 4: KURVA S */}
          {activeTab === 't4' && (
            <section id="t4">
              <div className="panel">
                <h2>Kurva S Agregat &amp; Individual</h2>
                <div id="kinfo">
                  {(() => {
                    const isPort = kSel === 'p';
                    const idx = isPort ? 0 : Number(kSel);
                    const tag = isPort ? 'S10' : `S${Number(kSel) + 1}`;
                    const d = isPort ? K.port : K.proj[idx];
                    const p = d.p[cutoffMonthIdx] ?? 0;
                    const r = d.r[cutoffMonthIdx] ?? 0;
                    const deviasi = Number((r - p).toFixed(1));
                    const totalNilai = K.nil.reduce((a, b) => a + b, 0);
                    const nilai = isPort ? totalNilai : K.nil[idx];
                    const bobot = isPort ? 100.0 : K.bob[idx];

                    return (
                      <>
                        <div className="kinfo-card" style={{ borderTop: '3px solid #3b82f6' }}>
                          <div className="kinfo-head">
                            <span className="kinfo-title">Bobot Proyek</span>
                          </div>
                          <div className="kinfo-val">{f1(bobot)}%</div>
                          <div className="kinfo-desc">Dari Total Kurva S</div>
                          <div className="kk-bar" style={{ marginTop: 'auto' }}><i style={{ width: `${Math.min(100, bobot)}%`, background: '#3b82f6' }} /></div>
                        </div>

                        <div className="kinfo-card" style={{ borderTop: '3px solid #10b981' }}>
                          <div className="kinfo-head">
                            <span className="kinfo-title">Nilai Pekerjaan</span>
                          </div>
                          <div className="kinfo-val">Rp{f1(nilai)} M</div>
                          <div className="kinfo-desc">Total Alokasi Nilai</div>
                          <div className="kk-bar" style={{ marginTop: 'auto' }}><i style={{ width: '75%', background: '#10b981' }} /></div>
                        </div>

                        <div className="kinfo-card" style={{ borderTop: '3px solid #f59e0b' }}>
                          <div className="kinfo-head">
                            <span className="kinfo-title">Realisasi</span>
                          </div>
                          <div className="kinfo-val">{f1(r)}%</div>
                          <div className="kinfo-desc">Rencana {f1(p)}% (Per {cutoffMonthLabel})</div>
                          <div className="kk-bar" style={{ marginTop: 'auto' }}><i style={{ width: `${Math.min(100, r)}%`, background: '#f59e0b' }} /></div>
                        </div>

                        <div className="kinfo-card" style={{ borderTop: '3px solid #8b5cf6' }}>
                          <div className="kinfo-head">
                            <span className="kinfo-title">Deviasi</span>
                          </div>
                          <div className="kinfo-val" style={{ color: deviasi < -3 ? '#ef4444' : deviasi < 0 ? '#f59e0b' : '#10b981' }}>
                            {deviasi > 0 ? `+${f1(deviasi)}%` : `${f1(deviasi)}%`}
                          </div>
                          <div
                            className="kinfo-desc"
                            style={{
                              color: deviasi < -3 ? '#ef4444' : deviasi < 0 ? '#f59e0b' : '#10b981',
                              fontWeight: 600
                            }}
                          >
                            Per {cutoffMonthLabel}
                          </div>
                          <div className="kk-bar" style={{ marginTop: 'auto' }}>
                            <i style={{ width: `${Math.min(100, Math.max(15, Math.abs(deviasi) * 5))}%`, background: deviasi < 0 ? '#ef4444' : '#10b981' }} />
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div id="kc">
                  {renderKurvaSvg(kSel === 'p' ? K.port : K.proj[Number(kSel)])}
                </div>
              </div>

              <div className="panel">
                <h2>Cek Sinkron: Progres Master Vs Kurva S (Posisi {cutoffMonthLabel})</h2>
                <div className="scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Realisasi Master</th>
                        <th>Realisasi Kurva S ({cutoffMonthLabel})</th>
                        <th>Selisih (%)</th>
                      </tr>
                    </thead>
                    <tbody id="kcmp">
                      {Object.entries(MAP).map(([a, k]) => {
                        const idxA = Number(a);
                        const idxK = Number(k);
                        const m = P[idxA]?.rl ?? 0;
                        const c = K.proj[idxK].r[cutoffMonthIdx] ?? 0;
                        const diff = Number((c - m).toFixed(1));

                        return (
                          <tr key={a}>
                            <td>{P[idxA]?.n}</td>
                            <td>{f1(m)}%</td>
                            <td>{f1(c)}%</td>
                            <td style={{ color: Math.abs(diff) > 3 ? 'var(--bad)' : 'inherit', fontWeight: '700' }}>
                              {diff > 0 ? `+${f1(diff)}%` : `${f1(diff)}%`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: KELENGKAPAN DOKUMEN */}
          {activeTab === 't3' && (
            <section id="t3">

                        {/* ===== KPI (gaya kartu seperti tab Kurva S) ===== */}
              <div className="t3-kpis" id="dk">
                {(() => {
                  const scope = dsS === 'G' ? 'Ongoing' : dsS === 'C' ? 'Closed' : 'Semua';
                  const jenis = dsJ === 'U' ? 'User' : dsJ === 'V' ? 'Vendor' : 'User + Vendor';
                  const pctUnder = docStats.total ? Math.round((docStats.under100 / docStats.total) * 100) : 0;
                  const totalCells = docFiltered.length * 20;
                  const pctMissing = totalCells ? Math.min(100, Math.round((docStats.missing / totalCells) * 100)) : 0;

                  return (
                    <>
                      <div className="kinfo-card" style={{ borderTop: '3px solid #3b82f6' }}>
                        <div className="kinfo-head">
                          <span className="kinfo-title">Total Kontrak</span>
                          <span className="kinfo-pill">{scope}</span>
                        </div>
                        <div className="kinfo-val">{docStats.total}</div>
                        <div className="kinfo-desc">{jenis}</div>
                        <div className="kk-bar" style={{ marginTop: 'auto' }}><i style={{ width: '100%', background: '#3b82f6' }} /></div>
                      </div>

                      <div className="kinfo-card" style={{ borderTop: '3px solid #10b981' }}>
                        <div className="kinfo-head">
                          <span className="kinfo-title">Rata-Rata Kelengkapan</span>
                          <span className="kinfo-pill">{scope}</span>
                        </div>
                        <div className="kinfo-val">{docStats.completeness}%</div>
                        <div className="kinfo-desc">Dari Seluruh Kontrak</div>
                        <div className="kk-bar" style={{ marginTop: 'auto' }}><i style={{ width: `${docStats.completeness}%`, background: '#10b981' }} /></div>
                      </div>

                      <div className="kinfo-card" style={{ borderTop: '3px solid #ef4444' }}>
                        <div className="kinfo-head">
                          <span className="kinfo-title">Belum Ada / Hilang</span>
                          <span className="kinfo-pill">{scope}</span>
                        </div>
                        <div className="kinfo-val" style={{ color: docStats.missing > 0 ? '#ef4444' : undefined }}>{docStats.missing}</div>
                        <div className="kinfo-desc" style={{ color: docStats.missing > 0 ? '#ef4444' : undefined, fontWeight: 600 }}>
                          {docStats.missing > 0 ? 'Dokumen Perlu Ditindaklanjuti' : 'Semua Dokumen Lengkap'}
                        </div>
                        <div className="kk-bar" style={{ marginTop: 'auto' }}><i style={{ width: `${pctMissing}%`, background: '#ef4444' }} /></div>
                      </div>

                      <div className="kinfo-card" style={{ borderTop: '3px solid #f59e0b' }}>
                        <div className="kinfo-head">
                          <span className="kinfo-title">Kontrak Progres &lt; 100%</span>
                          <span className="kinfo-pill">{scope}</span>
                        </div>
                        <div className="kinfo-val">{docStats.under100}</div>
                        <div className="kinfo-desc">Dari {docStats.total} Kontrak</div>
                        <div className="kk-bar" style={{ marginTop: 'auto' }}><i style={{ width: `${pctUnder}%`, background: '#f59e0b' }} /></div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* ===== HEATMAP ===== */}
              <div className="panel" style={{ marginBottom: '16px' }}>
                <div className="t3-ph">
                  <div>
                    <h2>Heatmap Kelengkapan Dokumen</h2>
                    <div className="t3-sub">Kontrak × 20 Dokumen</div>
                  </div>
                  <div className="t3-legend">
                    <span><i style={{ background: 'var(--ok)' }} />Ada</span>
                    <span><i style={{ background: '#BFC6C4' }} />Tidak Diperlukan</span>
                    <span><i style={{ background: 'var(--bad)' }} />Belum Ada / Hilang</span>
                    <span><i style={{ background: 'var(--risk)' }} />Proses / Pekerjaan Berjalan</span>
                    <span><i style={{ background: 'var(--accent-blue)' }} />Divisi Lain</span>
                  </div>
                </div>

                <div className="hm" id="hm">
                  <div className="hrow hmh">
                    <span />
                    {DN.map(d => (
                      <span key={d} className="vh">
                        {d}
                      </span>
                    ))}
                    <span className="t3-hm-end">Selesai</span>
                  </div>
                  {docFiltered.map((c, i) => {
                    const arr = Array.from(c.d);
                    const aCount = arr.filter(x => x === 'A').length;
                    const bCount = arr.filter(x => 'KHP'.includes(x)).length;
                    const pct = aCount + bCount ? Math.round((aCount / (aCount + bCount)) * 100) : null;

                    return (
                      <div className="hrow" key={i}>
                        <span className="n" title={`${c.n} | PIC ${c.pic} | ${c.w}`}>
                          <em className={c.j === 'V' ? 'v' : ''}>{c.j === 'V' ? 'V' : 'U'}</em>
                          {c.n}
                        </span>
                        {arr.map((x, j) => (
                          <i
                            key={j}
                            className={`c ${CL[x] || ''}`}
                            title={DN[j]}
                          />
                        ))}
                        <b
                          style={{
                            color:
                              pct === null
                                ? 'var(--t3-mute)'
                                : pct >= 75
                                ? 'var(--t3-ok)'
                                : pct < 50
                                ? 'var(--t3-bad)'
                                : 'var(--t3-ink)'
                          }}
                        >
                          {pct !== null ? `${pct}%` : '-'}
                        </b>
                      </div>
                    );
                  })}
                </div>

                <div className="t3-foot">
                  <span>Arahkan kursor ke sel atau nama untuk detail</span>
                </div>
              </div>

              {/* ===== 2 PANEL GRAFIK: Beban per PIC & Sebaran nilai kontrak ===== */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(440px, 100%), 1fr))',
                  gap: '16px',
                  marginBottom: '16px',
                  alignItems: 'stretch'
                }}
              >
                <div className="panel" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                  <div className="t3-ph" style={{ alignItems: 'center', marginBottom: '12px' }}>
                    <h2>Beban Per PIC</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {dsP && (
                        <button className="tg" onClick={() => setDsP('')} style={{ fontSize: '11px', padding: '2px 8px' }}>
                          Reset PIC ({dsP}) ✕
                        </button>
                      )}
                      <span className="t3-pill">{picStats.length} PIC · Jumlah Kontrak</span>
                    </div>
                  </div>
                  <div id="dpic" style={{ flex: 1 }}>
                    <PicBarChart data={picStats} selectedPic={dsP} onSelectPic={pic => setDsP(pic)} />
                  </div>
                  <div className="t3-foot">
                    <span>
                      Beban tertinggi: <b>{picStats[0] ? picStats[0][0] : '-'}</b>
                      {picStats[0] && docFiltered.length > 0
                        ? ` · ${picStats[0][1]} kontrak (${((picStats[0][1] / docFiltered.length) * 100).toFixed(1)}%)`
                        : ''}
                    </span>
                    <span>Klik bar untuk filter PIC</span>
                  </div>
                </div>

                <div className="panel" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                  <div className="t3-ph" style={{ alignItems: 'center', marginBottom: '12px' }}>
                    <h2>Sebaran Nilai Kontrak</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {dsB && (
                        <button className="tg" onClick={() => setDsB('')} style={{ fontSize: '11px', padding: '4px 10px' }}>
                          Reset Filter Nilai ({dsB}) ✕
                        </button>
                      )}
                      <span className="t3-pill purple">{docFiltered.length} kontrak · frekuensi</span>
                    </div>
                  </div>
                  <div id="dnil" style={{ flex: 1 }}>
                    <StatisticalBucketChart
                      data={bucketStats}
                      selectedBucket={dsB}
                      onSelectBucket={bucket => setDsB(bucket)}
                      totalFilteredContracts={docFiltered.length}
                    />
                  </div>
                  <div className="t3-foot">
                    {(() => {
                      const top = bucketStats.reduce((a, b) => (b[1] > a[1] ? b : a), bucketStats[0]);
                      return (
                        <span>
                          Terbanyak: <b>{top[0]}</b> · {top[1]} kontrak
                          {docFiltered.length > 0 ? ` (${((top[1] / docFiltered.length) * 100).toFixed(1)}%)` : ''}
                        </span>
                      );
                    })()}
                    <span>Klik bar untuk filter nilai</span>
                  </div>
                </div>
              </div>

              {/* Timeline Akhir Kontrak (Titik per Project terhadap Garis "Hari Ini") - Muncul jika filter kontrak dipilih yang Ongoing */}
              {dsS === 'G' && (
                <div className="panel" style={{ marginTop: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h2>Timeline Akhir Kontrak (Titik Per Project Terhadap Garis “Hari Ini”)</h2>
                      <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'var(--mute)' }}>
                        Menampilkan project Ongoing terhadap batas waktu hari ini ({todayDisplayLabel}). Titik merah = lewat batas waktu, kuning = mendekati (&lt; 60 hari), hijau = aman.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        className="tag"
                        style={{
                          background: 'rgba(37, 99, 235, 0.08)',
                          color: 'var(--accent)',
                          fontWeight: 700,
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        Hari Ini: {todayDisplayLabel}
                      </span>
                      <span
                        className="tag"
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          fontWeight: 700,
                          padding: '4px 10px',
                          fontSize: '11px',
                          borderRadius: '6px'
                        }}
                      >
                        Filter Aktif: Kontrak Ongoing ({contractDeadlineItems.length} Proyek)
                      </span>
                    </div>
                  </div>
                  <TimelineContractDeadlines
                    items={contractDeadlineItems}
                    todayStr={todayIso}
                  />
                </div>
              )}
            </section>
          )}

          {/* Modal Dialog Detail Project (Accessible across all tabs) */}
          {selectedIdx !== null && (
            <div
              id="sel"
              className="ov"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ovt"
              onClick={e => {
                if (e.target === e.currentTarget) ClosedetailModal();
              }}
            >
              <div className="ovb">
                <div className="ovh">
                  <div>
                    {projects[selectedIdx].wbs && projects[selectedIdx].wbs !== '—' && projects[selectedIdx].wbs !== '-' && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginBottom: '4px',
                          background: 'rgba(37, 99, 235, 0.12)',
                          color: 'var(--accent)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          fontFamily: 'monospace'
                        }}
                      >
                        WBS: {projects[selectedIdx].wbs}
                      </span>
                    )}
                    <h2 id="ovt" style={{ margin: 0 }}>
                      {projects[selectedIdx].no}. {projects[selectedIdx].n}
                    </h2>
                  </div>
                  <button id="ovx" className="rs" aria-label="Tutup detail" onClick={ClosedetailModal}>
                    Tutup ✕
                  </button>
                </div>

                {/* KPI Scorecard boxes at top of modal */}
                <div className="modal-kpi-grid">
                  <div className="modal-kpi-card">
                    <span className="modal-kpi-label">Nilai Pekerjaan</span>
                    <b className="modal-kpi-val">Rp{f1(projects[selectedIdx].nv)} M</b>
                    <span className="modal-kpi-sub">{projects[selectedIdx].nt}</span>
                  </div>

                  <div className="modal-kpi-card">
                    <span className="modal-kpi-label">Target Plan</span>
                    <b className="modal-kpi-val" style={{ color: '#2563eb' }}>
                      {projects[selectedIdx].pt}
                    </b>
                    <span className="modal-kpi-sub">Rencana Kumulatif</span>
                  </div>

                  <div className="modal-kpi-card">
                    <span className="modal-kpi-label">Realisasi</span>
                    <b className="modal-kpi-val" style={{ color: '#10b981' }}>
                      {projects[selectedIdx].rt}
                    </b>
                    <span className="modal-kpi-sub">Progres Lapangan</span>
                  </div>

                  <div className="modal-kpi-card">
                    <span className="modal-kpi-label">Deviasi</span>
                    <b
                      className="modal-kpi-val"
                      style={{
                        color:
                          projects[selectedIdx].dv == null
                            ? 'inherit'
                            : projects[selectedIdx].dv! < -5
                            ? '#ef4444'
                            : projects[selectedIdx].dv! < 0
                            ? '#f97316'
                            : '#10b981'
                      }}
                    >
                      {projects[selectedIdx].dv == null
                        ? '-'
                        : (projects[selectedIdx].dv! > 0 ? '+' : '') + f1(projects[selectedIdx].dv!) + '%'}
                    </b>
                    <span className="modal-kpi-sub">
                      {projects[selectedIdx].dv != null && projects[selectedIdx].dv! < 0
                        ? 'Keterlambatan'
                        : 'Sesuai / Melampaui'}
                    </span>
                  </div>

                  <div className="modal-kpi-card">
                    <span className="modal-kpi-label">Status Proyek</span>
                    <div style={{ margin: '6px 0 4px', display: 'flex', justifyContent: 'center' }}>
                      <span
                        className="tag"
                        style={{
                          background: stc(projects[selectedIdx].st),
                          color: stText(projects[selectedIdx].st),
                          fontSize: '12px',
                          padding: '4px 10px',
                          display: 'inline-block'
                        }}
                      >
                        {projects[selectedIdx].st}
                      </span>
                    </div>
                    {(() => {
                      const p = projects[selectedIdx];
                      const isDone = p.st === 'Finished'  
                      if (!isDone) return <span className="modal-kpi-sub">Kondisi Terkini</span>;
                      const rawD = sisa(p.akd);
                      const isDelayed = rawD !== null && rawD < 0;
                      const isOnTrack = p.st.includes('Ongoing') || (!isDelayed && rawD !== null && rawD >= 0);
                      if (isDelayed) return <span className="modal-kpi-sub" style={{ color: '#f97316', fontWeight: 700 }}>Finished (Delayed)</span>;
                      if (isOnTrack) return <span className="modal-kpi-sub" style={{ color: '#10b981', fontWeight: 700 }}>Finished (On time)</span>;
                      return <span className="modal-kpi-sub" style={{ color: '#2563eb', fontWeight: 700 }}>Finished</span>;
                    })()}
                  </div>

                  <div
                    className="modal-kpi-card"
                    style={{
                      borderColor:
                        ! (projects[selectedIdx].st === 'Finished') &&
                        sisa(projects[selectedIdx].akd) !== null && sisa(projects[selectedIdx].akd)! < 0
                          ? '#f87171'
                          : undefined,
                      background:
                        ! (projects[selectedIdx].st === 'Finished') &&
                        sisa(projects[selectedIdx].akd) !== null && sisa(projects[selectedIdx].akd)! < 0
                          ? 'rgba(239, 68, 68, 0.05)'
                          : undefined
                    }}
                  >
                    <span className="modal-kpi-label">Akhir Kontrak Terkini</span>
                    <b
                      className="modal-kpi-val"
                      style={{
                        fontSize: '13px',
                        color:
                          ! (projects[selectedIdx].st === 'Finished') &&
                          sisa(projects[selectedIdx].akd) !== null && sisa(projects[selectedIdx].akd)! < 0
                            ? '#ef4444'
                            : 'inherit'
                      }}
                    >
                      {projects[selectedIdx].akt}
                    </b>
                    <span className="modal-kpi-sub">
                      {(() => {
                        const rawD = sisa(projects[selectedIdx].akd);
                        const isDone = projects[selectedIdx].st === 'Finished';
                        const d = isDone && rawD !== null && rawD < 0 ? 0 : rawD;
                        if (d === null) return '-';
                        if (d < 0) {
                          return (
                            <span style={{ color: '#ef4444', fontWeight: 800 }}>
                              ⚠️ Terlambat {-d} hari
                            </span>
                          );
                        }
                        if (d <= 30) {
                          return (
                            <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                              Sisa {d} hari
                            </span>
                          );
                        }
                        return (
                          <span style={{ color: '#10b981', fontWeight: 600 }}>
                            Sisa {d} hari
                          </span>
                        );
                      })()}
                    </span>
                  </div>
                </div>

                <div className="g2x">
                  <div className="panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h2 style={{ margin: 0 }}>Project identity</h2>
                      <button
                        type="button"
                        onClick={() => {
                          const p = projects[selectedIdx];
                          setIdentityForm({
                            n: p.n,
                            wbs: p.wbs || '',
                            pic: p.pic || getProjectPic(p.no),
                            pem: p.pem,
                            bamk: p.bamk,
                            ak: p.ak,
                            akt: formatIndoDate(p.akt),
                            nv: p.nv
                          });
                          setIsIdentityEditOpen(true);
                        }}
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Edit
                      </button>
                    </div>
                   
                    {identityToast && (                 
                    <div className="status-feedback-banner">
                      <Check size={14} />
                      <span>{identityToast}</span>
                    </div>
                  )}

                    <div id="pid">
                      <div className="kv">
                        <b>Nama project</b>
                        <span>{projects[selectedIdx].n}</span>
                      </div>
                      <div className="kv">
                        <b>Nomor WBS</b>
                        <span>
                          {projects[selectedIdx].wbs && projects[selectedIdx].wbs !== '—' && projects[selectedIdx].wbs !== '-'
                            ? projects[selectedIdx].wbs
                            : '-'}
                        </span>
                      </div>
                      <div className="kv">
                        <b>PIC Proyek</b>
                        <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
                          {projects[selectedIdx].pic || getProjectPic(projects[selectedIdx].no)}
                        </span>
                      </div>
                      <div className="kv">
                        <b>Pemilik</b>
                        <span>{projects[selectedIdx].pem}</span>
                      </div>
                      <div className="kv">
                        <b>BAMK</b>
                        <span>{projects[selectedIdx].bamk}</span>
                      </div>
                      <div className="kv">
                        <b>Akhir kontrak (awal)</b>
                        <span>{projects[selectedIdx].ak}</span>
                      </div>
                      <div className="kv">
                        <b>Akhir kontrak terkini</b>
                        <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
                          {formatIndoDate(projects[selectedIdx].akt)}
                        </span>
                      </div>
                      {/* Status keterlambatan / sisa hari terhadap akhir kontrak terkini */}
                      {(() => {
                        const rawD = sisa(projects[selectedIdx].akd);
                        const isDone = projects[selectedIdx].st === 'Finished';
                        const d = isDone && rawD !== null && rawD < 0 ? 0 : rawD;
                        if (d === null) return null;
                        if (d < 0) {
                          return (
                            <div
                              className="kv"
                              style={{
                                background: '#fef2f2',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: '1px solid #fecaca'
                              }}
                            >
                              <b style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>⚠️</span> Keterlambatan kontrak
                              </b>
                              <span style={{ color: '#b91c1c', fontWeight: 800 }}>
                                Terlambat {-d} hari dari tanggal akhir kontrak terkini ({formatIndoDate(projects[selectedIdx].akt)})
                              </span>
                            </div>
                          );
                        }
                        return (
                          <div className="kv">
                            <b>Sisa waktu kontrak</b>
                            <span
                              style={{
                                color: d <= 30 ? 'var(--risk)' : 'var(--good)',
                                fontWeight: 700
                              }}
                            >
                              {d} hari lagi
                            </span>
                          </div>
                        );
                      })()}
                      {projects[selectedIdx].ket !== '-' && (
                        <div className="kv">
                          <b>Keterangan</b>
                          <span>{projects[selectedIdx].ket}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="status-update-header">
                      <h2>Status update</h2>
                      <div className="status-update-actions">
                        {projectUpdates[projects[selectedIdx].no] && (
                          <button
                            type="button"
                            className="btn-history-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              const p = projects[selectedIdx];
                              const currentList = statusHistory[p.no] || currentHistory;
                              const nonBaseline = currentList.filter(item => !item.id.startsWith('baseline-'));
                              if (nonBaseline.length > 0) {
                                handleDeleteHistory(nonBaseline[0].id);
                              } else {
                                setProjectUpdates(prev => {
                                  const copy = { ...prev };
                                  delete copy[p.no];
                                  return copy;
                                });
                                setStatusToast('Status proyek berhasil dikembalikan ke baseline awal.');
                                setTimeout(() => setStatusToast(null), 3000);
                              }
                            }}
                            title="Kembalikan ke status baseline awal"
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                          >
                            <Trash2 size={12} />
                            <span>Reset</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className={`btn-update-tab ${statusViewMode === 'history' ? 'active' : ''}`}
                          onClick={() => setStatusViewMode(prev => (prev === 'history' ? 'view' : 'history'))}
                          title="Lihat riwayat status update terdahulu"
                        >
                          <History size={13} />
                          <span>Riwayat ({currentHistory.length})</span>
                        </button>
                        <button
                          type="button"
                          className={`btn-add-update ${statusViewMode === 'edit' ? 'active' : ''}`}
                          onClick={() => {
                            if (statusViewMode === 'edit') {
                              setStatusViewMode('view');
                            } else {
                              setEditSt(projects[selectedIdx].st);
                              setEditSit(projects[selectedIdx].sit);
                              setEditMit(projects[selectedIdx].mit);
                              setEditNote('');
                              setStatusViewMode('edit');
                            }
                          }}
                        >
                          {statusViewMode === 'edit' ? (
                            <>
                              <X size={13} />
                              <span>Batal</span>
                            </>
                          ) : (
                            <>
                              <Plus size={13} />
                              <span>Update Status</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {statusToast && (
                      <div className="status-feedback-banner">
                        <Check size={14} />
                        <span>{statusToast}</span>
                      </div>
                    )}

                    <div id="psu">
                      {statusViewMode === 'edit' ? (
                        <form className="status-edit-form" onSubmit={handleSaveStatusUpdate}>
                          <div
                            style={{
                              background: 'rgba(37, 99, 235, 0.05)',
                              border: '1px solid rgba(37, 99, 235, 0.15)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '11px',
                              color: 'var(--ink)',
                              marginBottom: '10px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                                📊 Target: Sheet 'Detail Project Catatan'
                              </span>
                              {googleUser ? (
                                <span style={{ color: '#059669', fontWeight: 600, fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                  Terhubung: {googleUser.displayName || googleUser.email}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleGoogleSignIn}
                                  style={{
                                    background: '#2563eb',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '3px 8px',
                                    borderRadius: '5px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Hubungkan Google
                                </button>
                              )}
                            </div>
                            <span style={{ color: 'var(--mute)', fontSize: '10.5px' }}>
                              Hasil input akan otomatis mengisi <b>WBS</b> (Kolom A), <b>Tanggal</b> (Kolom C), <b>Problem</b> (Kolom I), <b>Action Plan</b> (Kolom J), dan <b>Catatan</b> (Kolom K).
                            </span>
                          </div>

                          <div className="status-form-group">
                            <label>Status Proyek</label>
                            <select
                              value={editSt}
                              onChange={e => setEditSt(e.target.value)}
                              required
                            >
                              {Object.keys(SC).map(s => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="status-form-group">
                            <label>Problem</label>
                            <textarea
                              rows={3}
                              value={editSit}
                              onChange={e => setEditSit(e.target.value)}
                              placeholder="Masukkan problem / kendala proyek..."
                            />
                          </div>

                          <div className="status-form-group">
                            <label>Action Plan</label>
                            <textarea
                              rows={2}
                              value={editMit}
                              onChange={e => setEditMit(e.target.value)}
                              placeholder="Masukkan action plan / tindak lanjut..."
                            />
                          </div>

                          <div className="status-form-group">
                            <label>Catatan Perubahan (Opsional)</label>
                            <input
                              type="text"
                              value={editNote}
                              onChange={e => setEditNote(e.target.value)}
                              placeholder="Contoh: Hasil rapat mingguan vendor / pembaruan lapangan"
                            />
                          </div>

                          <div className="status-form-actions">
                            <button
                              type="button"
                              className="btn-form-cancel"
                              onClick={() => setStatusViewMode('view')}
                            >
                              Batal
                            </button>
                            <button type="submit" className="btn-form-save">
                              <Check size={14} />
                              <span>Simpan & Sinkronkan ke Sheets</span>
                            </button>
                          </div>
                        </form>
                      ) : statusViewMode === 'history' ? (
                        <div className="status-history-container">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11.5px', color: 'var(--mute)', fontWeight: 600 }}>
                              Total {currentHistory.length} catatan riwayat status
                            </span>
                            <button
                              type="button"
                              className="btn-update-tab"
                              onClick={() => setStatusViewMode('view')}
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                            >
                              ← Kembali ke Tampilan Aktif
                            </button>
                          </div>

                          {currentHistory.map(entry => {
                            const isCurrentActive =
                              projects[selectedIdx].st === normalizeStatus(entry.st) &&
                              projects[selectedIdx].sit === entry.sit &&
                              projects[selectedIdx].mit === entry.mit;

                            return (
                              <div
                                key={entry.id}
                                className={`status-history-card ${isCurrentActive ? 'is-active-entry' : ''}`}
                              >
                                <div className="status-history-top">
                                  <div className="status-history-meta" style={{ flexWrap: 'wrap', gap: '6px' }}>
                                    <span
                                      className="tag"
                                      style={{
                                        background: stc(entry.st),
                                        color: stText(entry.st),
                                        fontSize: '11px',
                                        padding: '2px 8px'
                                      }}
                                    >
                                      {normalizeStatus(entry.st)}
                                    </span>
                                    <span className="status-history-time">
                                      <Clock size={11} />
                                      {entry.timestamp}
                                    </span>
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        color: 'var(--ink)',
                                        fontWeight: 600,
                                        background: 'var(--card)',
                                        border: '1px solid var(--line)',
                                        padding: '1px 7px',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      <User size={11} style={{ color: 'var(--accent-blue)' }} />
                                      <span>Diperbarui oleh: <b>{entry.author && !/sistem|bima|user|tim\s*proyek/i.test(entry.author) ? entry.author : (projects[selectedIdx].pic || getProjectPic(projects[selectedIdx].no))}</b></span>
                                    </span>
                                  </div>
                                  {isCurrentActive && (
                                    <span className="active-entry-pill">● Aktif Sekarang</span>
                                  )}
                                </div>

                                {entry.note && (
                                  <div style={{ fontSize: '11.5px', color: 'var(--mute)', fontStyle: 'italic', marginBottom: '2px' }}>
                                    "{entry.note}"
                                  </div>
                                )}

                                <div className="status-history-detail">
                                  <b>Problem:</b>
                                  <span>{entry.sit}</span>
                                </div>
                                <div className="status-history-detail">
                                  <b>Action Plan:</b>
                                  <span>{entry.mit}</span>
                                </div>

                                <div className="status-history-actions">
                                  {!isCurrentActive && (
                                    <button
                                      type="button"
                                      className="btn-history-restore"
                                      onClick={() => handleRestoreHistory(entry)}
                                      title="Pulihkan dan gunakan status update ini"
                                    >
                                      <RotateCcw size={11} />
                                      <span>Terapkan Status Ini</span>
                                    </button>
                                  )}
                                  {(!entry.id.startsWith('baseline-') || currentHistory.length > 1) && (
                                    <button
                                      type="button"
                                      className="btn-history-delete"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteHistory(entry.id);
                                      }}
                                      title="Hapus catatan status ini dari riwayat"
                                    >
                                      <Trash2 size={11} />
                                      <span>Hapus</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="tb">
                        <h3>Problem</h3>
                        <p>{projects[selectedIdx].sit || '-'}</p>
                        <h3>Action Plan</h3>
                        <p>{projects[selectedIdx].mit || '-'}</p>
                      </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div id="kc2">
                    {selectedIdx in MAP ? (
                      <div>
                        <h3 style={{ fontSize: '13.5px', color: 'var(--ink)', margin: '0 0 8px', fontWeight: '800' }}>
                          Kurva S project ini
                        </h3>
                        {renderKurvaSvg(K.proj[MAP[selectedIdx]])}
                      </div>
                    ) : (
                      <p className="src">Project ini belum punya kurva S di file kurva S.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isIdentityEditOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-base text-slate-800 dark:text-white">
                    Edit Project Identity #{selectedIdx !== null ? projects[selectedIdx].no : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsIdentityEditOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSaveIdentityEdit} className="p-5 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Project</label>
                    <textarea
                      required
                      rows={2}
                      value={identityForm.n}
                      onChange={e => setIdentityForm({ ...identityForm, n: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor WBS</label>
                    <input
                      type="text"
                      value={identityForm.wbs}
                      onChange={e => setIdentityForm({ ...identityForm, wbs: e.target.value })}
                      placeholder="Contoh: R/4.24.53.526 atau —"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">PIC Proyek</label>
                      <input
                        type="text"
                        value={identityForm.pic}
                        onChange={e => setIdentityForm({ ...identityForm, pic: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nilai Pekerjaan (Rp M)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={identityForm.nv}
                        onChange={e => setIdentityForm({ ...identityForm, nv: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pemilik</label>
                    <input
                      type="text"
                      value={identityForm.pem}
                      onChange={e => setIdentityForm({ ...identityForm, pem: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">BAMK</label>
                    <input
                      type="text"
                      value={identityForm.bamk}
                      onChange={e => setIdentityForm({ ...identityForm, bamk: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Akhir Kontrak (Awal)</label>
                      <input
                        type="text"
                        value={identityForm.ak}
                        onChange={e => setIdentityForm({ ...identityForm, ak: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Akhir Kontrak Terkini</label>
                      <input
                        type="text"
                        value={identityForm.akt}
                        onChange={e => setIdentityForm({ ...identityForm, akt: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsIdentityEditOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={13} />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
