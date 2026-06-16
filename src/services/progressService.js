// In-progress test auto-save. Lets a student resume an interrupted test and
// preserves their answers so an unsubmitted test isn't lost.
//
// The stored paper keeps the question id + the shuffled OPTION order only —
// never the correctAnswer — so a student reading their own progress doc can't
// see the answer key. Grading still happens against the live question bank.
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

const pid = (studentId, testId) => `${studentId}_${testId}`

export async function getProgress(studentId, testId) {
  const snap = await getDoc(doc(db, 'progress', pid(studentId, testId)))
  return snap.exists() ? snap.data() : null
}

// Create the initial progress record when a test starts.
// paper: [{ id, options }] — display order + shuffled options (no answer key).
export async function startProgress(studentId, testId, paper, startedAtMs) {
  return setDoc(doc(db, 'progress', pid(studentId, testId)), {
    studentId,
    testId,
    startedAtMs,
    order: paper.map((p) => p.id),
    options: Object.fromEntries(paper.map((p) => [p.id, p.options])),
    answers: {},
    updatedAt: serverTimestamp(),
  })
}

// Save the latest answers (called as the student answers questions).
export async function saveAnswers(studentId, testId, answers) {
  return setDoc(
    doc(db, 'progress', pid(studentId, testId)),
    { answers, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export async function deleteProgress(studentId, testId) {
  return deleteDoc(doc(db, 'progress', pid(studentId, testId)))
}
