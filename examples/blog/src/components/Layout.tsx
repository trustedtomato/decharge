import { Scripts, Styles } from 'jlessx'
import type { Children } from '../types/Children'

interface Props {
  extraTitle?: string
  description: string
  children: Children
}

export default ({ extraTitle, description, children }: Props) =>
  <html lang="en">
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    {/* TODO: create separate stylesheets for different screen sizes using media="..." */}
    <link rel="stylesheet" href="/styles/global.css" />
    <Styles />
    <title>{ extraTitle ? `${extraTitle} — ` : ''}Raskolnikov's blog</title>
    {children}
    <Scripts />
  </html>
