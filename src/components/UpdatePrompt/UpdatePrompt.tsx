import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_VERSION } from '../../generated/version'
import styles from '../../layouts/SiteChrome.module.css'

const POLL_INTERVAL_MS = 60_000

/**
 * Detects that a newer build is live and offers a reload.
 *
 * This is the safety net for the hardest failure mode in this stack: a precached
 * service-worker shell can keep serving an old build to a returning visitor long after
 * a deploy, so the site looks "not updated" even though the deploy succeeded. §3's
 * acceptance criterion ("a redeploy reaches a previously-visited browser without a hard
 * refresh") and the versioning requirement are the same test, and this closes it.
 *
 * version.json is fetched with cache: 'no-store' so the check itself can never be
 * answered from the very cache it is meant to detect.
 */
export default function UpdatePrompt() {
  const { t } = useTranslation()
  const [latest, setLatest] = useState<string | null>(null)

  const check = useCallback(async () => {
    try {
      const response = await fetch('/version.json', { cache: 'no-store' })
      if (!response.ok) return
      const data = (await response.json()) as { version?: string }
      if (data.version && data.version !== APP_VERSION) setLatest(data.version)
    } catch {
      // Offline or blocked — nothing to do; the PWA layer handles offline UX.
    }
  }, [])

  useEffect(() => {
    void check()

    const timer = window.setInterval(() => void check(), POLL_INTERVAL_MS)
    // Returning to the tab is the moment a stale build is most likely and most
    // noticeable, so re-check then rather than waiting out the interval.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [check])

  const reload = useCallback(async () => {
    // Retire the waiting service worker first, or the reload just re-serves the old
    // precached shell and the prompt reappears.
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        await registration?.update()
        registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
      }
    } catch {
      // Fall through to a plain reload.
    }
    window.location.reload()
  }, [])

  if (!latest) return null

  return (
    <div className={styles.updateBar} role="status" data-testid="update-prompt">
      <span>{t('update.available')}</span>
      <button type="button" className={styles.updateButton} onClick={() => void reload()}>
        {t('update.reload')}
      </button>
    </div>
  )
}
