module.exports = {
  snippetOptions: {
    rule: {
      match: /<\/title>/i,
      fn: (snippet, match) => match + snippet
    }
  }
}
