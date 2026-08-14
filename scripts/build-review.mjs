/**
 * Generates the self-contained design-review page.
 *
 * Fonts and screenshots are inlined as data URIs — the Artifact CSP blocks every
 * external host, and a silent font fallback would defeat the point of a page whose
 * job is to let the owner judge the typography.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const b64 = (p) => readFileSync(resolve(root, p)).toString('base64')
const font = (p) => `data:font/woff2;base64,${b64(p)}`
const shot = (n) => `data:image/jpeg;base64,${b64(`review/${n}.jpg`)}`

const FONTS = {
  archivo: font('node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'),
  newsreader: font(
    'node_modules/@fontsource-variable/newsreader/files/newsreader-latin-standard-normal.woff2',
  ),
  mono400: font('node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2'),
  mono500: font('node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2'),
}

const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version

const views = [
  {
    id: 'home-desktop',
    route: '/en/',
    viewport: '1440×900',
    title: 'Home',
    note: 'Hero, then three featured projects under the load-bearing lead-in, then the About strip and contact. Cards now lead with the research question in display type — the finding was too substantial to compress into a card. Contact is complete: email, GitHub, LinkedIn, Tableau Public.',
  },
  {
    id: 'projects-desktop',
    route: '/en/projects/',
    viewport: '1440×900',
    title: 'Projects index',
    note: 'Domain chips are built from frontmatter, not a hardcoded list, so a new project with a new domain gets a chip for free. Selecting one writes <code>?domain=</code> into the URL, which makes a filtered view shareable.',
  },
  {
    id: 'detail-desktop',
    route: '/en/projects/hospital-readmissions/',
    viewport: '1440×900',
    title: 'Project detail',
    note: 'The headline sentence is the hero, set large in condensed display type; the title above it recedes to a mono label. Title now reads “…for diabetes”, as you asked. Every project has its cover — this one is your boxplot-and-heatmap figure.',
  },
  {
    id: 'detail-antique',
    route: '/en/projects/antique-store-database/',
    viewport: '1440×900',
    title: 'Project detail — EER diagram',
    note: 'Your PDF rendered to PNG and auto-trimmed to the diagram’s bounding box, so the cover is the schema rather than a small diagram adrift in a page of white. This is the two-figure stat line, which the component handles without special-casing.',
  },
  {
    id: 'about-desktop',
    route: '/en/about/',
    viewport: '1440×900',
    title: 'About',
    note: 'Both paragraphs verbatim from Appendix A. No photo is rendered — you have not supplied one, and since stock imagery is out, a placeholder person would be worse than none.',
  },
  {
    id: 'resume-desktop',
    route: '/en/resume/',
    viewport: '1440×900',
    title: 'Resume',
    note: 'Rebuilt from your PDF: profile summary, skills, education, certifications and experience — plus the four projects pulled from the content layer so the resume and the site cannot drift. Download PDF is live for English and serves the real file.',
  },
]

const phones = [
  {
    id: 'home-phone',
    route: '/fr/',
    viewport: '390×844',
    title: 'Home — French, phone',
    note: 'The phone nav carries three items plus the language switcher. French is the widest of the three locales, so it sets the bar.',
  },
  {
    id: 'detail-phone',
    route: '/es/proyectos/reingresos-hospitalarios/',
    viewport: '390×844',
    title: 'Project detail — Spanish, phone',
    note: 'Stat line breaks 2×2 below 400px and never wraps mid-figure. Section headings and decimal separators are localized.',
  },
]

const decisions = [
  {
    kind: 'need',
    title: 'Capstone AUC and precision/recall',
    body: 'The last remaining content gap. Scaffolded in the Approach section, not invented — the sentence is written to accept the figures when you have them.',
  },
  {
    kind: 'need',
    title: 'French and Spanish resume PDFs',
    body: 'English is wired and downloading. The other two locales show a pending state rather than serving the English file under a French label.',
  },
  {
    kind: 'need',
    title: 'A Resend account',
    body: 'Needed before the contact form can actually send. Until then the page shows your email as plain selectable text, which §2 specifies as the graceful fallback.',
  },
  {
    kind: 'review',
    title: 'Cards now lead with the question',
    body: 'Your call, applied: featured cards and the index drop the finding and lead with the research question in display type. Your four titles were already framed as questions or design problems, so no new copy was needed. The full finding still opens each detail page, where it has room to land.',
  },
  {
    kind: 'review',
    title: 'Resume rebuilt from your PDF',
    body: 'The page was previously a thin scaffold. It now carries your real profile summary, skills, education, certifications and experience, transcribed from the PDF — plus the four projects pulled from the content layer so the resume and the site cannot drift apart.',
  },
  {
    kind: 'review',
    title: 'Alt text rewritten to match your figures',
    body: 'The handover described a readmission-rate-by-age chart and a regression coefficient plot. What you sent are boxplots with a correlation heatmap, and a satisfaction-by-stress bar chart. I rewrote the alt text in all three locales to describe the images you actually supplied — the old text would have misdescribed them to a screen reader.',
  },
  {
    kind: 'review',
    title: 'A caption worth a second look',
    body: 'Your readmissions figure carries a baked-in caption reading “had longer stays and received more medications on average”. The writeup’s conclusion is that the two are <em>near-identical</em> and barely correlated with readmission. Both are defensible — the coefficients are positive but tiny — but a recruiter sees the caption and the finding together, and the caption reads stronger than the finding.',
  },
  {
    kind: 'review',
    title: 'French and Spanish copy',
    body: 'I wrote all of it — UI strings and the four project writeups. Your spec allows the owner to write <em>or review</em> all three, so this is the review branch. Statistics use locale decimal separators (0,466 in French), which is correct typography but worth your eye.',
  },
  {
    kind: 'review',
    title: 'One label restructured',
    body: '<code>pipeline_seconds</code> could not survive as a bare suffix — “31 second pipeline” has no direct French or Spanish equivalent with the number outside the phrase. It now reads “secondes de pipeline” / “segundos de pipeline”, exactly the restructure Appendix C anticipated.',
  },
  {
    kind: 'deviation',
    title: 'Palette replaced §7’s cool gray',
    body: 'Your call, so this is a note rather than a question: the ground is now white and the nav has become a blue rail down the left edge. The accent blue keeps its original value but is doing structural work now. Cards picked up a faint blue bias so they read as part of the rail’s world rather than as gray boxes dropped on white.',
  },
  {
    kind: 'deviation',
    title: 'Card covers use contain, not cover',
    body: 'Your figures range from 1.35:1 to 2.26:1. Cropping them to fill a 16:9 thumbnail cut the axes and legends off the wide readmissions figure, so cards letterbox the whole chart instead. Slightly smaller, but the thumbnail actually shows the finding.',
  },
  {
    kind: 'deviation',
    title: 'run_worker_first scoped to “/”',
    body: 'Your spec says leave it at <code>false</code>. That silently breaks the Accept-Language redirect: a prerendered <code>index.html</code> exists at <code>/</code>, so the asset wins and the Worker never runs. I scoped it to just <code>["/"]</code> — every other route still serves from the edge untouched.',
  },
  {
    kind: 'deviation',
    title: 'Nested output, not flat',
    body: 'Prerendering emits <code>fr/index.html</code> rather than <code>fr.html</code>. With flat output Cloudflare 307s <code>/fr/</code> → <code>/fr</code>, which breaks the trailing-slash URLs the spec defines and costs every visitor a redirect.',
  },
]

const remaining = [
  'Contact API on the Worker — validation, KV rate limiting, honeypot',
  'PWA layer — manifest, icons, service worker, translated offline page',
  'Full Playwright suite, including the redeploy-picks-up-the-new-build test',
  'Quality floor — Lighthouse ≥95, security headers, WebP conversion',
  'Cloudflare → GitHub auto-deploy (needs an OAuth app install from you)',
]

const kindLabel = { need: 'Needs you', review: 'Review', deviation: 'Deviation' }

const viewBlock = (v) => `
      <section class="view">
        <div class="view-head">
          <p class="route">${v.route} <span class="vp">${v.viewport}</span></p>
          <h3>${v.title}</h3>
          <p class="note">${v.note}</p>
        </div>
        <figure class="frame">
          <img src="${shot(v.id)}" alt="${v.title}" loading="lazy" />
        </figure>
      </section>`

const html = `<title>Saliba Portfolio Review</title>
<style>
  @font-face{font-family:'Archivo R';src:url(${FONTS.archivo}) format('woff2-variations');font-weight:100 900;font-stretch:62% 125%;font-display:swap}
  @font-face{font-family:'Newsreader R';src:url(${FONTS.newsreader}) format('woff2-variations');font-weight:200 800;font-display:swap}
  @font-face{font-family:'Plex R';src:url(${FONTS.mono400}) format('woff2');font-weight:400;font-display:swap}
  @font-face{font-family:'Plex R';src:url(${FONTS.mono500}) format('woff2');font-weight:500;font-display:swap}

  /* The review borrows the portfolio's own tokens — it is a page about this system,
     so it should speak the system's language rather than a neutral doc theme. */
  :root{
    --ground:#ECEDEF; --panel:#F8F9FA; --ink:#101317; --muted:#6B7280;
    --rule:#C9CCD1; --signal:#1F3FD6; --flag:#D8322A; --frame:#DFE1E5;
    --display:'Archivo R','Arial Narrow',system-ui,sans-serif;
    --body:'Newsreader R',Georgia,serif;
    --mono:'Plex R',ui-monospace,Consolas,monospace;
  }
  @media (prefers-color-scheme:dark){
    :root:not([data-theme="light"]){
      --ground:#0D1013; --panel:#161A1F; --ink:#E8EAED; --muted:#8A929C;
      --rule:#2A3038; --signal:#7E95F7; --flag:#F0685F; --frame:#1E242B;
    }
  }
  :root[data-theme="dark"]{
    --ground:#0D1013; --panel:#161A1F; --ink:#E8EAED; --muted:#8A929C;
    --rule:#2A3038; --signal:#7E95F7; --flag:#F0685F; --frame:#1E242B;
  }

  *,*::before,*::after{box-sizing:border-box}
  body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--body);font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1080px;margin:0 auto;padding:clamp(1.5rem,4vw,4rem) clamp(1rem,4vw,2rem) 6rem}
  h1,h2,h3{font-family:var(--display);font-stretch:62%;font-weight:700;line-height:1.05;letter-spacing:-.01em;text-wrap:balance;margin:0}
  h1{font-size:clamp(2.6rem,7vw,4.5rem)}
  h2{font-size:clamp(1.6rem,3.4vw,2.4rem)}
  h3{font-size:clamp(1.3rem,2.4vw,1.8rem)}
  p{margin:0;text-wrap:pretty}
  code{font-family:var(--mono);font-size:.85em;background:var(--panel);border:1px solid var(--rule);border-radius:2px;padding:.08em .3em}
  a{color:var(--signal)}

  .eyebrow{font-family:var(--mono);font-size:.72rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
  header .lede{margin-top:1.25rem;max-width:60ch;font-size:1.2rem}

  .meta{display:flex;flex-wrap:wrap;gap:0;margin-top:2.5rem;border-block:1px solid var(--rule)}
  .meta div{flex:1 1 8rem;padding:.9rem 1rem .9rem 0;border-left:1px solid var(--rule);padding-left:1rem}
  .meta div:first-child{border-left:0;padding-left:0}
  .meta dt{font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 .3rem}
  .meta dd{margin:0;font-family:var(--display);font-stretch:62%;font-weight:700;font-size:1.9rem;line-height:1;font-variant-numeric:tabular-nums}

  section.view{margin-top:4.5rem}
  .view-head{max-width:66ch}
  .route{font-family:var(--mono);font-size:.78rem;color:var(--signal);word-break:break-all}
  .route .vp{color:var(--muted);margin-left:.6rem}
  .view-head h3{margin-top:.45rem}
  .note{margin-top:.7rem;color:var(--muted)}
  .frame{margin:1.5rem 0 0;padding:0;background:var(--frame);border:1px solid var(--rule);border-radius:2px;overflow:hidden}
  .frame img{display:block;width:100%;height:auto}

  .phones{display:grid;grid-template-columns:1fr;gap:2.5rem;margin-top:4.5rem}
  @media(min-width:820px){.phones{grid-template-columns:1fr 1fr}}
  .phones section.view{margin-top:0}
  .phones .frame img{max-height:none}

  .block{margin-top:5rem;padding-top:2rem;border-top:1px solid var(--rule)}
  .cards{display:grid;grid-template-columns:1fr;gap:1px;margin-top:1.75rem;background:var(--rule);border:1px solid var(--rule);border-radius:2px}
  @media(min-width:720px){.cards{grid-template-columns:1fr 1fr}}
  .card{background:var(--panel);padding:1.25rem}
  .tag{display:inline-block;font-family:var(--mono);font-size:.66rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;padding:.15rem .45rem;border-radius:2px;margin-bottom:.6rem}
  .tag.need{background:var(--flag);color:#fff}
  .tag.review{background:var(--signal);color:#fff}
  .tag.deviation{background:transparent;color:var(--muted);border:1px solid var(--rule)}
  .card h4{margin:0 0 .4rem;font-family:var(--mono);font-size:.9rem;font-weight:500;letter-spacing:.02em}
  .card p{font-size:.95rem;color:var(--muted)}

  ul.todo{margin:1.5rem 0 0;padding:0;list-style:none}
  ul.todo li{padding:.6rem 0 .6rem 1.4rem;border-bottom:1px solid var(--rule);position:relative;color:var(--muted);font-size:.98rem}
  ul.todo li::before{content:'';position:absolute;left:0;top:1.15em;width:.6rem;height:1px;background:var(--muted)}

  footer{margin-top:5rem;padding-top:1.5rem;border-top:1px solid var(--rule);font-family:var(--mono);font-size:.75rem;color:var(--muted);display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between}
  :focus-visible{outline:2px solid var(--signal);outline-offset:2px}
  @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>

<div class="wrap">
  <header>
    <p class="eyebrow">Design review · build ${version}</p>
    <h1>Three branches,<br />four projects.</h1>
    <p class="lede">
      White ground, blue rail, all four covers in place, and cards that lead with the question
      rather than the finding. Everything below is a real screenshot of the running site, not a
      mockup. What still needs your call is collected at the bottom.
    </p>

    <dl class="meta">
      <div><dt>Pages prerendered</dt><dd>25</dd></div>
      <div><dt>Locales</dt><dd>3</dd></div>
      <div><dt>Projects</dt><dd>4</dd></div>
      <div><dt>Open items</dt><dd>3</dd></div>
    </dl>
  </header>

  ${views.map(viewBlock).join('\n')}

  <div class="phones">
    ${phones.map(viewBlock).join('\n')}
  </div>

  <div class="block">
    <h2>Your call</h2>
    <p class="note" style="margin-top:.75rem;max-width:64ch">
      Red is blocking — the site ships incomplete without it. Blue is copy I wrote that you own and
      should read. Outlined items are places I departed from the spec, with the reason.
    </p>
    <div class="cards">
      ${decisions
        .map(
          (d) => `<div class="card">
        <span class="tag ${d.kind}">${kindLabel[d.kind]}</span>
        <h4>${d.title}</h4>
        <p>${d.body}</p>
      </div>`,
        )
        .join('\n      ')}
    </div>
  </div>

  <div class="block">
    <h2>Still to build</h2>
    <ul class="todo">
      ${remaining.map((r) => `<li>${r}</li>`).join('\n      ')}
    </ul>
  </div>

  <footer>
    <span>Alexandre Saliba · portfolio ${version}</span>
    <span>Archivo · Newsreader · IBM Plex Mono</span>
  </footer>
</div>
`

writeFileSync(resolve(root, 'review/index.html'), html, 'utf8')
const kb = Math.round(Buffer.byteLength(html) / 1024)
console.log(`[build-review] review/index.html — ${kb} KB`)
