import { createPlaceholderSvg as createPlaceholderSvgManual } from './manual.js'
import sharp from 'sharp'

export const createPlaceholderSvg = async (buffer: Buffer, placeholderMaxSize: number) => {
  const shrp = sharp(buffer)

  const { width, height, format } = await shrp
    .metadata()

  if (!width || !height || !format) {
    throw new Error('sharp cannot get the correct width/height/format of the image!')
  }

  const targetSize = width > height
    ? {
        width: placeholderMaxSize,
        height: placeholderMaxSize * height / width
      }
    : {
        height: placeholderMaxSize,
        width: placeholderMaxSize * width / height
      }

  const data = await shrp
    .resize(width > height ? { width: placeholderMaxSize } : { height: placeholderMaxSize })
    .toBuffer()

  return createPlaceholderSvgManual({
    data,
    format,
    width: targetSize.width,
    height: targetSize.height
  })
}
