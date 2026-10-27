import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, ChevronDown, X, Check } from 'lucide-react';
import {
  MONTH_NAMES_ID,
  PeriodWeek,
  ALL_WEEKS_BY_MONTH
} from '../utils/periodUtils';
import { M, C } from '../data/bimaData';

const START_YEAR = 2023;

interface PeriodFilterProps {
  startInput: string;
  endInput: string;
  onSelectPeriod: (start: string, end: string, label: string) => void;
  onClearPeriod: () => void;
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({
  startInput,
  endInput,
  onSelectPeriod,
  onClearPeriod
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tahun: 2023 sampai tahun berjalan (kalender sistem).
  // Tahun setelahnya hanya muncul kalau ada tanggal project/kontrak di tahun itu.
  const yearOptions = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const dataYears: number[] = [];
    const pick = (d?: string | null) => {
      const y = d ? parseInt(d.substring(0, 4), 10) : NaN;
      if (!Number.isNaN(y) && y >= START_YEAR && y <= thisYear + 5) dataYears.push(y);
    };
    M.forEach(m => pick(m.akd));
    C.forEach(c => {
      pick(c.a);
      pick(c.e);
    });
    const lastYear = Math.max(thisYear, ...dataYears);
    return Array.from({ length: lastYear - START_YEAR + 1 }, (_, i) => START_YEAR + i);
  }, []);

