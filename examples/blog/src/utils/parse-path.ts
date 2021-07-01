
/**
 *
 * @param {string} filename
 * @returns {{ directoryPath: string, name: string, extension: string }}
 */
export function parsePath (filename) {
  const match = filename.match(/^(.*?\/)?([^/]*?)(\.[^/.]*)?$/)
  return {
    directoryPath: match[1],
    name: match[2],
    extension: match[3]
  }
}

export default parsePath
