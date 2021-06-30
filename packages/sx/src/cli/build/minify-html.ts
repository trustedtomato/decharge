import { minify } from 'html-minifier'

export const minifyHtml = (html: string) => minify(html, {
  caseSensitive: false,
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: false,
  collapseWhitespace: true,
  conservativeCollapse: false,
  continueOnParseError: true,
  decodeEntities: true,
  html5: true,
  includeAutoGeneratedTags: false,
  keepClosingSlash: false,
  maxLineLength: 0,
  minifyCSS: true,
  minifyJS: true,
  preserveLineBreaks: false,
  preventAttributesEscaping: false,
  processConditionalComments: true,
  removeAttributeQuotes: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeEmptyElements: false,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  removeTagWhitespace: true,
  sortAttributes: true,
  sortClassName: true,
  trimCustomFragments: true,
  useShortDoctype: true
})

export default minifyHtml