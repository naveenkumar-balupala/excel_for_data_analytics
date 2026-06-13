// Fisher–Yates shuffle — returns a NEW array, does not mutate the input.
export function shuffle(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Pick n random elements from an array (without repetition).
export function pickRandom(array, n) {
  return shuffle(array).slice(0, n)
}

// Shuffle a question's options while keeping track of which option is correct.
// Returns { options: [...shuffled], correctAnswer: <text of correct option> }
export function shuffleOptions(question) {
  const shuffled = shuffle(question.options)
  return { ...question, options: shuffled, correctAnswer: question.correctAnswer }
}
