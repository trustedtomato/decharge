import fs from 'fs'
import { URL } from 'url'
import bufferToDataUrl from '../buffer-to-data-url.js'

const template = fs.readFileSync(new URL('template.svg', import.meta.url), 'utf8')

/**
 * Creates an SVG string from the given buffer.
 * The SVG will contain the image in a base64 string,
 * and applies a blur with the given stdDeviationX and stdDeviationY.
 */
export function createBlurredImageBuffer (
  { data, dataFormat, width, height }: { data: Buffer, dataFormat: string, width: number, height: number }
): string {
  const dataUri = bufferToDataUrl(data, dataFormat)

  return template
    .replace(/{{width}}/g, width.toString())
    .replace(/{{height}}/g, height.toString())
    .replace(/{{dataUri}}/g, dataUri)
}

export default createBlurredImageBuffer
