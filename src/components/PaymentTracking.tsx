import React, { useState, useMemo, useEffect } from 'react';
import { MasterProject } from '../data/bimaData';

export interface PaymentTrackingItem {
  id: string;
  projectNo: number;
  wbs: string;
  projectName: string;
  owner: string;
  pic?: string;
  nilaiKontrak: number;
  tahapTagihan: string;
  status: 'Proses tagihan' | 'Tertahan (dispute)' | 'Perhitungan denda' | 'Menunggu BAST' | 'Lunas';
  persentase?: number;
  nilaiTagihan?: string;
  nomorInvoice?: string;
  tanggalDiajukan?: string;
  tanggalDiterima?: string;
  catatan?: string;
  situasi?: string;
  mitigasi?: string;
  bamk?: string;
  akTerkini?: string;
  progresRencana?: number;
  progresRealisasi?: number;
  riwayat?: {
    tahap: string;
    nilai: string;
    diajukan: string;
    diterima: string;
  }[];
}

interface PaymentTrackingProps {
  projects: MasterProject[];
  onOpenProjectDetail?: (projectNo: number) => void;
  onOpenDocuments?: () => void;
}

// Known status/tahap overrides matching the spreadsheet & mockup
const KNOWN_TRACKING_DATA: Record<string, Partial<PaymentTrackingItem>> = {
  // Pengadaan Genset TPK Pantoloan
  'TPK Pantoloan': {
    tahapTagihan: 'Uang muka 20%',
    status: 'Proses tagihan',
    persentase: 20,
    situasi: 'Proses tagihan uang muka (20%) PT BIMA ke user; kendala pada proses PR terkait penentuan vendor terbatas.',
    mitigasi: 'Koordinasi dan diskusi dengan Tim Divisi Pengadaan untuk mempercepat proses dan mencegah keterlambatan pekerjaan.'
  },
  // Emergency Brake TPS
  'Emergency Brake CC-06 TPS': {
    tahapTagihan: 'Tagihan ke user',
    status: 'Tertahan (dispute)',
    persentase: 100,
    situasi: 'Terdapat perbedaan penafsiran klausul commissioning antara user dan vendor pada emergency brake.',
    mitigasi: 'Melakukan konsiliasi teknis bersama tim engineering TPS guna menyepakati parameter comtest.'
  },
  // Spreader IPC
  'Spreader IPC': {
    tahapTagihan: 'Perhitungan denda',
    status: 'Perhitungan denda',
    persentase: 100,
    situasi: 'Pekerjaan selesai melebihi target waktu kontrak; sedang dalam proses kalkulasi denda keterlambatan vendor/kontraktor.',
    mitigasi: 'Mengajukan perhitungan denda back-to-back kepada pihak supplier pembuat spreader.'
  },
  // Chassis IPC
  'Chassis IPC': {
    tahapTagihan: 'Penagihan ke user',
    status: 'Proses tagihan',
    persentase: 90,
    situasi: 'Seluruh unit chassis telah diterima di terminal dan dilakukan uji coba comtest.',
    mitigasi: 'Menyerahkan dokumen BAST comtest sebagai syarat pencairan termin penagihan.'
  },
  // Sparepart RS 01
  'Sparepart Pada RS 01': {
    tahapTagihan: 'Termin I (30%)',
    status: 'Proses tagihan',
    persentase: 30,
    situasi: 'Pekerjaan fisik 100%, Comtest belum dilaksanakan (menunggu GO Engine & Transmisi); Pekerjaan kombinasi dengan Tim Maintenance Site; Proses tagihan Termin I (30%).',
    mitigasi: 'Didukung BA Justifikasi/BA Kesepakatan untuk mengakomodir klausul Comtest; Koordinasi dengan User terkait pembayaran Termin I (30%).'
  },
  // Emergency Hoist Brake CC Nilam
  'Emergency Hoist Brake CC 01 dan 02': {
    tahapTagihan: 'Termin III',
    status: 'Proses tagihan',
    persentase: 30,
    situasi: 'BAST 28 Agustus 2026; Unit sudah beroperasi dengan progres pekerjaan fisik 100%; Proses penagihan Termin III.',
    mitigasi: 'Mempercepat proses pengajuan dan approval tagihan Termin III bersama bagian keuangan user.'
  },
  // Boom QCC Makassar
  'Perbaikan Struktur Boom': {
    tahapTagihan: 'Tagihan 100%',
    status: 'Proses tagihan',
    persentase: 100,
    situasi: 'Pekerjaan perbaikan boom selesai dan uji coba operasional berhasil; proses klaim asuransi selesai diverifikasi.',
    mitigasi: 'Mengawal proses pencairan pembayaran melalui koordinasi dengan PIC asuransi dan user.'
  },
  // Wheel dan Modif Leg CC Ex-Koja
  'Wheel dan Modif Leg CC': {
    tahapTagihan: 'Belum ditagih',
    status: 'Menunggu BAST',
    persentase: 0,
    situasi: 'Pekerjaan fisik telah tuntas dilaksanakan; saat ini dalam penjadwalan penandatanganan dokumen BAST resmi.',
    mitigasi: 'Koordinasi dengan sekretariat user untuk percepatan sirkulasi tanda tangan BAST 1.'
  }
};

