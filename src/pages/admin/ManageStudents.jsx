import { useEffect, useMemo, useState } from 'react'
import { getAllStudents, deleteStudent, updateStudent } from '../../services/studentService'
import { getAllAttempts } from '../../services/attemptService'
import { createBatch, deleteBatch, getAllBatches } from '../../services/batchService'
import { exportToCSV, exportToExcel } from '../../utils/export'
import Loader from '../../components/Loader'
import Alert from '../../components/Alert'
import ConfirmModal from '../../components/ConfirmModal'

const BRANCHES = ['CSE', 'ISE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIML', 'BCA', 'MCA', 'MBA', 'Other']
const SECTIONS = ['A', 'B', 'C', 'D']

export default function ManageStudents() {
  const [students, setStudents] = useState([])
  const [attempts, setAttempts] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const [newBatch, setNewBatch] = useState('')
  const [deleteBatchId, setDeleteBatchId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null) // student to delete
  const [editTarget, setEditTarget] = useState(null) // student being edited
  const [editForm, setEditForm] = useState({ name: '', phone: '', branch: '', section: '', batch: '' })
  const [savingEdit, setSavingEdit] = useState(false)

  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('All')
  const [section, setSection] = useState('All')
  const [batchFilter, setBatchFilter] = useState('All')

  const load = async () => {
    const [s, a, b] = await Promise.all([getAllStudents(), getAllAttempts(), getAllBatches()])
    setStudents(s)
    setAttempts(a)
    setBatches(b)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const attemptCount = useMemo(() => {
    const map = {}
    attempts.forEach((a) => (map[a.studentId] = (map[a.studentId] || 0) + 1))
    return map
  }, [attempts])

  const branches = ['All', ...new Set(students.map((s) => s.branch).filter(Boolean))]
  const sections = ['All', ...new Set(students.map((s) => s.section).filter(Boolean))]
  const batchOptions = ['All', ...new Set(students.map((s) => s.batch).filter(Boolean))]

  const filtered = students.filter((s) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.usn?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    const matchBranch = branch === 'All' || s.branch === branch
    const matchSection = section === 'All' || s.section === section
    const matchBatch = batchFilter === 'All' || s.batch === batchFilter
    return matchSearch && matchBranch && matchSection && matchBatch
  })

  const rows = filtered.map((s) => ({
    Name: s.name, USN: s.usn, Email: s.email, Phone: s.phone,
    Branch: s.branch, Section: s.section, Batch: s.batch || '',
    TestsAttempted: attemptCount[s.id] || 0,
  }))

  // ---- batch actions ----
  const handleAddBatch = async (e) => {
    e.preventDefault()
    if (!newBatch.trim()) return
    try {
      await createBatch(newBatch)
      setNewBatch('')
      setMsg({ type: 'success', text: 'Batch created.' })
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }
  const confirmDeleteBatch = async () => {
    await deleteBatch(deleteBatchId)
    setDeleteBatchId(null)
    setMsg({ type: 'success', text: 'Batch deleted.' })
    load()
  }

  // ---- student edit ----
  const openEdit = (s) => {
    setEditTarget(s)
    setEditForm({
      name: s.name || '', phone: s.phone || '',
      branch: s.branch || 'CSE', section: s.section || 'A', batch: s.batch || '',
    })
  }
  const saveEdit = async (e) => {
    e.preventDefault()
    setSavingEdit(true)
    try {
      await updateStudent(editTarget.id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        branch: editForm.branch,
        section: editForm.section,
        batch: editForm.batch,
      })
      setMsg({ type: 'success', text: 'Student details updated.' })
      setEditTarget(null)
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSavingEdit(false)
    }
  }

  // ---- student delete ----
  const confirmDeleteStudent = async () => {
    const target = deleteTarget
    setDeleteTarget(null)
    setMsg({ type: 'info', text: `Deleting ${target.name}…` })
    try {
      await deleteStudent(target)
      setMsg({ type: 'success', text: `${target.name} and their results were deleted.` })
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

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

      {msg.text && <div className="mb-4"><Alert type={msg.type}>{msg.text}</Alert></div>}

      {/* ---- Batch management ---- */}
      <div className="card mb-4">
        <h2 className="font-semibold text-slate-800">Batches</h2>
        <p className="text-xs text-slate-500">Create batches (e.g. 2024-2027). Students choose one at registration.</p>
        <form onSubmit={handleAddBatch} className="mt-3 flex gap-2">
          <input className="input max-w-xs" placeholder="New batch name e.g. 2024-2027" value={newBatch} onChange={(e) => setNewBatch(e.target.value)} />
          <button className="btn-primary">Add Batch</button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {batches.length === 0 && <span className="text-sm text-slate-400">No batches yet.</span>}
          {batches.map((b) => (
            <span key={b.id} className="badge flex items-center gap-2 bg-brand/10 text-brand">
              {b.name}
              <button className="text-brand-dark hover:text-red-600" onClick={() => setDeleteBatchId(b.id)} title="Delete batch">✕</button>
            </span>
          ))}
        </div>
      </div>

      {/* ---- Filters ---- */}
      <div className="card mb-4 grid gap-3 sm:grid-cols-4">
        <input className="input" placeholder="Search name / USN / email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}>
          {branches.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select className="input" value={section} onChange={(e) => setSection(e.target.value)}>
          {sections.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input" value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}>
          {batchOptions.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>

      {/* ---- Student table ---- */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Name</th><th>USN</th><th>Email</th><th>Branch</th><th>Section</th><th>Batch</th><th>Attempts</th><th>Action</th>
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
                <td>{s.batch || '—'}</td>
                <td><span className="badge bg-brand/10 text-brand">{attemptCount[s.id] || 0}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn-danger" onClick={() => setDeleteTarget(s)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-6 text-center text-slate-400">No students match the filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Student?"
        message={deleteTarget ? `This permanently removes ${deleteTarget.name} (${deleteTarget.usn}) and all their test attempts & results. The login account must be removed separately from Firebase Authentication. Continue?` : ''}
        confirmText="Delete Student"
        danger
        onConfirm={confirmDeleteStudent}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={!!deleteBatchId}
        title="Delete Batch?"
        message="This removes the batch from the list. Students already assigned to it keep their batch value."
        confirmText="Delete"
        danger
        onConfirm={confirmDeleteBatch}
        onCancel={() => setDeleteBatchId(null)}
      />

      {/* ---- Edit student modal ---- */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveEdit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800">Edit Student</h3>
            <p className="mt-1 text-xs text-slate-500">{editTarget.usn} · {editTarget.email}</p>
            <p className="mt-1 text-xs text-slate-400">USN and email can't be changed here.</p>

            <div className="mt-4 grid gap-3">
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Branch</label>
                  <select className="input" value={editForm.branch} onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}>
                    {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Section</label>
                  <select className="input" value={editForm.section} onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}>
                    {SECTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Batch</label>
                {batches.length > 0 ? (
                  <select className="input" value={editForm.batch} onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}>
                    <option value="">— none —</option>
                    {batches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                ) : (
                  <input className="input" value={editForm.batch} onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })} />
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
              <button className="btn-primary" disabled={savingEdit}>{savingEdit ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
