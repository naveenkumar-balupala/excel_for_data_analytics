import { useEffect, useMemo, useState } from 'react'
import { getAllAttempts } from '../../services/attemptService'
import { exportToCSV, exportToExcel } from '../../utils/export'
import Loader from '../../components/Loader'

export default function ViewResults() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [testType, setTestType] = useState('All')
  const [branch, setBranch] = useState('All')
  const [section, setSection] = useState('All')
  const [minScore, setMinScore] = useState('')
  const [maxScore, setMaxScore] = useState('')

  useEffect(() => {
    getAllAttempts().then((a) => {
      setAttempts(a.filter((x) => x.attempted))
      setLoading(false)
    })
  }, [])

  const testTypes = ['All', ...new Set(attempts.map((a) => a.testType).filter(Boolean))]
  const branches = ['All', ...new Set(attempts.map((a) => a.branch).filter(Boolean))]
  const sections = ['All', ...new Set(attempts.map((a) => a.section).filter(Boolean))]

  const filtered = useMemo(() => attempts.filter((a) => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.studentName?.toLowerCase().includes(q) || a.usn?.toLowerCase().includes(q)
    const matchType = testType === 'All' || a.testType === testType
    const matchBranch = branch === 'All' || a.branch === branch
    const matchSection = section === 'All' || a.section === section
    const p = a.percentage ?? 0
    const matchMin = minScore === '' || p >= Number(minScore)
    const matchMax = maxScore === '' || p <= Number(maxScore)
    return matchSearch && matchType && matchBranch && matchSection && matchMin && matchMax
  }), [attempts, search, testType, branch, section, minScore, maxScore])

  const rows = filtered.map((a) => ({
    Name: a.studentName, USN: a.usn, Branch: a.branch, Section: a.section,
    Test: a.testTitle, Type: a.testType, Score: a.score, Percentage: a.percentage, Status: a.status,
  }))

  if (loading) return <Loader />

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Results ({filtered.length})</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => exportToCSV(rows, 'results.csv')}>Export CSV</button>
          <button className="btn-primary" onClick={() => exportToExcel(rows, 'results.xlsx', 'Results')}>Export Excel</button>
        </div>
      </div>

      <div className="card mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <input className="input" placeholder="Search name / USN" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={testType} onChange={(e) => setTestType(e.target.value)}>
          {testTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}>
          {branches.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select className="input" value={section} onChange={(e) => setSection(e.target.value)}>
          {sections.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input className="input" type="number" placeholder="Min %" value={minScore} onChange={(e) => setMinScore(e.target.value)} />
        <input className="input" type="number" placeholder="Max %" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Name</th><th>USN</th><th>Branch</th><th>Sec</th><th>Test</th><th>Score</th><th>%</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="py-2 font-medium">{a.studentName}</td>
                <td>{a.usn}</td>
                <td>{a.branch}</td>
                <td>{a.section}</td>
                <td className="text-slate-500">{a.testTitle}</td>
                <td>{a.score}</td>
                <td className="font-semibold">{a.percentage}%</td>
                <td>
                  <span className={`badge ${a.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-6 text-center text-slate-400">No results match the filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
