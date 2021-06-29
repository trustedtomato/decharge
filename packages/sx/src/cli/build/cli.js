export const command = 'build'
export const describe = 'builds sx project'
export const builder = {}
export const handler = async () => {
  await import('./main.js')
}
