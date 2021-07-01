import fs from 'fs'
import bufferToDataUrl from '../buffer-to-data-url.js'

const template = fs.readFileSync(new URL('template.svg', import.meta.url), 'utf8')

/**
 * Creates an SVG string from the given buffer.
 * The SVG will contain the image in a base64 string,
 * and applies a blur with the given stdDeviationX and stdDeviationY.
 */
/**
 *
 * @param {{ data: Buffer, dataFormat: string, width: number, height: number }} param0
 * @returns {string}
 */
export function createBlurredImageBuffer ({ data, dataFormat, width, height }) {
  const dataUri = bufferToDataUrl(data, dataFormat)

  return template
    .replace(/{{width}}/g, width.toString())
    .replace(/{{height}}/g, height.toString())
    .replace(/{{dataUri}}/g, dataUri)
}

export default createBlurredImageBuffer
