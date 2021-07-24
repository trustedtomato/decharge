import pathLib from 'path'
import { promisify } from 'util'
import { writeFile, readFile } from 'fs/promises'
import { watch } from 'chokidar'
import mkdirp from 'mkdirp'
import hasha from 'hasha'
import waitFor from 'p-event'
import tsc from './tsc.js'
import { renderRoute } from '../utils/render-route.js'
import copyToTemp from '../utils/copy-to-temp.js'
import parseDependencies from '../utils/parse-dependencies.js'
import Debouncer from '../utils/debouncer.js'
import { tempDir, srcDir, distDir, tempRoutesDir, publicDir } from '../../common/config.js'
import copyPublic from '../utils/copy-public.js'
const delay = promisify(setTimeout)

const tempJsGlob = pathLib.join(tempDir, '**/*.js')

const dependencySets = new Map()

/**
 * Get the dependents of a module according to dependencySets.
 */
function getDependents (module: string): Set<string> {
  const dependents: Set<string> = new Set()

  ;(function addDependents (module) {
    // The check is needed to prevent cycles.
    if (dependents.has(module)) return
    dependents.add(module)

    for (const [dependent, dependencySet] of dependencySets.entries()) {
      if (dependencySet.has(module)) {
        addDependents(dependent)
      }
    }
  })(module)

  return dependents
}

/**
 * When writing a file, the hash of its content can be saved into this Map
 * so next time if we might change its content, we can skip that
 * if the content's hash is the same.
 */
const lastWriteContentHash = new Map()

/**
 * writeFile, but utilises lastWriteContentHash.
 * Also creates the containing directory if it doesn't exist yet.
 */
async function mightWriteFile (absolutePath: string, content: string): Promise<boolean> {
  const contentHash = hasha(content)
  if (lastWriteContentHash.get(absolutePath) !== contentHash) {
    lastWriteContentHash.set(absolutePath, contentHash)
    await mkdirp(pathLib.dirname(absolutePath))
    await writeFile(absolutePath, content)
    return true
  }
  return false
}

async function renderRoutesOnPathChanges (paths: string[]) {
  // TODO: parallelize!
  for (const path of paths) {
    if (path.endsWith('.js')) {
      const content = await readFile(path, 'utf-8')

      dependencySets.set(
        path,
        new Set(
          parseDependencies(content)
            // only keep local dependencies.
            .filter(dep => /^\.\.?\//.test(dep))
            // make the import URL an absolute URL.
            .map(dep => pathLib.resolve(pathLib.dirname(path), dep))
        )
      )
    }
  }

  const routes = (() => {
    if (paths.some(path => !path.endsWith('.js'))) {
      // Just rerender all routes.
      return Array.from(dependencySets.keys())
        .filter(dependent => dependent.startsWith(tempRoutesDir))
    }
    const dependents: Set<string> = new Set()
    for (const path of paths) {
      for (const dependent of getDependents(path)) {
        dependents.add(dependent)
      }
    }
    return Array.from(dependents)
      .filter(dependent => dependent.startsWith(tempRoutesDir))
  })()

  // TODO: parallelize!
  for (const route of routes) {
    const relativeRoutePath = pathLib.relative(tempRoutesDir, route)
    try {
      const generatedFiles = await renderRoute(relativeRoutePath, tempRoutesDir)
      for (const [path, content] of generatedFiles) {
        const targetPath = pathLib.join(distDir, path)
        const changedFile = await mightWriteFile(targetPath, content)
        if (changedFile) {
          console.log(`Modified ${path}!`)
        }
      }
    } catch (err) {
      console.error(`Error occured when executing this route: ${route}`)
      console.error(err)
    }
  }
}

const renderRoutesOnPathChangesDebouncer = new Debouncer(renderRoutesOnPathChanges)

// Continuously compile /src/**/*.([jt]sx?) to _temp.
tsc(tempDir)

// Continuously copy everything from src to _temp,
// except the *.([jt]sx?) files
// (since they are being taken care of by tsc).
async function onCopyOperation (path: string) {
  const copyOperation = copyToTemp(path)
  renderRoutesOnPathChangesDebouncer.addDebouncingPromise(copyOperation)
  renderRoutesOnPathChangesDebouncer.trigger(pathLib.resolve(process.cwd(), path))
}

watch(publicDir)
  .on('add', copyPublic)
  .on('change', copyPublic)

const srcCopier = watch(srcDir, {
  ignored: /\.[jt]sx?$/
})
  .on('add', onCopyOperation)
  .on('change', onCopyOperation)

const initialTempDirReady = waitFor(srcCopier, 'ready')
renderRoutesOnPathChangesDebouncer.addDebouncingPromise(initialTempDirReady)

initialTempDirReady.then(() => {
  // Continuously render routes in _temp to dist/.
  async function onTempJsChange (path: string) {
    renderRoutesOnPathChangesDebouncer.addDebouncingPromise(delay(100))
    renderRoutesOnPathChangesDebouncer.trigger(pathLib.resolve(process.cwd(), path))
  }

  watch(tempJsGlob)
    .on('add', onTempJsChange)
    .on('change', onTempJsChange)
})
