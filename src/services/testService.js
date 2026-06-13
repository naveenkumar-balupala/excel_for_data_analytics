// Test definition Firestore logic (admin creates/manages tests).
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COL = 'tests'

export async function createTest(data) {
  return addDoc(collection(db, COL), {
    totalQuestions: 30,
    isActive: true,
    resultsReleased: false, // students can't see scores/answers until admin releases
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function updateTest(id, data) {
  return updateDoc(doc(db, COL, id), data)
}

// Toggle whether students may view their results/answers for a test.
export async function setResultsReleased(id, released) {
  return updateDoc(doc(db, COL, id), { resultsReleased: !!released })
}

export async function deleteTest(id) {
  return deleteDoc(doc(db, COL, id))
}

export async function getTest(id) {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getAllTests() {
  const snap = await getDocs(collection(db, COL))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Active tests only — what a student sees on their dashboard.
export async function getActiveTests() {
  const q = query(collection(db, COL), where('isActive', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
