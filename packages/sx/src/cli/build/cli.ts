export const command = 'build'
export const describe = 'builds JLessX project'
export const builder = {}
export const handler = async () => {
  await import('./main.js')
}
