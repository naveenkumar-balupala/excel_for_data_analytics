import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, role } = useAuth()

  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-10 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-light">Skill Sprint · TORII</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Excel for Data Analytics</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Online assessment platform for Pre-Assessment, Day-wise Tests and the Grand Test.
          Register once, attempt each test a single time, and get instant topic-wise feedback.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {user ? (
            <Link to={role === 'admin' ? '/admin' : '/dashboard'} className="btn-primary">
              Go to {role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary">Register</Link>
              <Link to="/login" className="btn-secondary">Student Login</Link>
              <Link to="/admin/login" className="btn-secondary">Admin Login</Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { t: 'Pre-Assessment', d: 'Gauge your starting Excel level.' },
          { t: 'Day-wise Tests', d: '6 days · 1-hour test each day on that day\'s topics.' },
          { t: 'Grand Test', d: 'Full-syllabus final assessment.' },
        ].map((c) => (
          <div key={c.t} className="card">
            <h3 className="font-semibold text-slate-800">{c.t}</h3>
            <p className="mt-1 text-sm text-slate-500">{c.d}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
