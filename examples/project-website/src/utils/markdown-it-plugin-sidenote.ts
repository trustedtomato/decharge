import type MarkdownIt from 'markdown-it'
import type { RuleBlock } from 'markdown-it/lib/parser_block'
import type { RuleInline } from 'markdown-it/lib/parser_inline'
import type Token from 'markdown-it/lib/token'
import type { RenderRule } from 'markdown-it/lib/renderer'
import type { RuleCore } from 'markdown-it/lib/parser_core'

// Process footnotes
//

/// /////////////////////////////////////////////////////////////////////////////
// Renderer partials

const renderFootnoteAnchorName: RenderRule = (tokens, idx, options, env/*, slf */) => {
  const n = Number(tokens[idx].meta.id + 1).toString()
  let prefix = ''

  if (typeof env.docId === 'string') {
    prefix = `-${env.docId}-`
  }

  return prefix + n
}

const renderFootnoteCaption: RenderRule = (tokens, idx/*, options, env, slf */) => {
  let n = Number(tokens[idx].meta.id + 1).toString()

  if (tokens[idx].meta.subId > 0) {
    n += `:${tokens[idx].meta.subId}`
  }

  return `[${n}]`
}

const renderFootnoteRef: RenderRule = (tokens, idx, options, env, slf) => {
  const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf)
  const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf)
  let refid = id

  if (tokens[idx].meta.subId > 0) {
    refid += `:${tokens[idx].meta.subId}`
  }

  return `<sup class="footnote-ref"><a href="#fn${id}" id="fnref${refid}">${caption}</a></sup>`
}

const renderFootnoteBlockOpen: RenderRule = (tokens, idx, options) => {
  return `${options.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n'
         }<section class="footnotes">\n` +
         '<ol class="footnotes-list">\n'
}

const renderFootnoteBlockClose: RenderRule = () => {
  return '</ol>\n</section>\n'
}

const renderFootnoteOpen: RenderRule = (tokens, idx, options, env, slf) => {
  let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf)

  if (tokens[idx].meta.subId > 0) {
    id += `:${tokens[idx].meta.subId}`
  }

  return `<li id="fn${id}" class="footnote-item">`
}

const renderFootnoteClose: RenderRule = () => {
  return '</li>\n'
}

const renderFootnoteAnchor: RenderRule = (tokens, idx, options, env, slf) => {
  let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf)

  if (tokens[idx].meta.subId > 0) {
    id += `:${tokens[idx].meta.subId}`
  }

  /* ↩ with escape code to prevent display as Apple Emoji on iOS */
  return ` <a href="#fnref${id}" class="footnote-backref">\u21a9\uFE0E</a>`
}

