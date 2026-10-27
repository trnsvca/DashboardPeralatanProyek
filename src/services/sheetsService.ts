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
  problem: string;
  actionPlan: string;
  catatan?: string;
}

/**
 * Writes or appends status update to the 'Detail Project Catatan' sheet:
 * - Nomor WBS = Kolom A (A2:A)
 * - Tanggal Update = Kolom C (C2:C)
 * - Problem = Kolom I (I2:I)
 * - Action Plan = Kolom J (J2:J)
 * - Catatan Perubahan (opsional) = Kolom K (K2:K)
 * Preserves formula columns (B, D, E, F, G, H).
 */
export async function writeStatusUpdateToSheet(
  data: SheetUpdateData,
  accessToken: string
): Promise<{ ok: boolean; targetRow: number; error?: string }> {
  try {
    // 1. Fetch current rows in A2:C to find the target row
    const getRangeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${encodeURIComponent(
      SHEET_NAME
    )}'!A2:C200`;

    const getRes = await fetch(getRangeUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!getRes.ok) {
      const errJson = await getRes.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Gagal membaca sheet (${getRes.status})`);
    }

    const getData = await getRes.json();
    const rows: string[][] = getData.values || [];

    // Find the best target row:
    // Check if row 2 has matching WBS and empty Tanggal (initial placeholder row)
    let targetRow = 2;
    let found = false;

    // Check if there is an empty row or matching row
    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const rowWbs = rows[i] ? (rows[i][0] || '').trim() : '';
      const rowDate = rows[i] && rows[i].length > 2 ? (rows[i][2] || '').trim() : '';

      // If row has matching WBS and date is empty, use it
      if (rowWbs === data.wbs && !rowDate) {
        targetRow = rowNum;
        found = true;
        break;
      }

      // If row has both WBS and date empty, this is the next free slot
      if (!rowWbs && !rowDate) {
        targetRow = rowNum;
        found = true;
        break;
      }
    }

    if (!found) {
      targetRow = rows.length + 2;
    }

    // 2. Batch update target row without overwriting formula columns B, D, E, F, G, H
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
          range: `'${SHEET_NAME}'!I${targetRow}:K${targetRow}`,
          values: [[data.problem, data.actionPlan, data.catatan || '']]
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
