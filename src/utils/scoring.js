// Pure result-calculation logic. Given the questions served to a student and
// their selected answers, compute the full result breakdown.
//
// questions: array of { id, questionText, options, correctAnswer, topic, difficulty }
// answers:   map of { [questionId]: selectedOptionText }
export function calculateResult(questions, answers, passPercentage = 40) {
  let correctCount = 0
  let wrongCount = 0
  let unattemptedCount = 0

  const topicWise = {} // topic -> { correct, total }
  const difficultyWise = {} // difficulty -> { correct, total }

  for (const q of questions) {
    const topic = q.topic || 'General'
    const diff = q.difficulty || 'Medium'
    topicWise[topic] = topicWise[topic] || { correct: 0, total: 0 }
    difficultyWise[diff] = difficultyWise[diff] || { correct: 0, total: 0 }
    topicWise[topic].total++
    difficultyWise[diff].total++

    const selected = answers[q.id]
    if (selected == null || selected === '') {
      unattemptedCount++
      continue
    }
    if (selected === q.correctAnswer) {
      correctCount++
      topicWise[topic].correct++
      difficultyWise[diff].correct++
    } else {
      wrongCount++
    }
  }

  const total = questions.length
  const attemptedCount = total - unattemptedCount
  const score = correctCount // 1 mark per correct answer
  const percentage = total > 0 ? Math.round((correctCount / total) * 10000) / 100 : 0
  const status = percentage >= passPercentage ? 'Pass' : 'Needs Improvement'

  return {
    total,
    score,
    percentage,
    correctCount,
    wrongCount,
    attemptedCount,
    unattemptedCount,
    topicWisePerformance: topicWise,
    difficultyWisePerformance: difficultyWise,
    status,
  }
}
