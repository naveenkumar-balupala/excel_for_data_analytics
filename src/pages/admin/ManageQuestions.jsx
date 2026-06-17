import { useEffect, useMemo, useState } from 'react'
import {
  addQuestion, bulkAddQuestions, deleteQuestion, getAllQuestions, updateQuestion,
  removeDuplicateQuestions, questionKey,
} from '../../services/questionService'
import { sampleQuestions } from '../../utils/seedData'
import Loader from '../../components/Loader'
import Alert from '../../components/Alert'
import ConfirmModal from '../../components/ConfirmModal'

const TEST_TYPES = ['Pre-Assessment', 'Day-wise Test', 'Grand Test']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

const emptyForm = {
  questionText: '', options: ['', '', '', ''], correctIndex: 0,
  topic: '', unit: '', difficulty: 'Easy', testType: 'Pre-Assessment', dayNumber: 1,
}

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  // filters
  const [fType, setFType] = useState('All')
  const [fTopic, setFTopic] = useState('All')
  const [fDiff, setFDiff] = useState('All')
  const [fDay, setFDay] = useState('All')

  const load = async () => {
    const q = await getAllQuestions()
    setQuestions(q)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const topics = ['All', ...new Set(questions.map((q) => q.topic).filter(Boolean))]
  const days = ['All', 1, 2, 3, 4, 5, 6]

  const filtered = useMemo(() => questions.filter((q) => (
    (fType === 'All' || q.testType === fType) &&
    (fTopic === 'All' || q.topic === fTopic) &&
    (fDiff === 'All' || q.difficulty === fDiff) &&
    (fDay === 'All' || String(q.dayNumber) === String(fDay))
  )), [questions, fType, fTopic, fDiff, fDay])

  const resetForm = () => { setForm(emptyForm); setEditId(null) }

  // Idempotent seed: only add sample questions that aren't already present, so
  // clicking more than once never creates duplicates.
  const handleSeed = async () => {
    const have = new Set(questions.map(questionKey))
    const missing = sampleQuestions.filter((s) => !have.has(questionKey(s)))
    if (missing.length === 0) {
      setMsg({ type: 'info', text: 'All sample questions are already present — nothing to add.' })
      return
    }
    setMsg({ type: 'info', text: `Adding ${missing.length} new sample questions…` })
    try {
      await bulkAddQuestions(missing)
      setMsg({ type: 'success', text: `Added ${missing.length} new sample questions.` })
      load()
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    }
  }

  const handleRemoveDuplicates = async () => {
    setMsg({ type: 'info', text: 'Scanning for duplicate questions…' })
    try {
      const n = await removeDuplicateQuestions()
      setMsg({ type: n ? 'success' : 'info', text: n ? `Removed ${n} duplicate question(s).` : 'No duplicates found.' })
      load()
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    }
  }

  // Count of questions available per test, against the required 30.
  const counts = useMemo(() => {
    const c = { 'Pre-Assessment': 0, 'Grand Test': 0, days: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } }
    questions.forEach((qn) => {
      if (qn.testType === 'Pre-Assessment') c['Pre-Assessment']++
      else if (qn.testType === 'Grand Test') c['Grand Test']++
      else if (qn.testType === 'Day-wise Test' && qn.dayNumber) c.days[qn.dayNumber] = (c.days[qn.dayNumber] || 0) + 1
    })
    return c
  }, [questions])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.questionText.trim() || form.options.some((o) => !o.trim())) {
      return setMsg({ type: 'error', text: 'Fill the question and all four options.' })
    }
    const payload = {
      questionText: form.questionText.trim(),
      options: form.options.map((o) => o.trim()),
      correctAnswer: form.options[form.correctIndex].trim(),
      topic: form.topic.trim() || 'General',
      unit: form.unit.trim() || form.topic.trim() || 'General',
      difficulty: form.difficulty,
      testType: form.testType,
      dayNumber: form.testType === 'Day-wise Test' ? Number(form.dayNumber) : null,
    }
    try {
      if (editId) {
        await updateQuestion(editId, payload)
        setMsg({ type: 'success', text: 'Question updated.' })
      } else {
        await addQuestion(payload)
        setMsg({ type: 'success', text: 'Question added.' })
      }
      resetForm()
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  const startEdit = (q) => {
    setEditId(q.id)
    setForm({
      questionText: q.questionText,
      options: [...q.options],
      correctIndex: Math.max(0, q.options.indexOf(q.correctAnswer)),
      topic: q.topic || '', unit: q.unit || '',
      difficulty: q.difficulty || 'Easy',
      testType: q.testType, dayNumber: q.dayNumber || 1,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmDelete = async () => {
    await deleteQuestion(deleteId)
    setDeleteId(null)
    setMsg({ type: 'success', text: 'Question deleted.' })
    load()
  }

  if (loading) return <Loader />

  const setOpt = (i, v) => {
    const opts = [...form.options]; opts[i] = v; setForm({ ...form, options: opts })
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Manage Questions ({questions.length})</h1>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={handleSeed}>+ Add Sample Syllabus Questions</button>
          <button className="btn-secondary" onClick={handleRemoveDuplicates}>Remove Duplicates</button>
        </div>
      </div>

      {msg.text && <div className="mb-4"><Alert type={msg.type} onClose={() => setMsg({ type: '', text: '' })} autoCloseMs={msg.type === 'error' ? undefined : 5000}>{msg.text}</Alert></div>}

      {/* ---- Question count vs required 30 per test ---- */}
      <div className="card mb-4">
        <h2 className="mb-3 font-semibold text-slate-800">Questions per Test (required: 30 each)</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          <CountChip label="Pre-Assessment" value={counts['Pre-Assessment']} />
          {[1, 2, 3, 4, 5, 6].map((d) => (
            <CountChip key={d} label={`Day ${d}`} value={counts.days[d]} />
          ))}
          <CountChip label="Grand Test" value={counts['Grand Test']} />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Green = at least 30 available (test can fill 30). Amber = fewer than 30; add more or seed samples.
        </p>
      </div>

      {/* ---- Add / Edit form ---- */}
      <form onSubmit={handleSubmit} className="card mb-6 grid gap-4">
        <h2 className="font-semibold text-slate-800">{editId ? 'Edit Question' : 'Add Question'}</h2>
        <div>
          <label className="label">Question</label>
          <textarea className="input" rows={2} value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {form.options.map((opt, i) => (
            <label key={i} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${form.correctIndex === i ? 'border-green-400 bg-green-50' : 'border-slate-200'}`}>
              <input type="radio" name="correct" checked={form.correctIndex === i} onChange={() => setForm({ ...form, correctIndex: i })} />
              <input className="w-full bg-transparent text-sm outline-none" placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => setOpt(i, e.target.value)} />
            </label>
          ))}
        </div>
        <p className="text-xs text-slate-400">Select the radio button next to the correct option.</p>
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="label">Topic / Unit</label>
            <input className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Test Type</label>
            <select className="input" value={form.testType} onChange={(e) => setForm({ ...form, testType: e.target.value })}>
              {TEST_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Day Number</label>
            <input className="input" type="number" min={1} max={6} disabled={form.testType !== 'Day-wise Test'} value={form.dayNumber} onChange={(e) => setForm({ ...form, dayNumber: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary">{editId ? 'Update Question' : 'Add Question'}</button>
          {editId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      {/* ---- Filters ---- */}
      <div className="card mb-4 grid gap-3 sm:grid-cols-4">
        <select className="input" value={fType} onChange={(e) => setFType(e.target.value)}>
          <option>All</option>{TEST_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="input" value={fTopic} onChange={(e) => setFTopic(e.target.value)}>
          {topics.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="input" value={fDiff} onChange={(e) => setFDiff(e.target.value)}>
          <option>All</option>{DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="input" value={fDay} onChange={(e) => setFDay(e.target.value)}>
          {days.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* ---- List ---- */}
      <div className="space-y-3">
        {filtered.map((q) => (
          <div key={q.id} className="card flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-1 flex flex-wrap gap-2 text-xs">
                <span className="badge bg-brand/10 text-brand">{q.testType}</span>
                {q.dayNumber && <span className="badge bg-blue-100 text-blue-700">Day {q.dayNumber}</span>}
                <span className="badge bg-slate-100 text-slate-600">{q.topic}</span>
                <span className="badge bg-amber-100 text-amber-700">{q.difficulty}</span>
              </div>
              <p className="font-medium text-slate-800">{q.questionText}</p>
              <p className="mt-1 text-xs text-green-600">Correct: {q.correctAnswer}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button className="btn-secondary" onClick={() => startEdit(q)}>Edit</button>
              <button className="btn-danger" onClick={() => setDeleteId(q.id)}>Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="card text-center text-slate-400">No questions match these filters. Try clearing the search or filters above.</div>}
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Delete Question?"
        message="This permanently removes the question from the bank."
        confirmText="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

// Shows a test's available question count, green if it can fill 30, amber if not.
function CountChip({ label, value }) {
  const ok = value >= 30
  return (
    <div className={`rounded-lg border p-2 text-center ${ok ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-lg font-bold ${ok ? 'text-green-700' : 'text-amber-700'}`}>{value}</div>
    </div>
  )
}
