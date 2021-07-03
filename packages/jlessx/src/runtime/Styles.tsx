import { useContext } from 'preact/hooks'
import { StylesContext } from '../common/render.js'

// TODO: only enable adding this once to a page.
export const Styles = () => {
  const styles = useContext(StylesContext)

  return styles.length === 0 ? null : <style>{styles.join('')}</style>
}
