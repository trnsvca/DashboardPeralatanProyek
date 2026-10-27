import csv
import json
import re
import os

def clean_rupiah(s):
    if not s: return 0.0, "Rp 0"
    cleaned = re.sub(r'[^0-9,.]', '', s)
    if '.' in cleaned and ',' in cleaned:
        cleaned = cleaned.replace('.', '').replace(',', '.')
    elif '.' in cleaned:
        parts = cleaned.split('.')
        if len(parts) > 2 or len(parts[-1]) == 3:
            cleaned = ''.join(parts)
        else:
            cleaned = '.'.join(parts)
    elif ',' in cleaned:
        cleaned = cleaned.replace(',', '.')
    try:
        val = float(cleaned)
        m_val = round(val / 1e9, 1)
        # formatted rupiah text
        formatted = f"Rp {int(val):,}".replace(',', '.')
        return m_val, formatted
    except:
        return 0.0, s

def parse_pct(s):
    if not s or s.strip() in ['-', '—', '']: return None, '-'
    cleaned = s.strip().replace('%', '').replace(',', '.')
    try:
        val = float(cleaned)
        return val, s.strip()
    except:
        return None, s.strip()

def parse_akd(val):
    if not val or val.strip() in ['-', '—', '']: return None
    val = val.strip()
    m = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4})$', val)
    if m:
        mo, da, yr = m.groups()
        return f'{yr}-{mo.zfill(2)}-{da.zfill(2)}'
    return None

def parse_doc(v):
    v = v.strip().upper()
    if 'ADA' in v and 'TIDAK' not in v: return 'A'
    if 'TIDAK' in v: return 'T'
    if 'PROSES' in v: return 'P'
    if 'DIVISI' in v: return 'D'
    return 'K'

def parse_val_juta(v):
    if not v: return 0.0
    c = re.sub(r'[^0-9,.]', '', v)
    if '.' in c and ',' in c:
        c = c.replace('.', '').replace(',', '.')
    elif '.' in c:
        parts = c.split('.')
        if len(parts) > 2 or len(parts[-1]) == 3: c = ''.join(parts)
        else: c = '.'.join(parts)
    elif ',' in c:
        c = c.replace(',', '.')
    try:
        val = float(c)
        return round(val / 1e6, 1)
    except:
        return 0.0

def parse_prog(v):
    if not v: return 0
    c = re.sub(r'[^0-9,.]', '', v).replace(',', '.')
    try: return int(round(float(c)))
    except: return 0

def parse_date(v):
    if not v or v.strip() in ['-', '—', '']: return None
    v = v.strip()
    parts = re.split(r'[-/]', v)
    if len(parts) == 3:
        p0, p1, p2 = parts
        if len(p0) == 4:
            return f'{p0}-{p1.zfill(2)}-{p2.zfill(2)}'
        elif len(p2) == 4:
            return f'{p2}-{p1.zfill(2)}-{p0.zfill(2)}'
        elif len(p2) == 2:
            yr = int(p2)
            full_yr = 2000 + yr if yr < 50 else 1900 + yr
            return f'{full_yr}-{p1.zfill(2)}-{p0.zfill(2)}'
    return None

# Load PROJECT_PIC_MAP
with open('src/data/bimaData.ts') as f:
    ts_text = f.read()

pic_map = {
    1: 'Faruq', 2: 'Sarah', 3: 'Yustaim', 4: 'Widya', 5: 'Widya',
    6: 'Muhaimin', 7: 'Sindy', 8: 'Faruq', 9: 'Tommy', 10: 'Tommy',
    11: 'Widya', 12: 'Aziz', 13: 'Sindy', 14: 'Sindy', 15: 'Sarah',
    16: 'Muhaimin', 17: 'Muhaimin', 18: 'Ardi', 19: 'Sindy', 20: 'Widya',
    21: 'Sindy', 22: 'Ardi', 23: 'Eltria', 24: 'Faruq', 25: 'Widya',
    26: 'Kiki Dea', 27: 'Ardi', 28: 'Muhaimin', 29: 'Tommy', 30: 'Tommy',
    31: 'Saiful'
}

