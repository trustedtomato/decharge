import type { Ref } from 'preact'
import {
  useState as pUseState,
  useRef as pUseRef,
  useContext as pUseContext,
  useCallback as pUseCallback
} from 'preact/hooks'
import { RenderingDelayContext } from '../common/render.js'

/** Runs the given function only once + returns the return value of that call. */
export const useConst = <T>(func: () => T): T => {
  const ref = pUseRef<{ value: T } | null>(null)
  if (ref.current === null) {
    const value: T = func()
    ref.current = {
      value
    }
  }
  return ref.current.value
}

/** Delays rendering until release gets called. */
export const useRenderBlocker = () => {
  const renderingDelayers = pUseContext(RenderingDelayContext)
  return useConst(() => {
    let release: () => void
    const promise = new Promise((resolve) => {
      release = () => resolve(undefined)
    })
    renderingDelayers!!.add(promise)
    return {
      // @ts-ignore
      release
    }
  })
}

export const useRerenderingRef = <T>(): (Ref<T> & { current: T | null }) => {
  const [refTarget, setRefTarget] = pUseState<{ value: T } | null>(null)
  const renderBlocker = useRenderBlocker()

  const ref = Object.assign(
    pUseCallback<(arg: T) => void>(refTarget => {
      setRefTarget({ value: refTarget })
    }, []),
    {
      current: refTarget?.value || null
    }
  )

  console.log(refTarget)

  if (refTarget) {
    renderBlocker.release()
  }

  return ref
}

/**
 * Runs the given function only once +
 * returns null while the returned value is resolving,
 * and then returns the resolved value.
 **/
export const useConstAsync = <T>(func: () => Promise<T>): T | null => {
  const renderingBlocker = useRenderBlocker()
  const [result, setResult] = pUseState<{ value: T } | null>(null)

  useConst(() => {
    func().then(res => {
      setResult({ value: res })
    })
  })

  if (result) {
    renderingBlocker.release()
    return result.value
  }
  return null
}