  // Kosong dulu sampai user memilih (atau ikut filter yang sedang aktif)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(() => {
    if (endInput && endInput.length >= 7) {
      return parseInt(endInput.substring(5, 7), 10) - 1;
    }
    return null;
  });

  const [selectedYear, setSelectedYear] = useState<number | null>(() => {
    if (endInput && endInput.length >= 4) {
      const y = parseInt(endInput.substring(0, 4), 10);
      if (y >= START_YEAR) return y;
    }
    return null;
  });

  // Sync state if external date inputs change
  useEffect(() => {
    if (endInput && endInput.length >= 10) {
      const y = parseInt(endInput.substring(0, 4), 10);
      const m = parseInt(endInput.substring(5, 7), 10) - 1;
      if (y >= START_YEAR) {
        setSelectedYear(y);
        setSelectedMonth(m);
      }
    }
  }, [endInput]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const hasPicked = selectedMonth !== null && selectedYear !== null;
  const monthKey = hasPicked
    ? `${selectedYear}-${String((selectedMonth as number) + 1).padStart(2, '0')}`
    : '';
  const currentWeeks: PeriodWeek[] = ALL_WEEKS_BY_MONTH[monthKey] || [];

  // Check if active week is from another month
  const anyActiveWeek = (() => {
    if (!startInput || !endInput) return null;
    for (const key in ALL_WEEKS_BY_MONTH) {
      const found = ALL_WEEKS_BY_MONTH[key].find(
        w => w.startDateStr === startInput && w.endDateStr === endInput
      );
      if (found) return found;
    }
    return null;
  })();

  const isFullMonthSelected = (() => {
    if (!startInput || !endInput) return false;
    const startM = startInput.substring(0, 7);
    const endM = endInput.substring(0, 7);
    if (startM === endM && startInput.endsWith('-01')) {
      const y = parseInt(startInput.substring(0, 4), 10);
      const m = parseInt(startInput.substring(5, 7), 10);
      const lastDay = new Date(y, m, 0).getDate();
      return endInput === `${startM}-${String(lastDay).padStart(2, '0')}`;
    }
    return false;
  })();

  const triggerLabel = anyActiveWeek
    ? `${anyActiveWeek.label.split(' ')[0]} ${anyActiveWeek.shortLabel}`
    : isFullMonthSelected
    ? `${MONTH_NAMES_ID[parseInt(startInput.substring(5, 7), 10) - 1]} ${startInput.substring(0, 4)}`
    : startInput && endInput
    ? `${startInput} s/d ${endInput}`
    : 'Periode';

  const hasFilter = Boolean(startInput || endInput);

  const handleWeekSelect = (w: PeriodWeek) => {
    onSelectPeriod(w.startDateStr, w.endDateStr, w.label);
    setIsOpen(false);
  };

  const handleSelectFullMonth = () => {
    if (selectedMonth === null || selectedYear === null) return;
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const start = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    const end = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    const label = `${MONTH_NAMES_ID[selectedMonth]} ${selectedYear}`;
    onSelectPeriod(start, end, label);
    setIsOpen(false);
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedMonth(null);
    setSelectedYear(null);
    onClearPeriod();
  };

  return (
    <div className="period-filter-root" ref={containerRef}>
      {/* Trigger Button */}
      <div className="period-trigger-container">
        <button
          type="button"
          className={`period-trigger-btn ${hasFilter ? 'has-filter' : ''} ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(prev => !prev)}
          aria-expanded={isOpen}
          aria-label="Pilih Periode"
        >
          <Calendar size={14} className="period-trigger-icon" />
          <span className="period-trigger-label">{triggerLabel}</span>
          <ChevronDown size={14} className={`period-trigger-chevron ${isOpen ? 'rotate' : ''}`} />
        </button>

        {hasFilter && (
          <button
            type="button"
            className="period-trigger-clear-btn"
            onClick={handleClear}
            title="Reset filter periode"
            aria-label="Reset filter periode"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Popover Card */}
      {isOpen && (
        <div className="period-popover-dropdown">
          {/* Baris Selector Bulan & Tahun */}
          <div className="period-controls-row">
            <div className="period-select-box">
              <label htmlFor="period-month-select">Bulan</label>
              <div className="period-select-wrap">
                <select
                  id="period-month-select"
                  value={selectedMonth ?? ''}
                  className={selectedMonth === null ? 'is-placeholder' : ''}
                  onChange={e => setSelectedMonth(e.target.value === '' ? null : Number(e.target.value))}
                >
                  <option value="" disabled hidden>Pilih bulan</option>
                  {MONTH_NAMES_ID.map((name, idx) => (
                    <option key={idx} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="period-select-arrow" />
              </div>
            </div>

            <div className="period-select-box">
              <label htmlFor="period-year-select">Tahun</label>
              <div className="period-select-wrap">
                <select
                  id="period-year-select"
                  value={selectedYear ?? ''}
                  className={selectedYear === null ? 'is-placeholder' : ''}
                  onChange={e => setSelectedYear(e.target.value === '' ? null : Number(e.target.value))}
                >
                  <option value="" disabled hidden>Pilih tahun</option>
                  {yearOptions.map(yr => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="period-select-arrow" />
              </div>
            </div>
          </div>

          {/* Banner Bulan & Tahun Terpilih (muncul setelah dipilih) */}
          {hasPicked && (
            <div className="period-month-banner">
              <span>
                {MONTH_NAMES_ID[selectedMonth as number]} {selectedYear}
              </span>
            </div>
          )}

          {/* Grid Kartu Minggu */}
          {hasPicked && (
            <div className="period-weeks-grid">
              {currentWeeks.map(w => {
                const isSelected =
                  startInput === w.startDateStr && endInput === w.endDateStr;
                return (
                  <button
                    key={w.weekNum}
                    type="button"
                    className={`period-week-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleWeekSelect(w)}
                  >
                    <div className="week-card-header">
                      <span className="week-card-title">W - {w.weekNum}</span>
                      {isSelected && <Check size={14} className="week-card-check" />}
                    </div>
                    <span className="week-card-dates">{w.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tombol Aksi Tambahan */}
          <div className="period-popover-actions">
            <button
              type="button"
              className="period-action-link"
              onClick={handleSelectFullMonth}
              disabled={!hasPicked}
            >
              Pilih 1 Bulan Penuh
            </button>
            {hasFilter && (
              <button
                type="button"
                className="period-action-link danger"
                onClick={handleClear}
              >
                Reset Filter
              </button>
            )}
            <button
              type="button"
              className="period-action-close-btn"
              onClick={() => setIsOpen(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};