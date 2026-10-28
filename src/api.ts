import { writeStatusUpdateToSheet, getAccessToken } from './services/sheetsService';

export const API_URL: string =
  (import.meta as any).env?.VITE_API_URL ||
  'https://script.google.com/macros/s/ISI_URL_KAMU/exec';

export interface StatusUpdatePayload {
  no: number;
  wbs?: string;
  tanggal: string; // YYYY-MM-DD
  status: string; // Kolom H
  problem: string; // Kolom I
  actionPlan: string; // Kolom J
  catatan?: string; // Kolom K
}

export async function saveStatusUpdate(
  payload: StatusUpdatePayload,
  explicitToken?: string | null
): Promise<{ ok: boolean; targetRow?: number; error?: string }> {
  const token = explicitToken || (await getAccessToken());

  // 1. If we have a Google access token, write directly to Google Sheets API
  if (token) {
    const res = await writeStatusUpdateToSheet(
      {
        wbs: payload.wbs || '—',
        tanggal: payload.tanggal,
        status: payload.status,
        problem: payload.problem,
        actionPlan: payload.actionPlan,
        catatan: payload.catatan
      },
      token
    );
    if (res.ok) {
      return res;
    }
  }

  // 2. If an Apps Script or custom proxy URL is configured
  if (API_URL && !API_URL.includes('ISI_URL_KAMU')) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }

  // If no token and no custom endpoint
  if (!token) {
    return {
      ok: false,
      error: 'Harap masuk (Sign in with Google) untuk sinkronisasi ke Google Spreadsheet.'
    };
  }

  return { ok: false, error: 'Gagal memperbarui status ke Google Spreadsheet' };
}