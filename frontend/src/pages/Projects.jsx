import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMode } from '../context/ModeContext'
import ProjectCard from '../components/ProjectCard'
import ProjectTeaser from '../components/ProjectTeaser'
import Reveal from '../components/Reveal'
import projects from '../data/projects.json'
import { linkTeal } from '../styles/classNames'

export default function Projects() {
  const { mode } = useMode()
  const [showSecondary, setShowSecondary] = useState(false)

  const isRecruiter = mode === 'recruiter'
  const isFriend = mode === 'friend'
  const flagship = projects.filter((p) => p.tier === 'flagship')
  const secondary = projects.filter((p) => p.tier === 'secondary')
  const visible = isRecruiter && !showSecondary ? flagship : projects

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link to="/" className={`text-sm ${linkTeal}`}>
        ← Back home
      </Link>

      <h1 className="mt-4 text-2xl font-semibold font-display text-text-primary">Projects</h1>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {visible.map((project, i) => (
          <Reveal key={project.id} delayMs={i * 70} className="h-full">
            {isFriend ? (
              <ProjectCard project={project} mode={mode} />
            ) : (
              <ProjectTeaser project={project} mode={mode} />
            )}
          </Reveal>
        ))}
      </div>

      {isRecruiter && !showSecondary && secondary.length > 0 && (
        <button
          type="button"
          onClick={() => setShowSecondary(true)}
          className={`mt-8 text-sm ${linkTeal}`}
        >
          Show more projects
        </button>
      )}
    </div>
  )
}
