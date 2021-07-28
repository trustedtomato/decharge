import { usePageContext } from '../hooks/index.js'

// TODO: only enable adding this once to a page.
export const Styles = () => {
  const { styles } = usePageContext()!!

  return styles.length === 0
    ? null
    : <style>{styles.join('')}</style>
}
