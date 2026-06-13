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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser)
      if (fbUser) {
        // Determine role: check admins collection first, then students.
        const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid))
        if (adminSnap.exists()) {
          setRole('admin')
          setProfile({ id: fbUser.uid, ...adminSnap.data() })
        } else {
          const studentSnap = await getDoc(doc(db, 'students', fbUser.uid))
          if (studentSnap.exists()) {
            setRole('student')
            setProfile({ id: fbUser.uid, ...studentSnap.data() })
          } else {
            setRole(null)
            setProfile(null)
          }
        }
      } else {
        setRole(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const logout = () => signOut(auth)

  const value = { user, profile, role, loading, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
