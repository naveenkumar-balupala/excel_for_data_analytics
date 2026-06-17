import { useEffect, useState } from 'react'
import { buildDashboard } from '../../services/statsService'
import { exportToCSV, exportToExcel } from '../../utils/export'
import Loader from '../../components/Loader'
import StatCard from '../../components/StatCard'

// Central place to export every report as CSV or Excel.
export default function ExportReports() {
  const [data, setData] = useState(null)
  const [batch, setBatch] = useState('All')

  useEffect(() => { buildDashboard().then(setData) }, [])
  if (!data) return <Loader />

  const { students, attempts, testWise, sectionWise, branchWise, batchWise, topicWise, cards } = data

  // Batch filter applies to the per-student reports (list / results / pending).
  const batchOptions = ['All', ...new Set(students.map((s) => s.batch).filter(Boolean))]
  const inBatch = batch === 'All'
  const fStudents = inBatch ? students : students.filter((s) => s.batch === batch)
  const fAttempts = inBatch ? attempts : attempts.filter((a) => a.batch === batch)
  const suffix = inBatch ? '' : `-${batch}`

  const studentRows = fStudents.map((s) => ({
    Name: s.name, USN: s.usn, Email: s.email, Phone: s.phone, Branch: s.branch, Section: s.section, Batch: s.batch || '',
  }))
  const resultRows = fAttempts.map((a) => ({
    Name: a.studentName, USN: a.usn, Branch: a.branch, Section: a.section, Batch: a.batch || '',
    Test: a.testTitle, Type: a.testType, Score: a.score, Percentage: a.percentage, Status: a.status,
  }))
  const notAttempted = buildNotAttempted(fStudents, data.tests, fAttempts)

  const batchLabel = inBatch ? '' : ` · Batch ${batch}`
  const reports = [
    { name: `Student List${batchLabel}`, rows: studentRows, file: `students${suffix}` },
    { name: `All Results${batchLabel}`, rows: resultRows, file: `results${suffix}` },
    { name: `Not Attempted List${batchLabel}`, rows: notAttempted, file: `not-attempted${suffix}` },
    { name: 'Batch-wise Performance', rows: batchWise, file: 'batch-wise' },
    { name: 'Test-wise Performance', rows: testWise, file: 'test-wise' },
    { name: 'Section-wise Performance', rows: sectionWise, file: 'section-wise' },
    { name: 'Branch-wise Performance', rows: branchWise, file: 'branch-wise' },
    { name: 'Topic-wise Analysis', rows: topicWise, file: 'topic-wise' },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Export Reports</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Students" value={cards.totalStudents} accent="blue" />
        <StatCard label="Attempts" value={cards.totalAttempts} accent="brand" />
        <StatCard label="Avg Score" value={cards.averageScore} suffix="%" accent="brand" />
        <StatCard label="Pass %" value={cards.passPercentage} suffix="%" accent="green" />
      </div>

      <div className="card mb-4 flex flex-wrap items-center gap-3">
        <label className="label mb-0">Batch</label>
        <select className="input max-w-xs" value={batch} onChange={(e) => setBatch(e.target.value)}>
          {batchOptions.map((b) => <option key={b}>{b}</option>)}
        </select>
        <p className="text-xs text-slate-500">
          Filters the Student List, Results and Not-Attempted reports to the selected batch.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <div key={r.file} className="card flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">{r.name}</h3>
              <p className="text-xs text-slate-500">{r.rows.length} rows</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary" disabled={!r.rows.length} onClick={() => exportToCSV(r.rows, `${r.file}.csv`)}>CSV</button>
              <button className="btn-primary" disabled={!r.rows.length} onClick={() => exportToExcel(r.rows, `${r.file}.xlsx`, r.name)}>Excel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Cartesian (student x test) minus actual attempts = who still owes which test.
function buildNotAttempted(students, tests, attempts) {
  const done = new Set(attempts.map((a) => `${a.studentId}_${a.testId}`))
  const rows = []
  for (const s of students) {
    for (const t of (tests || [])) {
      if (!done.has(`${s.id}_${t.id}`)) {
        rows.push({ Name: s.name, USN: s.usn, Branch: s.branch, Section: s.section, Test: t.testTitle })
      }
    }
  }
  return rows
}
