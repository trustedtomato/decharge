import readdirp from 'readdirp'
import Layout from '../../components/Layout.js'
import pathToPost, { SluggedPost } from '../../utils/path-to-post.js'
import type { DynamicRoute } from 'decharge'

const posts: SluggedPost[] = []
for await (const { fullPath } of readdirp('src/posts', { fileFilter: '*.md' })) {
  posts.push(
    await pathToPost(fullPath)
  )
}

posts.sort((a, b) => Number(a.metadata.date) - Number(b.metadata.date))

function getPreviousPostLink (index: number) {
  const previousPost = posts[index - 1]
  if (!previousPost) return null
  return <a class="link-to-previous-post" href={`/posts/${previousPost.slug}`}>
    Previous post ({previousPost.metadata.title})
  </a>
}

function getNextPostLink (index: number) {
  const nextPost = posts[index + 1]
  if (!nextPost) return null
  return <a class="link-to-next-post" href={`/posts/${nextPost.slug}`}>
    Next post ({nextPost.metadata.title})
  </a>
}

const route: DynamicRoute<SluggedPost> = {
  dataList: posts,
  Page: ({ data, index }) =>
    <Layout description={data.metadata.excerpt} extraTitle={data.metadata.title}>
      <link rel="stylesheet" href="/styles/post.css" />
      <header>
        <h1>{data.metadata.title}</h1>
        <p>{new Date(data.metadata.date).toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
      </header>
      <main dangerouslySetInnerHTML={{ __html: data.content }} />
      <nav>
        {getPreviousPostLink(index)}
        <span style="flex-grow: 1" />
        {getNextPostLink(index)}
      </nav>
    </Layout>
}

export default route
