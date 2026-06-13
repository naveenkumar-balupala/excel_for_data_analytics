import { useEffect, useMemo, useState } from 'react'
import { getAllStudents } from '../../services/studentService'
import { getAllAttempts } from '../../services/attemptService'
import { exportToCSV, exportToExcel } from '../../utils/export'
import Loader from '../../components/Loader'

export default function ManageStudents() {
  const [students, setStudents] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('All')
  const [section, setSection] = useState('All')

  useEffect(() => {
    Promise.all([getAllStudents(), getAllAttempts()]).then(([s, a]) => {
      setStudents(s)
      setAttempts(a)
      setLoading(false)
    })
  }, [])

  const attemptCount = useMemo(() => {
    const map = {}
    attempts.forEach((a) => (map[a.studentId] = (map[a.studentId] || 0) + 1))
    return map
  }, [attempts])

  const branches = ['All', ...new Set(students.map((s) => s.branch).filter(Boolean))]
  const sections = ['All', ...new Set(students.map((s) => s.section).filter(Boolean))]

  const filtered = students.filter((s) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.usn?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    const matchBranch = branch === 'All' || s.branch === branch
    const matchSection = section === 'All' || s.section === section
    return matchSearch && matchBranch && matchSection
  })

  const rows = filtered.map((s) => ({
    Name: s.name, USN: s.usn, Email: s.email, Phone: s.phone,
    Branch: s.branch, Section: s.section, TestsAttempted: attemptCount[s.id] || 0,
  }))

  if (loading) return <Loader />

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Manage Students ({filtered.length})</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => exportToCSV(rows, 'students.csv')}>Export CSV</button>
          <button className="btn-primary" onClick={() => exportToExcel(rows, 'students.xlsx', 'Students')}>Export Excel</button>
        </div>
      </div>

      <div className="card mb-4 grid gap-3 sm:grid-cols-3">
        <input className="input" placeholder="Search name / USN / email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}>
          {branches.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select className="input" value={section} onChange={(e) => setSection(e.target.value)}>
          {sections.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Name</th><th>USN</th><th>Email</th><th>Branch</th><th>Section</th><th>Attempts</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="py-2 font-medium">{s.name}</td>
                <td>{s.usn}</td>
                <td className="text-slate-500">{s.email}</td>
                <td>{s.branch}</td>
                <td>{s.section}</td>
                <td><span className="badge bg-brand/10 text-brand">{attemptCount[s.id] || 0}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-slate-400">No students match the filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
