// Render's free Presidio instance sleeps when idle, and the API (also on
// Render) can't wake it: Render answers its requests with 502. A request from
// the browser does, so the app pings it while the user is still on the
// earlier steps; the API waits for it to come up.
const WAKE_URL = import.meta.env.VITE_PRESIDIO_WAKE_URL as string | undefined

// It sleeps after 15 minutes without requests.
const INTERVAL_MS = 5 * 60 * 1000
let lastPing = 0

/** Fire-and-forget; nothing is read back (no-cors), the request is the point. */
export function wakeDetectionService() {
  if (!WAKE_URL || Date.now() - lastPing < INTERVAL_MS) return
  lastPing = Date.now()
  fetch(WAKE_URL, { mode: 'no-cors', cache: 'no-store' }).catch(() => {
    // Asleep or offline: the API reports it if it matters.
  })
}