export default function (md: MarkdownIt) {
  const parseLinkLabel = md.helpers.parseLinkLabel
  const isSpace = md.utils.isSpace

  md.renderer.rules.footnote_ref = renderFootnoteRef
  md.renderer.rules.footnote_block_open = renderFootnoteBlockOpen
  md.renderer.rules.footnote_block_close = renderFootnoteBlockClose
  md.renderer.rules.footnote_open = renderFootnoteOpen
  md.renderer.rules.footnote_close = renderFootnoteClose
  md.renderer.rules.footnote_anchor = renderFootnoteAnchor

  // helpers (only used in other rules, no tokens are attached to those)
  md.renderer.rules.footnote_caption = renderFootnoteCaption
  md.renderer.rules.footnote_anchor_name = renderFootnoteAnchorName

  // Process footnote block definition
  const footnoteDef: RuleBlock = (state, startLine, endLine, silent) => {
    let pos
    let token
    let offset
    let ch
    const start = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    // line should be at least 5 chars - "[^x]:"
    if (start + 4 > max) { return false }

    if (state.src[start + 0] !== '[') { return false }
    if (state.src[start + 1] !== '^') { return false }
    if (state.src[start + 2] === ']') { return false } // no empty footnote labels

    for (pos = start + 2; pos < max; pos++) {
      if (state.src[pos] === ' ') { return false }
      if (state.src[pos] === ']') {
        break
      }
    }

    const label = state.src.slice(start + 2, pos - 2)

    pos++
    if (pos >= max || state.src[pos] !== ':') { return false }
    if (silent) { return true }
    pos++

    if (!state.env.footnotes) { state.env.footnotes = {} }
    if (!state.env.footnotes.refs) { state.env.footnotes.refs = {} }
    state.env.footnotes.refs[`:${label}`] = -1

    token = new state.Token('footnote_reference_open', '', 1)
    token.meta = { label }
    token.level = state.level++
    state.tokens.push(token)

    const oldBMark = state.bMarks[startLine]
    const oldTShift = state.tShift[startLine]
    const oldSCount = state.sCount[startLine]
    const oldParentType = state.parentType

    const posAfterColon = pos
    const initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine])

    while (pos < max) {
      ch = state.src.charCodeAt(pos)

      if (isSpace(ch)) {
        if (ch === 0x09) {
          offset += 4 - offset % 4
        } else {
          offset++
        }
      } else {
        break
      }

      pos++
    }

    state.tShift[startLine] = pos - posAfterColon
    state.sCount[startLine] = offset - initial

    state.bMarks[startLine] = posAfterColon
    state.blkIndent += 4
    // @ts-ignore
    state.parentType = 'footnote'

    if (state.sCount[startLine] < state.blkIndent) {
      state.sCount[startLine] += state.blkIndent
    }

    // @ts-ignore
    state.md.block.tokenize(state, startLine, endLine, true)

    state.parentType = oldParentType
    state.blkIndent -= 4
    state.tShift[startLine] = oldTShift
    state.sCount[startLine] = oldSCount
    state.bMarks[startLine] = oldBMark

    token = new state.Token('footnote_reference_close', '', -1)
    token.level = --state.level
    state.tokens.push(token)

    return true
  }

  // Process inline footnotes (^[...])
  const footnoteInline: RuleInline = (state, silent) => {
    let footnoteId
    let token: Token
    let tokens: Token[]
    const max = state.posMax
    const start = state.pos

    if (start + 2 >= max) { return false }
    if (state.src[start + 0] !== '^') { return false }
    if (state.src[start + 1] !== '[') { return false }

    const labelStart = start + 2
    const labelEnd = parseLinkLabel(state, start + 1)

    // parser failed to find ']', so it's not a valid note
    if (labelEnd < 0) { return false }

    // We found the end of the sidenote, and know for a fact it's a valid sidenote;
    // so all that's left to do is to call tokenizer.
    //
    if (!silent) {
      if (!state.env.footnotes) { state.env.footnotes = {} }
      if (!state.env.footnotes.list) { state.env.footnotes.list = [] }
      footnoteId = state.env.footnotes.list.length

      state.md.inline.parse(
        state.src.slice(labelStart, labelEnd),
        state.md,
        state.env,
        tokens = []
      )

      token = state.push('footnote_ref', '', 0)
      token.meta = { id: footnoteId }

      state.env.footnotes.list[footnoteId] = {
        content: state.src.slice(labelStart, labelEnd),
        tokens
      }
    }

    state.pos = labelEnd + 1
    state.posMax = max
    return true
  }

  // Process footnote references ([^...])
  const footnoteRef: RuleInline = (state, silent) => {
    let pos: number
    let footnoteId: number
    let footnoteSubId: number
    let token: Token
    const max = state.posMax
    const start = state.pos

    // should be at least 4 chars - "[^x]"
    if (start + 3 > max) { return false }

    if (!state.env.footnotes || !state.env.footnotes.refs) { return false }
    if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false }
    if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false }

    for (pos = start + 2; pos < max; pos++) {
      if (state.src.charCodeAt(pos) === 0x20) { return false }
      if (state.src.charCodeAt(pos) === 0x0A) { return false }
      if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
        break
      }
    }

    if (pos === start + 2) { return false } // no empty footnote labels
    if (pos >= max) { return false }
    pos++

    const label = state.src.slice(start + 2, pos - 1)
    if (typeof state.env.footnotes.refs[`:${label}`] === 'undefined') { return false }

    if (!silent) {
      if (!state.env.footnotes.list) { state.env.footnotes.list = [] }

      if (state.env.footnotes.refs[`:${label}`] < 0) {
        footnoteId = state.env.footnotes.list.length
        state.env.footnotes.list[footnoteId] = { label, count: 0 }
        state.env.footnotes.refs[`:${label}`] = footnoteId
      } else {
        footnoteId = state.env.footnotes.refs[`:${label}`]
      }

      footnoteSubId = state.env.footnotes.list[footnoteId].count
      state.env.footnotes.list[footnoteId].count++

      token = state.push('footnote_ref', '', 0)
      token.meta = { id: footnoteId, subId: footnoteSubId, label }
    }

    state.pos = pos
    state.posMax = max
    return true
  }

  // Glue footnote tokens to end of token stream
  const footnoteTail: RuleCore = (state): boolean => {
    let i
    let l
    let j
    let t
    let lastParagraph
    let token
    let tokens
    let current: Token[]
    let currentLabel: string
    let insideRef = false
    const refTokens: Record<string, Token[]> = {}

    if (!state.env.footnotes) { return false }

    state.tokens = state.tokens.filter((tok) => {
      if (tok.type === 'footnote_reference_open') {
        insideRef = true
        current = []
        currentLabel = tok.meta.label
        return false
      }
      if (tok.type === 'footnote_reference_close') {
        insideRef = false
        // prepend ':' to avoid conflict with Object.prototype members
        refTokens[`:${currentLabel}`] = current
        return false
      }
      if (insideRef) { current.push(tok) }
      return !insideRef
    })

    if (!state.env.footnotes.list) { return false }
    const list = state.env.footnotes.list

    token = new state.Token('footnote_block_open', '', 1)
    state.tokens.push(token)

    for (i = 0, l = list.length; i < l; i++) {
      token = new state.Token('footnote_open', '', 1)
      token.meta = { id: i, label: list[i].label }
      state.tokens.push(token)

      if (list[i].tokens) {
        tokens = []

        token = new state.Token('paragraph_open', 'p', 1)
        token.block = true
        tokens.push(token)

        token = new state.Token('inline', '', 0)
        token.children = list[i].tokens
        token.content = list[i].content
        tokens.push(token)

        token = new state.Token('paragraph_close', 'p', -1)
        token.block = true
        tokens.push(token)
      } else if (list[i].label) {
        tokens = refTokens[`:${list[i].label}`]
      }

      if (tokens) state.tokens = state.tokens.concat(tokens)
      if (state.tokens[state.tokens.length - 1].type === 'paragraph_close') {
        lastParagraph = state.tokens.pop()
      } else {
        lastParagraph = null
      }

      t = list[i].count > 0 ? list[i].count : 1
      for (j = 0; j < t; j++) {
        token = new state.Token('footnote_anchor', '', 0)
        token.meta = { id: i, subId: j, label: list[i].label }
        state.tokens.push(token)
      }

      if (lastParagraph) {
        state.tokens.push(lastParagraph)
      }

      token = new state.Token('footnote_close', '', -1)
      state.tokens.push(token)
    }

    token = new state.Token('footnote_block_close', '', -1)
    state.tokens.push(token)
  }

  md.block.ruler.before('reference', 'footnote_def', footnoteDef, { alt: ['paragraph', 'reference'] })
  md.inline.ruler.after('image', 'footnote_inline', footnoteInline)
  md.inline.ruler.after('footnote_inline', 'footnote_ref', footnoteRef)
  md.core.ruler.after('inline', 'footnote_tail', footnoteTail)
}
