import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const GOATCOUNTER_URL = 'https://gc.zgo.at/count.js'

/**
 * GoatCounter analytics hook.
 *
 * - Only activates in production (`import.meta.env.PROD`).
 * - Requires `VITE_GOATCOUNTER_CODE` env var to be set.
 * - Loads the count.js script once on mount.
 * - Calls `goatcounter.count()` on every route change (SPA support).
 */
export default function useGoatCounter() {
  const location = useLocation()

  useEffect(() => {
    const code = import.meta.env.VITE_GOATCOUNTER_CODE
    if (!code || !import.meta.env.PROD) return

    // Allow localhost visits in production (e.g. staging) by setting
    // VITE_GOATCOUNTER_ALLOW_LOCAL=true — GoatCounter blocks localhost by default
    const allowLocal = import.meta.env.VITE_GOATCOUNTER_ALLOW_LOCAL === 'true'

    // Get or create the script element
    let script = document.querySelector(`script[data-goatcounter]`)

    if (!script) {
      script = document.createElement('script')
      script.setAttribute('data-goatcounter', `https://${code}.goatcounter.com/count`)
      script.setAttribute('data-goatcounter-settings', JSON.stringify({ allow_local: allowLocal }))
      script.src = GOATCOUNTER_URL
      script.async = true
      document.head.appendChild(script)
    }

    // Track the current page view
    if (typeof window.goatcounter?.count === 'function') {
      window.goatcounter.count()
    } else {
      // If the script hasn't loaded yet, retry once after a short delay
      const timer = setTimeout(() => {
        if (typeof window.goatcounter?.count === 'function') {
          window.goatcounter.count()
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])
}
