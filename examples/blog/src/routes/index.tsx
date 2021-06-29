import readdirp from 'readdirp'
import Layout from '../components/Layout.js'
import Image from '../components/Image.js'
import pathToPost from '../utils/path-to-post.js'

const posts = []
for await (const { fullPath } of readdirp('src/posts', { fileFilter: '*.md' })) {
  posts.push(
    await pathToPost(fullPath)
  )
}

export default async () => <>
  <Layout description="The portfolio and blog of Tamás Halasi. Some of his writings are pretty neat.">
    <header>
      <h1>
        Tamás Halasi
      </h1>
      <div>
        <Image
          src="/images/shocked.jpg"
          alt="I am shocked"
          widthConditions={[
            ['32rem']
          ]}
          widthVersions={[512, 576]}
        />
        <h3>
          What have I done?!
        </h3>
        <a href="/projects/">Projects connected to programming</a>,<br/>
        <a href="/">writings about stuff</a> and <a href="/about/">an “About” page</a>.
      </div>
    </header>
    <div>
      {
        posts.map(({ metadata, content, slug }) => <div class="post">
            <h2 class="post__title"><a href={`/posts/${slug}`}>{metadata.title}</a></h2>
            <div class="post__date">{metadata.date.toLocaleDateString('en-US', { dateStyle: 'full' })}</div>
            <div class="post__excerpt">{metadata.excerpt}</div>
            <a class="post__readmore" href={`/posts/${slug}`}>Read more…</a>
        </div>)
      }
    </div>
  </Layout>
</>