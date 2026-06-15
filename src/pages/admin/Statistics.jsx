import { useEffect, useState } from 'react'
import { buildDashboard } from '../../services/statsService'
import Loader from '../../components/Loader'
import Alert from '../../components/Alert'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, Cell, PieChart, Pie, LabelList,
} from 'recharts'

// Small helper: render the value above/beside a series.
const valueLabel = (position = 'top') => (
  <LabelList position={position} className="fill-slate-600" style={{ fontSize: 11, fontWeight: 600 }} />
)

const COLORS = ['#dc2626', '#f59e0b', '#3b82f6', '#16a34a']

function ChartCard({ title, children, note }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold text-slate-800">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>{children}</ResponsiveContainer>
      {note && <p className="mt-2 text-xs text-slate-400">{note}</p>}
    </div>
  )
}

export default function Statistics() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    buildDashboard().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <Alert type="error">{error}</Alert>
  if (!data) return <Loader message="Crunching statistics…" />

  const { testWise, sectionWise, branchWise, topicWise, dayWise, grandBuckets } = data

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Statistics & Reports</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Test-wise Performance (avg %)">
          <BarChart data={testWise}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} height={60} />
            <YAxis domain={[0, 100]} />
            <Tooltip /><Legend />
            <Bar dataKey="avgScore" name="Avg %" fill="#ea580c" radius={[4, 4, 0, 0]}>{valueLabel()}</Bar>
            <Bar dataKey="attempts" name="Attempts" fill="#94a3b8" radius={[4, 4, 0, 0]}>{valueLabel()}</Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Section-wise Performance (avg %)">
          <BarChart data={sectionWise}>
            <XAxis dataKey="name" /><YAxis domain={[0, 100]} />
            <Tooltip /><Legend />
            <Bar dataKey="avgScore" name="Avg %" fill="#3b82f6" radius={[4, 4, 0, 0]}>{valueLabel()}</Bar>
            <Bar dataKey="passRate" name="Pass %" fill="#16a34a" radius={[4, 4, 0, 0]}>{valueLabel()}</Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Branch-wise Performance (avg %)">
          <BarChart data={branchWise}>
            <XAxis dataKey="name" /><YAxis domain={[0, 100]} />
            <Tooltip /><Legend />
            <Bar dataKey="avgScore" name="Avg %" fill="#8b5cf6" radius={[4, 4, 0, 0]}>{valueLabel()}</Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Day-wise Test Progress (avg %)" note="Average score trend across the 6 day-wise tests.">
          <LineChart data={dayWise}>
            <XAxis dataKey="name" /><YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="avgScore" stroke="#ea580c" strokeWidth={2}>{valueLabel('top')}</Line>
          </LineChart>
        </ChartCard>

        <ChartCard title="Grand Test Performance (distribution)" note="Number of students per score band.">
          <PieChart>
            <Pie data={grandBuckets} dataKey="value" nameKey="name" outerRadius={90} label>
              {grandBuckets.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Legend /><Tooltip />
          </PieChart>
        </ChartCard>

        <ChartCard title="Topic-wise Weak Areas (accuracy %)" note="Red = below 50% (needs reteaching).">
          <BarChart data={topicWise.slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="topic" width={130} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
              {topicWise.slice(0, 10).map((d, i) => (
                <Cell key={i} fill={d.accuracy >= 50 ? '#16a34a' : '#dc2626'} />
              ))}
              <LabelList dataKey="accuracy" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 11, fontWeight: 600 }} className="fill-slate-600" />
            </Bar>
          </BarChart>
        </ChartCard>
      </div>

      {/* Topic-wise analysis table */}
      <div className="card mt-6 overflow-x-auto">
        <h3 className="mb-3 font-semibold text-slate-800">Topic-wise Analysis</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Topic</th><th>Correct</th><th>Total</th><th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {topicWise.map((t) => (
              <tr key={t.topic} className="border-t border-slate-100">
                <td className="py-2 font-medium">{t.topic}</td>
                <td>{t.correct}</td>
                <td>{t.total}</td>
                <td>
                  <span className={`badge ${t.accuracy >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.accuracy}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
