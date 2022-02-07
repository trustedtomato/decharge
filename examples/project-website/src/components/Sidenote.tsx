import type { ComponentChildren, JSX } from 'preact'

interface Props {
  index: number
  children: ComponentChildren
}

export default ({ index, children }: Props): JSX.Element => <>{
  !children
    ? null
    : <>
      <small class="sidenote">
        <span class="sidenote__sup">{index}</span>
        { ' ' }
        { children }
      </small>
    </>
}</>
