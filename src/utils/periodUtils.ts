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
  shortLabel: string;   // e.g. "(26 Jan - 1 Feb)"
  label: string;        // e.g. "W-5 (26 Jan - 1 Feb 2026)"
}

// Generate continuous Monday-to-Sunday weeks grouped by the month of Monday, restarting weekNum to 1 every year
export function generateAllWeeks(startYear = 2023, endYear = 2027): Record<string, PeriodWeek[]> {
  const weeksByMonth: Record<string, PeriodWeek[]> = {};

  let curr = new Date(startYear, 0, 1);
  const day = curr.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  curr.setDate(curr.getDate() + diffToMonday);

  let currentYear = curr.getFullYear();
  let weekNum = 1;
  const endDateLimit = new Date(endYear, 11, 31);

  while (curr <= endDateLimit) {
    const monday = new Date(curr);
    const sunday = new Date(curr);
    sunday.setDate(monday.getDate() + 6);

    const y = monday.getFullYear();
    const m = monday.getMonth(); // 0-11

    if (y !== currentYear) {
      currentYear = y;
      weekNum = 1;
    }

    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;

    if (!weeksByMonth[monthKey]) {
      weeksByMonth[monthKey] = [];
    }

    const startDay = monday.getDate();
    const endDay = sunday.getDate();
    const startMonthName = MONTH_SHORT_ID[monday.getMonth()];
    const endMonthName = MONTH_SHORT_ID[sunday.getMonth()];

    const startDateStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    const endDateStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;

    const sameMonth = monday.getMonth() === sunday.getMonth();
    const shortLabel = sameMonth
      ? `(${startDay} - ${endDay} ${startMonthName})`
      : `(${startDay} ${startMonthName} - ${endDay} ${endMonthName})`;
    
    const label = `W-${weekNum} ${shortLabel} ${y}`;

    weeksByMonth[monthKey].push({
      weekNum,
      year: y,
      monthIdx: m,
      startDay,
      endDay,
      startDateStr,
      endDateStr,
      shortLabel,
      label
    });

    weekNum++;
    curr.setDate(curr.getDate() + 7);
  }

  return weeksByMonth;
}

export const ALL_WEEKS_BY_MONTH = generateAllWeeks(2023, 2027);