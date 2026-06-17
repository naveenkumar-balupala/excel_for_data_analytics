import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

// useAuth() exposes the current Firebase user, their app profile and role.
// role is one of: 'student' | 'admin' | null
export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // firebase auth user
  const [profile, setProfile] = useState(null) // firestore student/admin doc
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Resolve role + profile for a given Firebase user (admins take precedence).
  const resolveProfile = async (fbUser) => {
    if (!fbUser) { setRole(null); setProfile(null); return }
    const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid))
    if (adminSnap.exists()) {
      setRole('admin')
      setProfile({ id: fbUser.uid, ...adminSnap.data() })
      return
    }
    const studentSnap = await getDoc(doc(db, 'students', fbUser.uid))
    if (studentSnap.exists()) {
      setRole('student')
      setProfile({ id: fbUser.uid, ...studentSnap.data() })
    } else {
      setRole(null)
      setProfile(null)
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser)
      await resolveProfile(fbUser)
      setLoading(false)
    })
    return unsub
  }, [])

  // Re-read the current user's profile (e.g. after a forced password change).
  const refreshProfile = () => resolveProfile(auth.currentUser)

  const logout = () => signOut(auth)

  const value = { user, profile, role, loading, logout, refreshProfile }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
