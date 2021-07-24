interface Props {
  targetIndex: number
  targetId: string
}

export default ({ targetIndex, targetId }: Props) => <>
  <label class="sidenote__sup" for={targetId}>
    { targetIndex }
  </label>
</>
