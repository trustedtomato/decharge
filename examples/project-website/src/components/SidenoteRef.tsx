interface Props {
  targetIndex: number
  targetId: string
}

export default ({ targetIndex, targetId }: Props) => <>
  <label class="sidenote__sup sidenote__sup--button" for={targetId}>
      { targetIndex }
  </label>
  <input
    id={targetId}
    type="checkbox"
    class="sidenote__show hidden"
    // Disable keyboard focus
    // and screenreader accessing the input.
    aria-hidden="true"
    tabIndex={-1}
  />
</>
