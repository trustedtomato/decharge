import { ComponentChildren } from 'preact'

interface Props {
  index: number
  children?: ComponentChildren
}

export default ({ index, children }: Props) => <>
  <label class="sidenote__sup">
    { index }
  </label>
  {
    !children
      ? null
      : (
        <span class="sidenote">
          <label class="sidenote__sup">{index}</label>
          { ' ' }
          { children }
        </span>
        )
  }
</>
