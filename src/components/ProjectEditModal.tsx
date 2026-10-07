import React, { useState, useEffect } from 'react';
import { ProjectItem, ProjectStatus } from '../types';
import { normalizeStatus } from '../utils/helpers';
import { X, Save, Trash2, Plus } from 'lucide-react';

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem | null;
  onSave: (savedProject: ProjectItem) => void;
  onDelete?: (projectNo: number) => void;
  nextNo: number;
}

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
  onDelete,
  nextNo
}) => {
  const [formData, setFormData] = useState<Partial<ProjectItem>>({});

  useEffect(() => {
    if (project) {
      setFormData({ ...project });
    } else {
      setFormData({
        n: nextNo,
        nm: '',
        wbs: '',
        v: 5000000000,
        ow: 'PT Pelindo Terminal Petikemas',
        g: 'Pelindo TPK (semua cabang)',
        kelompok_status: 'ON GOING',
        bm: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        ak: '31 Desember 2026',
        ak_terkini: '31 Desember 2026',
        pl: 0.5,
        rl: 0.45,
        dv: -0.05,
        st: 'ON TRACK',
        s: 'ON TRACK',
        si: '',
        mi: '',
        ls: ''
      });
    }
  }, [project, nextNo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nm) return;

    const plNum = formData.pl != null ? Number(formData.pl) : null;
    const rlNum = formData.rl != null ? Number(formData.rl) : null;
    let dvNum = formData.dv != null ? Number(formData.dv) : null;
    if (plNum != null && rlNum != null && !isNaN(plNum) && !isNaN(rlNum)) {
      dvNum = Number((rlNum - plNum).toFixed(4));
    }

    const normStatus = normalizeStatus(formData.st || 'ON TRACK');

    const finalItem: ProjectItem = {
      n: formData.n || nextNo,
      nm: formData.nm,
      wbs: formData.wbs || '',
      v: Number(formData.v) || 0,
      ow: formData.ow || 'PT Pelindo',
      g: formData.g || 'Pelindo TPK (semua cabang)',
      kelompok_status: formData.kelompok_status || 'ON GOING',
      bm: formData.bm || '-',
      ak: formData.ak || '-',
      ak_terkini: formData.ak_terkini || formData.ak || '-',
      pl: plNum,
      rl: rlNum,
      dv: dvNum,
      st: formData.st || 'ON TRACK',
      s: normStatus,
      si: formData.si || '-',
      mi: formData.mi || '-',
      ls: formData.ls || '-'
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {project ? (
              <span className="font-bold text-base text-slate-800 dark:text-white">
                Edit Proyek #{project.n}
              </span>
            ) : (
              <span className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-500" /> Tambah Proyek Baru
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Project *
            </label>
            <textarea
              required
              rows={2}
              value={formData.nm || ''}
              onChange={e => setFormData({ ...formData, nm: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Elektrifikasi RTG di Terminal Petikemas..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nilai Pekerjaan (Rupiah) *
              </label>
              <input
                type="number"
                required
                value={formData.v ?? ''}
                onChange={e => setFormData({ ...formData, v: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Grup Pemilik
              </label>
              <select
                value={formData.g || ''}
                onChange={e => setFormData({ ...formData, g: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Pelindo TPK (semua cabang)">Pelindo TPK (semua cabang)</option>
                <option value="Pelindo Multi Terminal">Pelindo Multi Terminal</option>
                <option value="TPK Surabaya">TPK Surabaya</option>
                <option value="Prima Terminal Petikemas">Prima Terminal Petikemas</option>
                <option value="IPC Terminal Petikemas">IPC Terminal Petikemas</option>
                <option value="Terminal Teluk Lamong">Terminal Teluk Lamong</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pemilik Pekerjaan (Lengkap)
              </label>
              <input
                type="text"
                value={formData.ow || ''}
                onChange={e => setFormData({ ...formData, ow: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Proyek
              </label>
              <select
                value={formData.st || 'ON TRACK'}
                onChange={e => {
                  const s = e.target.value;
                  setFormData({ ...formData, st: s, s: normalizeStatus(s) });
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="ON TRACK">ON TRACK</option>
                <option value="AT RISK">AT RISK</option>
                <option value="DELAYED">DELAYED</option>
                <option value="DONE (ON TRACK)">DONE (ON TRACK)</option>
                <option value="DONE (DELAYED)">DONE (DELAYED)</option>
                <option value="DONE">DONE / SELESAI</option>
                <option value="ACTIVE">ACTIVE (PO/SP3 Release)</option>
                <option value="LELANG / AANWIJZING">LELANG / AANWIJZING</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rencana (0.0 - 1.0)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.pl ?? ''}
                onChange={e => setFormData({ ...formData, pl: e.target.value === '' ? null : parseFloat(e.target.value) })}
                placeholder="Mis. 0.85 (85%)"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Realisasi (0.0 - 1.0)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.rl ?? ''}
                onChange={e => setFormData({ ...formData, rl: e.target.value === '' ? null : parseFloat(e.target.value) })}
                placeholder="Mis. 0.80 (80%)"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deviasi (Otomatis: Real - Plan)
              </label>
              <input
                type="text"
                disabled
                value={
                  formData.pl != null && formData.rl != null
                    ? `${((formData.rl - formData.pl) * 100).toFixed(1)}%`
                    : '-'
                }
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                BAMK
              </label>
              <input
                type="text"
                value={formData.bm || ''}
                onChange={e => setFormData({ ...formData, bm: e.target.value })}
                placeholder="25 Juli 2024"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Akhir Kontrak
              </label>
              <input
                type="text"
                value={formData.ak || ''}
                onChange={e => setFormData({ ...formData, ak: e.target.value })}
                placeholder="31 Maret 2026"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Situasi Proyek
            </label>
            <textarea
              rows={2}
              value={formData.si || ''}
              onChange={e => setFormData({ ...formData, si: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Catatan kemajuan, hambatan, koordinasi..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mitigasi
            </label>
            <textarea
              rows={2}
              value={formData.mi || ''}
              onChange={e => setFormData({ ...formData, mi: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Langkah perbaikan, percepatan..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Learning Stop / Rekomendasi
            </label>
            <textarea
              rows={2}
              value={formData.ls || ''}
              onChange={e => setFormData({ ...formData, ls: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              placeholder="Pelajaran penting untuk proyek mendatang..."
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {project && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus proyek #${project.n}: "${project.nm}"?`)) {
                    onDelete(project.n);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-1.5 transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            ) : <span />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
