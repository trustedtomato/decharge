export function bufferToDataUrl (data: Buffer, dataFormat: string) {
  return `data:${dataFormat};base64,${data.toString('base64')}`
}