# 1. Process Master.csv -> RAW_M
raw_m = []
with open('scripts/sheets_data/Master.csv') as f:
    r = list(csv.reader(f))[1:]
    for row in r:
        if not row or not row[0]: continue
        no = int(row[0])
        wbs = row[1].strip()
        n = row[2].strip()
        kel_raw = row[4].strip().upper()
        if 'ON GOING' in kel_raw:
            g = 'ON GOING'
        elif 'SELESAI' in kel_raw:
            g = 'SELESAI'
        elif 'PO' in kel_raw or 'SP3' in kel_raw:
            g = 'PO'
        elif 'LELANG' in kel_raw or 'AANWIJZING' in kel_raw:
            g = 'LELANG'
        else:
            g = 'ON GOING'
        
        nv, nt = clean_rupiah(row[5])
        pem = row[6].strip()
        bamk = row[7].strip()
        ak = row[8].strip()
        ket = row[9].strip()
        akt = row[10].strip()
        pl, pt = parse_pct(row[11])
        rl, rt = parse_pct(row[12])
        dv, _ = parse_pct(row[13])
        st_ppt = row[14].strip()
        sit = row[16].strip()
        mit = row[17].strip()
        ls = row[18].strip()
        akd = parse_akd(akt)
        pic = pic_map.get(no, 'Muhaimin')

        raw_m.append({
            "no": no,
            "n": n,
            "g": g,
            "nv": nv,
            "nt": nt,
            "pem": pem,
            "bamk": bamk,
            "ak": ak,
            "akt": akt,
            "ket": ket,
            "pl": pl,
            "pt": pt,
            "rl": rl,
            "rt": rt,
            "dv": dv,
            "st": st_ppt,
            "sit": sit,
            "mit": mit,
            "ls": ls,
            "akd": akd,
            "pic": pic
        })

print(f'Parsed {len(raw_m)} RAW_M entries.')

# 2. Process Kurva_S_Komulatif.csv -> K.port and INITIAL_AGGREGATE
p_cum = []
r_cum = []
d_cum = []
with open('scripts/sheets_data/Kurva_S_Komulatif.csv') as f:
    for row in list(csv.reader(f))[1:]:
        if not row or not row[0]: continue
        def get_p(s):
            try: return float(s.strip().replace('%', '').replace(',', '.'))
            except: return 0.0
        p_val = get_p(row[5])
        r_val = get_p(row[7])
        d_val = get_p(row[8])
        p_cum.append(round(p_val, 2))
        r_cum.append(round(r_val, 2))
        d_cum.append(round(d_val, 2))

# Realisasi only for completed months (first 32)
r_cum_active = r_cum[:32]
d_cum_active = d_cum[:32]

# 3. Process Kurva_S_Bulanan.csv & Detail_Proyek_Kurva_S.csv -> K.proj & MASTER_PROJECTS_CURVE
details = {}
with open('scripts/sheets_data/Detail_Proyek_Kurva_S.csv') as f:
    for row in list(csv.reader(f))[1:]:
        if not row or not row[0]: continue
        pid = int(row[0])
        val_m, _ = clean_rupiah(row[2])
        w_val, _ = parse_pct(row[3])
        details[pid] = {
            'name': row[1].strip(),
            'val_m': val_m,
            'weight': w_val if w_val is not None else 0.0
        }

proj_monthly = {}
with open('scripts/sheets_data/Kurva_S_Bulanan.csv') as f:
    for row in list(csv.reader(f))[1:]:
        if not row or not row[0]: continue
        pid = int(row[0])
        if pid not in proj_monthly:
            proj_monthly[pid] = {'p': [], 'r': []}
        def get_p(s):
            try: return float(s.strip().replace('%', '').replace(',', '.'))
            except: return 0.0
        proj_monthly[pid]['p'].append(get_p(row[5]))
        proj_monthly[pid]['r'].append(get_p(row[6]))

k_proj = []
master_proj_curves = []
for pid in sorted(proj_monthly.keys()):
    p_data = proj_monthly[pid]
    # Cumulative plan
    p_cum_proj = []
    tot_p = 0
    for v in p_data['p']:
        tot_p += v
        p_cum_proj.append(round(tot_p, 1))
    
    # Cumulative real (first 32 months)
    r_cum_proj = []
    tot_r = 0
    for v in p_data['r'][:32]:
        tot_r += v
        r_cum_proj.append(round(tot_r, 1))

    k_proj.append({
        'p': p_cum_proj,
        'r': r_cum_proj
    })

    d_info = details.get(pid, {'name': f'Project {pid}', 'val_m': 0.0, 'weight': 0.0})
    master_proj_curves.append({
        'id': pid,
        'name': d_info['name'],
        'weight': d_info['weight'],
        'valueM': d_info['val_m'],
        'plan': p_cum_proj,
        'real': r_cum_proj
    })

