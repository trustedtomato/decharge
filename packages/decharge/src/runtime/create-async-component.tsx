import type { JSX } from 'preact/jsx-runtime'
import { useConstAsync } from './hooks.js'

export function createAsyncComponent <T> (componentFunction: (props: T) => Promise<JSX.Element>) {
  const AsyncComponent = (props: T): JSX.Element | null => {
    const children = useConstAsync(async () => componentFunction(props))
    return children
  }
  return AsyncComponent
}
