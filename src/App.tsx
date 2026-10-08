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
  ContractItem
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
  PanelLeft,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  History,
  Plus,
  Trash2,
  Check,
  Edit3
} from 'lucide-react';

// Status Update Record and History Types
export interface ProjectStatusUpdate {
  st: string;
  sit: string;
  mit: string;
  ls: string;
  lastUpdated: string;
}

export interface StatusHistoryEntry {
  id: string;
  timestamp: string;
  st: string;
  sit: string;
  mit: string;
  ls: string;
  note?: string;
  author?: string;
}

// Interactive Kurva S Line Chart with Hover Crosshair and Month Tooltip
function InteractiveKurvaChart({ d }: { d: { p: (number | null)[]; r: (number | null)[] } }) {
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

        {/* Current cutoff marker (Agu 2026) */}
        <line
          x1={X(31)}
          x2={X(31)}
          y1={T}
          y2={H - B}
          stroke="#2563eb"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.8"
        />
        <text x={X(31) - 4} y={T + 10} textAnchor="end" fontSize="10" fill="#2563eb" fontWeight="700">
          Agu 2026
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
            Rencana (kumulatif)
          </span>
          <span>
            <i className="dot" style={{ background: '#2563eb' }} />
            Realisasi (kumulatif)
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

// Modern Interactive Horizontal Bar Chart for PIC Workload (Bar ke bawah)
function PicHorizontalBarChart({ data }: { data: [string, number][] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="src">Tidak ada data untuk filter ini.</p>;
  }

  const maxVal = Math.max(...data.map(d => d[1]), 1);
  const total = data.reduce((a, b) => a + b[1], 0);

  return (
    <div className="pic-hbar-chart-wrapper">
      <div className="pic-hbar-list">
        {data.map(([pic, val], i) => {
          const pctOfMax = Math.max(Math.round((val / maxVal) * 100), 4);
          const sharePct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={pic}
              className={`pic-hbar-row ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="pic-hbar-header">
                <div className="pic-hbar-title">
                  <span className="pic-avatar-badge">{pic.charAt(0).toUpperCase()}</span>
                  <span className="pic-hbar-name" title={pic}>
                    {pic}
                  </span>
                </div>
                <div className="pic-hbar-stats">
                  <b>{val}</b> <small>kontrak ({sharePct}%)</small>
                </div>
              </div>

              <div className="pic-hbar-track">
                <div
                  className="pic-hbar-fill"
                  style={{
                    width: `${pctOfMax}%`,
                    background: isHovered
                      ? 'linear-gradient(90deg, #38bdf8, #2563eb)'
                      : 'linear-gradient(90deg, #60a5fa, #2563eb)'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pic-hbar-summary">
        <span>Total PIC: <b>{data.length} Orang</b></span>
        <span>Total Beban: <b>{total} Kontrak</b></span>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'t1' | 't2' | 't4' | 't3'>('t1');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Collapsible Sidebar like VSCode
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved === 'true') return true;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar (VSCode standard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Tab 2 (Detail project) Filters & Modal
  const [gs, setGs] = useState<string>(''); // Kelompok filter
  const [ss, setSs] = useState<string>(''); // Status filter
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Global search input for topbar
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Tab 4 (Kurva S) Selector
  const [kSel, setKSel] = useState<string>('p'); // 'p' or project index string

  // Tab 3 (Kelengkapan dokumen) Filters
  const [dsS, setDsS] = useState<string>('G'); // G, C, ''
  const [dsP, setDsP] = useState<string>(''); // PIC
  const [dsJ, setDsJ] = useState<string>(''); // '', 'U', 'V'
  const [dsB, setDsB] = useState<string>(''); // Bucket

  // Project Status Updates & History State (Persisted in localStorage)
  const [projectUpdates, setProjectUpdates] = useState<Record<number, ProjectStatusUpdate>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('project_status_updates_v1');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  const [statusHistory, setStatusHistory] = useState<Record<number, StatusHistoryEntry[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('project_status_history_v1');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('project_status_updates_v1', JSON.stringify(projectUpdates));
    } catch (e) {
      console.error(e);
    }
  }, [projectUpdates]);

  useEffect(() => {
    try {
      localStorage.setItem('project_status_history_v1', JSON.stringify(statusHistory));
    } catch (e) {
      console.error(e);
    }
  }, [statusHistory]);

  // Merged live projects data reflecting all status and situation updates
  const projects = useMemo(() => {
    return M.map(m => {
      const up = projectUpdates[m.no];
      if (up) {
        return {
          ...m,
          st: up.st || m.st,
          sit: up.sit ?? m.sit,
          mit: up.mit ?? m.mit,
          ls: up.ls ?? m.ls
        };
      }
      return m;
    });
  }, [projectUpdates]);

  const f1 = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 1 });

  // On going projects from Live Projects
  const P = useMemo(() => {
    return projects.filter(m => m.g === 'ON GOING');
  }, [projects]);

  const dev = K.port.p[31]! - K.port.r[31]!;

  // Helper for remaining days
  const today = useMemo(() => new Date(new Date().toDateString()), []);
  const sisa = useCallback((iso: string | null) => {
    if (!iso) return null;
    return Math.round((new Date(iso).getTime() - today.getTime()) / 864e5);
  }, [today]);

  // Tab 1 Filtered List
  const homeList = useMemo(() => {
    return P.map((m, i) => ({
      m,
      i,
      o: OW[i] || m.pem,
    })).filter(x => {
      const matchStatus = !fs || x.m.st === fs;
      const matchOwner = !fo || x.o === fo;
      const matchSearch = !globalSearch || x.m.n.toLowerCase().includes(globalSearch.toLowerCase()) || x.o.toLowerCase().includes(globalSearch.toLowerCase());
      return matchStatus && matchOwner && matchSearch;
    });
  }, [P, fs, fo, globalSearch]);

  // Tab 1 Remaining days sorted
  const homeDeadlineList = useMemo(() => {
    return homeList
      .map(x => ({ x, d: sisa(x.m.akd) }))
      .filter((y): y is { x: typeof homeList[0]; d: number } => y.d !== null)
      .sort((a, b) => a.d - b.d);
  }, [homeList, sisa]);

  // Tab 1 At Risk & Delayed
  const homeCriticalList = useMemo(() => {
    return homeList
      .filter(x => x.m.st !== 'ON TRACK')
      .sort((a, b) => {
        const dvA = (a.m.rl ?? 0) - (a.m.pl ?? 0);
        const dvB = (b.m.rl ?? 0) - (b.m.pl ?? 0);
        return dvA - dvB;
      });
  }, [homeList]);

  // Tab 2 Filtered List
  const detailList = useMemo(() => {
    return projects.map((m, i) => ({ m, i })).filter(({ m }) => {
      const matchKelompok = !gs || m.g === gs;
      const matchStatus = !ss || m.st === ss;
      const matchSearch = !globalSearch || m.n.toLowerCase().includes(globalSearch.toLowerCase()) || m.pem.toLowerCase().includes(globalSearch.toLowerCase());
      return matchKelompok && matchStatus && matchSearch;
    });
  }, [projects, gs, ss, globalSearch]);

  // Status update modal manager state
  const [statusViewMode, setStatusViewMode] = useState<'view' | 'edit' | 'history'>('view');
  const [editSt, setEditSt] = useState<string>('ON TRACK');
  const [editSit, setEditSit] = useState<string>('');
  const [editMit, setEditMit] = useState<string>('');
  const [editLs, setEditLs] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Helper to get history for currently selected project
  const currentHistory = useMemo((): StatusHistoryEntry[] => {
    if (selectedIdx === null || !projects[selectedIdx]) return [];
    const p = projects[selectedIdx];
    const list = statusHistory[p.no];
    if (list && list.length > 0) return list;
    return [
      {
        id: `baseline-${p.no}`,
        timestamp: 'Baseline Awal Kontrak',
        st: M[selectedIdx].st,
        sit: M[selectedIdx].sit,
        mit: M[selectedIdx].mit,
        ls: M[selectedIdx].ls,
        note: 'Baseline status awal data BIMA',
        author: 'Sistem'
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

    const newEntry: StatusHistoryEntry = {
      id: `up-${Date.now()}`,
      timestamp: timestampStr,
      st: editSt,
      sit: editSit.trim() || p.sit,
      mit: editMit.trim() || p.mit,
      ls: editLs.trim() || p.ls,
      note: editNote.trim() || 'Pembaruan status berkala',
      author: 'User / Tim Proyek'
    };

    setProjectUpdates(prev => ({
      ...prev,
      [p.no]: {
        st: editSt,
        sit: editSit.trim() || p.sit,
        mit: editMit.trim() || p.mit,
        ls: editLs.trim() || p.ls,
        lastUpdated: timestampStr
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
          ls: M[selectedIdx].ls,
          note: 'Baseline status awal data BIMA',
          author: 'Sistem'
        }
      ];
      return {
        ...prev,
        [p.no]: [newEntry, ...existing]
      };
    });

    setStatusToast('Status update berhasil diperbarui dan dicatat dalam riwayat!');
    setTimeout(() => setStatusToast(null), 3500);
    setStatusViewMode('view');
  };

  // Handler: Restore past status from history
  const handleRestoreHistory = (entry: StatusHistoryEntry) => {
    if (selectedIdx === null || !projects[selectedIdx]) return;
    const p = projects[selectedIdx];
    setProjectUpdates(prev => ({
      ...prev,
      [p.no]: {
        st: entry.st,
        sit: entry.sit,
        mit: entry.mit,
        ls: entry.ls,
        lastUpdated: entry.timestamp
      }
    }));
    setStatusToast(`Status update berhasil dipulihkan ke versi (${entry.timestamp})`);
    setTimeout(() => setStatusToast(null), 3500);
    setStatusViewMode('view');
  };

  // Handler: Delete history entry (mengurangi status update)
  const handleDeleteHistory = (entryId: string) => {
    if (selectedIdx === null || !projects[selectedIdx]) return;
    const p = projects[selectedIdx];
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus catatan status update ini dari riwayat?');
    if (!confirmDelete) return;

    setStatusHistory(prev => {
      const currentList = prev[p.no] || [];
      const updatedList = currentList.filter(item => item.id !== entryId);

      // If active update matches the deleted one, sync active to the next top entry or reset
      if (updatedList.length > 0) {
        const top = updatedList[0];
        setProjectUpdates(pUp => ({
          ...pUp,
          [p.no]: {
            st: top.st,
            sit: top.sit,
            mit: top.mit,
            ls: top.ls,
            lastUpdated: top.timestamp
          }
        }));
      } else {
        setProjectUpdates(pUp => {
          const copy = { ...pUp };
          delete copy[p.no];
          return copy;
        });
      }

      return {
        ...prev,
        [p.no]: updatedList
      };
    });

    setStatusToast('Catatan riwayat berhasil dihapus.');
    setTimeout(() => setStatusToast(null), 3000);
  };

  const stc = (s: string) => {
    if (!s) return '#10b981';
    if (/AT RISK/i.test(s)) return '#ef4444'; // at risk -> merah
    if (/DELAYED/i.test(s) && !/DONE/i.test(s)) return '#f97316'; // delayed -> oren
    if (/DONE/i.test(s) || /SELESAI/i.test(s)) return '#2563eb'; // done -> biru
    if (/ON TRACK/i.test(s)) return '#10b981'; // on track -> hijau
    if (/ACTIVE/i.test(s) || /PROSES/i.test(s)) return '#eab308'; // active -> kuning
    if (/LELANG/i.test(s) || /AANWIJZING/i.test(s)) return '#94a3b8'; // lelang/aanwizjing -> abu-abu
    return SC[s] || '#94a3b8';
  };

  const stText = (s: string) => {
    if (/ACTIVE/i.test(s)) return '#0f172a';
    return '#ffffff';
  };

  const openDetailModal = (idx: number) => {
    setSelectedIdx(idx);
    setStatusViewMode('view');
    setStatusToast(null);
  };

  const closeDetailModal = () => {
    setSelectedIdx(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDetailModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Kurva S Line Chart Render Helper (Interactive with hover crosshair & tooltip)
  const renderKurvaSvg = (d: { p: (number | null)[]; r: (number | null)[] }) => {
    return <InteractiveKurvaChart d={d} />;
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

  // Tab 3 Filtered Contracts
  const docFiltered = useMemo(() => {
    return C.filter(c => {
      const matchSource = !dsS || c.s === dsS;
      const matchPic = !dsP || c.pic === dsP;
      const matchJenis = !dsJ || c.j === dsJ || (dsJ === 'U' && c.j === 'D');
      const matchBucket = !dsB || c.b === dsB;
      const matchSearch = !globalSearch || c.n.toLowerCase().includes(globalSearch.toLowerCase()) || c.pic.toLowerCase().includes(globalSearch.toLowerCase());
      return matchSource && matchPic && matchJenis && matchBucket && matchSearch;
    });
  }, [dsS, dsP, dsJ, dsB, globalSearch]);

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
      {/* LEFT SIDEBAR (Collapsible like VSCode) */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Floating edge toggle handle on the sidebar border */}
        <button
          type="button"
          className="sidebar-edge-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? "Buka Menu Bar (Ctrl+B)" : "Sembunyikan Menu Bar (Ctrl+B)"}
          aria-label="Toggle Menu Bar"
        >
          {sidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        <div className="sidebar-header">
          {!sidebarCollapsed ? (
            <div className="sidebar-logo-container">
              <img
                src="/logo-bima.svg"
                alt="PELINDO JASA MARITIM BIMA"
                className="sidebar-logo-img"
              />
            </div>
          ) : (
            <div
              className="sidebar-collapsed-logo"
              title="PELINDO JASA MARITIM BIMA (Klik untuk buka menu)"
              onClick={() => setSidebarCollapsed(false)}
            >
              <img
                src="/logo-bima.svg"
                alt="PELINDO BIMA"
                className="sidebar-collapsed-logo-img"
              />
            </div>
          )}
        </div>

        <div className="sidebar-menu">
          {!sidebarCollapsed && <div className="menu-section-label">MAIN MENU</div>}
          <button
            className={`nav-item ${activeTab === 't1' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('t1');
              setMobileMenuOpen(false);
            }}
            title="Overview"
          >
            <LayoutDashboard size={18} />
            {!sidebarCollapsed && <span>Overview</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 't2' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('t2');
              setMobileMenuOpen(false);
            }}
            title="Detail Project"
          >
            <FolderKanban size={18} />
            {!sidebarCollapsed && <span>Detail Project</span>}
          </button>

          {!sidebarCollapsed && <div className="menu-section-label">ANALISIS &amp; KONTRAK</div>}
          <button
            className={`nav-item ${activeTab === 't4' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('t4');
              setMobileMenuOpen(false);
            }}
            title="Kurva S"
          >
            <TrendingUp size={18} />
            {!sidebarCollapsed && <span>Kurva S</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 't3' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('t3');
              setMobileMenuOpen(false);
            }}
            title="Document Tracking"
          >
            <FileCheck2 size={18} />
            {!sidebarCollapsed && <span>Document Tracking</span>}
          </button>
        </div>

        <div className="sidebar-footer">
          {!sidebarCollapsed ? (
            <div className="sidebar-help-card">
              <h4>Divisi Peralatan</h4>
              <p>PT Berkah Industri Mesin Angkat (BIMA)</p>
              <button
                className="sidebar-help-btn"
                onClick={() => {
                  setFs('');
                  setFo('');
                  setGs('');
                  setSs('');
                  setGlobalSearch('');
                }}
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="sidebar-collapsed-btn"
              onClick={() => {
                setFs('');
                setFo('');
                setGs('');
                setSs('');
                setGlobalSearch('');
              }}
              title="Reset Semua Filter"
              aria-label="Reset Semua Filter"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-wrapper">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Buka Menu Bar (Ctrl+B)" : "Sembunyikan Menu Bar (Ctrl+B)"}
              aria-label="Toggle Menu Bar"
            >
              <PanelLeft size={18} />
            </button>
            <div className="topbar-title">
              <h1>Dashboard Monitoring Project</h1>
              <span>Divisi Peralatan Proyek</span>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={16} color="var(--mute)" />
              <input
                type="text"
                placeholder="Cari nama project..."
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
              />
            </div>
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
        </header>

        {/* PAGE CONTENT */}
        <main className="page-content">
          <div className="note">
            Sistem pemantauan portofolio dan progres pekerjaan Mekanikal &amp; Elektrikal (ME) secara terpadu, menyajikan ringkasan eksekutif status proyek berjalan, analisis realisasi Kurva S terhadap rencana kumulatif, pemetaan mitigasi risiko kritis, serta pelacakan kelengkapan dokumen administrasi kontrak.
          </div>

          {/* TAB 1: RINGKASAN */}
          {activeTab === 't1' && (
            <section id="t1">
              <div className="filters">
                <select
                  id="fs"
                  aria-label="Status"
                  value={fs}
                  onChange={e => setFs(e.target.value)}
                >
                  <option value="">Semua status</option>
                  {Object.keys(SC).map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  id="fo"
                  aria-label="Pemilik pekerjaan"
                  value={fo}
                  onChange={e => setFo(e.target.value)}
                >
                  <option value="">Semua pemilik</option>
                  {Array.from(new Set(OW))
                    .sort()
                    .map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
                <button
                  id="fr"
                  className="rs"
                  onClick={() => {
                    setFs('');
                    setFo('');
                    setGlobalSearch('');
                  }}
                >
                  Reset Filter
                </button>
              </div>

              <div className="kp" id="hk">
                <div className="kk">
                  <span>Project on going</span>
                  <b>{homeList.length}</b>
                </div>
                <div className="kk">
                  <span>Total nilai kontrak</span>
                  <b>Rp{f1(homeList.reduce((a, x) => a + x.m.nv, 0))} M</b>
                </div>
                <div className="kk">
                  <span>At risk atau delayed</span>
                  <b style={{ color: homeList.filter(x => x.m.st !== 'ON TRACK').length > 0 ? '#ef4444' : 'inherit' }}>
                    {homeList.filter(x => x.m.st !== 'ON TRACK').length}
                    {homeList.length
                      ? ` (${Math.round(
                          (homeList.filter(x => x.m.st !== 'ON TRACK').length / homeList.length) * 100
                        )}%)`
                      : ''}
                  </b>
                </div>
                <div className="kk">
                  <span>Deviasi kurva S (Agu 2026)</span>
                  <b style={{ color: dev > 0 ? '#ef4444' : '#10b981' }}>−{f1(dev)}%</b>
                </div>
              </div>

              <div className="g2x">
                <div className="panel">
                  <h2>Jumlah Proyek Berdasarkan Status</h2>
                  <div id="hs">
                    <ProjectStagePieChart
                      data={GK.map(([k, l, c]) => ({
                        key: k,
                        label: l,
                        value: M.filter(m => m.g === k).length,
                        color: c
                      }))}
                    />
                  </div>
                </div>

                <div className="panel">
                  <h2>Akhir kontrak project on going</h2>
                  <div className="bk" id="hbk">
                    <div>
                      Terlewat<b>{homeDeadlineList.filter(y => y.d < 0).length}</b>
                    </div>
                    <div>
                      0-30 hari<b>{homeDeadlineList.filter(y => y.d >= 0 && y.d <= 30).length}</b>
                    </div>
                    <div>
                      31-90 hari<b>{homeDeadlineList.filter(y => y.d > 30 && y.d <= 90).length}</b>
                    </div>
                    <div>
                      &gt; 90 hari<b>{homeDeadlineList.filter(y => y.d > 90).length}</b>
                    </div>
                  </div>
                  <div className="scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Project</th>
                          <th>Akhir kontrak terkini</th>
                          <th>Sisa hari</th>
                          <th>Realisasi</th>
                        </tr>
                      </thead>
                      <tbody id="he">
                        {homeDeadlineList.slice(0, 6).map(y => (
                          <tr
                            key={y.x.m.no}
                            tabIndex={0}
                            onClick={() => {
                              openDetailModal(y.x.m.no - 1);
                            }}
                          >
                            <td>{y.x.m.n}</td>
                            <td>{y.x.m.akt}</td>
                            <td
                              style={{
                                color:
                                  y.d < 0 ? 'var(--bad)' : y.d <= 30 ? 'var(--risk)' : 'inherit'
                              }}
                            >
                              {y.d < 0 ? `terlewat ${-y.d}` : y.d}
                            </td>
                            <td>{y.x.m.rt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="panel">
                <h2>Perlu perhatian: delayed dan at risk</h2>
                <div className="scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Pemilik</th>
                        <th>Nilai (Rp M)</th>
                        <th>Deviasi</th>
                        <th>Status</th>
                        <th>Situasi</th>
                      </tr>
                    </thead>
                    <tbody id="hp">
                      {homeCriticalList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="src">
                            Tidak ada project untuk filter ini.
                          </td>
                        </tr>
                      ) : (
                        homeCriticalList.map(x => {
                          const dv = (x.m.rl ?? 0) - (x.m.pl ?? 0);
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
                              <td style={{ color: dv < -20 ? 'var(--bad)' : 'inherit' }}>
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
              <div className="filters">
                <select
                  id="gs"
                  aria-label="Kelompok"
                  value={gs}
                  onChange={e => setGs(e.target.value)}
                >
                  <option value="">Semua kelompok</option>
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
                  <option value="">Semua status</option>
                  {Array.from(new Set(projects.map(m => m.st))).map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="panel">
                <h2 id="tt">
                  Daftar project ({detailList.length} dari {projects.length})
                </h2>
                <div className="scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Project</th>
                        <th>Pemilik</th>
                        <th>Nilai (Rp M)</th>
                        <th>Realisasi vs plan</th>
                        <th>Deviasi</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody id="rows">
                      {detailList.map(({ m, i }) => (
                        <tr
                          key={m.no}
                          aria-selected={selectedIdx === i}
                        >
                          <td>{m.no}</td>
                          <td>{m.n}</td>
                          <td>{m.pem}</td>
                          <td>{f1(m.nv)}</td>
                          <td>
                            {m.rl != null ? (
                              <div className="bar">
                                <i style={{ width: `${Math.min(m.rl, 100)}%`, background: stc(m.st) }} />
                                {m.pl != null && (
                                  <u style={{ left: `${Math.min(m.pl, 100)}%` }} />
                                )}
                              </div>
                            ) : (
                              <span className="src">{m.rt}</span>
                            )}
                          </td>
                          <td style={{ color: m.dv != null && m.dv < -20 ? 'var(--bad)' : 'inherit' }}>
                            {m.dv == null ? '-' : m.dv === 0 ? '0' : `${f1(m.dv)}%`}
                          </td>
                          <td>
                            <span
                              className="tag"
                              style={{
                                background: stc(m.st),
                                color: stText(m.st)
                              }}
                            >
                              {m.st}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn-detail"
                              onClick={() => openDetailModal(i)}
                              aria-label={`Lihat detail ${m.n}`}
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="src">Klik tombol <b>Detail</b> pada baris project untuk membuka Project identity dan Status update. Garis hitam = plan.</p>
              </div>
            </section>
          )}

          {/* TAB 4: KURVA S */}
          {activeTab === 't4' && (
            <section id="t4">
              <div className="panel">
                <h2>Kurva S Agregat &amp; Individual</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <label htmlFor="ksel" className="src" style={{ margin: 0 }}>
                    Tampilkan:{' '}
                  </label>
                  <select
                    id="ksel"
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
                </div>

                <div id="kinfo">
                  {(() => {
                    const isPort = kSel === 'p';
                    const idx = isPort ? 0 : Number(kSel);
                    const tag = isPort ? 'S10' : `S${Number(kSel) + 1}`;
                    const d = isPort ? K.port : K.proj[idx];
                    const p = d.p[31] ?? 0;
                    const r = d.r[31] ?? 0;
                    const deviasi = Number((r - p).toFixed(1));
                    const totalNilai = K.nil.reduce((a, b) => a + b, 0);
                    const nilai = isPort ? totalNilai : K.nil[idx];
                    const bobot = isPort ? 100.0 : K.bob[idx];

                    return (
                      <>
                        <div className="kinfo-card">
                          <div className="kinfo-head">
                            <span className="kinfo-title">Bobot Proyek</span>
                            <span className="kinfo-pill">{tag}</span>
                          </div>
                          <div className="kinfo-val">{f1(bobot)}%</div>
                          <div className="kinfo-desc">dari total Kurva S</div>
                        </div>

                        <div className="kinfo-card">
                          <div className="kinfo-head">
                            <span className="kinfo-title">Nilai Pekerjaan</span>
                            <span className="kinfo-pill">{tag}</span>
                          </div>
                          <div className="kinfo-val">Rp{f1(nilai)} M</div>
                        </div>

                        <div className="kinfo-card">
                          <div className="kinfo-head">
                            <span className="kinfo-title">Realisasi</span>
                            <span className="kinfo-pill">{tag}</span>
                          </div>
                          <div className="kinfo-val">{f1(r)}%</div>
                          <div className="kinfo-desc">rencana {f1(p)}%</div>
                        </div>

                        <div className="kinfo-card">
                          <div className="kinfo-head">
                            <span className="kinfo-title">Deviasi</span>
                            <span className="kinfo-pill">{tag}</span>
                          </div>
                          <div className="kinfo-val">
                            {deviasi > 0 ? `+${f1(deviasi)}` : f1(deviasi)} pp
                          </div>
                          <div
                            className="kinfo-desc"
                            style={{
                              color: deviasi < -3 ? '#ef4444' : deviasi < 0 ? '#f59e0b' : '#22c55e',
                              fontWeight: 600
                            }}
                          >
                            per Agu 2026
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
                <h2>Cek sinkron: progres Master vs kurva S</h2>
                <div className="scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Realisasi Master</th>
                        <th>Realisasi kurva S</th>
                        <th>Selisih (poin)</th>
                      </tr>
                    </thead>
                    <tbody id="kcmp">
                      {Object.entries(MAP).map(([a, k]) => {
                        const idxA = Number(a);
                        const idxK = Number(k);
                        const m = P[idxA]?.rl ?? 0;
                        const c = K.proj[idxK].r[31] ?? 0;
                        const diff = Number((c - m).toFixed(1));

                        return (
                          <tr key={a}>
                            <td>{P[idxA]?.n}</td>
                            <td>{f1(m)}%</td>
                            <td>{f1(c)}%</td>
                            <td style={{ color: Math.abs(diff) > 3 ? 'var(--bad)' : 'inherit', fontWeight: '700' }}>
                              {f1(diff)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="src">
                  Selisih lebih dari 3 poin ditandai merah. Perlu dikonfirmasi: sumber mana yang dipakai, atau apakah cut-off tanggalnya berbeda.
                </p>
              </div>
            </section>
          )}

          {/* TAB 3: KELENGKAPAN DOKUMEN */}
          {activeTab === 't3' && (
            <section id="t3">
              <div className="filters">
                <select
                  id="dsS"
                  aria-label="Sumber"
                  value={dsS}
                  onChange={e => setDsS(e.target.value)}
                >
                  <option value="G">Kontrak on going</option>
                  <option value="C">Kontrak selesai (close)</option>
                  <option value="">Semua kontrak</option>
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
                  <option value="">User + vendor</option>
                  <option value="U">User</option>
                  <option value="V">Vendor</option>
                </select>
                <select
                  id="dsB"
                  aria-label="Tingkat nilai"
                  value={dsB}
                  onChange={e => setDsB(e.target.value)}
                >
                  <option value="">Semua nilai</option>
                  {BK.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="kp" id="dk">
                <div className="kk">
                  <span>Total kontrak (user + vendor)</span>
                  <b>{docStats.total}</b>
                </div>
                <div className="kk">
                  <span>Rata-rata kelengkapan dokumen</span>
                  <b>{docStats.completeness}%</b>
                </div>
                <div className="kk">
                  <span>Dokumen belum ada / hilang</span>
                  <b style={{ color: docStats.missing > 0 ? 'var(--bad)' : 'inherit' }}>{docStats.missing}</b>
                </div>
                <div className="kk">
                  <span>Kontrak progres &lt; 100%</span>
                  <b>{docStats.under100}</b>
                </div>
              </div>

              <div className="g2h">
                <div className="panel">
                  <h2>Heatmap kelengkapan dokumen (kontrak × 20 dokumen)</h2>
                  <div className="hm" id="hm">
                    <div className="hrow hmh">
                      <span />
                      {DN.map(d => (
                        <span key={d} className="vh">
                          {d}
                        </span>
                      ))}
                      <span />
                    </div>
                    {docFiltered.map((c, i) => {
                      const arr = Array.from(c.d);
                      const aCount = arr.filter(x => x === 'A').length;
                      const bCount = arr.filter(x => 'KHP'.includes(x)).length;
                      const pct = aCount + bCount ? Math.round((aCount / (aCount + bCount)) * 100) : null;

                      return (
                        <div className="hrow" key={i}>
                          <span className="n" title={`${c.n} | PIC ${c.pic} | ${c.w}`}>
                            <em>{c.j === 'V' ? 'V' : 'U'}</em>
                            {c.n}
                          </span>
                          {arr.map((x, j) => (
                            <i
                              key={j}
                              className={`c ${CL[x] || ''}`}
                              title={DN[j]}
                            />
                          ))}
                          <b>{pct !== null ? `${pct}%` : '-'}</b>
                        </div>
                      );
                    })}
                  </div>

                  <div className="legend" style={{ marginTop: '10px' }}>
                    <span>
                      <i className="dot" style={{ background: 'var(--ok)' }} />
                      Ada
                    </span>
                    <span>
                      <i className="dot" style={{ background: 'var(--line)' }} />
                      Tidak diperlukan
                    </span>
                    <span>
                      <i className="dot" style={{ background: 'var(--bad)' }} />
                      Belum ada / hilang
                    </span>
                    <span>
                      <i className="dot" style={{ background: 'var(--risk)' }} />
                      Proses / pekerjaan berjalan
                    </span>
                    <span>
                      <i className="dot" style={{ background: 'var(--accent)' }} />
                      Divisi lain
                    </span>
                  </div>
                  <p className="src" id="hmn">
                    {docFiltered.length} kontrak. Kelengkapan = ada ÷ (ada + belum ada + hilang + proses). V = vendor, U = user. Arahkan kursor ke sel atau nama untuk detail.
                  </p>
                </div>

                <div className="panel">
                  <h2>Beban per PIC (jumlah kontrak)</h2>
                  <div id="dpic">
                    <PicHorizontalBarChart data={picStats} />
                  </div>
                </div>
              </div>

              <div className="g2x">
                <div className="panel">
                  <h2>Sebaran tingkat nilai kontrak</h2>
                  <div id="dnil">
                    {renderHorizontalBars(bucketStats, v => v)}
                  </div>
                </div>

                <div className="panel">
                  <h2>Kontrak berjalan: tanggal mulai sampai selesai</h2>
                  <div className="hm" id="dtl" style={{ maxHeight: '300px' }}>
                    {timelineRange &&
                      timelineContracts.map((c, idx) => {
                        const l = ((new Date(c.a!).getTime() - timelineRange.t0) / timelineRange.sp) * 100;
                        const w = Math.max(
                          ((new Date(c.e!).getTime() - new Date(c.a!).getTime()) / timelineRange.sp) * 100,
                          1
                        );
                        return (
                          <div className="tl" key={idx}>
                            <span className="hl" title={c.n}>
                              {c.n}
                            </span>
                            <div className="tt">
                              <i
                                style={{
                                  left: `${l}%`,
                                  width: `${w}%`,
                                  background: c.p >= 100 ? 'var(--ok)' : 'var(--accent)'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <p className="src" id="dtn">
                    {timelineRange
                      ? `${timelineRange.label}. Hijau = progres 100%. Hanya kontrak dengan tanggal mulai dan selesai terisi (${timelineContracts.length} dari ${docFiltered.length}, maksimal 60 ditampilkan).`
                      : 'Belum ada kontrak dengan tanggal mulai dan selesai terisi untuk filter ini.'}
                  </p>
                </div>
              </div>
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
                if (e.target === e.currentTarget) closeDetailModal();
              }}
            >
              <div className="ovb">
                <div className="ovh">
                  <h2 id="ovt">
                    {projects[selectedIdx].no}. {projects[selectedIdx].n}
                  </h2>
                  <button id="ovx" className="rs" aria-label="Tutup detail" onClick={closeDetailModal}>
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
                    <span className="modal-kpi-sub">Kondisi Terkini</span>
                  </div>
                </div>

                <div className="g2x">
                  <div className="panel">
                    <h2>Project identity</h2>
                    <div id="pid">
                      <div className="kv">
                        <b>Nama project</b>
                        <span>{projects[selectedIdx].n}</span>
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
                        <b>Akhir kontrak</b>
                        <span>{projects[selectedIdx].ak}</span>
                      </div>
                      {projects[selectedIdx].akt !== projects[selectedIdx].ak && (
                        <div className="kv">
                          <b>Akhir kontrak terkini</b>
                          <span>{projects[selectedIdx].akt}</span>
                        </div>
                      )}
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
                              setEditLs(projects[selectedIdx].ls);
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
                            <label>Situasi Proyek</label>
                            <textarea
                              rows={3}
                              value={editSit}
                              onChange={e => setEditSit(e.target.value)}
                              placeholder="Masukkan situasi dan perkembangan proyek terkini..."
                              required
                            />
                          </div>

                          <div className="status-form-group">
                            <label>Mitigasi Hambatan / Risiko</label>
                            <textarea
                              rows={2}
                              value={editMit}
                              onChange={e => setEditMit(e.target.value)}
                              placeholder="Langkah penanganan atau mitigasi..."
                              required
                            />
                          </div>

                          <div className="status-form-group">
                            <label>Learning Stop</label>
                            <textarea
                              rows={2}
                              value={editLs}
                              onChange={e => setEditLs(e.target.value)}
                              placeholder="Catatan evaluasi atau learning stop..."
                              required
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
                              <span>Simpan Status Update</span>
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
                              projects[selectedIdx].st === entry.st &&
                              projects[selectedIdx].sit === entry.sit &&
                              projects[selectedIdx].mit === entry.mit;

                            return (
                              <div
                                key={entry.id}
                                className={`status-history-card ${isCurrentActive ? 'is-active-entry' : ''}`}
                              >
                                <div className="status-history-top">
                                  <div className="status-history-meta">
                                    <span
                                      className="tag"
                                      style={{
                                        background: stc(entry.st),
                                        color: stText(entry.st),
                                        fontSize: '11px',
                                        padding: '2px 8px'
                                      }}
                                    >
                                      {entry.st}
                                    </span>
                                    <span className="status-history-time">
                                      <Clock size={11} />
                                      {entry.timestamp}
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
                                  <b>Situasi Proyek:</b>
                                  <span>{entry.sit}</span>
                                </div>
                                <div className="status-history-detail">
                                  <b>Mitigasi:</b>
                                  <span>{entry.mit}</span>
                                </div>
                                <div className="status-history-detail">
                                  <b>Learning Stop:</b>
                                  <span>{entry.ls}</span>
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
                                  {currentHistory.length > 1 && (
                                    <button
                                      type="button"
                                      className="btn-history-delete"
                                      onClick={() => handleDeleteHistory(entry.id)}
                                      title="Hapus catatan ini dari riwayat"
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div className="status-badge-timestamp" style={{ margin: 0 }}>
                              <Clock size={12} />
                              <span>
                                {projectUpdates[projects[selectedIdx].no]?.lastUpdated
                                  ? `Update terakhir: ${projectUpdates[projects[selectedIdx].no]?.lastUpdated}`
                                  : 'Update terkini (Data Master)'}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="btn-update-tab"
                              onClick={() => {
                                setEditSt(projects[selectedIdx].st);
                                setEditSit(projects[selectedIdx].sit);
                                setEditMit(projects[selectedIdx].mit);
                                setEditLs(projects[selectedIdx].ls);
                                setEditNote('');
                                setStatusViewMode('edit');
                              }}
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                            >
                              <Edit3 size={11} />
                              <span>Ubah Status</span>
                            </button>
                          </div>

                          <h3>Situasi proyek</h3>
                          <p>{projects[selectedIdx].sit}</p>
                          <h3>Mitigasi</h3>
                          <p>{projects[selectedIdx].mit}</p>
                          <h3>Learning stop</h3>
                          <p>{projects[selectedIdx].ls}</p>
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
        </main>
      </div>
    </div>
  );
}