# 4. Process Data_on_going.csv & Data_Close.csv -> C
contracts = []
# Ongoing
with open('scripts/sheets_data/Data_on_going.csv') as f:
    for row in list(csv.reader(f))[1:]:
        if not row or not row[0]: continue
        wbs = row[1].strip()
        t = row[2].strip().upper()
        j = 'U' if 'USER' in t else ('V' if 'VENDOR' in t else 'D')
        name = row[3].strip()
        pic = row[5].strip()
        bucket = row[6].strip()
        val = parse_val_juta(row[7])
        prog = parse_prog(row[8])
        docs = ''.join([parse_doc(row[9 + i]) for i in range(20)])
        start_d = parse_date(row[29])
        end_d = parse_date(row[30])
        contracts.append({
            's': 'G',
            'w': wbs,
            'j': j,
            'n': name,
            'pic': pic,
            'b': bucket,
            'v': val,
            'p': prog,
            'd': docs,
            'a': start_d,
            'e': end_d
        })

# Close (with TAMPIL == 'YA')
with open('scripts/sheets_data/Data_Close.csv') as f:
    for row in list(csv.reader(f))[1:]:
        if not row or not row[0]: continue
        tampil = row[32].strip().upper() if len(row) > 32 else ''
        if tampil != 'YA': continue
        wbs = row[1].strip()
        t = row[2].strip().upper()
        j = 'U' if 'USER' in t else ('V' if 'VENDOR' in t else 'D')
        name = row[3].strip()
        pic = row[5].strip()
        bucket = row[6].strip()
        val = parse_val_juta(row[7])
        prog = parse_prog(row[8])
        docs = ''.join([parse_doc(row[9 + i]) for i in range(20)])
        start_d = parse_date(row[29])
        end_d = parse_date(row[30])
        contracts.append({
            's': 'C',
            'w': wbs,
            'j': j,
            'n': name,
            'pic': pic,
            'b': bucket,
            'v': val,
            'p': prog,
            'd': docs,
            'a': start_d,
            'e': end_d
        })

print(f'Total contracts C: {len(contracts)} (G: {sum(1 for c in contracts if c["s"]=="G")}, C: {sum(1 for c in contracts if c["s"]=="C")})')

# Save updated bimaData.ts
# Read existing bimaData.ts up to `export const K:`
k_names = [details[pid]['name'] for pid in sorted(details.keys())]
k_nil = [details[pid]['val_m'] for pid in sorted(details.keys())]
k_bob = [details[pid]['weight'] for pid in sorted(details.keys())]

