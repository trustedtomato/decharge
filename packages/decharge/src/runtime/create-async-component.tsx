import type { JSX } from 'preact/jsx-runtime'
import { useContext, useState } from 'preact/hooks'
import { RenderingDelayContext } from '../common/render.js'

export function createAsyncComponent <T> (componentFunction: (props: T) => Promise<JSX.Element>) {
  const AsyncComponent = (props: T): JSX.Element => {
    const [initalized, setInitalized] = useState(false)
    const [children, setChildren] = useState<JSX.Element>(null)
    const renderingDelayers = useContext(RenderingDelayContext)

    if (!initalized) {
      const pendingComponent = componentFunction(props).then((children) => {
        setChildren(children)
      })
      renderingDelayers.add(pendingComponent)
      setInitalized(true)
    }

    return children
  }
  return AsyncComponent
}
