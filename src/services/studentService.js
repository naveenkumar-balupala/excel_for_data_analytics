// Student registration / profile Firestore logic.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
} from 'firebase/auth'
import { auth, db } from '../firebase/config'

// Register a new student.
// Order matters for security rules: we create the Auth account FIRST (which
// also enforces unique email), so the user is signed in before we touch
// Firestore. Duplicate USN is then checked with a single-document read on the
// `usns` index collection (doc id = USN) — collection queries are not allowed
// for non-admins, so a read-by-id is the rules-friendly approach.
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

  // 1. Create the auth account (throws auth/email-already-in-use on dup email).
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
  const uid = cred.user.uid

  try {
    // 2. Duplicate-USN check via single-doc read.
    const usnRef = doc(db, 'usns', normalizedUsn)
    if ((await getDoc(usnRef)).exists()) {
      throw new Error('A student with this USN is already registered.')
    }

    // 3. Write the profile and claim the USN.
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
    await setDoc(usnRef, { uid, usn: normalizedUsn, createdAt: serverTimestamp() })
  } catch (err) {
    // Roll back the half-created auth user so the email can be reused on retry.
    try { await deleteUser(cred.user) } catch (_) { /* ignore */ }
    throw err
  }

  // 4. Sign out so the student explicitly logs in (per the spec flow).
  await signOut(auth)
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
