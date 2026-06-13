// Question bank Firestore logic (admin CRUD + querying for tests).
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COL = 'questions'

export async function addQuestion(data) {
  return addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() })
}

export async function updateQuestion(id, data) {
  return updateDoc(doc(db, COL, id), data)
}

export async function deleteQuestion(id) {
  return deleteDoc(doc(db, COL, id))
}

export async function getAllQuestions() {
  const snap = await getDocs(collection(db, COL))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Fetch questions matching a test type (and optional day number).
export async function getQuestionsForTest(testType, dayNumber = null) {
  let q
  if (testType === 'Day-wise Test' && dayNumber != null) {
    q = query(
      collection(db, COL),
      where('testType', '==', testType),
      where('dayNumber', '==', Number(dayNumber)),
    )
  } else {
    q = query(collection(db, COL), where('testType', '==', testType))
  }
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Bulk insert (used by the sample-data seeder).
export async function bulkAddQuestions(questions) {
  const batch = writeBatch(db)
  questions.forEach((qn) => {
    const ref = doc(collection(db, COL))
    batch.set(ref, { ...qn, createdAt: serverTimestamp() })
  })
  await batch.commit()
  return questions.length
}
