// App-wide settings (single doc) that an admin can toggle, e.g. whether
// students may self-register or use the forgot-password flow.
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

const REF = () => doc(db, 'settings', 'app')

// Defaults are "open" so the app keeps working before the doc is created.
const DEFAULTS = { registrationOpen: true, forgotPasswordEnabled: true }

export async function getSettings() {
  try {
    const snap = await getDoc(REF())
    return snap.exists() ? { ...DEFAULTS, ...snap.data() } : { ...DEFAULTS }
  } catch (_) {
    // If the read is denied or offline, fall back to defaults so the public
    // login/register pages still render.
    return { ...DEFAULTS }
  }
}

// Admin only (enforced by Firestore rules). merge:true keeps other keys intact.
export async function updateSettings(patch) {
  await setDoc(REF(), { ...patch, updatedAt: serverTimestamp() }, { merge: true })
}
