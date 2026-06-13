import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTest } from '../../services/testService'
import { sampleTests } from '../../utils/seedData'
import Alert from '../../components/Alert'

const TEST_TYPES = ['Pre-Assessment', 'Day-wise Test', 'Grand Test']

export default function CreateTest() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    testTitle: '', testType: 'Pre-Assessment', duration: 30, totalQuestions: 30, dayNumber: 1, isActive: true,
  })
  const [msg, setMsg] = useState({ type: '', text: '' })

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.testTitle.trim()) return setMsg({ type: 'error', text: 'Enter a test title.' })
    try {
      await createTest({
        testTitle: form.testTitle.trim(),
        testType: form.testType,
        duration: Number(form.duration),
        totalQuestions: Number(form.totalQuestions) || 30,
        dayNumber: form.testType === 'Day-wise Test' ? Number(form.dayNumber) : null,
        isActive: !!form.isActive,
      })
      setMsg({ type: 'success', text: 'Test created. Redirecting…' })
      setTimeout(() => navigate('/admin/tests'), 1000)
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  const seedDefaults = async () => {
    setMsg({ type: 'info', text: 'Creating the 8 default tests…' })
    try {
      for (const t of sampleTests) await createTest(t)
      setMsg({ type: 'success', text: 'Default tests created.' })
      setTimeout(() => navigate('/admin/tests'), 1000)
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Create Test</h1>
        <button className="btn-secondary" onClick={seedDefaults}>Create 8 Default Tests</button>
      </div>

      {msg.text && <div className="mb-4"><Alert type={msg.type}>{msg.text}</Alert></div>}

      <form onSubmit={handleSubmit} className="card grid gap-4">
        <div>
          <label className="label">Test Title</label>
          <input className="input" value={form.testTitle} onChange={set('testTitle')} placeholder="Day 1 — Excel Foundations" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Test Type</label>
            <select className="input" value={form.testType} onChange={set('testType')}>
              {TEST_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Day Number</label>
            <input className="input" type="number" min={1} max={6} disabled={form.testType !== 'Day-wise Test'} value={form.dayNumber} onChange={set('dayNumber')} />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input className="input" type="number" min={1} value={form.duration} onChange={set('duration')} />
          </div>
          <div>
            <label className="label">Number of Questions</label>
            <input className="input" type="number" value={form.totalQuestions} onChange={set('totalQuestions')} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active (visible to students)
        </label>
        <button className="btn-primary">Create Test</button>
      </form>
    </div>
  )
}
