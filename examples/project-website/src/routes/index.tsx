import Layout from '../components/Layout.js'
import Sidenote from '../components/Sidenote.js'
import SidenoteRef from '../components/SidenoteRef.js'
import SidenoteFull from '../components/SidenoteFull.js'
import Arrow from '../components/DownArrow.js'
import TableOfContents from '../components/TableOfContents.js'
import DechargeBanner from '../components/DechargeBanner.js'

import { useConstAsync, usePageContext, useRerenderingRef } from 'decharge/hooks'
import { renderComponent } from 'decharge'
import MarkdownIt from 'markdown-it'
import MarkdownItAnchor from 'markdown-it-anchor'
import MarkdownItSidenote from '../utils/markdown-it-plugin-sidenote-parser.js'
import asyncRenderMarkdown from '../utils/async-render-markdown.js'
import slugify from '@sindresorhus/slugify'
import { URL } from 'url'
import fs from 'fs/promises'
import prism from 'prismjs'
import 'prismjs/plugins/autolinker/prism-autolinker.js'
import prismLoadLanguages from 'prismjs/components/index.js'

prismLoadLanguages(['tsx'])

const languages = new Set([
  'tsx',
  // In prism, these are loaded by default.
  'markup',
  'html',
  'svg',
  'atom',
  'rss',
  'css',
  'clike',
  'javascript'
])

const markdownIt = new MarkdownIt({
  typographer: true,
  linkify: true,
  highlight: (src, lang) => {
    if (lang && languages.has(lang)) {
      try {
        // Have to use this workaround due to:
        // https://github.com/PrismJS/prism/issues/1171
        const grammar = prism.languages[lang]
        prism.hooks.run('before-highlight', { grammar })
        const highlighted = prism.highlight(src, grammar, lang)
        return `<pre><code class="block language-${lang}">${highlighted}</code></pre>`
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
  .use(MarkdownItSidenote)

const getSidenoteHtmlId = (index: string, options: MarkdownIt.Options, env: any): string => {
  return `docs-sn${index}`
}

export default function Index () {
  const pageContext = usePageContext()

  const docs = useConstAsync(async () => {
    return await asyncRenderMarkdown({
      src: await fs.readFile(new URL('../documentation.md', import.meta.url), 'utf-8'),
      markdownIt,
      asyncRenderers: {
        sidenote_ref: async (tokens, idx, options, env) => {
          const targetIndex = tokens[idx].meta.targetIndex.toString()
          const targetHtmlId = getSidenoteHtmlId(
            targetIndex,
            options,
            env
          )
          return renderComponent(() => <SidenoteRef
            targetId={targetHtmlId}
            targetIndex={targetIndex}
          />, pageContext!!)
        },
        sidenote_start: async (tokens, idx, options, env) => {
          const index = tokens[idx].meta.index
          const htmlId = getSidenoteHtmlId(
            index,
            options,
            env
          )
          const rendered = await renderComponent(() => <Sidenote
            id={htmlId}
            index={index}
          >?children-placeholder?</Sidenote>, pageContext!!)
          return rendered.replace(/\?children-placeholder\?[\s\S]*$/, '')
        },
        sidenote_end: async (tokens, idx, options, env) => {
          const index = tokens[idx].meta.index
          const htmlId = getSidenoteHtmlId(
            index,
            options,
            env
          )
          const rendered = await renderComponent(() => <Sidenote
            id={htmlId}
            index={index}
          >?children-placeholder?</Sidenote>, pageContext!!)
          return rendered.replace(/^[\s\S]*\?children-placeholder\?/, '')
        }
      }
    })
  })

  const docsContentRef = useRerenderingRef<HTMLDivElement>()

  return !docs
    ? <>{null}</>
    : <Layout description="Documentation and project website of decharge, the completely disappearing TSX framework.">
      <header>
        <h1>
          <DechargeBanner />
        </h1>
        <p>A TSX based framework which disappears <em>completely.</em></p>
      </header>
      <section class="introduction full-text">
        <div class="body-text">
          <p>
            Blogs, documentation and similar software often don’t need a lot of
            client-side JavaScript and are only consisting of static files.
            This framework aims to make the best out of this scenario.
            It features a <em>routing system similar to Next.js’</em> and
            uses <em><a href="https://www.typescriptlang.org/docs/handbook/jsx.html">TSX</a> as
            its templating system</em> so the framework can leverage <em>the amazing
            IDE support of React</em><SidenoteFull index={1} id="int-sn1">
              decharge uses Preact under the hood though, but that shouldn’t really matter.
            </SidenoteFull>.
          </p>
          <p>
            It has a component system and a rendering engine
            which was designed to <em>output as little code as possible</em> on build<SidenoteFull index={2} id="int-sn2">
              except for trivial minifaction, which should be done
              using html-minifier or similar after building the project.
            </SidenoteFull>.
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
