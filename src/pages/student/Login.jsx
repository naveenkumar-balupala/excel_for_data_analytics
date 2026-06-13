import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginStudent } from '../../services/studentService'
import Alert from '../../components/Alert'

export default function Login() {
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

  return (
    <div className="mx-auto max-w-md">
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
          <Alert type="error">{error}</Alert>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
          <p className="text-center text-sm text-slate-500">
            New student? <Link to="/register" className="font-semibold text-brand">Register here</Link>
          </p>
          <p className="text-center text-xs text-slate-400">
            Admin? <Link to="/admin/login" className="underline">Admin login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
