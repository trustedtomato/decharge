import type MarkdownIt from 'markdown-it'
import type { RuleInline } from 'markdown-it/lib/parser_inline'

const sidenoteParser: RuleInline = (state, silent): boolean => {
  const posMax = state.posMax
  let pos = state.pos

  if (state.src[pos] !== '^') {
    return false
  }

  pos++

  let id: string | null = null
  if (state.src[pos] !== '[') {
    const idMatch = state.src.slice(pos, posMax).match(/(?<id>[a-z0-9_-]+)\[/)
    if (!idMatch) {
      // The sidenote label is invalid.
      return false
    }
    id = idMatch.groups!!.id
    pos += idMatch[0].length - 1
  }

  pos++

  // this helper returns the index of the matching ']'
  const contentStart = pos
  const contentEnd = state.md.helpers.parseLinkLabel(state, contentStart)

  if (contentEnd === -1) {
    // There is no valid content end.
    return false
  }

  // put pos on the closing ']'
  pos = contentEnd

  if (pos > posMax) {
    return false
  }

  // We found the end of the sidenote, and know for a fact it's a valid sidenote;
  // so all that's left to do is to call tokenizer.
  if (!silent) {
    if (typeof state.env.nextSidenoteIndex !== 'number') {
      state.env.nextSidenoteIndex = 1
    }

    if (!(state.env.sidenoteIndicies instanceof Map)) {
      state.env.sidenoteIndicies = new Map()
    }

    const sidenoteIndex = state.env.nextSidenoteIndex
    state.env.nextSidenoteIndex++

    if (id) {
      state.env.sidenoteIndicies.set(id, sidenoteIndex)
    }

    const referenceToken = state.push('sidenote_ref', '', 0)
    const startToken = state.push('sidenote_start', '', 1)

    state.pos = contentStart
    state.posMax = contentEnd
    state.md.inline.tokenize(state)

    const endToken = state.push('sidenote_end', '', -1)

    referenceToken.meta = {
      targetIndex: sidenoteIndex
    }
    startToken.meta = endToken.meta = {
      index: sidenoteIndex
    }
  }

  state.pos = pos + 1
  state.posMax = posMax
  return true
}

const sidenoteReferenceParser: RuleInline = (state, silent) => {
  let pos = state.pos
  const posMax = state.posMax

  if (
    state.src[state.pos + 0] !== '[' ||
    state.src[state.pos + 1] !== '^'
  ) {
    return false
  }
  pos += 2

  const idMatch = state.src.slice(pos, posMax).match(/(?<id>[a-z0-9_-]+)\]/)
  if (!idMatch) {
    return false
  }
  // put pos on the closing ']'
  pos += idMatch[0].length - 1

  if (pos > posMax) {
    return false
  }

  // We found the end of the sidenote, and know for a fact it's a valid sidenote;
  // so all that's left to do is to call tokenizer.
  if (!silent) {
    const targetSidenoteIndex = state.env.sidenoteIndicies?.get?.(idMatch)
    if (typeof targetSidenoteIndex !== 'number') {
      return false
    }

    const referenceToken = state.push('sidenote_ref', '', 0)
    referenceToken.meta = {
      target: targetSidenoteIndex
    }
  }

  state.pos = pos + 1
  return true
}

/**
 * Note that this is just the parser,
 * You should include these renderers by yourself:
 * - sidenote_ref
 * - sidenote_start
 * - sidenote_end
 */
export default function (md: MarkdownIt) {
  md.inline.ruler.before('image', 'sidenote', sidenoteParser)
  md.inline.ruler.after('sidenote', 'sidenote_ref', sidenoteReferenceParser)
}
