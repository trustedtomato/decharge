import type { JSX } from 'preact/jsx-runtime'
import { useConstAsync } from './hooks.js'

export function createAsyncComponent <T> (
  createComponent: (props: T) => Promise<() => JSX.Element>
) {
  const AsyncComponent = (props: T): JSX.Element => {
    const Component = useConstAsync(async () => {
      return await createComponent(props)
    })
    return Component === null
      ? <></>
      : <Component />
  }
  return AsyncComponent
}
