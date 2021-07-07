interface Props {
  /** Arrow length relative to the SVG width. */
  length: number,
  /** Arrow stroke width relative to the SVG width.  */
  width?: number
}

export default ({ length, width = 1 / 6 }: Props) => {
  const endY = length * 8
  const strokeWidth = width * 8
  return <svg class="arrow" viewBox={`-1 0 10 ${endY + 1}`}>
    <line
      x1="4"
      y1="0"
      x2="4"
      y2={endY}
      stroke="#000"
      stroke-width={strokeWidth}
    />
    <polyline
      points={`0,${endY - 4} 4,${endY} 8,${endY - 4}`}
      stroke="black"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width={strokeWidth}
      fill="none"
    />
  </svg>
}
