// Admin dashboard statistics — aggregates students, tests, attempts, results.
// All computation happens client-side over Firestore reads so the admin can
// view live numbers from any device.
import { getAllStudents } from './studentService'
import { getAllTests } from './testService'
import { getAllAttempts, getAllResults } from './attemptService'

const round2 = (n) => Math.round(n * 100) / 100

export async function buildDashboard() {
  const [students, tests, attempts, results] = await Promise.all([
    getAllStudents(),
    getAllTests(),
    getAllAttempts(),
    getAllResults(),
  ])

  const submitted = attempts.filter((a) => a.attempted)
  const scores = submitted.map((a) => a.percentage ?? 0)

  const cards = {
    totalStudents: students.length,
    totalTests: tests.length,
    totalAttempts: submitted.length,
    averageScore: scores.length ? round2(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    highestScore: scores.length ? round2(Math.max(...scores)) : 0,
    lowestScore: scores.length ? round2(Math.min(...scores)) : 0,
    passPercentage: submitted.length
      ? round2((submitted.filter((a) => a.status === 'Pass').length / submitted.length) * 100)
      : 0,
    notAttemptedCount: Math.max(students.length * tests.length - submitted.length, 0),
  }

  // ---- Test-wise performance ----
  const byTest = {}
  for (const t of tests) byTest[t.id] = { name: t.testTitle, attempts: 0, totalPct: 0 }
  for (const a of submitted) {
    if (!byTest[a.testId]) byTest[a.testId] = { name: a.testTitle, attempts: 0, totalPct: 0 }
    byTest[a.testId].attempts++
    byTest[a.testId].totalPct += a.percentage ?? 0
  }
  const testWise = Object.values(byTest).map((t) => ({
    name: t.name,
    attempts: t.attempts,
    avgScore: t.attempts ? round2(t.totalPct / t.attempts) : 0,
  }))

  // ---- Section-wise ----
  const sectionWise = groupAvg(submitted, 'section')
  // ---- Branch-wise ----
  const branchWise = groupAvg(submitted, 'branch')

  // ---- Topic-wise (weak areas) from results ----
  const topicAgg = {} // topic -> { correct, total }
  for (const r of results) {
    const tw = r.topicWisePerformance || {}
    for (const [topic, v] of Object.entries(tw)) {
      topicAgg[topic] = topicAgg[topic] || { correct: 0, total: 0 }
      topicAgg[topic].correct += v.correct || 0
      topicAgg[topic].total += v.total || 0
    }
  }
  const topicWise = Object.entries(topicAgg)
    .map(([topic, v]) => ({
      topic,
      accuracy: v.total ? round2((v.correct / v.total) * 100) : 0,
      correct: v.correct,
      total: v.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy) // weakest first

  // ---- Day-wise progress (avg percentage per day number) ----
  const dayAgg = {}
  for (const a of submitted.filter((x) => x.testType === 'Day-wise Test' && x.dayNumber)) {
    const k = `Day ${a.dayNumber}`
    dayAgg[k] = dayAgg[k] || { total: 0, count: 0 }
    dayAgg[k].total += a.percentage ?? 0
    dayAgg[k].count++
  }
  const dayWise = Object.entries(dayAgg)
    .map(([name, v]) => ({ name, avgScore: round2(v.total / v.count) }))
    .sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]))

  // ---- Grand test performance distribution ----
  const grand = submitted.filter((a) => a.testType === 'Grand Test')
  const grandBuckets = scoreBuckets(grand.map((g) => g.percentage ?? 0))

  return {
    cards,
    testWise,
    sectionWise,
    branchWise,
    topicWise,
    dayWise,
    grandBuckets,
    students,
    tests,
    attempts: submitted,
    results,
  }
}

function groupAvg(items, key) {
  const agg = {}
  for (const a of items) {
    const k = a[key] || 'Unknown'
    agg[k] = agg[k] || { total: 0, count: 0, pass: 0 }
    agg[k].total += a.percentage ?? 0
    agg[k].count++
    if (a.status === 'Pass') agg[k].pass++
  }
  return Object.entries(agg).map(([name, v]) => ({
    name,
    avgScore: v.count ? round2(v.total / v.count) : 0,
    attempts: v.count,
    passRate: v.count ? round2((v.pass / v.count) * 100) : 0,
  }))
}

function scoreBuckets(percentages) {
  const buckets = [
    { name: '0-40', value: 0 },
    { name: '41-60', value: 0 },
    { name: '61-80', value: 0 },
    { name: '81-100', value: 0 },
  ]
  for (const p of percentages) {
    if (p <= 40) buckets[0].value++
    else if (p <= 60) buckets[1].value++
    else if (p <= 80) buckets[2].value++
    else buckets[3].value++
  }
  return buckets
}