bima_content = f"""// Data Kurva S, Master 31 Project, dan Kelengkapan Dokumen Kontrak PT BIMA
import {{ normalizeStatus }} from '../utils/helpers';
import {{ ProjectStatus }} from '../types';

export interface KurvaData {{
  m: number;
  names: string[];
  nil: number[];
  bob: number[];
  port: {{
    p: (number | null)[];
    r: (number | null)[];
  }};
  proj: {{
    p: (number | null)[];
    r: (number | null)[];
  }}[];
}}

export interface MasterProject {{
  no: number;
  n: string;
  g: string; // ON GOING, SELESAI, PO, LELANG
  nv: number; // Nilai M
  nt: string; // Teks Rupiah
  pem: string; // Pemilik
  bamk: string;
  ak: string;
  akt: string;
  ket: string;
  pl: number | null;
  pt: string;
  rl: number | null;
  rt: string;
  dv: number | null;
  st: ProjectStatus | string;
  s?: ProjectStatus;
  sit: string;
  mit: string;
  ls: string;
  akd: string | null;
  pic: string;
}}

export const PROJECT_PIC_MAP: Record<number, string> = {json.dumps(pic_map, indent=2)};

export function getProjectPic(no: number): string {{
  return PROJECT_PIC_MAP[no] || 'Muhaimin';
}}

export interface ContractItem {{
  s: 'G' | 'C'; // G = on going, C = close/selesai
  w: string; // WBS
  j: 'U' | 'V' | 'D'; // U = user, V = vendor, D = divisi
  n: string; // Nama
  pic: string;
  b: string; // Bucket nilai: '0 - 2.5M' | '2.5M - 5M' | '5M - 10M' | '> 10M'
  v: number; // Nilai
  p: number; // Progres %
  d: string; // 20 chars: A=ada, T=td, K=kosong, H=kosong, P=proses, D=divisi
  a: string | null; // Tgl mulai YYYY-MM-DD
  e: string | null; // Tgl selesai YYYY-MM-DD
}}

export const K: KurvaData = {{
  m: {len(p_cum)},
  names: {json.dumps(k_names, indent=4)},
  nil: {json.dumps(k_nil)},
  bob: {json.dumps(k_bob)},
  port: {{
    p: {json.dumps(p_cum)},
    r: {json.dumps(r_cum_active)}
  }},
  proj: {json.dumps(k_proj, indent=4)}
}};

export const MAP: Record<number, number> = {{ 0: 3, 2: 8, 4: 9, 3: 7 }};

const RAW_M: MasterProject[] = {json.dumps(raw_m, indent=2)};

export const M: MasterProject[] = RAW_M.map(m => {{
  const norm = normalizeStatus(m.st);
  return {{
    ...m,
    st: norm,
    s: norm
  }};
}});

export const GK: [string, string, string][] = [
  ["ON GOING", "On going", "#10b981"],
  ["SELESAI", "Selesai fisik, urus administrasi", "#2563eb"],
  ["PO", "PO/SP3 terbit, proses di BIMA", "#eab308"],
  ["LELANG", "Lelang / aanwijzing", "#94a3b8"]
];

export const OW = [
  "TPK Semarang",
  "Pelindo Reg. IV",
  "Pelindo Multi Terminal",
  "Prima Terminal Petikemas",
  "Pelindo Multi Terminal",
  "TPK Pantoloan",
  "TPK Ternate",
  "TPK Banjarmasin",
  "TPK Surabaya",
  "TPK Surabaya",
  "Pelindo Multi Terminal",
  "TPK New Makassar",
  "Pelindo Terminal Petikemas",
  "TPK Ternate",
  "TPK Surabaya"
];

export const SC: Record<string, string> = {{
  "Ongoing": "#10b981",
  "At risk": "#ef4444",
  "Delayed": "#f97316",
  "Finished": "#2563eb",
  "Closed": "#475569"
}};

export const DN = [
  "RAP 2", "Justifikasi PL", "SPPP/SP3", "SPP/SP2", "PO",
  "RKS", "BA Aanwijzing", "BA Nego", "BAMK", "BA MOS",
  "BA Comtest", "BA Endurance", "BA Progress", "BASP", "BAST",
  "Lap. Mingguan", "Doc Lain", "BA ADD", "BA Pembayaran", "Invoice Vendor"
];

export const BK = ["0 - 2.5M", "2.5M - 5M", "5M - 10M", "> 10M"];

export const CL: Record<string, string> = {{
  A: "ada",
  T: "td",
  K: "kosong",
  H: "kosong",
  P: "proses",
  D: "divisi"
}};

// Data kelengkapan dokumen (Data on going + Data Close)
export const C: ContractItem[] = {json.dumps(contracts, indent=2)};
"""

with open('src/data/bimaData.ts', 'w') as f:
    f.write(bima_content)

print("Updated src/data/bimaData.ts successfully.")

# 5. Save updated initialData.ts
# RAW_INITIAL_PROJECTS from raw_m
raw_initial_projects = []
for p in raw_m:
    # Convert nv (Miliar) back to rupiah
    rupiah_val = int(round(p['nv'] * 1e9))
    norm_st = p['st']
    raw_initial_projects.append({
        "n": p['no'],
        "nm": p['n'],
        "v": rupiah_val,
        "ow": p['pem'],
        "g": "Pelindo TPK (semua cabang)",
        "kelompok_status": p['g'],
        "bm": p['bamk'],
        "ak": p['ak'],
        "ak_terkini": p['akt'],
        "pl": p['pl'] / 100.0 if p['pl'] is not None else None,
        "rl": p['rl'] / 100.0 if p['rl'] is not None else None,
        "dv": p['dv'] / 100.0 if p['dv'] is not None else None,
        "st": p['st'],
        "s": p['st'],
        "si": p['sit'],
        "mi": p['mit'],
        "ls": p['ls']
    })

