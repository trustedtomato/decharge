import wrapAnsi from 'wrap-ansi'

export interface FormatAnsiOptions {
  maxLineLength: number,
  extraIndent: number,
  firstIndent: number
}

export const formatAnsi = (
  text: string, {
    maxLineLength,
    extraIndent,
    firstIndent
  }: FormatAnsiOptions
) => {
  const indent = firstIndent + extraIndent
  const firstIndentStr = ''.padEnd(firstIndent)
  const indentStr = ''.padEnd(indent)
  return (
    firstIndentStr +
    text.slice(0, firstIndent) +
    wrapAnsi(text.slice(firstIndent), maxLineLength - indent, {
      hard: true
    }).replace(/\n/g, `\n${indentStr}`)
  )
}
