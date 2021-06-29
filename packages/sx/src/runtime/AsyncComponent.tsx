import type { JSX } from 'preact/jsx-runtime'
import { useContext, useState } from 'preact/hooks'
import { RenderDelay } from './render.js'

export function AsyncComponent <T>(componentFunction: (props: T) => Promise<JSX.Element>) {
  return (props: T): JSX.Element => {
    const [initalized, setInitalized] = useState(false)
    const [children, setChildren] = useState<JSX.Element>(null)

    if (!initalized) {
      const delayerPromises = useContext(RenderDelay)
      const pendingComponent = componentFunction(props).then((children) => {
        setChildren(children)
      })
      delayerPromises.add(pendingComponent)
      setInitalized(true)
    }

    return children
  }
}