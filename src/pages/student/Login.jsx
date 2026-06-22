import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginStudent, sendStudentPasswordReset } from '../../services/studentService'
import { getSettings } from '../../services/settingsService'
import Alert from '../../components/Alert'
import Logo from '../../components/Logo'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [settings, setSettings] = useState({ registrationOpen: true, forgotPasswordEnabled: true })
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' })
  const [forgotSending, setForgotSending] = useState(false)

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginStudent(email, password)
      navigate('/dashboard')
    } catch (err) {
      const map = {
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
      }
      setError(map[err.code] || err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendReset = async (e) => {
    e.preventDefault()
    setForgotMsg({ type: '', text: '' })
    setForgotSending(true)
    try {
      await sendStudentPasswordReset(forgotEmail)
      setForgotMsg({ type: 'success', text: `If an account exists for ${forgotEmail}, a reset link has been sent.` })
    } catch (err) {
      const map = { 'auth/invalid-email': 'Enter a valid email address.' }
      setForgotMsg({ type: 'error', text: map[err.code] || err.message })
    } finally {
      setForgotSending(false)
    }
  }

  const openForgot = () => {
    setForgotEmail(email)
    setForgotMsg({ type: '', text: '' })
    setForgotOpen(true)
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex justify-center"><Logo className="text-4xl" /></div>
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-800">Student Login</h1>
        <p className="mt-1 text-sm text-slate-500">Login to view and take your tests.</p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {settings.forgotPasswordEnabled && (
            <div className="text-right">
              <button type="button" onClick={openForgot} className="text-xs font-semibold text-brand hover:underline">
                Forgot password?
              </button>
            </div>
          )}
          <Alert type="error">{error}</Alert>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
          {settings.registrationOpen && (
            <p className="text-center text-sm text-slate-500">
              New student? <Link to="/register" className="font-semibold text-brand">Register here</Link>
            </p>
          )}
          <p className="text-center text-xs text-slate-400">
            Admin? <Link to="/admin/login" className="underline">Admin login</Link>
          </p>
        </form>
      </div>

      {/* ---- Forgot password modal ---- */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !forgotSending && setForgotOpen(false)}>
          <form onSubmit={sendReset} role="dialog" aria-modal="true" className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800">Reset Password</h3>
            <p className="mt-1 text-sm text-slate-500">
              Enter your registered email and we'll send a link to set a new password.
            </p>
            <div className="mt-4">
              <label className="label">Email</label>
              <input className="input" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} autoFocus />
            </div>
            {forgotMsg.text && <div className="mt-3"><Alert type={forgotMsg.type}>{forgotMsg.text}</Alert></div>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setForgotOpen(false)} disabled={forgotSending}>Close</button>
              <button className="btn-primary" disabled={forgotSending || !forgotEmail}>
                {forgotSending ? 'Sending…' : 'Send reset link'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
