// Batch management (e.g. "2024-2027"). Admin creates batches; students pick
// one at registration so results can be grouped per batch.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COL = 'batches'

export async function createBatch(name) {
  return addDoc(collection(db, COL), { name: name.trim(), createdAt: serverTimestamp() })
}

export async function deleteBatch(id) {
  return deleteDoc(doc(db, COL, id))
}

export async function getAllBatches() {
  const snap = await getDocs(collection(db, COL))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}
