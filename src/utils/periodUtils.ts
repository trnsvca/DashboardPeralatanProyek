export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export interface PeriodWeek {
  weekNum: number;
  year: number;
  monthIdx: number; // 0-11
  startDay: number;
  endDay: number;
  startDateStr: string; // YYYY-MM-DD
  endDateStr: string;   // YYYY-MM-DD
  shortLabel: string;   // e.g. "(1 - 4 Okt)"
  label: string;        // e.g. "W-90 (1 - 4 Okt 2026)"
}

// Generate weeks grouped by "YYYY-MM"
// Start year is 2023 as requested by the user
export function generateAllWeeks(startYear = 2023, endYear = 2027): Record<string, PeriodWeek[]> {
  const weeksByMonth: Record<string, PeriodWeek[]> = {};

  for (let y = startYear; y <= endYear; y++) {
    let yearWeek = 1;
    for (let m = 0; m < 12; m++) {
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      weeksByMonth[key] = [];
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      let startDay = 1;

      while (startDay <= daysInMonth) {
        const d = new Date(y, m, startDay);
        const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday...
        // Cut-off Sunday (Hari Minggu) sesuai kalender nasional
        const daysToSunday = dayOfWeek === 0 ? 0 : (7 - dayOfWeek);
        const endDay = Math.min(daysInMonth, startDay + daysToSunday);

        const startDateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
        const endDateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
        const shortLabel = `(${startDay} - ${endDay} ${MONTH_SHORT_ID[m]})`;
        const label = `W-${yearWeek} (${startDay} - ${endDay} ${MONTH_SHORT_ID[m]} ${y})`;

        weeksByMonth[key].push({
          weekNum: yearWeek,
          year: y,
          monthIdx: m,
          startDay,
          endDay,
          startDateStr,
          endDateStr,
          shortLabel,
          label
        });

        yearWeek++;
        startDay = endDay + 1;
      }
    }
  }

  return weeksByMonth;
}

export const ALL_WEEKS_BY_MONTH = generateAllWeeks(2023, 2027);
