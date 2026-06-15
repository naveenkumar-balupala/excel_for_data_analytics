import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Carousel from '../components/Carousel'

// Photos live in /public/ai-coach/. With the GitHub Pages base path, reference
// them via BASE_URL so they resolve both locally and when deployed.
const B = import.meta.env.BASE_URL
const coachImages = [
  { src: `${B}ai-coach/1.jpg`, alt: 'AI Tech Coach launch — address to students at NCET' },
  { src: `${B}ai-coach/2.jpg`, alt: 'Students attending the AI Tech Coach session' },
  { src: `${B}ai-coach/3.jpg`, alt: 'Live demonstration during the Skill Sprint' },
  { src: `${B}ai-coach/4.jpg`, alt: 'Interactive mentoring session at NCET' },
]

export default function Home() {
  const { user, role } = useAuth()

  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-10 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-light">Skill Sprint · TORII</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Excel for Data Analytics</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Online assessment platform for Pre-Assessment, Day-wise Tests and the Grand Test.
          Register once, attempt each test a single time, and get instant topic-wise feedback.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {user ? (
            <Link to={role === 'admin' ? '/admin' : '/dashboard'} className="btn-primary">
              Go to {role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary">Register</Link>
              <Link to="/login" className="btn-secondary">Student Login</Link>
              <Link to="/admin/login" className="btn-secondary">Admin Login</Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { t: 'Pre-Assessment', d: 'Gauge your starting Excel level.' },
          { t: 'Day-wise Tests', d: '6 days · 1-hour test each day on that day\'s topics.' },
          { t: 'Grand Test', d: 'Full-syllabus final assessment.' },
        ].map((c) => (
          <div key={c.t} className="card">
            <h3 className="font-semibold text-slate-800">{c.t}</h3>
            <p className="mt-1 text-sm text-slate-500">{c.d}</p>
          </div>
        ))}
      </section>

      {/* ---- AI Tech Coach Launch (Torii Minds × NCET) ---- */}
      <section className="mt-10">
        <div className="mb-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Torii Minds × NCET</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-800">AI Tech Coach Launch at NCET</h2>
        </div>

        <Carousel images={coachImages} />

        <div className="card mt-6 space-y-4 text-sm leading-relaxed text-slate-600">
          <p>
            Torii Minds proudly launched the <b>AI Tech Coach initiative at Nagarjuna College of
            Engineering and Technology (NCET)</b> to help students build future-ready skills in
            Artificial Intelligence and emerging technologies.
          </p>
          <p>
            The program is designed to guide students in using AI tools effectively for learning,
            coding, project development, debugging, documentation, research, and real-world
            problem-solving. Through hands-on sessions, live demonstrations, and structured
            mentoring, students gain practical exposure to AI-powered workflows and responsible
            AI usage.
          </p>
          <p>
            This initiative aims to create an AI-enabled learning environment at NCET, where
            students can improve productivity, strengthen technical confidence, and develop
            innovative projects aligned with industry expectations.
          </p>
          <p>
            The <b>AI Tech Coach Launch by Torii Minds</b> marks an important step toward preparing
            students to become skilled, creative, and industry-ready engineers in the AI-driven
            digital era.
          </p>
        </div>
      </section>
    </div>
  )
}
