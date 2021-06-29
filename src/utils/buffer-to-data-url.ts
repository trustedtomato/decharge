export function bufferToDataUrl (data: Buffer, dataFormat: string) {
  return `data:image/${dataFormat};base64,${data.toString('base64')}`
}

export default bufferToDataUrl