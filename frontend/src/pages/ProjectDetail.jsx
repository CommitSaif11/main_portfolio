import { Link, Navigate, useParams } from 'react-router-dom'
import { useMode } from '../context/ModeContext'
import ProjectCard from '../components/ProjectCard'
import Reveal from '../components/Reveal'
import projects from '../data/projects.json'
import { linkTeal, mutedText } from '../styles/classNames'

export default function ProjectDetail() {
  const { mode } = useMode()
  const { id } = useParams()
  const project = projects.find((p) => p.id === id)

  if (!project) return <Navigate to="/projects" replace />

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link to="/projects" className={`text-sm ${linkTeal}`}>
        ← All projects
      </Link>

      <Reveal className="mt-6">
        <ProjectCard project={project} mode={mode} />
      </Reveal>

      {/* Room to grow: screenshots, a longer write-up, or embedded demos can go here. */}
      <Reveal delayMs={80} className="mt-10 rounded-md border border-dashed border-border-subtle p-8 text-center">
        <p className={`text-sm ${mutedText}`}>Screenshots and a deeper write-up for this project are coming soon.</p>
      </Reveal>
    </div>
  )
}
