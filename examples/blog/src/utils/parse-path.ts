export function parsePath (filename: string): { directoryPath: string, name: string, extension: string } {
  const match = filename.match(/^(.*?\/)?([^/]*?)(\.[^/.]*)?$/)
  return {
    directoryPath: match[1],
    name: match[2],
    extension: match[3]
  }
}

export default parsePath
