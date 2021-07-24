import type Token from 'markdown-it/lib/token'
import Renderer, { RenderRule } from 'markdown-it/lib/renderer'
import type MarkdownIt from 'markdown-it'

interface Props {
  markdownIt: MarkdownIt,
  src: string,
  asyncRenderers: Record<string, (tokens: Token[], index: number, options: MarkdownIt.Options, env: any, self: Renderer) => Promise<string>>
  env?: any,
}

export default async ({
  markdownIt,
  src,
  asyncRenderers,
  env
}: Props) => {
  for (const asyncRendererName of Object.keys(asyncRenderers)) {
    if (!/[a-z0-9_-]+/i.test(asyncRendererName)) {
      throw new Error('Invalid async renderer name! Can only contain [a-z0-9_-] characters!')
    }
  }

  // replace renderers with ones that render placeholders,
  // save orignal renderers so that they be restored
  const oldRenderers: Record<string, RenderRule | undefined> = {}
  const placeholders: [Token[], number, MarkdownIt.Options, any, Renderer][] = []
  for (const asyncRendererName of Object.keys(asyncRenderers)) {
    oldRenderers[asyncRendererName] = markdownIt.renderer.rules[asyncRendererName]
    markdownIt.renderer.rules[asyncRendererName] = (tokens, index, options, env, self) => {
      const placeholderIndex = placeholders.length
      placeholders[placeholderIndex] = [tokens, index, options, env, self]
      return `<?placeholder? ${asyncRendererName} ${placeholderIndex}>`
    }
  }

  const resultWithPlaceholders = markdownIt.render(src, env)

  // restore original renderers
  for (const asyncRendererName of Object.keys(asyncRenderers)) {
    markdownIt.renderer.rules[asyncRendererName] = oldRenderers[asyncRendererName]
  }

  // find placeholders
  const placeholderMatches = [...resultWithPlaceholders.matchAll(
    /<\?placeholder\? (?<rendererName>[a-z0-9_-]+) (?<placeholderIndex>[0-9]+)>/ig
  )]

  // replace placeholders with the asyncly calculated values
  let result = resultWithPlaceholders
  await Promise.all(placeholderMatches.map(async placeholderMatch => {
    const placeholder = placeholders[parseInt(placeholderMatch.groups!!.placeholderIndex, 10)]
    const rendered = await asyncRenderers[placeholderMatch.groups!!.rendererName](...placeholder)
    result = result.replace(placeholderMatch[0], rendered)
  }))

  return result
}
