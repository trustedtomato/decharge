import fs from 'fs/promises'
import parsePost, { Post } from './parse-post.js'
import parsePath from './parse-path.js'

interface SluggedPost extends Post {
  slug: string
}

export async function pathToPost (path: string): Promise<SluggedPost> {
  const text = await fs.readFile(path, 'utf8')
  const post: SluggedPost = {
    ...await parsePost(text),
    slug: parsePath(path).name
  }
  return post
}

export default pathToPost
