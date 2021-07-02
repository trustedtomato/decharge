import { createBlurredImageBuffer } from './index.js'
import gm from 'gm'
import { gmToBuffer, getGmSize, getGmFormat } from '../gm-promisified.js'

export const createBlurredImageBufferAuto = async (buffer: Buffer, placeholderMaxSize: number) => {
  const data = await gmToBuffer(
    gm(buffer)
      .resize(placeholderMaxSize, placeholderMaxSize)
  )

  const size = await getGmSize(gm(buffer))
  const dataFormat = (await getGmFormat(gm(data))).toLowerCase()

  const svg = createBlurredImageBuffer({
    data,
    dataFormat,
    width: 40,
    height: 40 * size.height / size.width
  })

  return svg
}

export default createBlurredImageBufferAuto
