import { useEffect, useMemo, useState } from 'react'
import {
  addQuestion, bulkAddQuestions, deleteQuestion, getAllQuestions, updateQuestion,
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

  const handleSeed = async () => {
    setMsg({ type: 'info', text: 'Seeding sample questions…' })
    try {
      await bulkAddQuestions(sampleQuestions)
      setMsg({ type: 'success', text: `Added ${sampleQuestions.length} sample questions.` })
      load()
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    }
  }

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
        <button className="btn-secondary" onClick={handleSeed}>+ Add Sample Syllabus Questions</button>
      </div>

      {msg.text && <div className="mb-4"><Alert type={msg.type}>{msg.text}</Alert></div>}

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
        {filtered.length === 0 && <div className="card text-center text-slate-400">No questions match the filters.</div>}
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
