import { cardBase, linkTeal, mutedText, fadedText } from '../styles/classNames'

export function LinkRow({ project }) {
  return (
    <div className="mt-4 pt-4 border-t border-border-subtle flex gap-4 text-sm items-center">
      {project.live_demo ? (
        <a href={project.live_demo} target="_blank" rel="noreferrer" className={`font-medium ${linkTeal}`}>
          Live demo
        </a>
      ) : (
        <span className={`text-xs italic ${fadedText}`}>Live demo coming soon</span>
      )}
      {project.github && (
        <a href={project.github} target="_blank" rel="noreferrer" className={linkTeal}>
          GitHub
        </a>
      )}
    </div>
  )
}

function RecruiterCard({ project }) {
  return (
    <div className={cardBase}>
      <h3 className="text-lg font-semibold font-display text-text-primary">{project.name}</h3>
      <p className={`mt-1 text-sm ${mutedText}`}>{project.tagline}</p>
      <ul className="mt-4 space-y-1.5 text-sm text-text-primary">
        {project.impact_metrics.slice(0, 3).map((metric) => (
          <li key={metric} className="flex gap-2">
            <span aria-hidden="true" className="text-teal-400">
              •
            </span>
            <span>{metric}</span>
          </li>
        ))}
      </ul>
      <p className={`mt-4 text-xs ${mutedText}`}>Built for {project.built_for}</p>
      <div className="mt-auto">
        <LinkRow project={project} />
      </div>
    </div>
  )
}

function FriendCard({ project }) {
  return (
    <div className={cardBase}>
      <h3 className="text-lg font-semibold font-display text-text-primary">{project.name}</h3>
      <p className={`mt-1 text-sm ${mutedText}`}>{project.friendly_one_liner}</p>
      <div className="mt-auto">
        <LinkRow project={project} />
      </div>
    </div>
  )
}

export default function ProjectCard({ project, mode }) {
  if (mode === 'friend') return <FriendCard project={project} />
  return <RecruiterCard project={project} />
}
