import type { ComponentChildren, JSX } from 'preact'
import Sidenote from './Sidenote.js'
import SidenoteRef from './SidenoteRef.js'

interface Props {
  index: number
  id: string
  children: ComponentChildren
}

export default ({ index, children, id }: Props): JSX.Element => <>
  <SidenoteRef targetIndex={index} targetId={id} /><Sidenote index={index}>
    {children}
  </Sidenote>
</>
