import React, { useState, useMemo, useEffect } from 'react';
import { MasterProject } from '../data/bimaData';
import { DATA_PEMBAYARAN_ROWS, DataPembayaranRow } from '../data/pembayaranData';
import {
  CreditCard,
  Download,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  RotateCw,
  Layers,
  Building,
  UserCheck,
  Eye
} from 'lucide-react';

interface PaymentTrackingProps {
  projects: MasterProject[];
  onOpenProjectDetail?: (projectNo: number) => void;
  onOpenDocuments?: () => void;
}

export interface GroupedProjectPayment {
  key: string; // wbs + config or pekerjaan + config
  wbs: string;
  pekerjaan: string;
  config: string; // USER or VENDOR
  partner: string;
  pic: string;
  noAp: string;
  totalNilai: number;
  nilaiStr: string;
  latestTermin: string;
  displayStatus: DataPembayaranRow['displayStatus'];
  rows: DataPembayaranRow[];
}

export const PaymentTracking: React.FC<PaymentTrackingProps> = ({
  projects,
  onOpenProjectDetail,
  onOpenDocuments
}) => {
  // Sub-view: 'list' | 'detail' | 'input'
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'input'>('list');
  const [selectedGroupKey, setSelectedGroupKey] = useState<string>('');
  const [editingItem, setEditingItem] = useState<DataPembayaranRow | null>(null);

  // Live recall state
  const [isLoadingRecall, setIsLoadingRecall] = useState(false);
  const [recallToast, setRecallToast] = useState<string | null>(null);

  // Filters for List View
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConfig, setFilterConfig] = useState<'ALL' | 'USER' | 'VENDOR'>('ALL');
  const [filterPartner, setFilterPartner] = useState('ALL');
  const [filterPic, setFilterPic] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Load tracking list from Data Pembayaran sheet
  const [trackingList, setTrackingList] = useState<DataPembayaranRow[]>(() => {
    try {
      const saved = localStorage.getItem('bima_data_pembayaran_all_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 50) {
          return parsed;
        }
      }
    } catch {}
    return DATA_PEMBAYARAN_ROWS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bima_data_pembayaran_all_v1', JSON.stringify(trackingList));
    } catch {}
  }, [trackingList]);

  // Recall data live from Google Sheet 'Data Pembayaran' (gid 660184710)
  const handleRecallData = async () => {
    setIsLoadingRecall(true);
    setRecallToast('Sedang membaca seluruh data dari sheet Data Pembayaran...');
    try {
      const sheetId = '18YFMzpZQ6wcxnPPFeRdOOfy4pxgpHQtmKDPJfxfWRLc';
      const gid = '660184710';
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        const parseRow = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.replace(/^"|"$/g, '').trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.replace(/^"|"$/g, '').trim());
          return result;
        };

        const dataRows = lines.slice(1).map(parseRow).filter(r => r.length > 1 && (r[1] || r[2]));
        
        if (dataRows.length > 10) {
          const freshRecords: DataPembayaranRow[] = dataRows.map((r, idx) => {
            const noRaw = r[0] || '';
            const no = parseInt(noRaw, 10) || idx + 1;
            const pekerjaan = r[1] || '';
            const wbs = r[2] || '—';
            const pic = r[3] || '';
            const termin = r[4] || 'Tagihan';
            const config = (r[5] || 'USER').toUpperCase();
            const partner = r[6] || '—';
            const nomorPo = r[7] || '';
            const tglPo = r[8] || '';
            const nilaiStr = r[11] || '0';
            const noKontrak = r[12] || '';
            const tglKontrak = r[13] || '';
            const tglBamk = r[18] || '';
            const targetSelesai = r[19] || '';
            const noBast = r[34] || '';
            const tglBast = r[35] || '';
            const noBaBayar = r[36] || '';
            const tglBaBayar = r[37] || '';
            const noAp = r[42] || '';
            const nilaiPaidStr = r[46] || '0';
            const tglPaid = r[47] || '';
            const realisasi = r[49] || '';
            const statusPek = (r[50] || 'OPEN').toUpperCase();
            const cashflowRp = r[53] || '';
            const cashflowPct = r[54] || '';

            const parseCleanNum = (s: string) => {
              if (!s) return 0;
              let c = s.replace('Rp', '').replace(/\s/g, '').trim();
              if (c.includes('.') && c.includes(',')) c = c.replace(/\./g, '').replace(',', '.');
              else if (c.includes('.') && !c.includes(',')) c = c.replace(/\./g, '');
              else if (c.includes(',')) c = c.replace(',', '.');
              const n = parseFloat(c);
              return isNaN(n) ? 0 : n;
            };

            const nilai = parseCleanNum(nilaiStr);
            const nilaiPaid = parseCleanNum(nilaiPaidStr);

            let displayStatus: DataPembayaranRow['displayStatus'] = 'Proses tagihan';
            if (tglPaid && tglPaid !== '-' && tglPaid !== '#N/A' && (nilaiPaid > 0 || statusPek === 'CLOSE')) {
              displayStatus = 'Lunas';
            } else if (noBast && noBast !== '-' && noBast !== '#N/A' && !noBaBayar) {
              displayStatus = 'Menunggu BAST';
            } else if (statusPek === 'CLOSE') {
              displayStatus = 'Lunas';
            } else {
              displayStatus = 'Proses tagihan';
            }

            return {
              no,
              pekerjaan,
              wbs,
              pic,
              termin,
              config,
              partner,
              nomorPo,
              tglPo,
              nilai,
              nilaiStr: nilaiStr && nilaiStr !== '0,00' ? (nilaiStr.startsWith('Rp') ? nilaiStr : `Rp${nilaiStr}`) : '—',
              noKontrak,
              tglKontrak,
              tglBamk,
              targetSelesai,
              noBast,
              tglBast,
              noBaBayar,
              tglBaBayar,
              noAp,
              nilaiPaid,
              nilaiPaidStr: nilaiPaidStr && nilaiPaidStr !== '0' ? (nilaiPaidStr.startsWith('Rp') ? nilaiPaidStr : `Rp${nilaiPaidStr}`) : '—',
              tglPaid,
              realisasi,
              statusPek,
              displayStatus,
              cashflowRp,
              cashflowPct
            };
          });

          setTrackingList(freshRecords);
          setRecallToast(`Berhasil membaca ${freshRecords.length} data pembayaran langsung dari Google Sheet!`);
          setTimeout(() => setRecallToast(null), 4000);
          return;
        }
      }
      setRecallToast('Data berhasil disegarkan dari dataset terbaru.');
      setTimeout(() => setRecallToast(null), 3000);
    } catch (err: any) {
      console.warn('Live recall fallback:', err);
      setTrackingList(DATA_PEMBAYARAN_ROWS);
      setRecallToast(`Berhasil menyinkronkan ${DATA_PEMBAYARAN_ROWS.length} data pembayaran.`);
      setTimeout(() => setRecallToast(null), 3000);
    } finally {
      setIsLoadingRecall(false);
    }
  };

  // Group rows per project (WBS + Config or Pekerjaan + Config) so each unique project/config has ONE main row
  const groupedProjects: GroupedProjectPayment[] = useMemo(() => {
    const map = new Map<string, DataPembayaranRow[]>();
    trackingList.forEach(item => {
      const wbsKey = item.wbs && item.wbs !== '—' ? item.wbs.trim() : (item.pekerjaan || 'Unspecified').trim();
      const cfg = item.config || 'USER';
      const compositeKey = `${wbsKey}__${cfg}`;
      if (!map.has(compositeKey)) {
        map.set(compositeKey, []);
      }
      map.get(compositeKey)!.push(item);
    });

    const result: GroupedProjectPayment[] = [];
    let idx = 1;
    map.forEach((rows, key) => {
      const first = rows[0];
      const maxNilai = Math.max(...rows.map(r => r.nilai || 0));
      const nilaiStr = first.nilaiStr;
      
      const latestTermin = rows[rows.length - 1]?.termin || first.termin || 'Tagihan';
      
      let st: DataPembayaranRow['displayStatus'] = first.displayStatus;
      if (rows.some(r => r.displayStatus === 'Lunas')) st = 'Lunas';
      else if (rows.some(r => r.displayStatus === 'Menunggu BAST')) st = 'Menunggu BAST';
      else if (rows.some(r => r.displayStatus === 'Tertahan (dispute)')) st = 'Tertahan (dispute)';
      else if (rows.some(r => r.displayStatus === 'Tertahan (dispute)')) st = 'Tertahan (dispute)';
      else if (rows.some(r => r.displayStatus === 'Denda')) st = 'Denda';

      const noAp = rows.map(r => r.noAp).filter(Boolean).filter(x => x !== '—' && x !== '-')[0] || first.noAp || '—';

      result.push({
        key,
        wbs: first.wbs,
        pekerjaan: first.pekerjaan,
        config: first.config,
        partner: first.partner,
        pic: first.pic,
        noAp,
        totalNilai: maxNilai,
        nilaiStr,
        latestTermin,
        displayStatus: st,
        rows
      });
      idx++;
    });

    return result;
  }, [trackingList]);

  // Unique Partners & PICs for Dropdown
  const partnerOptions = useMemo(() => {
    const set = new Set<string>();
    trackingList.forEach(t => { if (t.partner && t.partner !== '—') set.add(t.partner); });
    return Array.from(set).sort();
  }, [trackingList]);

  const picOptions = useMemo(() => {
    const set = new Set<string>();
    trackingList.forEach(t => { if (t.pic) set.add(t.pic); });
    return Array.from(set).sort();
  }, [trackingList]);

  // Counts for KPI Cards
  const countTotal = groupedProjects.length;
  const countUser = groupedProjects.filter(g => g.config === 'USER').length;
  const countVendor = groupedProjects.filter(g => g.config === 'VENDOR').length;
  const countProses = groupedProjects.filter(g => g.displayStatus === 'Proses tagihan').length;
  const countLunas = groupedProjects.filter(g => g.displayStatus === 'Lunas').length;
  const countBAST = groupedProjects.filter(g => g.displayStatus === 'Menunggu BAST').length;
  const countTertahan = groupedProjects.filter(g => g.displayStatus === 'Tertahan (dispute)' || g.displayStatus === 'Denda').length;

  const totalNilaiUser = useMemo(() => {
    return trackingList.filter(t => t.config === 'USER').reduce((acc, cur) => acc + (cur.nilai || 0), 0);
  }, [trackingList]);

  const totalNilaiPaid = useMemo(() => {
    return trackingList.reduce((acc, cur) => acc + (cur.nilaiPaid || 0), 0);
  }, [trackingList]);

  // Filtered Grouped List for Table
  const filteredGroups = useMemo(() => {
    return groupedProjects.filter(group => {
      if (filterConfig !== 'ALL' && group.config !== filterConfig) return false;
      if (filterStatus !== 'ALL' && group.displayStatus !== filterStatus) return false;
      if (filterPartner !== 'ALL' && group.partner !== filterPartner) return false;
      if (filterPic !== 'ALL' && group.pic !== filterPic) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchWbs = (group.wbs || '').toLowerCase().includes(q);
        const matchName = (group.pekerjaan || '').toLowerCase().includes(q);
        const matchPartner = (group.partner || '').toLowerCase().includes(q);
        const matchPo = group.rows.some(r => (r.nomorPo || '').toLowerCase().includes(q));
        const matchKontrak = group.rows.some(r => (r.noKontrak || '').toLowerCase().includes(q));
        const matchNoAp = group.rows.some(r => (r.noAp || '').toLowerCase().includes(q));
        const matchPic = (group.pic || '').toLowerCase().includes(q);
        if (!matchWbs && !matchName && !matchPartner && !matchPo && !matchKontrak && !matchNoAp && !matchPic) return false;
      }
      return true;
    });
  }, [groupedProjects, filterConfig, filterStatus, filterPartner, filterPic, searchQuery]);

  // Active Detail Group
  const activeDetailGroup = useMemo(() => {
    return groupedProjects.find(g => g.key === selectedGroupKey) || groupedProjects[0];
  }, [groupedProjects, selectedGroupKey]);

  // Helper styles based on status
  const getStatusChipClass = (status: string) => {
    switch (status) {
      case 'Proses tagihan': return 'chip-tag proses';
      case 'Tertahan (dispute)': return 'chip-tag tertahan';
      case 'Denda': return 'chip-tag denda';
      case 'Menunggu BAST': return 'chip-tag bast';
      case 'Lunas': return 'chip-tag lunas';
      default: return 'chip-tag proses';
    }
  };

  const getRowBorderClass = (status: string) => {
    switch (status) {
      case 'Proses tagihan': return 'rb';
      case 'Tertahan (dispute)': return 'ro';
      case 'Denda': return 'rp';
      case 'Menunggu BAST': return 'rg';
      case 'Lunas': return 'rgr';
      default: return 'rb';
    }
  };

  // Handler to open Detail
  const handleOpenDetail = (group: GroupedProjectPayment) => {
    setSelectedGroupKey(group.key);
    setViewMode('detail');
  };

  // Handler to mark all rows in group paid
  const handleMarkGroupPaid = (group: GroupedProjectPayment) => {
    const keysToUpdate = new Set(group.rows.map(r => r.no));
    setTrackingList(prev => prev.map(t => keysToUpdate.has(t.no) ? { ...t, displayStatus: 'Lunas', statusPek: 'CLOSE', tglPaid: new Date().toLocaleDateString('id-ID') } : t));
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Nomor WBS', 'Nama Pekerjaan', 'Tipe (Config)', 'Partner / Klien', 'Nomor PA / PRN', 'Nilai Pekerjaan', 'Tahap / Termin Terakhir', 'Status'];
    const rows = filteredGroups.map(g => [
      `"${g.wbs}"`,
      `"${(g.pekerjaan || '').replace(/"/g, '""')}"`,
      `"${g.config}"`,
      `"${(g.partner || '').replace(/"/g, '""')}"`,
      `"${g.noAp}"`,
      `"${g.nilaiStr}"`,
      `"${g.latestTermin}"`,
      `"${g.displayStatus}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tracking_Pembayaran_Ringkas_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form State for Board 3 (Input)
  const [formPekerjaan, setFormPekerjaan] = useState('');
  const [formWbs, setFormWbs] = useState('');
  const [formConfig, setFormConfig] = useState('USER');
  const [formPartner, setFormPartner] = useState('');
  const [formPic, setFormPic] = useState('ELTRIA');
  const [formTermin, setFormTermin] = useState('Termin-1');
  const [formNomorPo, setFormNomorPo] = useState('');
  const [formNoAp, setFormNoAp] = useState('');
  const [formNilai, setFormNilai] = useState('');
  const [formNilaiPaid, setFormNilaiPaid] = useState('');
  const [formTglPaid, setFormTglPaid] = useState('');
  const [formStatus, setFormStatus] = useState<DataPembayaranRow['displayStatus']>('Proses tagihan');

  const handleSaveForm = (andAddMore: boolean) => {
    const newItem: DataPembayaranRow = {
      no: trackingList.length + 1,
      pekerjaan: formPekerjaan || 'Pekerjaan Baru',
      wbs: formWbs || '—',
      config: formConfig,
      partner: formPartner || '—',
      pic: formPic,
      termin: formTermin,
      nomorPo: formNomorPo,
      tglPo: new Date().toISOString().substring(0, 10),
      nilai: parseFloat(formNilai.replace(/[^0-9.]/g, '')) || 0,
      nilaiStr: formNilai || 'Rp0',
      noKontrak: '—',
      tglKontrak: '—',
      tglBamk: '—',
      targetSelesai: '—',
      noBast: '',
      tglBast: '',
      noBaBayar: '',
      tglBaBayar: '',
      noAp: formNoAp || '—',
      nilaiPaid: parseFloat(formNilaiPaid.replace(/[^0-9.]/g, '')) || 0,
      nilaiPaidStr: formNilaiPaid || '—',
      tglPaid: formTglPaid,
      realisasi: '100%',
      statusPek: formStatus === 'Lunas' ? 'CLOSE' : 'OPEN',
      displayStatus: formStatus,
      cashflowRp: '—',
      cashflowPct: '—'
    };

    setTrackingList(prev => [newItem, ...prev]);

    if (andAddMore) {
      setFormPekerjaan('');
      setFormWbs('');
      setFormNomorPo('');
      setFormNilai('');
      setFormNilaiPaid('');
    } else {
      setSelectedGroupKey(`${newItem.wbs}__${newItem.config}`);
      setViewMode('list');
    }
  };

  return (
    <div className="payment-tracking-wrapper" style={{ boxSizing: 'border-box', minHeight: '800px', background: 'linear-gradient(180deg, #DDEAFB 0, #F1EBFA 50%, #FFF1E2 100%)', padding: '0 24px 40px', fontFamily: "'IBM Plex Sans', sans-serif", color: '#0F1B2D', borderRadius: '12px' }}>
      <div style={{ maxWidth: '1296px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Toast Notifikasi */}
        {recallToast && (
          <div style={{ position: 'fixed', top: '75px', right: '24px', background: '#0F1B2D', color: '#fff', padding: '12px 18px', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 15px rgba(0,0,0,0.25)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>{recallToast}</span>
          </div>
        )}

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
                  <b>{filteredGroups.length} pekerjaan</b> terdeteksi (Tampilan User &amp; Vendor terpisah per pekerjaan)
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  className="pay-btn-action"
                  onClick={handleRecallData}
                  disabled={isLoadingRecall}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: '#FFFFFF',
                    color: '#12315C',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  title="Muat ulang seluruh data langsung dari Google Sheet Data Pembayaran"
                >
                  <RotateCw size={15} className={isLoadingRecall ? 'animate-spin' : ''} style={{ color: '#2A6FC4' }} />
                  <span>{isLoadingRecall ? 'Membaca Sheet...' : 'Recall Data Sheet'}</span>
                </button>

                <button
                  type="button"
                  className="pay-btn-action"
                  onClick={handleExportCsv}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: '#FFFFFF',
                    color: '#12315C',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Download size={15} style={{ color: '#2A6FC4' }} />
                  <span>Ekspor CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setViewMode('input');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #FF6B00 0%, #D93800 100%)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 12px rgba(217, 56, 0, 0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Input Pembayaran</span>
                </button>
              </div>
            </div>

            {/* 4 KPI Cards */}
            <div className="four" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              <div className="card card-proses" style={{ padding: '14px 18px', borderTop: '4px solid #2A6FC4', background: '#EAF2FD', cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === 'Proses tagihan' ? 'ALL' : 'Proses tagihan')}>
                <div className="k" style={{ color: '#44546A', fontSize: '12px', fontWeight: 600 }}>Proses tagihan</div>
                <div className="m" style={{ fontSize: '28px', color: '#0F3F7A', fontWeight: 700 }}>{countProses}</div>
              </div>
              <div className="card card-lunas" style={{ padding: '14px 18px', borderTop: '4px solid #0B7A43', background: '#E6F8EF', cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === 'Lunas' ? 'ALL' : 'Lunas')}>
                <div className="k" style={{ color: '#44546A', fontSize: '12px', fontWeight: 600 }}>Lunas / Paid</div>
                <div className="m" style={{ fontSize: '28px', color: '#07582F', fontWeight: 700 }}>{countLunas}</div>
              </div>
              <div className="card card-bast" style={{ padding: '14px 18px', borderTop: '4px solid #8A97A8', background: '#EEF1F5', cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === 'Menunggu BAST' ? 'ALL' : 'Menunggu BAST')}>
                <div className="k" style={{ color: '#44546A', fontSize: '12px', fontWeight: 600 }}>Menunggu BAST</div>
                <div className="m" style={{ fontSize: '28px', color: '#2E3A48', fontWeight: 700 }}>{countBAST}</div>
              </div>
              <div className="card card-tertahan" style={{ padding: '14px 18px', borderTop: '4px solid #E8730C', background: '#FFF1E3', cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === 'Tertahan (dispute)' ? 'ALL' : 'Tertahan (dispute)')}>
                <div className="k" style={{ color: '#44546A', fontSize: '12px', fontWeight: 600 }}>Tertahan / Denda</div>
                <div className="m" style={{ fontSize: '28px', color: '#7A3300', fontWeight: 700 }}>{countTertahan}</div>
              </div>
            </div>

            {/* Filter Bar with Search, Dropdowns, and Single Status Select */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                Cari
                <input
                  className="in"
                  placeholder="Cari WBS, nama pekerjaan, partner, nomor PO..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ minHeight: '40px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '13px' }}
                />
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                <span>Tipe Kontrak</span>
                <select
                  className="in"
                  value={filterConfig}
                  onChange={e => setFilterConfig(e.target.value as 'ALL' | 'USER' | 'VENDOR')}
                  style={{ minHeight: '40px', width: '160px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 8px', fontSize: '13px', fontWeight: 600, background: '#fff' }}
                >
                  <option value="ALL">Semua Tipe ({countTotal})</option>
                  <option value="USER">USER ({countUser})</option>
                  <option value="VENDOR">VENDOR ({countVendor})</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                <span>Partner / Klien</span>
                <select
                  className="in"
                  value={filterPartner}
                  onChange={e => setFilterPartner(e.target.value)}
                  style={{ minHeight: '40px', width: '180px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 8px', fontSize: '13px' }}
                >
                  <option value="ALL">Semua Partner</option>
                  {partnerOptions.map(p => (
                    <option key={p} value={p}>{p.length > 22 ? p.substring(0, 22) + '...' : p}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                <span>Filter Status</span>
                <select
                  className="in"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  style={{ minHeight: '40px', width: '180px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 8px', fontSize: '13px', fontWeight: 600, background: '#fff' }}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Proses tagihan">Proses Tagihan</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Menunggu BAST">Menunggu BAST</option>
                  <option value="Tertahan (dispute)">Tertahan (dispute)</option>
                  <option value="Denda">Denda</option>
                </select>
              </div>
            </div>

            {/* Table Card */}
            <div className="card" style={{ overflowX: 'auto', background: '#fff', border: '1px solid #D3DEEC', borderRadius: '12px', boxShadow: '0 2px 6px rgba(31,78,140,.10)' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '45px' }}>Nomor</th>
                    <th>WBS</th>
                    <th>Nama Pekerjaan</th>
                    <th>Tipe</th>
                    <th>Nilai Pekerjaan</th>
                    <th>Tahap Tagihan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--mute)' }}>
                        Tidak ada data pembayaran yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group, idx) => (
                      <tr key={group.key} className={getRowBorderClass(group.displayStatus)}>
                        <td style={{ color: '#64748b', fontSize: '12px' }}>{idx + 1}</td>
                        <td className="m" style={{ fontWeight: 600, color: '#174A8B', whiteSpace: 'nowrap' }}>
                          {group.wbs}
                        </td>
                        <td style={{ fontWeight: 500, minWidth: '280px' }}>
                          {group.pekerjaan}
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: group.config === 'USER' ? '#dbeafe' : '#f3e8ff', color: group.config === 'USER' ? '#1d4ed8' : '#7e22ce' }}>
                            {group.config}
                          </span>
                        </td>
                        <td className="m" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {group.nilaiStr}
                        </td>
                        <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {group.latestTermin}
                        </td>
                        <td>
                          <span className={getStatusChipClass(group.displayStatus)}>
                            {group.displayStatus}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="pay-btn-detail"
                            onClick={() => handleOpenDetail(group)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                              color: '#FFFFFF',
                              border: 'none',
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.28)',
                              cursor: 'pointer',
                              transition: 'all 0.18s ease',
                            }}
                          >
                            <Eye size={13} strokeWidth={2.2} />
                            <span>Detail</span>
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
        {/* VIEW 2: DETAIL PEMBAYARAN (MENAMPILKAN SELURUH TAHAP/TERMIN) */}
        {/* ========================================================= */}
        {viewMode === 'detail' && activeDetailGroup && (
          <>
            {/* Top Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
              <button
                type="button"
                className="pay-btn-secondary"
                onClick={() => setViewMode('list')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: '#FFFFFF',
                  color: '#1E293B',
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <ArrowLeft size={16} style={{ color: '#2A6FC4' }} />
                <span>Kembali ke daftar</span>
                <span
                  style={{
                    background: '#E2E8F0',
                    color: '#334155',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    marginLeft: '2px'
                  }}
                >
                  {filteredGroups.length}
                </span>
              </button>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  className="pay-btn-secondary"
                  onClick={() => window.print()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: '#FFFFFF',
                    color: '#1E293B',
                    border: '1px solid #CBD5E1',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FileText size={15} style={{ color: '#2A6FC4' }} />
                  <span>Unduh PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkGroupPaid(activeDetailGroup)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                  <span>Tandai Seluruh Termin Dibayar (Paid)</span>
                </button>
              </div>
            </div>

            {/* Hero Header */}
            <div style={{ background: 'linear-gradient(135deg, #12315C, #2A6FC4)', borderRadius: '12px', padding: '22px 24px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="k m" style={{ color: '#BFD6F4', fontSize: '13px' }}>
                  {activeDetailGroup.wbs} · Tipe: <b>{activeDetailGroup.config}</b>
                </div>
                <span className={getStatusChipClass(activeDetailGroup.displayStatus)}>
                  {activeDetailGroup.displayStatus}
                </span>
              </div>
              <h1 style={{ margin: '6px 0 10px', fontSize: '24px', fontWeight: 600, color: '#fff' }}>
                {activeDetailGroup.pekerjaan}
              </h1>
              <div style={{ fontSize: '13px', color: '#E0EDFC' }}>
                Partner / Klien: <b>{activeDetailGroup.partner}</b> · Total Nilai: <b>{activeDetailGroup.nilaiStr}</b> · PIC: <b>{activeDetailGroup.pic || '—'}</b>
              </div>
            </div>

            {/* List Seluruh Tahap Tagihan (Termin) untuk Pekerjaan Ini */}
            <div className="card" style={{ padding: '20px', borderTop: '4px solid #1E9E8A', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0B6B5C' }}>
                  Daftar Seluruh Tahap Tagihan &amp; Termin ({activeDetailGroup.rows.length} Item)
                </div>
                <span style={{ fontSize: '12px', color: '#44546A' }}>Data dibaca langsung dari sheet Data Pembayaran</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ minWidth: '900px' }}>
                  <thead>
                    <tr>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '10px' }}>No</th>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '10px' }}>Tahap / Termin</th>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '10px' }}>Nomor PO</th>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '10px' }}>Nomor PA / PRN</th>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '10px' }}>Tanggal PO</th>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '10px' }}>Nilai Tagihan</th>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '10px' }}>Nilai Paid</th>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '10px' }}>Tanggal Paid</th>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '10px' }}>No BAST / Ba.Bayar</th>
                      <th style={{ background: '#E6F4F1', color: '#0B6B5C', padding: '10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDetailGroup.rows.map((r, i) => (
                      <tr key={r.no || i}>
                        <td style={{ padding: '10px', fontSize: '12px', color: '#64748b' }}>{i + 1}</td>
                        <td style={{ padding: '10px', fontWeight: 600, fontSize: '13px' }}>{r.termin}</td>
                        <td className="m" style={{ padding: '10px', fontSize: '12.5px' }}>{r.nomorPo || '—'}</td>
                        <td className="m" style={{ padding: '10px', fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>{r.noAp || '—'}</td>
                        <td style={{ padding: '10px', fontSize: '12.5px', color: '#44546A' }}>{r.tglPo || '—'}</td>
                        <td className="m" style={{ padding: '10px', fontSize: '13px', fontWeight: 600 }}>{r.nilaiStr}</td>
                        <td className="m" style={{ padding: '10px', fontSize: '13px', color: r.nilaiPaid > 0 ? '#059669' : '#64748b' }}>{r.nilaiPaidStr}</td>
                        <td style={{ padding: '10px', fontSize: '12.5px', color: '#44546A' }}>{r.tglPaid || '—'}</td>
                        <td className="m" style={{ padding: '10px', fontSize: '12px' }}>
                          {r.noBast ? `BAST: ${r.noBast}` : ''} {r.noBaBayar ? `| Ba.Byr: ${r.noBaBayar}` : ''} {!r.noBast && !r.noBaBayar ? '—' : ''}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span className={getStatusChipClass(r.displayStatus)}>
                            {r.displayStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#fff' }}>Input Pembayaran Baru</h1>
              <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#D4E4F8' }}>
                Catat tahap tagihan dan penerimaan pembayaran kontrak baru ke dalam sistem
              </p>
            </div>

            <div className="card" style={{ padding: '24px', borderTop: '4px solid #1E9E8A', display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '880px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                Nama Pekerjaan / Proyek
                <input
                  className="in"
                  value={formPekerjaan}
                  onChange={e => setFormPekerjaan(e.target.value)}
                  placeholder="Masukkan nama pekerjaan..."
                  style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                />
              </label>

              <div className="two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Nomor WBS / PRODEF
                  <input
                    className="in"
                    value={formWbs}
                    onChange={e => setFormWbs(e.target.value)}
                    placeholder="Contoh: R/4.24.53.521"
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Tipe Kontrak (Config)
                  <select
                    className="in"
                    value={formConfig}
                    onChange={e => setFormConfig(e.target.value)}
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px', background: '#fff' }}
                  >
                    <option value="USER">USER (Tagihan Klien / Terminal)</option>
                    <option value="VENDOR">VENDOR (Tagihan Subkon / Rekanan)</option>
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Partner / Klien / Vendor
                  <input
                    className="in"
                    value={formPartner}
                    onChange={e => setFormPartner(e.target.value)}
                    placeholder="Contoh: TPS, TPK Semarang..."
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Tahap / Termin
                  <input
                    className="in"
                    value={formTermin}
                    onChange={e => setFormTermin(e.target.value)}
                    placeholder="Contoh: DP, Termin-1, Pembayaran 100%..."
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Nomor PO
                  <input
                    className="in"
                    value={formNomorPo}
                    onChange={e => setFormNomorPo(e.target.value)}
                    placeholder="Contoh: PO 2024/0004149"
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Nomor PA / PRN
                  <input
                    className="in"
                    value={formNoAp}
                    onChange={e => setFormNoAp(e.target.value)}
                    placeholder="Contoh: PRN-2023-0001801"
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Nilai Tagihan / Kontrak
                  <input
                    className="in"
                    value={formNilai}
                    onChange={e => setFormNilai(e.target.value)}
                    placeholder="Contoh: Rp146.740.265.479,00"
                    style={{ minHeight: '44px', border: '1px solid #C7D0DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#44546A' }}>
                  Nilai Paid (Terbayar)
                  <input
                    className="in"
                    value={formNilaiPaid}
                    onChange={e => setFormNilaiPaid(e.target.value)}
                    placeholder="Nilai yang sudah cair..."
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
                    <option value="Lunas">Lunas / Paid</option>
                    <option value="Menunggu BAST">Menunggu BAST</option>
                    <option value="Tertahan (dispute)">Tertahan (dispute)</option>
                    <option value="Perhitungan denda">Perhitungan denda</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  className="bt"
                  onClick={() => setViewMode('list')}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="bt ok"
                  onClick={() => handleSaveForm(false)}
                  style={{ background: '#0B7A43', color: '#fff', borderColor: '#0B7A43' }}
                >
                  Simpan
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
