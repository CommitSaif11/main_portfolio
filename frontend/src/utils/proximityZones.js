// Lets far-apart components (Home's hero tagline/CTA, ChatWidget's launcher)
// register themselves as "hover near me to open chat" zones without ChatWidget
// needing direct refs into pages it doesn't render.
const zones = new Set()

export function registerProximityZone(el) {
  if (!el) return () => {}
  zones.add(el)
  return () => zones.delete(el)
}

export function getProximityZones() {
  return Array.from(zones)
}
