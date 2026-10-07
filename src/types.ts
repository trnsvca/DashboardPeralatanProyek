export type ProjectStatus = 'ON TRACK' | 'AT RISK' | 'DELAYED' | 'SELESAI' | 'ACTIVE' | 'LELANG';

export interface ProjectItem {
  n: number; // No
  nm: string; // Nama Project
  wbs?: string; // Nomor WBS
  v: number; // Nilai Pekerjaan (numeric in IDR)
  ow: string; // Pemilik Pekerjaan (full raw name)
  g: string; // Kelompok / Group Pemilik
  kelompok_status?: string; // Kelompok (ON GOING, SUDAH SELESAI FISIK, etc.)
  bm: string; // BAMK
  ak: string; // Akhir Kontrak & Keterangan
  ak_terkini?: string; // Akhir Kontrak Terkini
  pl: number | null; // Rencana (0 to 1, or null)
  rl: number | null; // Realisasi (0 to 1, or null)
  dv: number | null; // Deviasi (-1 to 1, or null)
  st: string; // Raw status from spreadsheet
  s: ProjectStatus; // Normalized status category
  si: string; // Situasi Proyek
  mi: string; // Mitigasi
  ls: string; // Learning stop
  keterangan?: string; // Keterangan tambahan
}

export interface MasterProjectCurve {
  id: number;
  name: string;
  weight: number; // Bobot % (e.g. 31.6)
  valueM: number; // Nilai Milyar Rp (e.g. 146.7)
  plan: number[]; // Rencana kumulatif per bulan (33 points)
  real: number[]; // Realisasi kumulatif per bulan
}

export interface AggregateCurveData {
  P: number[]; // Rencana
  R: number[]; // Realisasi
  D: number[]; // Deviasi
}

export type TabId = 'r' | 'k' | 'p' | 'd' | 'q' | 'i' | 's';

export type AppTheme = 'web' | 'looker';

export interface FilterState {
  status: string;
  ownerGroup: string;
  search: string;
}

export type DocumentStatus = 'ADA' | 'PROSES' | 'BELUM' | 'TIDAK_DIPERLUKAN';

export interface ContractDocumentRow {
  id: number;
  contractName: string;
  vendorOrUser: string;
  pic: string;
  value: number; // in IDR
  startDate: string;
  endDate: string;
  progress: number;
  docs: Record<string, DocumentStatus>;
  notes: string;
}
