import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const SPREADSHEET_ID = '18YFMzpZQ6wcxnPPFeRdOOfy4pxgpHQtmKDPJfxfWRLc';
export const SHEET_NAME = 'Detail Project Catatan';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

// In-memory token cache (strictly memory-only, not in localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

// Auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    cachedUser = user;
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google.');
    }
    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentUser = (): User | null => {
  return cachedUser;
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
};

export interface SheetUpdateData {
  wbs: string;
  tanggal: string; // YYYY-MM-DD or DD/MM/YYYY
  status: string; // Kolom I
  problem: string; // Kolom J
  actionPlan: string; // Kolom K
  catatan?: string; // Kolom L
}

/**
 * Writes or appends status update to the 'Detail Project Catatan' sheet:
 * - Nomor WBS = Kolom A (A2:A)
 * - Tanggal Update = Kolom C (C2:C)
 * - Status = Kolom H (H2:H)
 * - Problem = Kolom I (I2:I)
 * - Action Plan = Kolom J (J2:J)
 * - Catatan Perubahan (opsional) = Kolom K (K2:K)
 * Preserves formula columns (B, D, E, F, G).
 */
let cachedSheetId: number | null = null;

async function getSheetId(accessToken: string): Promise<number> {
  if (cachedSheetId !== null) return cachedSheetId;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties(sheetId,title)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Gagal membaca info sheet (${res.status})`);
  const json = await res.json();
  const s = json.sheets?.find((x: any) => x.properties.title === SHEET_NAME);
  if (!s) throw new Error(`Sheet '${SHEET_NAME}' tidak ditemukan`);
  cachedSheetId = s.properties.sheetId as number;
  return cachedSheetId;
}

async function insertRowAfter(afterRow: number, accessToken: string) {
  const sheetId = await getSheetId(accessToken);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            insertDimension: {
              range: { sheetId, dimension: 'ROWS', startIndex: afterRow, endIndex: afterRow + 1 },
              inheritFromBefore: true
            }
          },
          {
            copyPaste: {
              source: { sheetId, startRowIndex: afterRow - 1, endRowIndex: afterRow, startColumnIndex: 1, endColumnIndex: 8 },
              destination: { sheetId, startRowIndex: afterRow, endRowIndex: afterRow + 1, startColumnIndex: 1, endColumnIndex: 8 },
              pasteType: 'PASTE_FORMULA'
            }
          }
        ]
      })
    }
  );
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error?.message || `Gagal menyisipkan baris (${res.status})`);
  }
}
export async function writeStatusUpdateToSheet(
  data: SheetUpdateData,
  accessToken: string
): Promise<{ ok: boolean; targetRow: number; error?: string }> {
  try {
    // 1. Fetch current rows in A2:C to find the target row
    const getRangeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${encodeURIComponent(
      SHEET_NAME
    )}'!A2:C`;

    const getRes = await fetch(getRangeUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!getRes.ok) {
      const errJson = await getRes.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Gagal membaca sheet (${getRes.status})`);
    }

    const getData = await getRes.json();
    const rows: string[][] = getData.values || [];

    let placeholderRow = -1;
let lastSameWbsRow = -1;
let emptySlotRow = -1;

for (let i = 0; i < rows.length; i++) {
  const rowNum = i + 2;
  const rowWbs = (rows[i]?.[0] || '').trim();
  const rowDate = (rows[i]?.[2] || '').trim();

  if (rowWbs === data.wbs) {
    lastSameWbsRow = rowNum;
    if (!rowDate && placeholderRow === -1) placeholderRow = rowNum;
  }
  if (!rowWbs && !rowDate && emptySlotRow === -1) emptySlotRow = rowNum;
}

let targetRow: number;
if (placeholderRow !== -1) {
  targetRow = placeholderRow;
} else if (lastSameWbsRow !== -1) {
  targetRow = lastSameWbsRow + 1;
  await insertRowAfter(lastSameWbsRow, accessToken);
} else if (emptySlotRow !== -1) {
  targetRow = emptySlotRow;
} else {
  targetRow = rows.length + 2;
}

    // 2. Batch update target row: WBS (A), Tanggal (C), Status (H), Problem (I), Action Plan (J), Catatan (K)
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchUpdate`;

    const batchBody = {
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: `'${SHEET_NAME}'!A${targetRow}`,
          values: [[data.wbs]]
        },
        {
          range: `'${SHEET_NAME}'!C${targetRow}`,
          values: [[data.tanggal]]
        },
        {
          range: `'${SHEET_NAME}'!I${targetRow}:L${targetRow}`,
          values: [[data.status, data.problem, data.actionPlan, data.catatan || '']]
        }
      ]
    };

    const putRes = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batchBody)
    });

    if (!putRes.ok) {
      const errJson = await putRes.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Gagal menulis ke sheet (${putRes.status})`);
    }

    return { ok: true, targetRow };
  } catch (err: any) {
    console.error('writeStatusUpdateToSheet error:', err);
    return { ok: false, targetRow: 0, error: err.message || 'Terjadi kesalahan jaringan' };
  }
}

export async function deleteStatusRowFromSheet(
  data: { wbs: string; status: string; problem: string; actionPlan: string },
  accessToken: string
): Promise<{ ok: boolean; deletedRow?: number; notFound?: boolean; error?: string }> {
  try {
    const norm = (s?: string) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();

    const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${encodeURIComponent(
      SHEET_NAME
    )}'!A2:L`;
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!getRes.ok) throw new Error(`Gagal membaca sheet (${getRes.status})`);
    const rows: string[][] = (await getRes.json()).values || [];

    // Cari dari bawah (data terbaru dulu): A=WBS, I=Status, J=Problem, K=Action Plan
    let targetRow = -1;
    for (let i = rows.length - 1; i >= 0; i--) {
      const r = rows[i] || [];
      if (
        norm(r[0]) === norm(data.wbs) &&
        norm(r[8]) === norm(data.status) &&
        norm(r[9]) === norm(data.problem) &&
        norm(r[10]) === norm(data.actionPlan)
      ) {
        targetRow = i + 2;
        break;
      }
    }
    if (targetRow === -1) return { ok: false, notFound: true };

    const sheetId = await getSheetId(accessToken);
    const delRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              deleteDimension: {
                range: { sheetId, dimension: 'ROWS', startIndex: targetRow - 1, endIndex: targetRow }
              }
            }
          ]
        })
      }
    );
    if (!delRes.ok) {
      const e = await delRes.json().catch(() => ({}));
      throw new Error(e.error?.message || `Gagal menghapus baris (${delRes.status})`);
    }
    return { ok: true, deletedRow: targetRow };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Terjadi kesalahan jaringan' };
  }
}
