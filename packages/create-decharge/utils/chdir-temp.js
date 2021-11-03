export async function chdirTemp (path, func) {
  const previousCwd = process.cwd()
  process.chdir(path)
  const result = await func()
  process.chdir(previousCwd)
  return result
} 