function derivePaymentItem(p: MasterProject): PaymentTrackingItem {
  const sit = p.sit || '';
  const sitLower = sit.toLowerCase();
  const rl = p.rl ?? 0;
  const val = p.nv * 1e9;

  let tahapTagihan = 'Uang muka 20%';
  let status: PaymentTrackingItem['status'] = 'Proses tagihan';
  let persentase = 20;

  // Check known data overrides
  for (const key in KNOWN_TRACKING_DATA) {
    if (p.n.toLowerCase().includes(key.toLowerCase()) || (p.wbs && p.wbs.toLowerCase().includes(key.toLowerCase()))) {
      const match = KNOWN_TRACKING_DATA[key];
      tahapTagihan = match.tahapTagihan || tahapTagihan;
      status = match.status || status;
      persentase = match.persentase || persentase;
      break;
    }
  }

  // If not overridden, infer from project situation, status, or progress
  if (tahapTagihan === 'Uang muka 20%' && status === 'Proses tagihan') {
    if (sitLower.includes('denda')) {
      tahapTagihan = 'Perhitungan denda';
      status = 'Perhitungan denda';
      persentase = 100;
    } else if (sitLower.includes('dispute') || sitLower.includes('tertahan')) {
      tahapTagihan = 'Tagihan ke user';
      status = 'Tertahan (dispute)';
      persentase = 100;
    } else if (sitLower.includes('bast') || sitLower.includes('belum ditagih')) {
      tahapTagihan = 'Belum ditagih';
      status = 'Menunggu BAST';
      persentase = 0;
    } else if (sitLower.includes('termin iii') || sitLower.includes('termin 3')) {
      tahapTagihan = 'Termin III';
      status = 'Proses tagihan';
      persentase = 30;
    } else if (sitLower.includes('termin ii') || sitLower.includes('termin 2')) {
      tahapTagihan = 'Termin II (30%)';
      status = 'Proses tagihan';
      persentase = 30;
    } else if (sitLower.includes('termin i') || sitLower.includes('termin 1')) {
      tahapTagihan = 'Termin I (30%)';
      status = 'Proses tagihan';
      persentase = 30;
    } else if (p.st === 'FINISH' || p.st === 'Finished' || p.st === 'Closed' || sitLower.includes('lunas')) {
      tahapTagihan = 'Pelunasan 100%';
      status = 'Lunas';
      persentase = 100;
    } else if (rl >= 100) {
      tahapTagihan = 'Tagihan 100%';
      status = 'Proses tagihan';
      persentase = 100;
    } else if (rl >= 70) {
      tahapTagihan = 'Termin II (30%)';
      status = 'Proses tagihan';
      persentase = 30;
    } else if (rl >= 30) {
      tahapTagihan = 'Termin I (30%)';
      status = 'Proses tagihan';
      persentase = 30;
    } else {
      tahapTagihan = 'Uang muka 20%';
      status = 'Proses tagihan';
      persentase = 20;
    }
  }

  const nilaiTagihanNum = (val * persentase) / 100;
  const nilaiTagihanStr = `Rp${Math.round(nilaiTagihanNum).toLocaleString('id-ID')}`;

  const riwayat = [
    {
      tahap: tahapTagihan,
      nilai: nilaiTagihanStr,
      diajukan: p.bamk || '—',
      diterima: status === 'Lunas' ? (p.akt || '—') : '—'
    },
    {
      tahap: 'Termin berikutnya',
      nilai: status === 'Lunas' ? '—' : '[nilai]',
      diajukan: '—',
      diterima: '—'
    }
  ];

  return {
    id: `proj-${p.no}`,
    projectNo: p.no,
    wbs: p.wbs && p.wbs !== '-' ? p.wbs : `WBS-${p.no}`,
    projectName: p.n,
    owner: p.pem,
    pic: p.pic || 'ELTRIA',
    nilaiKontrak: val,
    tahapTagihan,
    status,
    persentase,
    nilaiTagihan: nilaiTagihanStr,
    nomorInvoice: `INV/2026/ME/${String(p.no).padStart(3, '0')}`,
    tanggalDiajukan: p.bamk || '—',
    tanggalDiterima: status === 'Lunas' ? (p.akt || '—') : '—',
    situasi: p.sit || 'Proses administrasi tagihan berjalan normal sesuai termin kontrak.',
    mitigasi: p.mit || 'Melakukan monitoring berkala bersama unit kerja terkait.',
    bamk: p.bamk || '—',
    akTerkini: p.akt || p.ak || '—',
    progresRencana: p.pl ?? 0,
    progresRealisasi: p.rl ?? 0,
    riwayat
  };
}

