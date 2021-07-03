import { useContext } from 'preact/hooks'
import { ScriptsContext } from '../common/render.js'

// TODO: only enable adding this once to a page.
export const Scripts = () => {
  const scripts = useContext(ScriptsContext)

  return scripts.length === 0 ? null : <script>{scripts.join('')}</script>
}
