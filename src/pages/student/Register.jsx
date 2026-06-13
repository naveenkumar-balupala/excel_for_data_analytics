import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerStudent } from '../../services/studentService'
import Alert from '../../components/Alert'

const BRANCHES = ['CSE', 'ISE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIML', 'Other']
const SECTIONS = ['A', 'B', 'C', 'D']

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', usn: '', email: '', phone: '', branch: 'CSE', section: 'A', password: '', confirm: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.'
    if (!/^[A-Za-z0-9]+$/.test(form.usn.trim())) return 'Enter a valid USN / Roll number.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Enter a valid email address.'
    if (!/^\d{10}$/.test(form.phone.trim())) return 'Phone number must be 10 digits.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const v = validate()
    if (v) return setError(v)

    setLoading(true)
    try {
      await registerStudent(form)
      setSuccess('Registration successful! Redirecting to login…')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      // Friendly messages for common Firebase Auth errors.
      const map = {
        'auth/email-already-in-use': 'This email is already registered. Please login.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak (min 6 characters).',
      }
      setError(map[err.code] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-800">Student Registration</h1>
        <p className="mt-1 text-sm text-slate-500">Register once to access all tests.</p>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={set('name')} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="label">USN / Roll Number</label>
            <input className="input" value={form.usn} onChange={set('usn')} placeholder="1XX21CS001" />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" value={form.phone} onChange={set('phone')} placeholder="9876543210" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Email ID</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" />
          </div>
          <div>
            <label className="label">Branch</label>
            <select className="input" value={form.branch} onChange={set('branch')}>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Section</label>
            <select className="input" value={form.section} onChange={set('section')}>
              {SECTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={set('password')} />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input className="input" type="password" value={form.confirm} onChange={set('confirm')} />
          </div>

          <div className="sm:col-span-2 space-y-3">
            <Alert type="error">{error}</Alert>
            <Alert type="success">{success}</Alert>
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Registering…' : 'Register'}
            </button>
            <p className="text-center text-sm text-slate-500">
              Already registered? <Link to="/login" className="font-semibold text-brand">Login here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