export const PaymentTracking: React.FC<PaymentTrackingProps> = ({
  projects,
  onOpenProjectDetail,
  onOpenDocuments
}) => {
  // Sub-view: 'list' | 'detail' | 'input'
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'input'>('list');
  const [selectedId, setSelectedId] = useState<string>('');
  const [editingItem, setEditingItem] = useState<PaymentTrackingItem | null>(null);

  // Filters for List View
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOwner, setFilterOwner] = useState('ALL');
  const [filterPic, setFilterPic] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Load tracking list derived from ALL projects
  const [trackingList, setTrackingList] = useState<PaymentTrackingItem[]>(() => {
    try {
      const saved = localStorage.getItem('bima_payment_tracking_data_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= projects.length) {
          return parsed;
        }
      }
    } catch {}
    return projects.map(derivePaymentItem);
  });

  // Keep tracking list synchronized if projects prop updates
  useEffect(() => {
    setTrackingList(prev => {
      const existingMap = new Map(prev.map(item => [item.projectNo, item]));
      return projects.map(p => {
        const existing = existingMap.get(p.no);
        if (existing) {
          return {
            ...existing,
            wbs: p.wbs && p.wbs !== '-' ? p.wbs : existing.wbs,
            projectName: p.n,
            owner: p.pem,
            pic: p.pic || existing.pic,
            nilaiKontrak: p.nv * 1e9,
            bamk: p.bamk || existing.bamk,
            akTerkini: p.akt || p.ak || existing.akTerkini,
            progresRencana: p.pl ?? existing.progresRencana,
            progresRealisasi: p.rl ?? existing.progresRealisasi,
            situasi: existing.situasi || p.sit,
            mitigasi: existing.mitigasi || p.mit
          };
        }
        return derivePaymentItem(p);
      });
    });
  }, [projects]);

  // Persist tracking list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bima_payment_tracking_data_v2', JSON.stringify(trackingList));
    } catch {}
  }, [trackingList]);

  // Form State for Board 3
  const [formProjectNo, setFormProjectNo] = useState<number>(projects[0]?.no || 1);
  const [formTahap, setFormTahap] = useState('Uang muka 20%');
  const [formPersen, setFormPersen] = useState('20');
  const [formNilai, setFormNilai] = useState('');
  const [formInvoice, setFormInvoice] = useState('');
  const [formTglDiajukan, setFormTglDiajukan] = useState('');
  const [formTglDiterima, setFormTglDiterima] = useState('');
  const [formStatus, setFormStatus] = useState<PaymentTrackingItem['status']>('Proses tagihan');
  const [formCatatan, setFormCatatan] = useState('');

  // Selected Item for Detail View
  const activeDetailItem = useMemo(() => {
    return trackingList.find(item => item.id === selectedId) || trackingList[0];
  }, [trackingList, selectedId]);

  // Unique Owners & PICs for Filter Dropdowns
  const ownerOptions = useMemo(() => {
    const set = new Set<string>();
    trackingList.forEach(t => { if (t.owner) set.add(t.owner); });
    return Array.from(set).sort();
  }, [trackingList]);

  const picOptions = useMemo(() => {
    const set = new Set<string>();
    trackingList.forEach(t => { if (t.pic) set.add(t.pic); });
    return Array.from(set).sort();
  }, [trackingList]);

  // Counts for KPI Cards
  const countProses = trackingList.filter(t => t.status === 'Proses tagihan').length;
  const countTertahan = trackingList.filter(t => t.status === 'Tertahan (dispute)').length;
  const countDenda = trackingList.filter(t => t.status === 'Perhitungan denda').length;
  const countBAST = trackingList.filter(t => t.status === 'Menunggu BAST').length;
  const countLunas = trackingList.filter(t => t.status === 'Lunas').length;

  // Filtered List for Table
  const filteredItems = useMemo(() => {
    return trackingList.filter(item => {
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
      if (filterOwner !== 'ALL' && item.owner !== filterOwner) return false;
      if (filterPic !== 'ALL' && item.pic !== filterPic) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchWbs = item.wbs.toLowerCase().includes(q);
        const matchName = item.projectName.toLowerCase().includes(q);
        const matchOwner = item.owner.toLowerCase().includes(q);
        if (!matchWbs && !matchName && !matchOwner) return false;
      }
      return true;
    });
  }, [trackingList, filterStatus, filterOwner, filterPic, searchQuery]);

  // Helper styles based on status
  const getStatusChipClass = (status: string) => {
    switch (status) {
      case 'Proses tagihan': return 'chip b';
      case 'Tertahan (dispute)': return 'chip o';
      case 'Perhitungan denda': return 'chip p';
      case 'Menunggu BAST': return 'chip g';
      case 'Lunas': return 'chip gr';
      default: return 'chip b';
    }
  };

  const getRowBorderClass = (status: string) => {
    switch (status) {
      case 'Proses tagihan': return 'rb';
      case 'Tertahan (dispute)': return 'ro';
      case 'Perhitungan denda': return 'rp';
      case 'Menunggu BAST': return 'rg';
      case 'Lunas': return 'rgr';
      default: return 'rb';
    }
  };

  // Handler to open Detail
  const handleOpenDetail = (item: PaymentTrackingItem) => {
    setSelectedId(item.id);
    setViewMode('detail');
  };

  // Handler to open Form Edit
  const handleOpenEdit = (item: PaymentTrackingItem) => {
    setEditingItem(item);
    setFormProjectNo(item.projectNo);
    setFormTahap(item.tahapTagihan);
    setFormPersen(String(item.persentase || 20));
    setFormNilai(item.nilaiTagihan || '');
    setFormInvoice(item.nomorInvoice || '');
    setFormTglDiajukan(item.tanggalDiajukan || '');
    setFormTglDiterima(item.tanggalDiterima || '');
    setFormStatus(item.status);
    setFormCatatan(item.catatan || '');
    setViewMode('input');
  };

  // Handler to save form
  const handleSaveForm = (andAddMore: boolean) => {
    const matchedProj = projects.find(p => p.no === Number(formProjectNo)) || projects[0];

    const newItem: PaymentTrackingItem = {
      id: editingItem ? editingItem.id : `proj-${matchedProj.no}`,
      projectNo: matchedProj.no,
      wbs: matchedProj.wbs && matchedProj.wbs !== '-' ? matchedProj.wbs : `WBS-${matchedProj.no}`,
      projectName: matchedProj.n,
      owner: matchedProj.pem,
      pic: matchedProj.pic,
      nilaiKontrak: matchedProj.nv * 1e9,
      tahapTagihan: formTahap,
      status: formStatus,
      persentase: Number(formPersen) || 0,
      nilaiTagihan: formNilai || `Rp${((matchedProj.nv * (Number(formPersen) || 20) / 100) * 1e9).toLocaleString('id-ID')}`,
      nomorInvoice: formInvoice || `INV/${new Date().getFullYear()}/ME/${String(matchedProj.no).padStart(3, '0')}`,
      tanggalDiajukan: formTglDiajukan || new Date().toISOString().substring(0, 10),
      tanggalDiterima: formTglDiterima || '',
      catatan: formCatatan,
      situasi: editingItem?.situasi || matchedProj.sit || 'Tahap proses penagihan administrasi ke user.',
      mitigasi: editingItem?.mitigasi || matchedProj.mit || 'Monitoring berkala bersama tim pengadaan & finance user.',
      bamk: matchedProj.bamk,
      akTerkini: matchedProj.akt || matchedProj.ak,
      progresRencana: matchedProj.pl ?? 0,
      progresRealisasi: matchedProj.rl ?? 0,
      riwayat: editingItem?.riwayat || [
        { tahap: formTahap, nilai: formNilai || 'Sesuai Tagihan', diajukan: formTglDiajukan || 'Baru diajukan', diterima: formTglDiterima || '—' }
      ]
    };

    setTrackingList(prev => {
      const idx = prev.findIndex(item => item.id === newItem.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = newItem;
        return copy;
      }
      return [newItem, ...prev];
    });

    if (andAddMore) {
      setFormNilai('');
      setFormInvoice('');
      setFormCatatan('');
    } else {
      setSelectedId(newItem.id);
      setViewMode('list');
    }
  };

  // Handler to mark paid
  const handleMarkPaid = (item: PaymentTrackingItem) => {
    setTrackingList(prev => prev.map(t => t.id === item.id ? { ...t, status: 'Lunas' } : t));
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Nomor WBS', 'Nama Pekerjaan', 'Pemilik', 'Tahap Tagihan', 'Nilai Tagihan', 'Status'];
    const rows = filteredItems.map(t => [
      `"${t.wbs}"`,
      `"${t.projectName.replace(/"/g, '""')}"`,
      `"${t.owner.replace(/"/g, '""')}"`,
      `"${t.tahapTagihan}"`,
      `"${t.nilaiTagihan || '-'}"`,
      `"${t.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tracking_Pembayaran_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ boxSizing: 'border-box', minHeight: '800px', background: 'linear-gradient(180deg, #DDEAFB 0, #F1EBFA 50%, #FFF1E2 100%)', padding: '0 24px 40px', fontFamily: "'IBM Plex Sans', sans-serif", color: '#0F1B2D', borderRadius: '12px' }}>
      <div style={{ maxWidth: '1296px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ========================================================= */}
        {/* VIEW 1: DAFTAR PEMBAYARAN KONTRAK */}
        {/* ========================================================= */}
        {viewMode === 'list' && (
          <>
            {/* Top Banner Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap', background: 'linear-gradient(135deg, #12315C, #2A6FC4)', borderRadius: '12px', padding: '22px 24px', color: '#fff', marginTop: '16px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#fff' }}>Tracking Pembayaran Kontrak</h1>
                <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#D4E4F8' }}>
                  {trackingList.length} kontrak dalam tracking · data dari Google Sheet (hanya-baca)
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" className="bt" onClick={handleExportCsv} style={{ background: '#fff', color: '#0F1B2D' }}>
                  Ekspor <span className="tg">4</span>
                </button>
                <button
                  type="button"
                  className="bt acc"
                  onClick={() => {
                    setEditingItem(null);
                    setViewMode('input');
                  }}
                  style={{ background: '#B24A00', color: '#fff', borderColor: '#B24A00' }}
                >
                  + Input Pembayaran <span className="tg" style={{ background: '#fff', color: '#B24A00' }}>3</span>
                </button>
              </div>
            </div>

            {/* 4 KPI Cards */}
            <div className="four" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              <div className="card" style={{ padding: '14px 18px', borderTop: '4px solid #2A6FC4', background: '#EAF2FD', cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === 'Proses tagihan' ? 'ALL' : 'Proses tagihan')}>
                <div className="k" style={{ color: '#44546A', fontSize: '12px', fontWeight: 600 }}>Proses tagihan</div>
                <div className="m" style={{ fontSize: '28px', color: '#0F3F7A', fontWeight: 700 }}>{countProses}</div>
              </div>
              <div className="card" style={{ padding: '14px 18px', borderTop: '4px solid #E8730C', background: '#FFF1E3', cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === 'Tertahan (dispute)' ? 'ALL' : 'Tertahan (dispute)')}>
                <div className="k" style={{ color: '#44546A', fontSize: '12px', fontWeight: 600 }}>Tertahan (dispute)</div>
                <div className="m" style={{ fontSize: '28px', color: '#7A3300', fontWeight: 700 }}>{countTertahan}</div>
              </div>
              <div className="card" style={{ padding: '14px 18px', borderTop: '4px solid #7B3FB3', background: '#F3EBFB', cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === 'Perhitungan denda' ? 'ALL' : 'Perhitungan denda')}>
                <div className="k" style={{ color: '#44546A', fontSize: '12px', fontWeight: 600 }}>Perhitungan denda</div>
                <div className="m" style={{ fontSize: '28px', color: '#4A2273', fontWeight: 700 }}>{countDenda}</div>
              </div>
              <div className="card" style={{ padding: '14px 18px', borderTop: '4px solid #8A97A8', background: '#EEF1F5', cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === 'Menunggu BAST' ? 'ALL' : 'Menunggu BAST')}>
                <div className="k" style={{ color: '#44546A', fontSize: '12px', fontWeight: 600 }}>Menunggu BAST</div>
                <div className="m" style={{ fontSize: '28px', color: '#2E3A48', fontWeight: 700 }}>{countBAST}</div>
              </div>
            </div>

            {/* Filter Bar with Search, Dropdowns, and Pills */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                Cari
                <input
                  className="in"
                  placeholder="Nomor WBS, pekerjaan, atau pemilik"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ minHeight: '40px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '13px' }}
                />
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                <span>Pemilik</span>
                <select
                  className="in"
                  value={filterOwner}
                  onChange={e => setFilterOwner(e.target.value)}
                  style={{ minHeight: '40px', width: '180px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 8px', fontSize: '13px' }}
                >
                  <option value="ALL">Semua pemilik</option>
                  {ownerOptions.map(o => (
                    <option key={o} value={o}>{o.length > 25 ? o.substring(0, 25) + '...' : o}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                <span>PIC</span>
                <select
                  className="in"
                  value={filterPic}
                  onChange={e => setFilterPic(e.target.value)}
                  style={{ minHeight: '40px', width: '130px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 8px', fontSize: '13px' }}
                >
                  <option value="ALL">Semua PIC</option>
                  {picOptions.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignSelf: 'flex-end' }}>
                <button
                  type="button"
                  className={`f ${filterStatus === 'ALL' ? 'on' : ''}`}
                  onClick={() => setFilterStatus('ALL')}
                >
                  Semua ({trackingList.length})
                </button>
                <button
                  type="button"
                  className={`f cb ${filterStatus === 'Proses tagihan' ? 'on' : ''}`}
                  onClick={() => setFilterStatus('Proses tagihan')}
                >
                  Proses Tagihan ({countProses})
                </button>
                <button
                  type="button"
                  className={`f co ${filterStatus === 'Tertahan (dispute)' ? 'on' : ''}`}
                  onClick={() => setFilterStatus('Tertahan (dispute)')}
                >
                  Tertahan ({countTertahan})
                </button>
                <button
                  type="button"
                  className={`f cp ${filterStatus === 'Perhitungan denda' ? 'on' : ''}`}
                  onClick={() => setFilterStatus('Perhitungan denda')}
                >
                  Denda ({countDenda})
                </button>
                <button
                  type="button"
                  className={`f cg ${filterStatus === 'Menunggu BAST' ? 'on' : ''}`}
                  onClick={() => setFilterStatus('Menunggu BAST')}
                >
                  Menunggu BAST ({countBAST})
                </button>
                {countLunas > 0 && (
                  <button
                    type="button"
                    className={`f gr ${filterStatus === 'Lunas' ? 'on' : ''}`}
                    onClick={() => setFilterStatus('Lunas')}
                    style={{ background: filterStatus === 'Lunas' ? '#07582F' : '#CFF0DE', color: filterStatus === 'Lunas' ? '#fff' : '#07582F', borderColor: '#A3E2BD' }}
                  >
                    Lunas ({countLunas})
                  </button>
                )}
              </div>
            </div>

            {/* Table Card */}
            <div className="card" style={{ overflowX: 'auto', background: '#fff', border: '1px solid #D3DEEC', borderRadius: '12px', boxShadow: '0 2px 6px rgba(31,78,140,.10)' }}>
              <table>
                <thead>
                  <tr>
                    <th>Nomor WBS</th>
                    <th>Nama pekerjaan</th>
                    <th>Pemilik pekerjaan</th>
                    <th>Tahap tagihan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--mute)' }}>
                        Tidak ada data pembayaran yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr key={item.id} className={getRowBorderClass(item.status)}>
                        <td className="m" style={{ fontWeight: 600, color: '#174A8B', whiteSpace: 'nowrap' }}>
                          {item.wbs}
                        </td>
                        <td style={{ fontWeight: 500, minWidth: '280px' }}>
                          {item.projectName}
                        </td>
                        <td style={{ color: '#44546A', minWidth: '200px' }}>
                          {item.owner}
                        </td>
                        <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {item.tahapTagihan}
                        </td>
                        <td>
                          <span className={getStatusChipClass(item.status)}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="bt"
                            onClick={() => handleOpenDetail(item)}
                            style={{ minHeight: '34px', padding: '0 12px', fontSize: '12px' }}
                          >
                            Detail <span className="tg">5</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: DETAIL PEMBAYARAN */}
        {/* ========================================================= */}
        {viewMode === 'detail' && activeDetailItem && (
          <>
            {/* Top Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
              <button
                type="button"
                className="bt"
                onClick={() => setViewMode('list')}
                style={{ background: '#fff', color: '#0F1B2D', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                ← Kembali ke daftar <span className="tg">6</span>
              </button>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" className="bt" onClick={() => window.print()} style={{ background: '#fff', color: '#0F1B2D' }}>
                  Unduh PDF <span className="tg">11</span>
                </button>
                <button type="button" className="bt" onClick={() => handleOpenEdit(activeDetailItem)} style={{ background: '#fff', color: '#0F1B2D' }}>
                  Edit pembayaran <span className="tg">7</span>
                </button>
                <button
                  type="button"
                  className="bt ok"
                  onClick={() => handleMarkPaid(activeDetailItem)}
                  style={{ background: '#0B7A43', color: '#fff', borderColor: '#0B7A43' }}
                >
                  Tandai dibayar <span className="tg" style={{ background: '#fff', color: '#0B7A43' }}>8</span>
                </button>
              </div>
            </div>

            {/* Hero Header */}
            <div style={{ background: 'linear-gradient(135deg, #12315C, #2A6FC4)', borderRadius: '12px', padding: '22px 24px', color: '#fff' }}>
              <div className="k m" style={{ color: '#BFD6F4', fontSize: '13px' }}>{activeDetailItem.wbs}</div>
              <h1 style={{ margin: '6px 0 10px', fontSize: '24px', fontWeight: 600, color: '#fff' }}>
                {activeDetailItem.projectName}
              </h1>
              <span className={getStatusChipClass(activeDetailItem.status)}>
                {activeDetailItem.status}
              </span>
            </div>

            {/* Two Cards: Informasi Kontrak & Riwayat Tagihan */}
            <div className="two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Card 1: Informasi Kontrak */}
              <div className="card" style={{ padding: '20px', borderTop: '4px solid #2A6FC4', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1/3', fontSize: '14px', fontWeight: 600, color: '#174A8B' }}>
                  Informasi kontrak
                </div>
                <div>
                  <div className="k" style={{ fontSize: '12px', color: '#44546A' }}>Pemilik pekerjaan</div>
                  <div className="v" style={{ fontSize: '13.5px', fontWeight: 500, color: '#0F1B2D', marginTop: '3px' }}>{activeDetailItem.owner}</div>
                </div>
                <div>
                  <div className="k" style={{ fontSize: '12px', color: '#44546A' }}>Nilai pekerjaan</div>
                  <div className="v m" style={{ fontSize: '14px', fontWeight: 600, color: '#0F1B2D', marginTop: '3px' }}>
                    Rp{activeDetailItem.nilaiKontrak.toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <div className="k" style={{ fontSize: '12px', color: '#44546A' }}>BAMK</div>
                  <div className="v" style={{ fontSize: '13px', color: '#0F1B2D', marginTop: '3px' }}>{activeDetailItem.bamk || '—'}</div>
                </div>
                <div>
                  <div className="k" style={{ fontSize: '12px', color: '#44546A' }}>Akhir kontrak terkini</div>
                  <div className="v" style={{ fontSize: '13px', color: '#0F1B2D', marginTop: '3px' }}>{activeDetailItem.akTerkini || '—'}</div>
                </div>
                <div>
                  <div className="k" style={{ fontSize: '12px', color: '#44546A' }}>Progres rencana</div>
                  <div className="v m" style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F1B2D', marginTop: '3px' }}>{activeDetailItem.progresRencana}%</div>
                </div>
                <div>
                  <div className="k" style={{ fontSize: '12px', color: '#44546A' }}>Progres realisasi</div>
                  <div className="v m" style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F1B2D', marginTop: '3px' }}>{activeDetailItem.progresRealisasi}%</div>
                </div>
                <div style={{ gridColumn: '1/3', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {onOpenProjectDetail && (
                    <button
                      type="button"
                      className="bt"
                      onClick={() => onOpenProjectDetail(activeDetailItem.projectNo)}
                      style={{ fontSize: '12px' }}
                    >
                      Buka di Database Project <span className="tg">9</span>
                    </button>
                  )}
                  {onOpenDocuments && (
                    <button
                      type="button"
                      className="bt"
                      onClick={onOpenDocuments}
                      style={{ fontSize: '12px' }}
                    >
                      Lihat dokumen <span className="tg">10</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Card 2: Riwayat Tagihan */}
              <div className="card" style={{ padding: '20px', borderTop: '4px solid #1E9E8A', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0B6B5C' }}>
                  Riwayat tagihan
                </div>
                <p style={{ fontSize: '12px', color: '#44546A', margin: 0 }}>
                  Data dibaca dari Google Sheet (hanya-baca). Perubahan dilakukan di spreadsheet.
                </p>
                <table style={{ minWidth: 0, width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '8px 10px', fontSize: '12px' }}>Tahap</th>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '8px 10px', fontSize: '12px' }}>Nilai</th>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '8px 10px', fontSize: '12px' }}>Diajukan</th>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '8px 10px', fontSize: '12px' }}>Diterima</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeDetailItem.riwayat && activeDetailItem.riwayat.length > 0) ? (
                      activeDetailItem.riwayat.map((r, i) => (
                        <tr key={i}>
                          <td style={{ padding: '10px', fontSize: '12.5px' }}>{r.tahap}</td>
                          <td className="m" style={{ padding: '10px', fontSize: '12.5px', fontWeight: 600 }}>{r.nilai}</td>
                          <td style={{ padding: '10px', fontSize: '12px', color: '#44546A' }}>{r.diajukan}</td>
                          <td style={{ padding: '10px', fontSize: '12px', color: '#44546A' }}>{r.diterima}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td style={{ padding: '10px', fontSize: '12.5px' }}>{activeDetailItem.tahapTagihan}</td>
                        <td className="m" style={{ padding: '10px', fontSize: '12.5px', fontWeight: 600 }}>{activeDetailItem.nilaiTagihan || '—'}</td>
                        <td style={{ padding: '10px', fontSize: '12px', color: '#44546A' }}>{activeDetailItem.tanggalDiajukan || '—'}</td>
                        <td style={{ padding: '10px', fontSize: '12px', color: '#44546A' }}>{activeDetailItem.tanggalDiterima || '—'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Milestone Flow Diagram */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '11px', color: '#44546A', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '10px' }}>
                  <span className="chip gr" style={{ background: '#CFF0DE', color: '#07582F' }}>BAMK</span>
                  <span>→</span>
                  <span className="chip b" style={{ background: '#D3E5FB', color: '#0F3F7A' }}>Tagihan uang muka</span>
                  <span>→</span>
                  <span className="chip g" style={{ background: '#DDE3EA', color: '#2E3A48' }}>Dibayar</span>
                  <span>→</span>
                  <span className="chip g" style={{ background: '#DDE3EA', color: '#2E3A48' }}>Termin berikutnya</span>
                </div>
              </div>
            </div>

            {/* Bottom Card: Situasi Proyek & Mitigasi */}
            <div className="card two" style={{ padding: '20px', borderTop: '4px solid #E8730C', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div className="k" style={{ fontSize: '12px', color: '#44546A', fontWeight: 600 }}>Situasi proyek</div>
                <div className="v" style={{ fontSize: '13.5px', color: '#0F1B2D', lineHeight: 1.5, marginTop: '4px' }}>
                  {activeDetailItem.situasi || 'Tidak ada kendala khusus dalam proses tagihan.'}
                </div>
              </div>
              <div>
                <div className="k" style={{ fontSize: '12px', color: '#44546A', fontWeight: 600 }}>Mitigasi</div>
                <div className="v" style={{ fontSize: '13.5px', color: '#0F1B2D', lineHeight: 1.5, marginTop: '4px' }}>
                  {activeDetailItem.mitigasi || 'Melakukan pengawalan tagihan secara berkelanjutan.'}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: FORM INPUT PEMBAYARAN */}
        {/* ========================================================= */}
        {viewMode === 'input' && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #12315C, #2A6FC4)', borderRadius: '12px', padding: '22px 24px', color: '#fff', marginTop: '16px' }}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#fff' }}>Input Pembayaran</h1>
              <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#D4E4F8' }}>
                Catat atau perbarui tahap tagihan dan penerimaan pembayaran kontrak
              </p>
            </div>

            <div className="card" style={{ padding: '24px', borderTop: '4px solid #1E9E8A', display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '880px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                Project
                <select
                  className="in"
                  value={formProjectNo}
                  onChange={e => {
                    const no = Number(e.target.value);
                    setFormProjectNo(no);
                    const p = projects.find(x => x.no === no);
                    if (p) {
                      setFormNilai(`Rp${((p.nv * (Number(formPersen) || 20) / 100) * 1e9).toLocaleString('id-ID')}`);
                    }
                  }}
                  style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px', background: '#fff' }}
                >
                  {projects.map(p => (
                    <option key={p.no} value={p.no}>
                      [{p.wbs && p.wbs !== '-' ? p.wbs : `No ${p.no}`}] {p.n.length > 70 ? p.n.substring(0, 70) + '...' : p.n}
                    </option>
                  ))}
                </select>
              </label>

              <div className="two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Tahap tagihan
                  <select
                    className="in"
                    value={formTahap}
                    onChange={e => setFormTahap(e.target.value)}
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px', background: '#fff' }}
                  >
                    <option value="Uang muka 20%">Uang muka (20%)</option>
                    <option value="Termin I (30%)">Termin I (30%)</option>
                    <option value="Termin II (30%)">Termin II (30%)</option>
                    <option value="Termin III">Termin III</option>
                    <option value="Tagihan 100%">Tagihan 100%</option>
                    <option value="Penagihan ke user">Penagihan ke user</option>
                    <option value="Perhitungan denda">Perhitungan denda</option>
                    <option value="Belum ditagih">Belum ditagih</option>
                    <option value="Pelunasan 100%">Pelunasan 100%</option>
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Persentase (%)
                  <input
                    className="in"
                    type="number"
                    value={formPersen}
                    onChange={e => {
                      setFormPersen(e.target.value);
                      const p = projects.find(x => x.no === Number(formProjectNo));
                      if (p) {
                        setFormNilai(`Rp${((p.nv * (Number(e.target.value) || 0) / 100) * 1e9).toLocaleString('id-ID')}`);
                      }
                    }}
                    placeholder="20"
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Nilai tagihan (Rp)
                  <input
                    className="in"
                    value={formNilai}
                    onChange={e => setFormNilai(e.target.value)}
                    placeholder="[nilai tagihan]"
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Nomor invoice
                  <input
                    className="in"
                    value={formInvoice}
                    onChange={e => setFormInvoice(e.target.value)}
                    placeholder="[nomor invoice]"
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Tanggal diajukan
                  <input
                    className="in"
                    type="date"
                    value={formTglDiajukan}
                    onChange={e => setFormTglDiajukan(e.target.value)}
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Tanggal diterima
                  <input
                    className="in"
                    type="date"
                    value={formTglDiterima}
                    onChange={e => setFormTglDiterima(e.target.value)}
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Status
                  <select
                    className="in"
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px', background: '#fff' }}
                  >
                    <option value="Proses tagihan">Proses tagihan</option>
                    <option value="Tertahan (dispute)">Tertahan (dispute)</option>
                    <option value="Perhitungan denda">Perhitungan denda</option>
                    <option value="Menunggu BAST">Menunggu BAST</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                Catatan
                <input
                  className="in"
                  value={formCatatan}
                  onChange={e => setFormCatatan(e.target.value)}
                  placeholder="Keterangan tambahan"
                  style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                />
              </label>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  className="bt"
                  onClick={() => setViewMode('list')}
                >
                  Batal <span className="tg">12</span>
                </button>
                <button
                  type="button"
                  className="bt"
                  onClick={() => handleSaveForm(true)}
                >
                  Simpan &amp; tambah lagi <span className="tg">14</span>
                </button>
                <button
                  type="button"
                  className="bt ok"
                  onClick={() => handleSaveForm(false)}
                  style={{ background: '#0B7A43', color: '#fff', borderColor: '#0B7A43' }}
                >
                  Simpan <span className="tg" style={{ background: '#fff', color: '#0B7A43' }}>13</span>
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
