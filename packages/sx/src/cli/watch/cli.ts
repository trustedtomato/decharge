export const command = 'watch'
export const describe = 'watches & rebuilds JlessX project when something changes'
export const builder = {}
export const handler = async () => {
  await import('./main.js')
}
