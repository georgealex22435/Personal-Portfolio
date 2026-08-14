import type { Plugin } from 'vite'
import matter from 'gray-matter'
import { load as loadYaml } from 'js-yaml'
import { marked } from 'marked'

/**
 * Compiles .md and .yaml content to plain JS modules at build time.
 *
 * The point is bundle size. §10 caps total JS at 120KB gzipped; gray-matter, js-yaml
 * and marked together are far larger than the entire budget. Doing the parsing here
 * means the client receives finished HTML strings and plain objects, and none of these
 * three libraries appear in the browser bundle at all.
 *
 * It also means malformed frontmatter fails the build rather than rendering a broken
 * page — consistent with §5's "fail loudly" stance on content problems.
 */
export function contentPlugin(): Plugin {
  return {
    name: 'portfolio-content',
    enforce: 'pre',

    transform(code, id) {
      const [path] = id.split('?')
      if (!path) return null

      if (path.endsWith('.md')) {
        const { data, content } = matter(code)
        const html = marked.parse(content, { async: false, gfm: true }) as string

        return {
          code:
            `export const frontmatter = ${JSON.stringify(data)};\n` +
            `export const html = ${JSON.stringify(html)};\n` +
            `export default { frontmatter, html };\n`,
          map: null,
        }
      }

      if (path.endsWith('.yaml') || path.endsWith('.yml')) {
        const data = loadYaml(code)
        return {
          code: `export default ${JSON.stringify(data)};\n`,
          map: null,
        }
      }

      return null
    },
  }
}
