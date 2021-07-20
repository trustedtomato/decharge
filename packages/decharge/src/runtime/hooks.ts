import type { Ref } from 'preact'
import {
  useState as pUseState,
  useRef as pUseRef,
  useContext as pUseContext,
  useCallback as pUseCallback,
  useEffect as pUseEffect
} from 'preact/hooks'
import { RenderingContext, PageContext } from '../common/render.js'

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

export const usePageContext = () => pUseContext(PageContext)

/**
 * Basically React's useState, except that it blocks the SSR
 * between each setState call and the rerender caused by it.
 */
export const useState = <T>(defaultValue: T) => {
  const [state, pSetState] = pUseState(defaultValue)
  const renderBlocker = useRenderBlocker()
  const setState = useConst(() =>
    (value: T) => {
      renderBlocker.renew()
      pSetState(value)
    }
  )
  pUseEffect(() => {
    renderBlocker.release()
  }, [state])
  return [state, setState]
}

/** Delays the SSR until release gets called. */
export const useRenderBlocker = () => {
  const { delayerPromises } = pUseContext(RenderingContext)!!
  return useConst(() => {
    let releaseCurrent: (() => void) | null = null
    const renderBlocker = {
      renew () {
        if (releaseCurrent) {
          releaseCurrent()
        }
        const promise = new Promise((resolve) => {
          releaseCurrent = () => resolve(undefined)
        })
        delayerPromises.add(promise)
      },
      release () {
        releaseCurrent!!()
      }
    }
    renderBlocker.renew()
    return renderBlocker
  })
}

/**
 * This is the useRef hook, except that it triggers a rerender when the ref target changes
 * and blocks the SSR while the ref target is null.
 */
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

  if (refTarget) {
    renderBlocker.release()
  }

  return ref
}

/**
 * Runs the given function only once +
 * returns null while the returned value is resolving,
 * and then returns the resolved value.
 * Delays the SSR until the value is resolved.
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
