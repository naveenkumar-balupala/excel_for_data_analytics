import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { changeOwnPassword } from '../services/studentService'
import Alert from './Alert'

// Blocking gate shown to students whose account was bulk-imported with their
// USN as the temporary password. They cannot use the app until they set a new
// password. Rendered globally so it covers every student route.
export default function ForcePasswordChange() {
  const { role, profile, refreshProfile, logout } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (role !== 'student' || !profile?.mustChangePassword) return null

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setSaving(true)
    try {
      await changeOwnPassword(password)
      await refreshProfile()
    } catch (err) {
      const map = {
        'auth/weak-password': 'Password is too weak (min 6 characters).',
        'auth/requires-recent-login': 'Please log out and log in again, then change your password.',
      }
      setError(map[err.code] || err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-800">Set a New Password</h3>
        <p className="mt-1 text-sm text-slate-500">
          Your temporary password is your USN. For security, please set a new password to continue.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Alert type="error">{error}</Alert>
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <button type="button" className="btn-secondary" onClick={logout} disabled={saving}>Logout</button>
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save & Continue'}</button>
        </div>
      </form>
    </div>
  )
}
