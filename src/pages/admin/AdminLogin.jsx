import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase/config'
import Alert from '../../components/Alert'
import Logo from '../../components/Logo'

// Admin login verifies the user exists in the `admins` collection (role-based).
// A regular student who logs in here is rejected and signed out.
export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
      const adminSnap = await getDoc(doc(db, 'admins', cred.user.uid))
      if (!adminSnap.exists()) {
        await signOut(auth)
        throw new Error('This account does not have admin access.')
      }
      navigate('/admin')
    } catch (err) {
      const map = {
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/user-not-found': 'No account found.',
        'auth/wrong-password': 'Incorrect password.',
      }
      setError(map[err.code] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex justify-center"><Logo className="text-4xl" /></div>
      <div className="card border-t-4 border-t-slate-800">
        <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-500">Restricted access — administrators only.</p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="label">Admin Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Alert type="error">{error}</Alert>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Verifying…' : 'Login as Admin'}
          </button>
        </form>
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">
        To create the first admin, see the README "Create an admin" section.
      </p>
    </div>
  )
}
