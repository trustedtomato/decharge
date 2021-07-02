import readdirp from 'readdirp'
import Layout from '../../components/Layout.js'
import pathToPost, { SluggedPost } from '../../utils/path-to-post.js'

const posts: SluggedPost[] = []
for await (const { fullPath } of readdirp('src/posts', { fileFilter: '*.md' })) {
  posts.push(
    await pathToPost(fullPath)
  )
}

posts.sort((a, b) => Number(a.metadata.date) - Number(b.metadata.date))

export const propsList = posts

function getPreviousPostLink (post: SluggedPost) {
  const index = posts.indexOf(post)
  if (index === -1) {
    throw new Error(`${JSON.stringify(post)} is not a real post! It's an impostor, haha.`)
  }
  const previousPost = posts[index - 1]
  if (!previousPost) return null
  return <a class="link-to-previous-post" href={`/posts/${previousPost.slug}`}>
    Previous post ({previousPost.metadata.title})
  </a>
}

function getNextPostLink (post: SluggedPost) {
  const index = posts.indexOf(post)
  if (index === -1) {
    throw new Error(`${JSON.stringify(post)} is not a real post! It's an impostor, haha.`)
  }
  const nextPost = posts[index + 1]
  if (!nextPost) return null
  return <a class="link-to-next-post" href={`/posts/${nextPost.slug}`}>
    Next post ({nextPost.metadata.title})
  </a>
}

export default (post: SluggedPost) => <Layout description={post.metadata.excerpt} extraTitle={post.metadata.title}>
  <link rel="stylesheet" href="/styles/post.css" />
  <header>
    <h1>{post.metadata.title}</h1>
    <p>{new Date(post.metadata.date).toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
  </header>
  <main dangerouslySetInnerHTML={{ __html: post.content }} />
  <nav>
    {getPreviousPostLink(post)}
    <span style="flex-grow: 1" />
    {getNextPostLink(post)}
  </nav>
</Layout>
