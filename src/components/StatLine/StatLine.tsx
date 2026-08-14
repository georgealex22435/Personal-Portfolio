import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Locale } from '../../i18n/locales'
import styles from './StatLine.module.css'

export interface Stat {
  /** i18n key — the label is translated per locale, the value never is. */
  key: string
  /** Raw number. Formatting is Intl's job, per §5. */
  value: number
  /** Resolved label text for the active locale. */
  label: string
}

interface Props {
  stats: Stat[]
  locale: Locale
  /** Count-up is the page's one animation; suppress it for offscreen instances. */
  animate?: boolean
}

const isBrowser = typeof window !== 'undefined'

/** SSR-safe layout effect: silent on the server, pre-paint in the browser. */
const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect

function prefersReducedMotion(): boolean {
  if (!isBrowser) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * §7's signature element.
 *
 * Numbers are formatted with Intl per locale — 101,766 (en) / 101 766 (fr) /
 * 101.766 (es). §5 calls this out specifically: the stat line is the signature
 * element and wrong separators look sloppy to a native reader.
 *
 * The count-up animation is the entire animation budget for the site: 500ms,
 * staggered 60ms per column. Final values are rendered on the server and during
 * hydration, so the prerendered HTML always carries the real numbers — a crawler,
 * a no-JS visitor, and `prefers-reduced-motion` all see them immediately.
 */
export default function StatLine({ stats, locale, animate = true }: Props) {
  const formatter = new Intl.NumberFormat(locale)
  const finals = stats.map((stat) => stat.value)

  // Server and first client paint both render the final values.
  const [displayed, setDisplayed] = useState<number[]>(finals)
  const frame = useRef<number | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (!animate || prefersReducedMotion()) return

    const duration = 500
    const stagger = 60
    const start = performance.now()

    // Reset to zero pre-paint so there is no flash of the final value.
    setDisplayed(finals.map(() => 0))

    const tick = (now: number) => {
      const elapsed = now - start
      let settled = true

      const next = finals.map((target, index) => {
        const local = elapsed - index * stagger
        if (local <= 0) {
          settled = false
          return 0
        }
        if (local >= duration) return target
        settled = false
        // easeOutCubic — decelerating, like a scoreboard settling.
        const t = local / duration
        const eased = 1 - Math.pow(1 - t, 3)
        return Math.round(target * eased)
      })

      setDisplayed(next)
      if (!settled) frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      setDisplayed(finals)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, stats.map((s) => `${s.key}:${s.value}`).join('|')])

  return (
    <dl
      className={styles.statLine}
      data-testid="stat-line"
    >
      {stats.map((stat, index) => (
        <div key={stat.key} className={styles.stat}>
          {/* Semantic order: the label is the term, the figure is its description.
              CSS reverses them visually so the number sits on top, per §7's layout. */}
          <dt className={styles.label}>{stat.label}</dt>
          <dd className={styles.value} data-testid={`stat-value-${stat.key}`}>
            {formatter.format(displayed[index] ?? stat.value)}
          </dd>
        </div>
      ))}
    </dl>
  )
}
