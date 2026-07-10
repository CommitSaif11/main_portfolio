import { useEffect, useMemo, useRef, useState } from 'react'
import { Color, MeshPhongMaterial } from 'three'
import Globe from 'react-globe.gl'
import fallbackPins from '../data/fallbackPins.json'
import { useMode } from '../context/ModeContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const VISIT_FLAG = 'visit-recorded'

// WebGL materials and the tooltip's raw HTML string both need literal hex, not
// CSS var() - kept in sync with the [data-mode] overrides in index.css.
const ACCENT_BY_MODE = {
  recruiter: { light: '#2DD4BF', dark: '#0D9488', elevatedBg: '#1A2129' },
  friend: { light: '#FB7185', dark: '#E11D48', elevatedBg: '#281F1B' },
}

// The 4 highlighted/seeded pins (Karnataka, West Bengal, Pune, Delhi NCR) always
// render gold/amber and pulse, regardless of mode - they're the "real people are
// actually checking this out" signal, not mode decoration.
const HIGHLIGHT_COLOR = '#FFD24D'
const HIGHLIGHT_RING_COLOR = 'rgba(255, 210, 77, 0.85)'

function isMyLocation(pin, myLocation) {
  if (!myLocation) return false
  if (myLocation.country?.toLowerCase() !== pin.country?.toLowerCase()) return false
  if (myLocation.region_name) {
    return pin.label?.toLowerCase() === myLocation.region_name.toLowerCase()
  }
  return !pin.is_state
}

function pinColor(pin, isFallback, accent) {
  if (isFallback) return 'rgba(156, 168, 166, 0.45)' // dim, static marker - not a real visit
  if (pin.highlight) return HIGHLIGHT_COLOR
  return pin.is_state ? accent.light : accent.dark
}

function pinRadius(pin, isFallback, maxCount) {
  if (isFallback) return 0.32 // uniform, no count-based bump - these aren't real visit counts
  // Scale relative to the largest pin so Bangalore visibly dwarfs the smaller ones,
  // instead of everything looking the same size regardless of count.
  const ratio = maxCount > 0 ? pin.count / maxCount : 0
  return 0.4 + ratio * 0.7
}

// Local device hour decides day vs night - simple and accurate for "what the
// visitor is actually looking at outside their window" without needing a geo
// lookup. 6:00-17:59 reads as day, everything else as night.
function isDaytimeNow() {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18
}

const TEXTURE_BY_TIME = {
  day: {
    globeImageUrl: '//unpkg.com/three-globe/example/img/earth-day.jpg',
    // Multiplies the globe's own material color (not a CSS filter on the whole
    // canvas) so only the earth texture gets darkened - the pins are separate
    // Three.js objects and stay at full, un-dimmed brightness.
    materialColor: 0x8c8c8c,
  },
  night: {
    globeImageUrl: '//unpkg.com/three-globe/example/img/earth-night.jpg',
    // The night texture (city lights on black land/ocean) is already the right
    // mood as-is - no darkening needed.
    materialColor: 0xffffff,
  },
}

function tooltip(pin, isFallback, myLocation) {
  const where = pin.is_state ? `${pin.label}, ${pin.country}` : pin.label
  if (isFallback) {
    return `<div style="font-family:Inter,sans-serif;font-size:12px;padding:4px 8px;background:#1A2129;color:#9CA8A6;border-radius:6px;">${where} - worked with / applied to</div>`
  }
  if (isMyLocation(pin, myLocation)) {
    return `<div style="font-family:Inter,sans-serif;font-size:12px;padding:4px 8px;background:#281F1B;color:#FBBF24;border-radius:6px;border:1px solid rgba(251,191,36,0.4);">You might be viewing from here - ${where}</div>`
  }
  const noun = pin.count === 1 ? 'visitor' : 'visitors'
  const bg = pin.highlight ? '#281F1B' : '#1A2129'
  const color = pin.highlight ? '#FBBF24' : '#F1F5F4'
  return `<div style="font-family:Inter,sans-serif;font-size:12px;padding:4px 8px;background:${bg};color:${color};border-radius:6px;">${pin.count} ${noun} from ${where}</div>`
}

