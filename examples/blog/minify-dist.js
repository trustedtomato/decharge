import { minify } from 'html-minifier-terser'
import CleanCss from 'clean-css'
import readdirp from 'readdirp'
import fs from 'fs/promises'
import { minify as minifyJs } from 'uglify-js'

for await (const { fullPath } of readdirp('dist', { fileFilter: '*.html' })) {
  fs.writeFile(
    fullPath,
    minify(
      await fs.readFile(fullPath, 'utf-8'), {
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
      }
    )
  )
}

const cssCleaner = new CleanCss()

for await (const { fullPath } of readdirp('dist', { fileFilter: '*.css' })) {
  fs.writeFile(
    fullPath,
    cssCleaner.minify(
      await fs.readFile(fullPath, 'utf-8')
    ).styles
  )
}

for await (const { fullPath } of readdirp('dist', { fileFilter: '*.js' })) {
  fs.writeFile(
    fullPath,
    minifyJs(
      await fs.readFile(fullPath, 'utf-8'), {
        compress: {
          drop_console: true,
          unsafe_math: true,
          unsafe_undefined: true
        }
      }
    ).code
  )
}
