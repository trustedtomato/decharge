import Layout from '../components/Layout.js'
import Sidenote from '../components/Sidenote.js'
import Arrow from '../components/DownArrow.js'
import TableOfContents from '../components/TableOfContents.js'
import { useRerenderingRef } from 'decharge/hooks'
import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import slugify from '@sindresorhus/slugify'
import { URL } from 'url'
import fs from 'fs/promises'
import hljs from 'highlight.js/lib/core'
import tsHljs from 'highlight.js/lib/languages/typescript'
import xmlHljs from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('xml', xmlHljs)
hljs.registerAliases([
  'html',
  'xhtml',
  'rss',
  'atom',
  'xjb',
  'xsd',
  'xsl',
  'plist',
  'wsf',
  'svg'
], { languageName: 'xml' })
hljs.registerLanguage('ts', tsHljs)
hljs.registerAliases(['tsx', 'typescript', 'jsx', 'js'], { languageName: 'ts' })

const markdownIt = new MarkdownIt({
  typographer: true,
  linkify: true,
  highlight: (src, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(src, { language: lang }).value
        return `<pre><code class="block">${highlighted}</code></pre>`
      } catch (__) {}
    }
    // use external default escaping
    return ''
  }
})
  .use(MarkdownItAnchor, {
    slugify: (s) => `docs-${slugify(s)}`,
    permalink: MarkdownItAnchor.permalink.headerLink()
  })

async function renderMarkdown (src: string): Promise<string> {
  return markdownIt.render(src)
}

const docs = await renderMarkdown(await fs.readFile(new URL('../documentation.md', import.meta.url), 'utf-8'))

function Index () {
  const docsContentRef = useRerenderingRef<HTMLDivElement>()

  return <Layout description="Documentation and project website of decharge, the completely disappearing TSX framework.">
    <header>
      <h1>decharge</h1>
      <p>A TSX based framework which disappears <em>completely.</em></p>
    </header>
    <section class="introduction full-text">
      <div class="body-text">
        <p>
          Blogs, documentation and similar software often don’t need a lot of
          client-side JavaScript and are only consisting of static files.
          This framework aims to make the best out of this scenario.
          It features a <em>routing system similar to Next.js’</em> and uses
          <em><a href="https://www.typescriptlang.org/docs/handbook/jsx.html">TSX</a> as
          its templating system</em> so the framework can leverage <em>the amazing
          IDE support of React</em><Sidenote index={1}>
            decharge uses Preact under the hood though, but that shouldn’t really matter.
          </Sidenote>.
        </p>
        <p>
          It has a component system and a rendering engine
          which was designed to <em>output as little code as possible</em> on build<Sidenote index={2}>
            except for trivial minifaction, which should be done
            using html-minifier or similar after building the project.
          </Sidenote>.
          As an example, the size of this page’s HTML-CSS-JS code is 2.32 kB combined
          (1.5 kB if gzipped).
        </p>
        <p>
          If you found these two paragraphs interesting,
          consider checking out the <a href="#getting-started">Getting started</a> guide below
          or the <a href="https://github.com/trustedtomato/decharge">GitHub page</a> of
          the project.
        </p>
      </div>
    </section>
    <Arrow length={7} />
    <section class="docs">
      <div class="docs__table-of-contents">
        <h2>Table of contents</h2>
        <TableOfContents basedOn={docsContentRef.current} />
      </div>
      <div class="docs__content full-text" ref={docsContentRef}>
        <div class="body-text" dangerouslySetInnerHTML={{ __html: docs }} />
      </div>
    </section>
  </Layout>
}

export default () => <Index />
