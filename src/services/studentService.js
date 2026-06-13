// Student registration / profile Firestore logic.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase/config'

// Returns true if a student with this USN already exists.
export async function usnExists(usn) {
  const q = query(collection(db, 'students'), where('usn', '==', usn.trim().toUpperCase()))
  const snap = await getDocs(q)
  return !snap.empty
}

// Register a new student: creates a Firebase Auth user + a students/{uid} doc.
// Throws on duplicate USN/email or weak password.
export async function registerStudent({
  name,
  usn,
  email,
  phone,
  branch,
  section,
  password,
}) {
  const normalizedUsn = usn.trim().toUpperCase()

  // Duplicate USN check (email duplicates are caught by Firebase Auth).
  if (await usnExists(normalizedUsn)) {
    throw new Error('A student with this USN is already registered.')
  }

  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
  const uid = cred.user.uid

  await setDoc(doc(db, 'students', uid), {
    name: name.trim(),
    usn: normalizedUsn,
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    branch: branch.trim(),
    section: section.trim().toUpperCase(),
    role: 'student',
    createdAt: serverTimestamp(),
  })

  return uid
}

export async function loginStudent(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password)
}

export async function getStudent(uid) {
  const snap = await getDoc(doc(db, 'students', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getAllStudents() {
  const snap = await getDocs(collection(db, 'students'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
