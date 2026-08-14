import { z } from 'zod'
import type { Env } from './index'

/**
 * POST /api/contact — handover §2.
 *
 * Validates with Zod, rate-limits by IP in Workers KV, drops honeypot submissions, and
 * forwards through Resend's HTTP API. Workers is not Node: no nodemailer, no SMTP — an
 * HTTP API is the only way to send mail from here.
 */

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(5000),
  /**
   * Honeypot. Real users never see this field, so anything in it is a bot. Named
   * plausibly ("company") because bots fill fields whose names look real and skip
   * ones called "honeypot".
   */
  company: z.string().max(0).optional(),
})

const RATE_LIMIT = { max: 5, windowSeconds: 3600 }

interface RateState {
  count: number
  resetAt: number
}

/**
 * Fixed-window rate limit keyed by hashed IP.
 *
 * The IP is hashed with SHA-256 before it becomes a KV key so the store never holds raw
 * addresses. KV is eventually consistent, so a determined attacker could squeeze a few
 * extra requests through concurrent edges — acceptable for a contact form, where the
 * goal is stopping casual abuse rather than a hard guarantee.
 */
async function checkRateLimit(
  env: Env,
  ip: string,
): Promise<{ allowed: boolean; retryAfter: number }> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip))
  const hash = [...new Uint8Array(digest)]
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const key = `contact:rate:${hash}`

  const now = Math.floor(Date.now() / 1000)
  const existing = await env.CACHE.get<RateState>(key, 'json')

  if (!existing || existing.resetAt <= now) {
    const state: RateState = { count: 1, resetAt: now + RATE_LIMIT.windowSeconds }
    await env.CACHE.put(key, JSON.stringify(state), { expirationTtl: RATE_LIMIT.windowSeconds })
    return { allowed: true, retryAfter: 0 }
  }

  if (existing.count >= RATE_LIMIT.max) {
    return { allowed: false, retryAfter: existing.resetAt - now }
  }

  const state: RateState = { count: existing.count + 1, resetAt: existing.resetAt }
  await env.CACHE.put(key, JSON.stringify(state), {
    expirationTtl: Math.max(1, existing.resetAt - now),
  })
  return { allowed: true, retryAfter: 0 }
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  )
}

/** True when the deployment has everything it needs to actually send mail. */
export function isContactConfigured(env: Env): boolean {
  return Boolean(env.RESEND_API_KEY && env.CONTACT_TO && env.CONTACT_FROM)
}

export async function handleContact(request: Request, env: Env): Promise<Response> {
  const json = (body: unknown, status: number, headers: HeadersInit = {}) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json', ...headers },
    })

  // §2: if the endpoint slips, ship without it and degrade gracefully. A clear 503 lets
  // the client hide the form and show the plain email instead of failing silently.
  if (!isContactConfigured(env)) {
    return json({ ok: false, error: 'not_configured' }, 503)
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400)
  }

  const parsed = ContactSchema.safeParse(payload)
  if (!parsed.success) {
    return json(
      {
        ok: false,
        error: 'validation_failed',
        fields: parsed.error.issues.map((i) => i.path.join('.')),
      },
      400,
    )
  }

  // Honeypot filled → accept and discard. Returning 200 denies the bot the signal it
  // would get from a rejection, and nothing is sent.
  if (parsed.data.company) {
    return json({ ok: true }, 200)
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  const { allowed, retryAfter } = await checkRateLimit(env, ip)
  if (!allowed) {
    return json({ ok: false, error: 'rate_limited' }, 429, {
      'Retry-After': String(retryAfter),
    })
  }

  const { name, email, message } = parsed.data

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      // So a reply in the mail client goes to the sender, not to the site.
      reply_to: email,
      subject: `Portfolio contact — ${name}`,
      html:
        `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>` +
        `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    }),
  })

  if (!response.ok) {
    // Never surface the upstream body — it can echo the API key's account details.
    console.error('resend failed', response.status)
    return json({ ok: false, error: 'send_failed' }, 502)
  }

  return json({ ok: true }, 200)
}
