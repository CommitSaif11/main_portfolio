import { Link } from 'react-router-dom'
import { LinkRow } from './ProjectCard'
import { cardBase, mutedText, cardInFocusGlow, cardFocusTransition } from '../styles/classNames'
import { categoryTagClass, classifyTech } from '../data/categoryColors'
import useInFocus from '../hooks/useInFocus'

// Compact teaser - name, tagline, top metrics, live-demo/GitHub links (visible
// right here, not just after clicking through). The rest (remaining metrics,
// tech stack, who it was built for) is hidden by default and animates open on
// hover instead of hiding behind a "View project" link - the project name
// itself still links out to /projects/:id for anyone who wants a permalink.
export default function ProjectTeaser({ project }) {
  const extraMetrics = project.impact_metrics.slice(2)
  const [focusRef, inFocus] = useInFocus()

  return (
    <div
      ref={focusRef}
      className={`group ${cardBase} ${cardFocusTransition} ${inFocus ? cardInFocusGlow : ''}`}
    >
      <Link to={`/projects/${project.id}`} className="inline-block">
        <h3 className="text-lg font-semibold font-display text-text-primary group-hover:text-teal-400 transition duration-fast ease">
          {project.name}
        </h3>
      </Link>
      <p className={`mt-1 text-sm ${mutedText}`}>{project.tagline}</p>
      <ul className="mt-3 space-y-1.5 text-sm text-text-primary">
        {project.impact_metrics.slice(0, 2).map((metric) => (
          <li key={metric} className="flex gap-2">
            <span aria-hidden="true" className="text-teal-400">
              •
            </span>
            <span>{metric}</span>
          </li>
        ))}
      </ul>

      {/* Hidden until hover, then animates open (grid-template-rows 0fr -> 1fr is
          the trick that lets height animate to "auto" smoothly). */}
      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-400 ease-out">
        <div className="overflow-hidden">
          {extraMetrics.length > 0 && (
            <ul className="mt-1.5 space-y-1.5 text-sm text-text-primary">
              {extraMetrics.map((metric) => (
                <li key={metric} className="flex gap-2">
                  <span aria-hidden="true" className="text-teal-400">
                    •
                  </span>
                  <span>{metric}</span>
                </li>
              ))}
            </ul>
          )}
          {/* Tech tags are hidden until hover (see the grid-rows trick above), not
              scroll-revealed, so their stagger rides the same group-hover trigger
              instead of an IntersectionObserver - each tag fades + scales up with
              a 35ms delay off the one before it once the panel opens. */}
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tech_stack.map((tech, i) => (
              <span
                key={tech}
                style={{ transitionDelay: `${i * 35}ms` }}
                className={`opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-[opacity,transform] duration-300 ease-out ${categoryTagClass(
                  classifyTech(tech),
                )}`}
              >
                {tech}
              </span>
            ))}
          </div>
          <p className={`mt-3 text-xs ${mutedText}`}>Built for {project.built_for}</p>
        </div>
      </div>

      <div className="mt-auto">
        <LinkRow project={project} />
      </div>
    </div>
  )
}
