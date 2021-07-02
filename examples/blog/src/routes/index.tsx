import readdirp from 'readdirp'
import Layout from '../components/Layout.js'
import Image from '../components/Image.js'
import pathToPost, { SluggedPost } from '../utils/path-to-post.js'

const posts: SluggedPost[] = []
for await (const { fullPath } of readdirp('src/posts', { fileFilter: '*.md' })) {
  posts.push(
    await pathToPost(fullPath)
  )
}

export default async () => <>
  <Layout description="The blog of Raskolnikov.">
    <link rel="stylesheet" href="/styles/home.css" />
    <header>
      <h1>
        Raskolnikov's blog
      </h1>
      <p>
        Written in third person.
      </p>
    </header>
    <div class="not-header">
      <aside>
        <p>
          You can now grab a copy of <a href="https://www.gutenberg.org/files/2554/2554-h/2554-h.htm">his new
          book</a>.
        </p>
        <Image
          src="/images/crime-and-punishment-cover.jpg"
          alt="Cover of Crime and punishment."
          widthConditions={[
            ['32rem']
          ]}
          widthVersions={[320]}
        />
      </aside>
      <main>
        {
          posts
            .sort((a, b) => Number(a.metadata.date) - Number(b.metadata.date))
            .map(({ metadata, slug }) => <div class="post" key={slug}>
              <h2 class="post__title"><a href={`/posts/${slug}`}>{metadata.title}</a></h2>
              <div class="post__date">{new Date(metadata.date).toLocaleDateString('en-US', { dateStyle: 'full' })}</div>
              <div class="post__excerpt">{metadata.excerpt}</div>
              <a class="post__readmore" href={`/posts/${slug}`}>Read more…</a>
            </div>)
        }
      </main>
    </div>
  </Layout>
</>
