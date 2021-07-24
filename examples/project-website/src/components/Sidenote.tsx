import type { ComponentChildren, JSX } from 'preact'

interface Props {
  index: number
  id: string
  children: ComponentChildren
}

export default ({ index, children, id }: Props): JSX.Element => <>{
  !children
    ? null
    : <>
      <span class="sidenote" id={id}>
        <label class="sidenote__sup">{index}</label>
        { ' ' }
        { children }
      </span>
    </>
}</>
