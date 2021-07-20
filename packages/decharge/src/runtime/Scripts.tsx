import { usePageContext } from './hooks.js'

// TODO: only enable adding this once to a page.
export const Scripts = ({ type }: { type: 'end-of-body' }) => {
  const { scripts } = usePageContext()!!

  return scripts.length === 0
    ? null
    : <script>{scripts.join('')}</script>
}
