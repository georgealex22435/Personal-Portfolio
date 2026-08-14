import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './ContactForm.module.css'

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'rate_limited'

/**
 * Contact form — handover §2.
 *
 * Progressive enhancement, deliberately. The page is prerendered and the email address
 * is always in the static HTML, so a visitor with no JS, a failed fetch, or an
 * unconfigured deployment still gets a working way to make contact. The form only
 * appears once /api/health confirms the Worker can actually send — §2's "contact form
 * hidden, plain email address shown" is the default state, not the failure state.
 */
export default function ContactForm() {
  const { t } = useTranslation()
  const [enabled, setEnabled] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    let cancelled = false
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { contactEnabled?: boolean } | null) => {
        if (!cancelled && data?.contactEnabled) setEnabled(true)
      })
      .catch(() => {
        // Offline or blocked — the email address in the static HTML still stands.
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!enabled) return null

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    setStatus('sending')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.get('name') ?? ''),
          email: String(data.get('email') ?? ''),
          message: String(data.get('message') ?? ''),
          company: String(data.get('company') ?? ''),
        }),
      })

      if (response.ok) {
        setStatus('sent')
        form.reset()
      } else if (response.status === 429) {
        setStatus('rate_limited')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate data-testid="contact-form">
      <div className={styles.field}>
        <label className={styles.label} htmlFor="contact-name">
          {t('contactForm.name')}
        </label>
        <input
          id="contact-name"
          name="name"
          className={styles.input}
          type="text"
          required
          maxLength={100}
          autoComplete="name"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contact-email">
          {t('contactForm.email')}
        </label>
        <input
          id="contact-email"
          name="email"
          className={styles.input}
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contact-message">
          {t('contactForm.message')}
        </label>
        <textarea
          id="contact-message"
          name="message"
          className={styles.textarea}
          required
          minLength={10}
          maxLength={5000}
        />
      </div>

      {/* Honeypot: invisible, unfocusable, and hidden from assistive tech. Bots fill it. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button className={styles.submit} type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? t('contactForm.sending') : t('contactForm.send')}
      </button>

      {/* role="status" so the outcome is announced without stealing focus. */}
      <p role="status" aria-live="polite">
        {status === 'sent' && <span className={styles.statusOk}>{t('contactForm.sent')}</span>}
        {status === 'error' && <span className={styles.statusError}>{t('contactForm.error')}</span>}
        {status === 'rate_limited' && (
          <span className={styles.statusError}>{t('contactForm.rateLimited')}</span>
        )}
      </p>
    </form>
  )
}