initial_data_content = f"""import {{ ProjectItem, MasterProjectCurve, AggregateCurveData, ContractDocumentRow }} from '../types';
import {{ normalizeStatus }} from '../utils/helpers';

export const INITIAL_AGGREGATE: AggregateCurveData = {{
  P: {json.dumps(p_cum)},
  R: {json.dumps(r_cum_active)},
  D: {json.dumps(d_cum_active)}
}};

export const MASTER_PROJECTS_CURVE: MasterProjectCurve[] = {json.dumps(master_proj_curves, indent=2)};

const RAW_INITIAL_PROJECTS = {json.dumps(raw_initial_projects, indent=2)};

export const INITIAL_PROJECTS: ProjectItem[] = RAW_INITIAL_PROJECTS.map(p => {{
  const norm = normalizeStatus(p.st || (p as any).s);
  return {{
    ...p,
    st: norm,
    s: norm
  }};
}});

export const SOURCE_CATALOG: Record<string, string> = {{
  S1: "Daftar_31_Proyek_PPT: No, Nilai Pekerjaan",
  S2: "Kurva_S_Agregat: rencana/realisasi_kumulatif",
  S3: "Daftar_31_Proyek_PPT: Status, Nilai",
  S4: "Kurva_S_Agregat: tanggal, kumulatif",
  S5: "Kurva_S_Agregat: deviasi",
  S6: "Daftar_31_Proyek_PPT: Status, Nilai",
  S7: "Daftar_31_Proyek_PPT: Plan, Realisasi, Deviasi",
  S8: "Kurva_S_Agregat: kurva agregat dan individual",
  S9: "Data_Close_PPT & Data_Ongoing_PPT: WBS, Pekerjaan, PIC",
  S10: "Data_Close_PPT & Data_Ongoing_PPT: 20 Dokumen Kontrak",
  S11: "Data_Close_PPT & Data_Ongoing_PPT: Dokumen, Tanggal Mulai/Selesai",
  S12: "Data_Close_PPT & Data_Ongoing_PPT: Nilai Pekerjaan, Kategori Kontrak",
  S13: "Daftar_31_Proyek_PPT: Filter Status, Pemilik, Range Tanggal",
  S14: "Daftar_31_Proyek_PPT: Nilai Pekerjaan (sumbu X), Deviasi (sumbu Y)",
  S15: "Daftar_31_Proyek_PPT: Deviasi < 0, Situasi Proyek, Mitigasi, Learning Stop",
  S16: "Data_Close_PPT & Data_Ongoing_PPT: Rekap 20 Dokumen per Kategori"
}};

export const DOCUMENT_TYPES = [
  'RAP', 'Justifikasi PL', 'SPPP/SP3', 'SP2', 'PO',
  'RKS', 'BA Aanwijzing', 'BA Nego', 'BAMK', 'BA MOS',
  'BA Comtest', 'BA Endurance', 'BA Progress', 'BASP', 'BAST',
  'Lap. Mingguan', 'Doc Lain', 'BA ADD', 'BA Pembayaran', 'Invoice Vendor'
];
"""

with open('src/data/initialData.ts', 'w') as f:
    f.write(initial_data_content)

print("Updated src/data/initialData.ts successfully.")

# Generate INITIAL_CONTRACTS
doc_types_list = [
  'RAP', 'Justifikasi PL', 'SPPP/SP3', 'SP2', 'PO',
  'RKS', 'BA Aanwijzing', 'BA Nego', 'BAMK', 'BA MOS',
  'BA Comtest', 'BA Endurance', 'BA Progress', 'BASP', 'BAST',
  'Lap. Mingguan', 'Doc Lain', 'BA ADD', 'BA Pembayaran', 'Invoice Vendor'
]

doc_map = {
    'A': 'ADA',
    'T': 'TIDAK_DIPERLUKAN',
    'P': 'PROSES',
    'D': 'DIVISI',
    'K': 'BELUM'
}

initial_contracts = []
for i, c in enumerate(contracts):
    doc_record = {}
    for d_idx, dtype in enumerate(doc_types_list):
        char = c['d'][d_idx] if d_idx < len(c['d']) else 'K'
        doc_record[dtype] = doc_map.get(char, 'BELUM')
    
    val_rp = int(round(c['v'] * 1e6))
    initial_contracts.append({
        'id': i + 1,
        'contractName': c['n'],
        'vendorOrUser': c['w'] or 'PT BIMA',
        'pic': c['pic'],
        'value': val_rp,
        'startDate': c['a'] or '-',
        'endDate': c['e'] or '-',
        'progress': c['p'],
        'notes': f"Status: {'Ongoing' if c['s']=='G' else 'Closed'}, WBS: {c['w']}",
        'docs': doc_record
    })

# Append INITIAL_CONTRACTS export to initialData.ts
with open('src/data/initialData.ts', 'a') as f:
    f.write(f"\nexport const INITIAL_CONTRACTS: ContractDocumentRow[] = {json.dumps(initial_contracts, indent=2)};\n")

print(f"Appended {len(initial_contracts)} INITIAL_CONTRACTS to initialData.ts.")
