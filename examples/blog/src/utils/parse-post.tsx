import fs from 'fs/promises'
import markdownToHtml from '../patched-packages/marked/marked.js'
import parseFrontmatter from 'gray-matter'
import striptags from 'striptags'
import Image from '../components/Image.js'
import { render } from 'decharge'

export interface Post {
  metadata: Record<string, string>
  content: string
}

/* markdownToHtml.setOptions({
  baseUrl: base
}) */

markdownToHtml.use({
  renderer: {
    async image (src: string, title: string, alt: string) {
      return await render(<Image src={src} title={title} alt={alt} />)
    }
  }
})

export async function getPost (slug: string) {
  const post = await fs.readFile(`src/posts/${slug}.md`, 'utf-8')
  const { content: contentInMarkdown, data: metadata, excerpt } = parseFrontmatter(post, {
    excerpt: true,
    excerpt_separator: '\n\n'
  })
  const content = await markdownToHtml(contentInMarkdown)

  return {
    content,
    excerpt,
    metadata,
    slug
  }
}

export async function parsePost (postText: string): Promise<Post> {
  const { content: contentInMarkdown, data: metadata, excerpt: rawExcerpt } = parseFrontmatter(postText, {
    excerpt: true,
    excerpt_separator: '\n\n'
  })

  const content = await markdownToHtml(contentInMarkdown)
  const excerpt = striptags(await markdownToHtml(rawExcerpt))

  return {
    content,
    metadata: {
      excerpt,
      ...metadata
    }
  }
}

export default parsePost
