import Layout from '../components/Layout.js'
import Sidenote from '../components/Sidenote.js'
import Arrow from '../components/DownArrow.js'
import TableOfContents from '../components/TableOfContents.js'
import { useRerenderingRef } from 'decharge/hooks'

function Index () {
  const docsContentRef = useRerenderingRef<HTMLDivElement>()

  return <Layout description="Documentation and project website of decharge, the completely disappearing TSX framework.">
    <header>
      <h1>decharge</h1>
      <p>A TSX based framework which disappears <em>completely.</em></p>
    </header>
    <section class="introduction">
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
    </section>
    <Arrow length={7} />
    <section class="docs">
      <div class="docs__content" ref={docsContentRef}>
        <h2>Getting started</h2>
        <h2>Test</h2>
        <h3>Blabla</h3>
        <h4>Coconut</h4>
        <p>
          To make a basic project, run <code>pnpm init decharge .</code><Sidenote index={3}>
            You can also use npm or yarn if you’d like, it’s just that pnpm is used for decharge development.
          </Sidenote>.
          This will initalize the current directory.
          Then use <code>pnpm install</code><Sidenote index={3} /> to install the dependencies,
          <code>pnpm run watch</code><Sidenote index={3} /> to start continuously compiling the project
          and <code>pnpm run dev-server</code><Sidenote index={3} /> to run a browser-sync on the dist/ directory.
        </p>
      </div>
      <div class="docs__table-of-contents">
        {docsContentRef.current?.textContent}
        <TableOfContents basedOn={docsContentRef.current} />
      </div>
    </section>
  </Layout>
}

export default () => <Index />
