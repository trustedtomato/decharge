export function fatalError (message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}
