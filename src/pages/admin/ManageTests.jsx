import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteTest, getAllTests, updateTest, setResultsReleased } from '../../services/testService'
import { getAllAttempts } from '../../services/attemptService'
import Loader from '../../components/Loader'
import ConfirmModal from '../../components/ConfirmModal'

export default function ManageTests() {
  const [tests, setTests] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  const load = async () => {
    const [t, a] = await Promise.all([getAllTests(), getAllAttempts()])
    setTests(t)
    setAttempts(a)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const attemptsByTest = useMemo(() => {
    const map = {}
    attempts.forEach((a) => (map[a.testId] = (map[a.testId] || 0) + 1))
    return map
  }, [attempts])

  const toggleActive = async (test) => {
    await updateTest(test.id, { isActive: !test.isActive })
    load()
  }

  const toggleResults = async (test) => {
    await setResultsReleased(test.id, !test.resultsReleased)
    load()
  }

  const confirmDelete = async () => {
    await deleteTest(deleteId)
    setDeleteId(null)
    load()
  }

  if (loading) return <Loader />

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Manage Tests ({tests.length})</h1>
        <Link to="/admin/create-test" className="btn-primary">+ Create Test</Link>
      </div>

      <p className="mb-2 text-xs text-slate-400 sm:hidden">Swipe the table sideways to see more columns →</p>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Title</th><th>Type</th><th>Day</th><th>Qs</th><th>Duration</th><th>Attempts</th><th>Status</th><th>Results</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="py-2 font-medium">{t.testTitle}</td>
                <td>{t.testType}</td>
                <td>{t.dayNumber || '—'}</td>
                <td>{t.totalQuestions}</td>
                <td>{t.duration} min</td>
                <td><span className="badge bg-brand/10 text-brand">{attemptsByTest[t.id] || 0}</span></td>
                <td>
                  <span className={`badge ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${t.resultsReleased ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {t.resultsReleased ? 'Released' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-secondary" onClick={() => toggleActive(t)}>
                      {t.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className={t.resultsReleased ? 'btn-secondary' : 'btn-primary'}
                      onClick={() => toggleResults(t)}
                    >
                      {t.resultsReleased ? 'Hide Results' : 'Release Results'}
                    </button>
                    <button className="btn-danger" onClick={() => setDeleteId(t.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {tests.length === 0 && (
              <tr><td colSpan={9} className="py-6 text-center text-slate-400">No tests yet. Create one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Delete Test?"
        message="Students will no longer see this test. Existing results are kept."
        confirmText="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
