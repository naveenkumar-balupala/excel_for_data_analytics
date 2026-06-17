import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getActiveTests } from '../../services/testService'
import { getStudentAttempts } from '../../services/attemptService'
import Loader from '../../components/Loader'
import Alert from '../../components/Alert'

export default function Dashboard() {
  const { profile } = useAuth()
  const [tests, setTests] = useState([])
  const [attempts, setAttempts] = useState({}) // testId -> attempt
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile) return
    ;(async () => {
      try {
        const [t, a] = await Promise.all([
          getActiveTests(),
          getStudentAttempts(profile.id),
        ])
        // sort: Pre-Assessment, Day-wise (by day), Grand
        const order = { 'Pre-Assessment': 0, 'Day-wise Test': 1, 'Grand Test': 2 }
        t.sort((x, y) =>
          (order[x.testType] - order[y.testType]) || ((x.dayNumber || 0) - (y.dayNumber || 0)))
        setTests(t)
        const map = {}
        a.forEach((att) => (map[att.testId] = att))
        setAttempts(map)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [profile])

  if (loading) return <Loader message="Loading your tests…" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {profile?.name}</h1>
        <p className="text-sm text-slate-500">
          {profile?.usn} · {profile?.branch} · Section {profile?.section}
        </p>
      </div>

      <Alert type="error">{error}</Alert>

      {tests.length === 0 ? (
        <div className="card text-center text-slate-500">No active tests are available right now.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => {
            const attempt = attempts[test.id]
            const done = attempt && attempt.submittedAt
            return (
              <div key={test.id} className="card flex flex-col justify-between">
                <div>
                  <span className="badge bg-brand/10 text-brand">{test.testType}</span>
                  <h3 className="mt-2 font-semibold text-slate-800">{test.testTitle}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {test.totalQuestions} questions · {test.duration} min
                  </p>
                </div>
                <div className="mt-4">
                  {done ? (
                    test.resultsReleased ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Your score</span>
                          <span className="font-bold text-slate-800">{attempt.percentage}%</span>
                        </div>
                        <Link to={`/result/${test.id}`} className="btn-secondary w-full">View Result</Link>
                        <p className="text-center">
                          <span className="badge bg-slate-100 text-slate-600">Completed · 1 attempt only</span>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-center">
                        <span className="badge bg-green-100 text-green-700">Submitted</span>
                        <p className="text-xs text-slate-500">
                          Your result will be available once the admin releases it.
                        </p>
                      </div>
                    )
                  ) : (
                    <Link to={`/test/${test.id}/instructions`} className="btn-primary w-full">Start Test</Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
