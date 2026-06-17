// Student registration / profile Firestore logic.
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
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
  batch,
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
      batch: (batch || '').trim(),
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

// Admin: send a password-reset email to a student. (Directly setting another
// user's password needs the server Admin SDK, which a static site can't use;
// the email link lets the student set a new password securely themselves.)
export async function sendStudentPasswordReset(email) {
  return sendPasswordResetEmail(auth, email)
}

export async function getStudent(uid) {
  const snap = await getDoc(doc(db, 'students', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getAllStudents() {
  const snap = await getDocs(collection(db, 'students'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Admin: update a student's editable profile fields, and propagate the
// denormalized copies (name/branch/section/batch) stored on their attempts and
// results so statistics and result tables reflect the change immediately.
export async function updateStudent(id, data) {
  // USN change: maintain the `usns/{USN}` uniqueness index (re-key it) and
  // reject duplicates. USN is not denormalized onto attempts/results.
  if ('usn' in data) {
    const newUsn = (data.usn || '').trim().toUpperCase()
    if (!newUsn) throw new Error('USN cannot be empty.')
    const snap = await getDoc(doc(db, 'students', id))
    const oldUsn = snap.exists() ? snap.data().usn : null
    data = { ...data, usn: newUsn }
    if (newUsn !== oldUsn) {
      const newRef = doc(db, 'usns', newUsn)
      const existing = await getDoc(newRef)
      if (existing.exists() && existing.data().uid !== id) {
        throw new Error('Another student already uses this USN.')
      }
      await setDoc(newRef, { uid: id, usn: newUsn, createdAt: serverTimestamp() })
      if (oldUsn) {
        try { await deleteDoc(doc(db, 'usns', oldUsn)) } catch (_) { /* ignore */ }
      }
    }
  }

  // Email change: this updates the Firestore record only. The Firebase Auth
  // login email is NOT changed (that needs the server Admin SDK), so the
  // student still signs in with their original email.
  if ('email' in data) {
    data = { ...data, email: (data.email || '').trim().toLowerCase() }
  }

  await updateDoc(doc(db, 'students', id), data)

  const patch = {}
  if ('name' in data) patch.studentName = data.name
  if ('usn' in data) patch.usn = data.usn
  if ('branch' in data) patch.branch = data.branch
  if ('section' in data) patch.section = data.section
  if ('batch' in data) patch.batch = data.batch
  if (Object.keys(patch).length === 0) return

  // Best-effort: keep the denormalized copies in sync too. Display already
  // joins to the live student record, so a failure here is non-fatal.
  try {
    const updates = []
    const aSnap = await getDocs(query(collection(db, 'attempts'), where('studentId', '==', id)))
    aSnap.forEach((d) => updates.push(updateDoc(doc(db, 'attempts', d.id), patch)))
    const rSnap = await getDocs(query(collection(db, 'results'), where('studentId', '==', id)))
    rSnap.forEach((d) => updates.push(updateDoc(doc(db, 'results', d.id), patch)))
    await Promise.all(updates)
  } catch (err) {
    console.warn('Result denormalization sync skipped:', err?.message)
  }
}

// Admin: re-propagate every student's CURRENT name/branch/section/batch onto
// all their attempts and results. Fixes historical drift for students that
// were edited before per-edit cascading existed. Returns docs updated.
export async function syncResultsWithStudents() {
  const students = await getAllStudents()
  const sMap = {}
  students.forEach((s) => (sMap[s.id] = s))

  const updates = []
  const patchFrom = (s) => ({
    studentName: s.name ?? '',
    usn: s.usn ?? '',
    branch: s.branch ?? '',
    section: s.section ?? '',
    batch: s.batch ?? null,
  })

  const aSnap = await getDocs(collection(db, 'attempts'))
  aSnap.forEach((d) => {
    const s = sMap[d.data().studentId]
    if (s) updates.push(updateDoc(doc(db, 'attempts', d.id), patchFrom(s)))
  })
  const rSnap = await getDocs(collection(db, 'results'))
  rSnap.forEach((d) => {
    const s = sMap[d.data().studentId]
    if (s) updates.push(updateDoc(doc(db, 'results', d.id), patchFrom(s)))
  })

  await Promise.all(updates)
  return updates.length
}

// Admin: delete a student and all their data (USN claim, attempts, results).
// NOTE: this removes Firestore data only. The Firebase Authentication login
// record can't be deleted from the browser (needs the Admin SDK); remove it
// from Firebase Console -> Authentication -> Users if required.
export async function deleteStudent(student) {
  const deletes = []

  const aSnap = await getDocs(query(collection(db, 'attempts'), where('studentId', '==', student.id)))
  aSnap.forEach((d) => deletes.push(deleteDoc(doc(db, 'attempts', d.id))))

  const rSnap = await getDocs(query(collection(db, 'results'), where('studentId', '==', student.id)))
  rSnap.forEach((d) => deletes.push(deleteDoc(doc(db, 'results', d.id))))

  await Promise.all(deletes)

  if (student.usn) await deleteDoc(doc(db, 'usns', student.usn))
  await deleteDoc(doc(db, 'students', student.id))
}