export default function VisitorGlobe({ showCaption = true, onStatsChange }) {
  const { mode } = useMode()
  const timeOfDay = isDaytimeNow() ? 'day' : 'night'
  const texture = TEXTURE_BY_TIME[timeOfDay]
  const accent = ACCENT_BY_MODE[mode] ?? ACCENT_BY_MODE.recruiter
  const containerRef = useRef(null)
  const globeRef = useRef(null)
  const [size, setSize] = useState({ width: 380, height: 380 })
  const [stats, setStats] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [myLocation, setMyLocation] = useState(null)
  const [clickedPin, setClickedPin] = useState(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width
      setSize({ width, height: Math.min(width, 520) })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Guard is synchronous (read+set happen before any await), so this fires at
    // most once per browser tab session - survives re-renders, HMR, and even full
    // page reloads within the same tab. Only a closed tab / new tab resets it.
    if (!sessionStorage.getItem(VISIT_FLAG)) {
      sessionStorage.setItem(VISIT_FLAG, '1')
      fetch(`${API_URL}/visit`, { method: 'POST', cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.recorded) {
            setMyLocation({ country: data.country, region_name: data.region_name })
          }
        })
        .catch(() => {})
    }

    // no-store (plus a cache-busting query param, belt-and-suspenders against any
    // intermediary/browser HTTP cache) so the pin/visitor count is always fresh,
    // not a stale response served from a previous page load.
    fetch(`${API_URL}/visit-stats?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('bad response')
        return res.json()
      })
      .then((data) => {
        if (data.pins && data.pins.length > 0) {
          setStats(data)
        } else {
          setUsingFallback(true)
        }
      })
      .catch(() => setUsingFallback(true))
      .finally(() => setLoaded(true))
  }, [])

  useEffect(() => {
    if (globeRef.current) {
      // Start facing the seeded India pins instead of the default mid-Atlantic
      // view, so the gold glow is visible immediately rather than after a
      // partial auto-rotate.
      globeRef.current.pointOfView({ lat: 10, lng: 45, altitude: 1.8 }, 0)
      const controls = globeRef.current.controls()
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.6
      controls.enableZoom = false
      // Stop the ambient auto-rotate the moment someone actually grabs the globe,
      // so their drag isn't fighting the animation.
      controls.addEventListener('start', () => {
        controls.autoRotate = false
      })
    }
    // timeOfDay is included because the Globe remounts (key={timeOfDay}) on a
    // day/night texture swap, which needs the camera/controls re-initialized.
  }, [loaded, timeOfDay])

  // Fallback pins are illustrative only (places Saif has worked with/applied to) -
  // they must never be counted as real visitors, so real vs fallback stay fully
  // separate: real stats only render when the backend actually has recorded visits.
  const isFallback = usingFallback || !stats
  const pins = isFallback ? fallbackPins : stats.pins
  const countryCount = isFallback ? null : stats.total_countries
  const pinCount = isFallback ? null : pins.length
  const maxCount = isFallback ? 0 : Math.max(...pins.map((p) => p.count), 1)
  const highlightPins = isFallback ? [] : pins.filter((p) => p.highlight)

  // Darkens the globe's own material (a real Three.js Material passed as a prop,
  // not a CSS filter on the whole canvas) so only the earth texture dims - the
  // pins are separate objects in the scene and stay at full brightness.
  const globeMaterial = useMemo(
    () => new MeshPhongMaterial({ color: new Color(texture.materialColor) }),
    [texture.materialColor],
  )

  useEffect(() => {
    if (!loaded) return
    onStatsChange?.({ isFallback, countryCount, pinCount })
  }, [loaded, isFallback, countryCount, pinCount, onStatsChange])

  return (
    <div>
      <div ref={containerRef} className="relative w-full max-w-xl mx-auto aspect-square overflow-hidden rounded-full">
        {!loaded && (
          <div className="w-full h-full rounded-full bg-bg-surface animate-pulse" aria-hidden="true" />
        )}
        {loaded && (
          // Switches texture by the visitor's own local clock (day vs night),
          // like the real earth would look outside their window right now.
          // earth-dark.jpg (tried earlier) is essentially monochrome, so land and
          // ocean can't be told apart there - earth-day.jpg has genuine hue
          // separation (green/brown land vs blue ocean). Darkened via the globe's
          // own material color (not a CSS filter), so pins stay bright regardless
          // of how dim the earth texture itself is.
          <Globe
            key={timeOfDay}
            ref={globeRef}
            width={size.width}
            height={size.height}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl={texture.globeImageUrl}
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            globeMaterial={globeMaterial}
            showAtmosphere={false}
            pointsData={pins}
            pointLat={(d) => d.lat}
            pointLng={(d) => d.lng}
            pointColor={(d) => pinColor(d, isFallback, accent)}
            pointRadius={(d) => pinRadius(d, isFallback, maxCount)}
            pointAltitude={0.01}
            pointLabel={(d) => tooltip(d, isFallback, myLocation)}
            onPointClick={(pin) => setClickedPin(pin)}
            ringsData={highlightPins}
            ringLat={(d) => d.lat}
            ringLng={(d) => d.lng}
            ringColor={() => HIGHLIGHT_RING_COLOR}
            ringMaxRadius={(d) => 2.5 + (d.count / maxCount) * 3.5}
            ringPropagationSpeed={1.4}
            ringRepeatPeriod={1600}
          />
        )}
      </div>
      {clickedPin && (
        <div className="mt-3 mx-auto max-w-xs flex items-center justify-between gap-3 rounded-md border border-border-default bg-bg-elevated px-3 py-2 text-sm text-text-primary">
          <span>
            {isFallback
              ? `${clickedPin.is_state ? `${clickedPin.label}, ${clickedPin.country}` : clickedPin.label} - worked with / applied to`
              : `${clickedPin.count} ${clickedPin.count === 1 ? 'visitor' : 'visitors'} from ${
                  clickedPin.is_state ? `${clickedPin.label}, ${clickedPin.country}` : clickedPin.label
                }`}
          </span>
          <button
            type="button"
            onClick={() => setClickedPin(null)}
            aria-label="Dismiss"
            className="shrink-0 text-text-tertiary hover:text-text-primary"
          >
            ×
          </button>
        </div>
      )}
      {showCaption && (
        <p className="mt-4 text-center text-sm text-text-secondary">
          {isFallback
            ? "No real visitors tracked yet - dots show places I've worked with or applied to."
            : `Visitors from ${pinCount} ${pinCount === 1 ? 'place' : 'places'} across ${countryCount} ${countryCount === 1 ? 'country' : 'countries'}`}
        </p>
      )}
    </div>
  )
}
