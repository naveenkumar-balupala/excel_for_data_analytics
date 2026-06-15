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

// A normalized identity for a question, used to detect duplicates and to make
// seeding idempotent. Same testType + day + question text => same question.
export function questionKey(q) {
  return `${q.testType}||${q.dayNumber ?? ''}||${(q.questionText || '').trim().toLowerCase()}`
}

// Remove duplicate questions, keeping the first of each identical set.
// Returns the number of duplicates deleted.
export async function removeDuplicateQuestions() {
  const all = await getAllQuestions()
  const seen = new Set()
  const dupes = []
  for (const q of all) {
    const key = questionKey(q)
    if (seen.has(key)) dupes.push(q.id)
    else seen.add(key)
  }
  // Delete in batches of 400 (Firestore batch limit is 500).
  for (let i = 0; i < dupes.length; i += 400) {
    const batch = writeBatch(db)
    dupes.slice(i, i + 400).forEach((id) => batch.delete(doc(db, COL, id)))
    await batch.commit()
  }
  return dupes.length
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
