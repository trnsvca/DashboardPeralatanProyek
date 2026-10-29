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

// Penomoran minggu mengikuti sheet 'Kode Mingguan':
// Senin-Minggu, W01 = 1 Jan s/d Minggu pertama (bisa parsial),
// minggu yang melewati pergantian tahun dipecah, nomor reset tiap tahun.
export function generateAllWeeks(startYear = 2023, endYear = 2030): Record<string, PeriodWeek[]> {
  const weeksByMonth: Record<string, PeriodWeek[]> = {};
  const pad = (n: number) => String(n).padStart(2, '0');
  const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  for (let y = startYear; y <= endYear; y++) {
    const lastDay = new Date(y, 11, 31);
    let start = new Date(y, 0, 1);
    let weekNum = 1;

    while (start <= lastDay) {
      const toSunday = (7 - start.getDay()) % 7;
      let end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + toSunday);
      if (end > lastDay) end = lastDay;

      const m = start.getMonth();
      const monthKey = `${y}-${pad(m + 1)}`;
      const sameMonth = start.getMonth() === end.getMonth();
      const startName = MONTH_SHORT_ID[start.getMonth()];
      const endName = MONTH_SHORT_ID[end.getMonth()];
      const shortLabel =
        start.getDate() === end.getDate() && sameMonth
          ? `(${start.getDate()} ${startName})`
          : sameMonth
          ? `(${start.getDate()} - ${end.getDate()} ${startName})`
          : `(${start.getDate()} ${startName} - ${end.getDate()} ${endName})`;

      if (!weeksByMonth[monthKey]) weeksByMonth[monthKey] = [];
      weeksByMonth[monthKey].push({
        weekNum,
        year: y,
        monthIdx: m,
        startDay: start.getDate(),
        endDay: end.getDate(),
        startDateStr: ymd(start),
        endDateStr: ymd(end),
        shortLabel,
        label: `W-${pad(weekNum)} ${shortLabel} ${y}`
      });

      weekNum++;
      start = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
    }
  }
  return weeksByMonth;
}

export const ALL_WEEKS_BY_MONTH = generateAllWeeks(2023, 2030);